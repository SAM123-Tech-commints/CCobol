"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { highlightCobol } from "@/lib/cobol/highlight";

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

interface DocFile {
  name: string;
  content: string;
  kind: "cobol" | "data";
}

type TermLine = { kind: "out" | "in" | "sys"; text: string };

/** OneCompiler-style IDE: explorer + editor tabs + STDIN/terminal panel + status bar. COBOL only. */
export default function Workbench({ examples, initialCode, initialStdin, initialFiles, initialTitle }: Props) {
  const [docs, setDocs] = useState<DocFile[]>(() => [
    { name: "HelloWorld.cbl", content: initialCode || DEFAULT_CODE, kind: "cobol" },
    ...Object.entries(initialFiles ?? {}).map(([name, content]) => ({ name, content, kind: "data" as const })),
  ]);
  const [active, setActive] = useState(0);
  const [stdin, setStdin] = useState(initialStdin || "");
  const [title, setTitle] = useState(initialTitle || "Untitled COBOL program");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputTab, setOutputTab] = useState<"terminal" | "files">("terminal");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [termLines, setTermLines] = useState<TermLine[]>([]);
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const termEndRef = useRef<HTMLDivElement>(null);
  const termOutputRef = useRef("");
  const echoRef = useRef<string[]>([]);
  const roundsRef = useRef(0);
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

  const combinedCode = useMemo(
    () =>
      docs
        .filter((d) => d.kind === "cobol")
        .map((d) => d.content)
        .join("\n"),
    [docs],
  );
  const dataFiles = useMemo(() => Object.fromEntries(docs.filter((d) => d.kind === "data").map((d) => [d.name, d.content])), [docs]);

  const isCobol = useMemo(() => {
    const upper = combinedCode.toUpperCase();
    return upper.includes("IDENTIFICATION DIVISION") || upper.includes("PROCEDURE DIVISION");
  }, [combinedCode]);

  const STARVED_MARKER = "past the end of the standard input";

  /** Execute the program. fresh=true resets the terminal; otherwise output is appended (interactive continue). */
  const runWith = useCallback(
    async (stdinVal: string, fresh: boolean) => {
      if (!isCobol) {
        setError(null);
        setAwaitingInput(false);
        setResult({
          output: "",
          fileOutput: {},
          errors: ["Only COBOL is supported here. Your program must contain an IDENTIFICATION DIVISION and a PROCEDURE DIVISION."],
          warnings: [],
          runMs: 0,
        });
        return;
      }
      if (fresh) {
        roundsRef.current = 0;
        echoRef.current = [];
        termOutputRef.current = "";
        setTermLines([{ kind: "sys", text: "$ cobc -x -free *.cbl && ./program" }]);
        setResult(null);
      }
      setRunning(true);
      setError(null);
      setAwaitingInput(false);
      try {
        const payload = { code: combinedCode, stdin: stdinVal, files: dataFiles };
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as RunResult & { error?: string };
        if (data.error) {
          setError(data.error);
          setTermLines((prev) => [...prev, { kind: "sys", text: `error: ${data.error}` }]);
        } else {
          setResult(data);
          setOutputTab(Object.keys(data.fileOutput ?? {}).length ? "files" : "terminal");
          const out = data.output ?? "";
          const prevOut = termOutputRef.current;
          if (fresh || !out.startsWith(prevOut)) {
            const rebuilt: TermLine[] = [{ kind: "sys", text: "$ cobc -x -free *.cbl && ./program" }];
            for (const echo of echoRef.current) rebuilt.push({ kind: "in", text: `› ${echo}` });
            for (const line of out.split("\n")) rebuilt.push({ kind: "out", text: line });
            setTermLines(rebuilt);
          } else if (out.length > prevOut.length) {
            const delta = out.slice(prevOut.length).split("\n");
            setTermLines((prevLines) => [...prevLines, ...delta.map((text) => ({ kind: "out" as const, text }))]);
          }
          termOutputRef.current = out;
          const starved = (data.warnings ?? []).some((w) => w.includes(STARVED_MARKER));
          if ((data.errors ?? []).length) {
            setAwaitingInput(false);
          } else if (starved && roundsRef.current < MAX_INTERACTIVE_ROUNDS) {
            setAwaitingInput(true);
          } else {
            setAwaitingInput(false);
            if (starved) {
              setTermLines((prevLines) => [
                ...prevLines,
                { kind: "sys", text: "■ input limit reached - prefill more lines in STDIN and Run again." },
              ]);
            } else {
              setTermLines((prevLines) => [...prevLines, { kind: "sys", text: `■ exited in ${data.runMs} ms - press Run to execute again.` }]);
            }
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not run the program.");
      } finally {
        setRunning(false);
      }
    },
    [combinedCode, dataFiles, isCobol],
  );

  const run = useCallback(() => runWith(stdin, true), [runWith, stdin]);

  /** User typed a line into the terminal for a waiting ACCEPT. */
  const submitInput = useCallback(() => {
    const line = inputValue;
    setInputValue("");
    setTermLines((prev) => [...prev, { kind: "in", text: `› ${line}` }]);
    echoRef.current.push(line);
    roundsRef.current += 1;
    const nextStdin = stdin + (stdin === "" || stdin.endsWith("\n") ? "" : "\n") + line + "\n";
    setStdin(nextStdin);
    void runWith(nextStdin, false);
  }, [inputValue, runWith, stdin]);

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

  const resetTerminal = () => {
    setTermLines([]);
    setAwaitingInput(false);
    setInputValue("");
    termOutputRef.current = "";
    echoRef.current = [];
    roundsRef.current = 0;
  };

  const loadExample = (id: string) => {
    const example = examples.find((e) => e.id === id);
    if (!example) return;
    setDocs([
      { name: `${example.id}.cbl`, content: example.code, kind: "cobol" },
      ...Object.entries(example.files ?? {}).map(([name, content]) => ({ name, content, kind: "data" as const })),
    ]);
    setActive(0);
    setStdin(example.stdin ?? "");
    setTitle(example.name);
    setResult(null);
    setShareUrl(null);
    resetTerminal();
  };

  const save = async () => {
    setSaving(true);
    setShareUrl(null);
    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, code: combinedCode, stdin, files: dataFiles }),
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
  };

  const addCobolFile = () => {
    const n = docs.filter((d) => d.kind === "cobol").length + 1;
    const name = `Program${n}.cbl`;
    setDocs((prev) => [...prev, { name, content: NEW_FILE_SKELETON(name), kind: "cobol" }]);
    setActive(docs.length);
  };

  const addDataFile = () => {
    const n = docs.filter((d) => d.kind === "data").length + 1;
    setDocs((prev) => [...prev, { name: `FILE${n}.DAT`, content: "", kind: "data" }]);
    setActive(docs.length);
  };

  const closeDoc = (idx: number) => {
    const target = docs[idx];
    if (target.kind === "cobol" && docs.filter((d) => d.kind === "cobol").length === 1) return;
    setDocs((prev) => prev.filter((_, i) => i !== idx));
    setActive((prev) => (idx < prev ? prev - 1 : Math.min(prev, docs.length - 2)));
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
  const cobolDocs = docs.filter((d) => d.kind === "cobol");
  const dataDocs = docs.filter((d) => d.kind === "data");

  return (
    <div>
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
            title={isCobol ? "Compile and run this COBOL program (Ctrl+Enter)" : "Only COBOL programs can run here"}
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
            <option value="">Load example…</option>
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

        {/* main 3-pane area */}
        <div className="flex min-h-[480px] flex-col lg:flex-row">
          {/* explorer */}
          <div className="shrink-0 border-b border-slate-800 bg-[#0d1526] lg:w-52 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between px-3 pt-3 pb-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Explorer</p>
              <button type="button" onClick={addCobolFile} title="New COBOL file" className="rounded px-1.5 text-sm text-slate-400 hover:bg-slate-700 hover:text-white">
                ＋
              </button>
            </div>
            <div className="flex gap-1 overflow-x-auto px-2 pb-2 lg:flex-col lg:overflow-visible">
              {cobolDocs.map((doc) => {
                const idx = docs.indexOf(doc);
                return (
                  <button
                    key={doc.name}
                    type="button"
                    onClick={() => setActive(idx)}
                    className={`group flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 font-mono text-xs transition ${
                      idx === safeActive ? "bg-slate-700/70 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-indigo-400">≡</span>
                    <span className="whitespace-nowrap">{doc.name}</span>
                    {cobolDocs.length > 1 ? (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          closeDoc(idx);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") closeDoc(idx);
                        }}
                        className="rounded px-1 text-slate-500 opacity-0 hover:bg-slate-600 hover:text-white group-hover:opacity-100"
                      >
                        ×
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between px-3 pt-1 pb-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Data files</p>
              <button type="button" onClick={addDataFile} title="New data file (for SELECT … ASSIGN TO)" className="rounded px-1.5 text-sm text-slate-500 hover:bg-slate-700 hover:text-white">
                ＋
              </button>
            </div>
            <div className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:overflow-visible">
              {dataDocs.length === 0 ? (
                <p className="px-2 text-[11px] text-slate-600">none yet ＋</p>
              ) : (
                dataDocs.map((doc) => {
                  const idx = docs.indexOf(doc);
                  return (
                    <button
                      key={doc.name}
                      type="button"
                      onClick={() => setActive(idx)}
                      className={`group flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 font-mono text-xs transition ${
                        idx === safeActive ? "bg-slate-700/70 text-white" : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                      }`}
                    >
                      <span className="text-amber-400/80">▤</span>
                      <span className="whitespace-nowrap">{doc.name}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          closeDoc(idx);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") closeDoc(idx);
                        }}
                        className="rounded px-1 text-slate-500 opacity-0 hover:bg-slate-600 hover:text-white group-hover:opacity-100"
                      >
                        ×
                      </span>
                    </button>
                  );
                })
              )}
            </div>
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

          {/* I/O panel */}
          <div className="flex shrink-0 flex-col border-t border-slate-800 bg-[#0d1526] lg:w-80 lg:border-t-0 lg:border-l">
            <div className="flex items-center gap-1 border-b border-slate-800 px-2 pt-1.5">
              {(
                [
                  ["terminal", "I/O"],
                  ["files", `Files (${writtenFiles.length})`],
                ] as ["terminal" | "files", string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setOutputTab(id)}
                  className={`rounded-t-md px-3 py-1.5 text-xs font-semibold transition ${
                    outputTab === id ? "bg-[#0b1220] text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="border-b border-slate-800 p-3">
              <p className="mb-1 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">STDIN</p>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Input for the program ( Optional ) — or leave empty and type live in the terminal below"
                className="h-20 w-full resize-y rounded-lg border border-slate-700 bg-slate-900 p-2 font-mono text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-400"
              />
            </div>
            <div className="flex max-h-[380px] min-h-[220px] flex-1 flex-col overflow-hidden">
              <p className="px-3 pt-2 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">Output</p>
              <div className="flex-1 overflow-auto p-3">
                {error ? (
                  <p className="font-mono text-xs text-rose-400">{error}</p>
                ) : outputTab === "files" ? (
                  writtenFiles.length ? (
                    <div className="space-y-3">
                      {writtenFiles.map(([name, content]) => (
                        <div key={name}>
                          <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-emerald-400">{name}</p>
                          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-200">{content}</pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-mono text-xs text-slate-500">No files were written by this program.</p>
                  )
                ) : (
                  <div className="font-mono text-xs leading-relaxed">
                    {termLines.length === 0 ? (
                      <p className="text-slate-500">Click on RUN button to see the output</p>
                    ) : (
                      termLines.map((line, idx) => (
                        <div key={idx} className={line.kind === "in" ? "text-emerald-300" : line.kind === "sys" ? "text-slate-500" : "whitespace-pre-wrap text-slate-200"}>
                          {line.text === "" ? " " : line.text}
                        </div>
                      ))
                    )}
                    {running ? <p className="animate-pulse text-slate-500">● running…</p> : null}
                    {awaitingInput && !running ? (
                      <form
                        className="mt-1 flex items-center gap-2 border-t border-slate-800 pt-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitInput();
                        }}
                      >
                        <span className="animate-pulse font-bold text-emerald-400">›</span>
                        <input
                          autoFocus
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Type input, Enter to send"
                          className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-100 outline-none placeholder:text-slate-600 focus:border-emerald-400"
                        />
                        <button type="submit" className="shrink-0 rounded-md bg-emerald-500 px-2.5 py-1.5 text-[11px] font-bold text-slate-900 hover:bg-emerald-400">
                          Send ⏎
                        </button>
                      </form>
                    ) : null}
                    <div ref={termEndRef} />
                  </div>
                )}
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
        <summary className="cursor-pointer font-semibold text-slate-800">How this terminal works</summary>
        <p className="mt-2">
          Press <strong>Run</strong> and the program executes in the I/O panel like a real console. When it reaches{" "}
          <span className="font-mono">ACCEPT</span> with no input left, it pauses and you type the value live (green{" "}
          <span className="font-mono">›</span> prompt). Prefill the <strong>STDIN</strong> box to skip typing, add multiple{" "}
          <strong>.cbl files</strong> with ＋ (they compile together, so <span className="font-mono">CALL</span> works between them),
          and add <strong>data files</strong> for <span className="font-mono">SELECT … ASSIGN TO</span>. Only COBOL runs here.
        </p>
      </details>
    </div>
  );
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
