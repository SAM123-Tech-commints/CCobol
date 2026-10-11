"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { highlightCobol } from "@/lib/cobol/highlight";
import { parseSource } from "@/lib/cobol/units";

export interface WorkbenchExample {
  id: string;
  name: string;
  description: string;
  code: string;
  stdin?: string;
  files?: Record<string, string>;
}

interface RunResult {
  output: string;
  fileOutput: Record<string, string>;
  errors: string[];
  warnings: string[];
  runMs: number;
}

interface Props {
  examples: WorkbenchExample[];
  initialCode: string;
  initialStdin: string;
  initialFiles: Record<string, string>;
  initialTitle: string;
}

const DEFAULT_CODE = `       IDENTIFICATION DIVISION.
       PROGRAM-ID. HelloWorld.
       PROCEDURE DIVISION.
           DISPLAY 'Hello, World!'.
           STOP RUN.
`;

const NEW_FILE_SKELETON = (name: string) => `       IDENTIFICATION DIVISION.
       PROGRAM-ID. ${name.replace(/[^A-Za-z0-9-]/g, "").slice(0, 20) || "MyProg"}.
       PROCEDURE DIVISION.
           DISPLAY 'Hello from ${name}'.
           STOP RUN.
`;

const SHELL_WELCOME: TermLine[] = [
  { kind: "sys", text: "COBOL terminal - GnuCOBOL-style workflow in your browser." },
  { kind: "sys", text: "Type 'help' for commands. Quick start:  cobc -x -free HelloWorld.cbl" },
];

interface DocFile {
  name: string;
  content: string;
  kind: "cobol" | "data";
}

type TermLine = { kind: "out" | "in" | "sys" | "err"; text: string };

function kindOf(name: string): "cobol" | "data" {
  return /\.(cbl|cob)$/i.test(name) ? "cobol" : "data";
}

function uniqueName(docs: DocFile[], base: string): string {
  if (!docs.some((d) => d.name.toLowerCase() === base.toLowerCase())) return base;
  const dot = base.lastIndexOf(".");
  const stem = dot === -1 ? base : base.slice(0, dot);
  const ext = dot === -1 ? "" : base.slice(dot);
  let i = 2;
  while (docs.some((d) => d.name.toLowerCase() === `${stem} (${i})${ext}`.toLowerCase())) i++;
  return `${stem} (${i})${ext}`;
}

/** VS Code-style IDE: explorer (rename/upload/download) + editor tabs + real shell terminal. COBOL only. */
export default function Workbench({ examples, initialCode, initialStdin, initialFiles, initialTitle }: Props) {
  const [docs, setDocs] = useState<DocFile[]>(() => [
    { name: "HelloWorld.cbl", content: initialCode || DEFAULT_CODE, kind: "cobol" },
    ...Object.entries(initialFiles ?? {}).map(([name, content]) => ({ name, content, kind: kindOf(name) as "cobol" | "data" })),
  ]);
  const [active, setActive] = useState(0);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [title, setTitle] = useState(initialTitle || "Untitled COBOL program");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [termLines, setTermLines] = useState<TermLine[]>(SHELL_WELCOME);
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [exeName, setExeName] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const termEndRef = useRef<HTMLDivElement>(null);
  const termInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const termOutputRef = useRef("");
  const echoRef = useRef<string[]>([]);
  const roundsRef = useRef(0);
  const stdinAccRef = useRef(initialStdin || "");
  const writtenRef = useRef<Record<string, string>>({});
  const compiledRef = useRef<string | null>(null);
  const MAX_INTERACTIVE_ROUNDS = 12;

  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [termLines, awaitingInput, running]);

  const safeActive = Math.min(active, docs.length - 1);
  const activeDoc = docs[safeActive];

  const highlighted = useMemo(
    () => (activeDoc.kind === "cobol" ? highlightCobol(activeDoc.content) : escapeHtml(activeDoc.content)),
    [activeDoc],
  );
  const lineCount = useMemo(() => activeDoc.content.split("\n").length, [activeDoc]);

  const cobolDocs = useMemo(() => docs.filter((d) => d.kind === "cobol"), [docs]);
  const combinedCode = useMemo(() => cobolDocs.map((d) => d.content).join("\n"), [cobolDocs]);
  const dataFiles = useMemo(() => Object.fromEntries(docs.filter((d) => d.kind === "data").map((d) => [d.name, d.content])), [docs]);

  const isCobol = useMemo(() => {
    const upper = combinedCode.toUpperCase();
    return upper.includes("IDENTIFICATION DIVISION") || upper.includes("PROCEDURE DIVISION");
  }, [combinedCode]);

  const STARVED_MARKER = "past the end of the standard input";
  const PROMPT = "cobol-dev:~$";

  const print = useCallback((lines: TermLine[]) => {
    setTermLines((prev) => [...prev, ...lines]);
  }, []);

  /** Execute the compiled program. fresh=true resets the run; otherwise output is appended (live ACCEPT input). */
  const runWith = useCallback(
    async (stdinVal: string, fresh: boolean, exe: string) => {
      if (!isCobol) {
        setError(null);
        setAwaitingInput(false);
        setResult({ output: "", fileOutput: {}, errors: ["Only COBOL is supported here."], warnings: [], runMs: 0 });
        return;
      }
      if (fresh) {
        roundsRef.current = 0;
        echoRef.current = [];
        termOutputRef.current = "";
        setResult(null);
      }
      setRunning(true);
      setError(null);
      setAwaitingInput(false);
      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: combinedCode, stdin: stdinVal, files: dataFiles }),
        });
        const data = (await res.json()) as RunResult & { error?: string };
        if (data.error) {
          setError(data.error);
          print([{ kind: "err", text: `error: ${data.error}` }]);
        } else {
          setResult(data);
          for (const [name, content] of Object.entries(data.fileOutput ?? {})) writtenRef.current[name] = content;
          const out = data.output ?? "";
          const prevOut = termOutputRef.current;
          if (fresh || !out.startsWith(prevOut)) {
            const rebuilt: TermLine[] = [];
            for (const echo of echoRef.current) rebuilt.push({ kind: "in", text: `› ${echo}` });
            for (const line of out.split("\n")) rebuilt.push({ kind: "out", text: line });
            print(rebuilt);
          } else if (out.length > prevOut.length) {
            const delta = out.slice(prevOut.length).split("\n");
            print(delta.map((text) => ({ kind: "out" as const, text })));
          }
          termOutputRef.current = out;
          const written = Object.entries(data.fileOutput ?? {});
          for (const [name, content] of written) {
            print([{ kind: "sys", text: `wrote ${name} (${content.length} bytes) - type 'cat ${name}' to view` }]);
          }
          const starved = (data.warnings ?? []).some((w) => w.includes(STARVED_MARKER));
          if ((data.errors ?? []).length) {
            setAwaitingInput(false);
            for (const e of data.errors ?? []) print([{ kind: "err", text: `error: ${e}` }]);
          } else if (starved && roundsRef.current < MAX_INTERACTIVE_ROUNDS) {
            setAwaitingInput(true);
          } else {
            setAwaitingInput(false);
            if (starved) print([{ kind: "sys", text: "■ input limit reached - type 'run' with fewer ACCEPTs, or prefill via a data file." }]);
            else print([{ kind: "sys", text: `■ '${exe}' exited in ${data.runMs} ms` }]);
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not run the program.");
      } finally {
        setRunning(false);
      }
    },
    [combinedCode, dataFiles, isCobol, print],
  );

  /** GnuCOBOL-style compile: genuine syntax check in the browser, no execution. */
  const compileDocs = useCallback(
    (targets: DocFile[], exe: string): boolean => {
      const src = targets.map((d) => d.content).join("\n");
      const upper = src.toUpperCase();
      if (!(upper.includes("IDENTIFICATION DIVISION") || upper.includes("PROCEDURE DIVISION"))) {
        print([{ kind: "err", text: "cobc: error: only COBOL source can be compiled here" }]);
        return false;
      }
      try {
        const parsed = parseSource(src);
        for (const e of parsed.errors) print([{ kind: "err", text: `cobc: error: ${e}` }]);
        for (const w of parsed.warnings) print([{ kind: "sys", text: `cobc: warning: ${w}` }]);
        if (parsed.errors.length) return false;
        compiledRef.current = exe;
        setExeName(exe);
        print([
          {
            kind: "sys",
            text: `compiled ${targets.map((d) => d.name).join(", ")} → ./${exe}${parsed.warnings.length ? ` (${parsed.warnings.length} warning${parsed.warnings.length === 1 ? "" : "s"})` : " (no warnings)"}`,
          },
        ]);
        return true;
      } catch (e) {
        print([{ kind: "err", text: `cobc: error: ${e instanceof Error ? e.message : "parse failed"}` }]);
        return false;
      }
    },
    [print],
  );

  const defaultExe = useMemo(() => {
    const first = cobolDocs[0]?.name ?? "program.cbl";
    return first.replace(/\.[^.]*$/, "") || "program";
  }, [cobolDocs]);

  const shellRun = useCallback(
    (exe: string) => {
      const compiled = compiledRef.current;
      if (!compiled || compiled.toLowerCase() !== exe.toLowerCase()) {
        print([{ kind: "err", text: `bash: ./${exe}: No such file. Compile first:  cobc -x -free <file>.cbl -o ${exe}` }]);
        return;
      }
      print([{ kind: "sys", text: `$ ./${compiled}` }]);
      void runWith(stdinAccRef.current, true, compiled);
    },
    [print, runWith],
  );

  /** One-keypress Run button: compile everything, then execute like GnuCOBOL would. */
  const run = useCallback(() => {
    if (running) return;
    print([{ kind: "in", text: `${PROMPT} cobc -x -free ${cobolDocs.map((d) => d.name).join(" ")} -o ${defaultExe} && ./${defaultExe}` }]);
    if (!compileDocs(cobolDocs, defaultExe)) return;
    print([{ kind: "sys", text: `$ ./${defaultExe}` }]);
    void runWith(stdinAccRef.current, true, defaultExe);
  }, [compileDocs, cobolDocs, defaultExe, print, runWith, running]);

  const handleCommand = useCallback(
    (raw: string) => {
      const line = raw.trim();
      print([{ kind: "in", text: `${PROMPT} ${raw}` }]);
      if (!line) return;
      const parts = line.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);
      if (cmd === "help") {
        print([
          { kind: "out", text: "commands:" },
          { kind: "out", text: "  ls                          list files in the explorer" },
          { kind: "out", text: "  cat <file>                  print a file" },
          { kind: "out", text: "  cobc -x -free <file> [-o n] compile COBOL (checks syntax, reports errors)" },
          { kind: "out", text: "  ./<name>   or   run         execute the compiled program (live ACCEPT input)" },
          { kind: "out", text: "  clear                       clear the terminal" },
        ]);
        return;
      }
      if (cmd === "clear") {
        setTermLines([]);
        return;
      }
      if (cmd === "ls") {
        if (!docs.length) print([{ kind: "out", text: "(empty)" }]);
        for (const d of docs) print([{ kind: "out", text: `${d.name}   [${d.kind === "cobol" ? "COBOL" : "data"}, ${d.content.split("\n").length} lines]` }]);
        if (compiledRef.current) print([{ kind: "sys", text: `./${compiledRef.current}   [compiled program]` }]);
        return;
      }
      if (cmd === "cat") {
        const name = args.join(" ");
        if (!name) {
          print([{ kind: "err", text: "usage: cat <file>" }]);
          return;
        }
        const doc = docs.find((d) => d.name.toLowerCase() === name.toLowerCase());
        const written = writtenRef.current[Object.keys(writtenRef.current).find((k) => k.toLowerCase() === name.toLowerCase()) ?? ""];
        const content = doc?.content ?? written;
        if (content === undefined) {
          print([{ kind: "err", text: `cat: ${name}: No such file` }]);
          return;
        }
        for (const l of content.split("\n")) print([{ kind: "out", text: l }]);
        return;
      }
      if (cmd === "cobc") {
        let exe = defaultExe;
        const files: string[] = [];
        for (let i = 0; i < args.length; i++) {
          if (args[i] === "-o" && args[i + 1]) {
            exe = args[i + 1];
            i++;
          } else if (!args[i].startsWith("-")) files.push(args[i]);
        }
        const targets = files.length
          ? files.map((f) => {
              const found = cobolDocs.find((d) => d.name.toLowerCase() === f.toLowerCase());
              return { asked: f, doc: found };
            })
          : cobolDocs.map((doc) => ({ asked: doc.name, doc }));
        const missing = targets.find((t) => !t.doc);
        if (missing) {
          print([{ kind: "err", text: `cobc: error: ${missing.asked}: No such file. 'ls' to list files.` }]);
          return;
        }
        compileDocs(targets.map((t) => t.doc as DocFile), exe);
        return;
      }
      if (cmd === "run") {
        if (!compiledRef.current) {
          print([{ kind: "err", text: "nothing compiled yet - compile first:  cobc -x -free HelloWorld.cbl" }]);
          return;
        }
        shellRun(compiledRef.current);
        return;
      }
      if (cmd.startsWith("./")) {
        shellRun(parts[0].slice(2));
        return;
      }
      if (cmd === "exit" || cmd === "quit") {
        print([{ kind: "sys", text: "This terminal never exits - type 'clear' to wipe it." }]);
        return;
      }
      print([{ kind: "err", text: `command not found: ${parts[0]} (try 'help')` }]);
    },
    [cobolDocs, compileDocs, defaultExe, docs, print, shellRun],
  );

  /** Submit from the prompt line: program input when a program waits, otherwise a shell command. */
  const submitInput = useCallback(() => {
    const line = inputValue;
    setInputValue("");
    if (awaitingInput) {
      // Merge the typed text onto the program's prompt line (like a real
      // terminal: "What is your name Derek"), instead of a separate line.
      setTermLines((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].kind === "out" && next[i].text.trim() !== "") {
            const sep = next[i].text.endsWith(" ") ? "" : " ";
            next[i] = { ...next[i], text: `${next[i].text}${sep}${line}` };
            break;
          }
        }
        return next;
      });
      echoRef.current.push(line);
      roundsRef.current += 1;
      const acc = stdinAccRef.current;
      const nextStdin = acc + (acc === "" || acc.endsWith("\n") ? "" : "\n") + line + "\n";
      stdinAccRef.current = nextStdin;
      void runWith(nextStdin, false, compiledRef.current ?? defaultExe);
    } else {
      handleCommand(line);
    }
  }, [awaitingInput, defaultExe, handleCommand, inputValue, runWith]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void run();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [run]);

  const resetTerminal = (hint?: string) => {
    setTermLines(hint ? [...SHELL_WELCOME, { kind: "sys", text: hint }] : [...SHELL_WELCOME]);
    setAwaitingInput(false);
    setInputValue("");
    termOutputRef.current = "";
    echoRef.current = [];
    roundsRef.current = 0;
    stdinAccRef.current = "";
    writtenRef.current = {};
    compiledRef.current = null;
    setExeName(null);
  };

  const loadExample = (id: string) => {
    const example = examples.find((e) => e.id === id);
    if (!example) return;
    setDocs([
      { name: `${example.id}.cbl`, content: example.code, kind: "cobol" },
      ...Object.entries(example.files ?? {}).map(([name, content]) => ({ name, content, kind: kindOf(name) as "cobol" | "data" })),
    ]);
    setActive(0);
    setTitle(example.name);
    setResult(null);
    setShareUrl(null);
    stdinAccRef.current = example.stdin ?? "";
    resetTerminal(`Loaded '${example.name}' - compile it:  cobc -x -free ${example.id}.cbl`);
  };

  const save = async () => {
    setSaving(true);
    setShareUrl(null);
    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, code: combinedCode, stdin: stdinAccRef.current, files: dataFiles }),
      });
      const data = (await res.json()) as { program?: { shareId: string }; error?: string };
      if (data.program) {
        const url = `${window.location.origin}/compiler?share=${data.program.shareId}`;
        setShareUrl(url);
        await navigator.clipboard?.writeText(url).catch(() => undefined);
      } else setError(data.error ?? "Could not save the program.");
    } catch {
      setError("Could not save the program.");
    } finally {
      setSaving(false);
    }
  };

  const updateActive = (content: string) => {
    setDocs((prev) => prev.map((d, i) => (i === safeActive ? { ...d, content } : d)));
    compiledRef.current = null;
    setExeName(null);
  };

  const addCobolFile = () => {
    const n = cobolDocs.length + 1;
    const name = uniqueName(docs, `Program${n}.cbl`);
    setDocs((prev) => [...prev, { name, content: NEW_FILE_SKELETON(name), kind: "cobol" }]);
    setActive(docs.length);
  };

  const addDataFile = () => {
    const name = uniqueName(docs, `FILE${docs.filter((d) => d.kind === "data").length + 1}.DAT`);
    setDocs((prev) => [...prev, { name, content: "", kind: "data" }]);
    setActive(docs.length);
  };

  const closeDoc = (idx: number) => {
    const target = docs[idx];
    if (target.kind === "cobol" && cobolDocs.length === 1) return;
    setDocs((prev) => prev.filter((_, i) => i !== idx));
    setActive((prev) => (idx < prev ? prev - 1 : Math.min(prev, docs.length - 2)));
    compiledRef.current = null;
    setExeName(null);
  };

  const commitRename = () => {
    if (renaming === null) return;
    const clean = renameDraft.trim();
    const clash = docs.some((d) => d.name !== renaming && d.name.toLowerCase() === clean.toLowerCase());
    if (clean && !clash) {
      setDocs((prev) => prev.map((d) => (d.name === renaming ? { ...d, name: clean, kind: kindOf(clean) } : d)));
      compiledRef.current = null;
      setExeName(null);
    }
    setRenaming(null);
  };

  const downloadDoc = (doc: DocFile) => {
    const blob = new Blob([doc.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const additions: DocFile[] = [];
    for (const f of Array.from(files)) {
      const text = await f.text();
      additions.push({ name: uniqueName([...docs, ...additions], f.name), content: text, kind: kindOf(f.name) });
    }
    if (additions.length) {
      setDocs((prev) => [...prev, ...additions]);
      setActive(docs.length);
      print([{ kind: "sys", text: `added ${additions.map((a) => a.name).join(", ")} - 'ls' to list, 'cat <file>' to view` }]);
    }
    e.target.value = "";
  };

  const syncScroll = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const ta = event.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const content = activeDoc.content;
      updateActive(`${content.slice(0, start)}    ${content.slice(end)}`);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  };

  const writtenFiles = Object.entries(result?.fileOutput ?? {});
  const visibleWarnings = (result?.warnings ?? []).filter((w) => !(awaitingInput && w.includes(STARVED_MARKER)));

  return (
    <div>
      <input ref={uploadRef} type="file" multiple accept=".cbl,.cob,.dat,.txt" onChange={onUpload} className="hidden" />
      {/* IDE window */}
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#0b1220] shadow-2xl">
        {/* top toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-700 bg-[#111a2e] px-3 py-2">
          <span className="mr-1 hidden items-center gap-1.5 sm:flex">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </span>
          <button
            type="button"
            onClick={run}
            disabled={running || !isCobol}
            title={isCobol ? "Compile all .cbl files and run (Ctrl+Enter)" : "Only COBOL programs can run here"}
            className="rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-bold text-white shadow transition hover:bg-rose-500 disabled:opacity-50"
          >
            {running ? "Running…" : "▶ Run"}
          </button>
          <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white">Cobol ▾</span>
          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300">COBOL ONLY</span>
          <select
            onChange={(e) => loadExample(e.target.value)}
            defaultValue=""
            className="max-w-[170px] rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-400"
          >
            <option value="">Load example… ({examples.length})</option>
            {examples.map((example) => (
              <option key={example.id} value={example.id}>
                {example.name}
              </option>
            ))}
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Program name"
            className="min-w-[120px] flex-1 rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-indigo-400"
          />
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-indigo-400 hover:text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "💾 Save"}
          </button>
        </div>

        {/* main 2-pane area: explorer+editor | terminal */}
        <div className="flex min-h-[480px] flex-col lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col sm:flex-row">
            {/* explorer */}
            <div className="shrink-0 border-b border-slate-800 bg-[#0d1526] sm:w-52 sm:border-b-0 sm:border-r">
              <div className="flex items-center justify-between px-3 pt-3 pb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Explorer</p>
                <div className="flex gap-1">
                  <button type="button" onClick={() => uploadRef.current?.click()} title="Add files from your computer (.cbl, .dat)" className="rounded px-1.5 text-sm text-slate-400 hover:bg-slate-700 hover:text-white">
                    ⭳
                  </button>
                  <button type="button" onClick={addCobolFile} title="New COBOL file" className="rounded px-1.5 text-sm text-slate-400 hover:bg-slate-700 hover:text-white">
                    ＋
                  </button>
                </div>
              </div>
              <div className="flex gap-1 overflow-x-auto px-2 pb-2 sm:flex-col sm:overflow-visible">
                {docs.map((doc, idx) =>
                  renaming === doc.name ? (
                    <input
                      key={doc.name}
                      autoFocus
                      value={renameDraft}
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") setRenaming(null);
                      }}
                      className="w-full rounded-md border border-indigo-400 bg-slate-800 px-2 py-1.5 font-mono text-xs text-white outline-none"
                    />
                  ) : (
                    <div
                      key={doc.name}
                      className={`group flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 transition ${
                        idx === safeActive ? "bg-slate-700/70" : "hover:bg-slate-800"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActive(idx)}
                        onDoubleClick={() => {
                          setRenaming(doc.name);
                          setRenameDraft(doc.name);
                        }}
                        title="Open (double-click to rename)"
                        className={`flex min-w-0 flex-1 items-center gap-1.5 rounded px-1 py-1 font-mono text-xs ${
                          idx === safeActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span className={doc.kind === "cobol" ? "text-indigo-400" : "text-amber-400/80"}>{doc.kind === "cobol" ? "≡" : "▤"}</span>
                        <span className="truncate">{doc.name}</span>
                      </button>
                      <span className="flex shrink-0 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          title="Rename"
                          onClick={() => {
                            setRenaming(doc.name);
                            setRenameDraft(doc.name);
                          }}
                          className="rounded px-1 text-xs text-slate-500 hover:bg-slate-600 hover:text-white"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          title={`Download ${doc.name}`}
                          onClick={() => downloadDoc(doc)}
                          className="rounded px-1 text-xs text-slate-500 hover:bg-slate-600 hover:text-white"
                        >
                          ⭳
                        </button>
                        {(doc.kind === "data" || cobolDocs.length > 1) && (
                          <button
                            type="button"
                            title="Remove"
                            onClick={() => closeDoc(idx)}
                            className="rounded px-1 text-xs text-slate-500 hover:bg-slate-600 hover:text-white"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    </div>
                  ),
                )}
              </div>
              <div className="flex items-center justify-between px-3 pt-1 pb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Data files</p>
                <button type="button" onClick={addDataFile} title="New data file (for SELECT … ASSIGN TO)" className="rounded px-1.5 text-sm text-slate-500 hover:bg-slate-700 hover:text-white">
                  ＋
                </button>
              </div>
              <p className="px-3 pb-3 text-[11px] leading-relaxed text-slate-600">Tip: double-click a file to rename it. Hover for ✎ rename, ⭳ download.</p>
            </div>

            {/* editor */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 bg-[#0d1526] px-2 pt-1.5">
                {docs.map((doc, idx) => (
                  <button
                    key={`${doc.kind}-${doc.name}`}
                    type="button"
                    onClick={() => setActive(idx)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-t-md px-3 py-1.5 font-mono text-xs transition ${
                      idx === safeActive ? "bg-[#0b1220] font-semibold text-white" : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                    }`}
                  >
                    {doc.name}
                    {doc.kind === "data" ? <span className="rounded bg-amber-500/15 px-1 text-[9px] font-bold text-amber-300">DATA</span> : null}
                  </button>
                ))}
              </div>
              <div className="relative flex max-h-[520px] min-h-[380px] flex-1">
                <div
                  ref={gutterRef}
                  className="hidden select-none overflow-hidden border-r border-slate-800 bg-[#0d1526] px-2 py-3 text-right font-mono text-[13px] leading-[1.55] text-slate-600 sm:block"
                >
                  {Array.from({ length: lineCount }, (_, idx) => (
                    <div key={idx}>{idx + 1}</div>
                  ))}
                </div>
                <div className="relative flex-1">
                  <pre
                    ref={preRef}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre px-3 py-3 font-mono text-[13px] leading-[1.55] text-slate-200"
                  >
                    <code dangerouslySetInnerHTML={{ __html: `${highlighted}\n` }} />
                  </pre>
                  <textarea
                    ref={textareaRef}
                    value={activeDoc.content}
                    onChange={(e) => updateActive(e.target.value)}
                    onScroll={syncScroll}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    wrap="off"
                    className="relative h-full min-h-[380px] w-full resize-none overflow-auto whitespace-pre bg-transparent px-3 py-3 font-mono text-[13px] leading-[1.55] text-transparent caret-emerald-300 outline-none selection:bg-indigo-500/40"
                    style={{ WebkitTextFillColor: "transparent" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* terminal */}
          <div className="flex min-h-[300px] shrink-0 flex-col border-t border-slate-800 bg-black lg:w-[380px] lg:border-t-0 lg:border-l">
            <div className="flex items-center gap-2 border-b border-slate-800 bg-[#111a2e] px-3 py-1.5">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">Terminal</p>
              {exeName ? <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">./{exeName}</span> : null}
              {writtenFiles.length ? <span className="font-mono text-[10px] text-slate-500">{writtenFiles.length} file(s) written</span> : null}
            </div>
            <div className="max-h-[480px] min-h-[260px] flex-1 overflow-auto p-3" onClick={() => termInputRef.current?.focus()}>
              <div className="font-mono text-xs leading-relaxed">
                {termLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.kind === "in"
                        ? "whitespace-pre-wrap text-emerald-300"
                        : line.kind === "err"
                          ? "whitespace-pre-wrap text-rose-400"
                          : line.kind === "sys"
                            ? "whitespace-pre-wrap text-slate-500"
                            : "whitespace-pre-wrap text-slate-200"
                    }
                  >
                    {line.text === "" ? " " : line.text}
                  </div>
                ))}
                {running ? <p className="animate-pulse text-slate-500">● running…</p> : null}
                {!running ? (
                  <form
                    className="flex items-center gap-1 pt-0.5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitInput();
                    }}
                  >
                    <span className={`shrink-0 font-bold ${awaitingInput ? "animate-pulse text-emerald-400" : "text-indigo-400"}`}>
                      {awaitingInput ? "›" : `${PROMPT} `}
                    </span>
                    <input
                      key={awaitingInput ? "prog" : "shell"}
                      ref={termInputRef}
                      autoFocus
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      aria-label={awaitingInput ? "Type program input" : "Type a terminal command"}
                      className="min-w-[60px] flex-1 border-0 bg-transparent p-0 font-mono text-xs text-slate-100 caret-emerald-400 outline-none"
                    />
                  </form>
                ) : null}
                <div ref={termEndRef} />
              </div>
            </div>
          </div>
        </div>

        {/* status bar */}
        <div className="flex items-center gap-3 border-t border-slate-700 bg-[#111a2e] px-3 py-1.5 font-mono text-[11px] text-slate-400">
          <span className={running ? "text-amber-400" : "text-emerald-400"}>● {running ? "Running" : "Ready"}</span>
          <span className="truncate">{activeDoc.name}</span>
          <span className="ml-auto shrink-0">
            {lineCount} lines · COBOL{result ? ` · ${result.runMs} ms` : ""}
          </span>
        </div>
      </div>

      {!isCobol ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          This compiler runs <strong>COBOL only</strong> (GnuCOBOL-compatible). Add an <span className="font-mono">IDENTIFICATION DIVISION</span> and a{" "}
          <span className="font-mono">PROCEDURE DIVISION</span> to enable Run.
        </p>
      ) : null}

      {shareUrl ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Share link copied to your clipboard: <span className="font-mono text-xs">{shareUrl}</span>
        </div>
      ) : null}

      {result && result.errors.length ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <p className="mb-1 text-sm font-semibold text-rose-800">Compiler / runtime messages</p>
          <ul className="space-y-1 font-mono text-[12px] text-rose-700">
            {result.errors.map((e, idx) => (
              <li key={idx}>error: {e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result && visibleWarnings.length ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="mb-1 text-sm font-semibold text-amber-800">Notes ({visibleWarnings.length})</p>
          <ul className="max-h-52 space-y-1 overflow-auto font-mono text-[11.5px] text-amber-800">
            {visibleWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <details className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <summary className="cursor-pointer font-semibold text-slate-800">Terminal cheatsheet</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-mono text-[12.5px]">
          <li>ls - list files (compiled programs show as ./name)</li>
          <li>cat {"<file>"} - print a file, including files your program wrote</li>
          <li>cobc -x -free {"<file>"} [-o name] - compile & syntax-check (real errors, GnuCOBOL-style)</li>
          <li>./{"<name>"} or run - execute; type live input when the program asks</li>
          <li>clear - wipe the terminal</li>
        </ul>
        <p className="mt-2">
          Explorer: double-click (or ✎) to <strong>rename</strong>, ⭳ to <strong>upload</strong> .cbl/.dat files from your
          computer, ⭳ per file to <strong>download</strong>. Editing any file un-compiles the program - run{" "}
          <span className="font-mono">cobc</span> again (just like real GnuCOBOL).
        </p>
      </details>
    </div>
  );
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
