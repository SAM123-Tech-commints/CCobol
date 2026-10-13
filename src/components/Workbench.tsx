"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { highlightCobol } from "@/lib/cobol/highlight";
import { parseSource } from "@/lib/cobol/units";
import {
  ClockIcon,
  DownloadIcon,
  FileCodeIcon,
  FileIcon,
  GearIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
  UploadIcon,
  XIcon,
} from "@/components/icons";
import AiPanel from "@/components/AiPanel";

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
  /** Output length when the program first ran out of stdin (real-console pause point). */
  inputStarvedAt?: number | null;
  /** Output offset of every ACCEPT that consumed a line of stdin (echo anchors). */
  acceptPoints?: number[];
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

interface HistoryEntry {
  id: string;
  ts: number;
  title: string;
  docs: DocFile[];
  stdin: string;
  ok: boolean;
  runMs: number;
}

export interface WorkbenchSettings {
  editorFont: number;
  termFont: number;
  tabSize: number;
  wrap: boolean;
  autoHistory: boolean;
  autoWorkspace: boolean;
}

const DEFAULT_SETTINGS: WorkbenchSettings = {
  editorFont: 13,
  termFont: 12,
  tabSize: 4,
  wrap: false,
  autoHistory: true,
  autoWorkspace: true,
};

const SETTINGS_KEY = "ocb-settings";
const HISTORY_KEY = "ocb-run-history";
const WORKSPACE_KEY = "ocb-workspace";
const HISTORY_LIMIT = 25;

/** Same empty-trailing-line filter the engine uses, so prefill line counts match ACCEPT consumption. */
function countPrefill(s: string): number {
  if (!s) return 0;
  return s.split("\n").filter((l, i, arr) => i < arr.length - 1 || l.length > 0).length;
}

function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

/** Build terminal lines from program output, merging every typed input onto the
 *  prompt line that consumed it. points[i] is the output offset of the ACCEPT that
 *  consumed stdin line i (prefill lines come first, then user-typed echoes). */
function renderTranscript(visible: string, points: number[], echoes: string[], prefillCount: number): TermLine[] {
  const lines: TermLine[] = [];
  let current = "";
  let cursor = 0;
  const flush = () => {
    lines.push({ kind: "out", text: current });
    current = "";
  };
  for (let i = 0; i < points.length; i++) {
    const p = Math.min(Math.max(points[i], cursor), visible.length);
    for (const ch of visible.slice(cursor, p)) {
      if (ch === "\n") flush();
      else current += ch;
    }
    cursor = p;
    const ei = i - prefillCount;
    if (ei >= 0 && ei < echoes.length) {
      const echo = echoes[ei];
      if (current !== "" && !current.endsWith(" ") && !echo.startsWith(" ")) current += " ";
      current += echo;
      // Pressing Enter in a real console moves the cursor to the next line, so
      // the typed line is echoed, then the program's following output starts on
      // a fresh line (never glued on as "SamHELLO Sam").
      flush();
    }
  }
  for (const ch of visible.slice(cursor)) {
    if (ch === "\n") flush();
    else current += ch;
  }
  flush();
  return lines;
}

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
  const [settings, setSettings] = useState<WorkbenchSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const termEndRef = useRef<HTMLDivElement>(null);
  const termInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const echoRef = useRef<string[]>([]);
  const roundsRef = useRef(0);
  const stdinAccRef = useRef(initialStdin || "");
  const prefillRef = useRef(initialStdin || "");
  const writtenRef = useRef<Record<string, string>>({});
  const compiledRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cmdHistoryRef = useRef<string[]>([]);
  const cmdIdxRef = useRef(0);
  const hydratedRef = useRef(false);
  const MAX_INTERACTIVE_ROUNDS = 12;

  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [termLines, awaitingInput, running]);

  // Guarantee the cursor lands in the program-input field the moment the
  // program starts waiting for ACCEPT (VS Code behaviour).
  useEffect(() => {
    if (awaitingInput && !running) {
      const t = setTimeout(() => termInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [awaitingInput, running]);

  const safeActive = Math.min(active, docs.length - 1);
  const activeDoc = docs[safeActive];

  /** Snapshot the current program into local run history. */
  const rememberRun = useCallback(
    (ok: boolean, runMs: number) => {
      if (!settings.autoHistory) return;
      setHistory((prev) => {
        const entry: HistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ts: Date.now(),
          title: title || activeDoc.name,
          docs,
          stdin: prefillRef.current,
          ok,
          runMs,
        };
        const next = [entry, ...prev].slice(0, HISTORY_LIMIT);
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [activeDoc, docs, settings.autoHistory, title],
  );

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

  // Hydrate settings + local history + last workspace from this browser.
  useEffect(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(s) as Partial<WorkbenchSettings>) });
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h) as HistoryEntry[]);
      const shares = typeof window !== "undefined" ? window.location.search : "";
      const restore = localStorage.getItem(WORKSPACE_KEY);
      if (restore && !initialCode && !shares.includes("share=") && !shares.includes("example=") && !shares.includes("code=")) {
        const ws = JSON.parse(restore) as { title?: string; docs?: DocFile[]; active?: number };
        if (ws.docs && ws.docs.length && ws.docs.every((d) => d && typeof d.name === "string" && typeof d.content === "string")) {
          setDocs(ws.docs.map((d) => ({ ...d, kind: kindOf(d.name) })));
          setActive(Math.min(ws.active ?? 0, ws.docs.length - 1));
          if (ws.title) setTitle(ws.title);
          print([{ kind: "sys", text: "restored your last workspace from this browser. Select Settings to start fresh." }]);
        }
      }
    } catch {
      // corrupted local data must never break the editor
    }
    setTimeout(() => {
      hydratedRef.current = true;
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist settings.
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Autosave the workspace (debounced) so a refresh never loses code.
  useEffect(() => {
    if (!hydratedRef.current || !settings.autoWorkspace) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(WORKSPACE_KEY, JSON.stringify({ title, docs, active }));
      } catch {}
    }, 800);
    return () => clearTimeout(t);
  }, [docs, title, active, settings.autoWorkspace]);

  /** Execute the compiled program. fresh=true restarts it; every round re-renders the
   *  whole transcript deterministically from the engine's output (echoes merged onto the
   *  prompt lines that consumed them), so prompts can never duplicate or drift. */
  const runWith = useCallback(
    async (stdinVal: string, fresh: boolean, exe: string) => {
      if (!isCobol) {
        setError(null);
        setAwaitingInput(false);
        setResult({ output: "", fileOutput: {}, errors: ["Only COBOL is supported here."], warnings: [], runMs: 0, inputStarvedAt: null, acceptPoints: [] });
        return;
      }
      if (fresh) {
        roundsRef.current = 0;
        echoRef.current = [];
        // Fresh run restarts input from the prefill (shared/example stdin),
        // so old typed lines never leak into the new execution.
        stdinAccRef.current = prefillRef.current;
        writtenRef.current = {};
        setResult(null);
      }
      setRunning(true);
      setError(null);
      setAwaitingInput(false);
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: combinedCode, stdin: stdinVal, files: dataFiles }),
          signal: ac.signal,
        });
        const data = (await res.json()) as RunResult & { error?: string };
        if (data.error) {
          setError(data.error);
          print([{ kind: "err", text: `error: ${data.error}` }]);
        } else {
          setResult(data);
          const starved = (data.warnings ?? []).some((w) => w.includes(STARVED_MARKER));
          const willPause = starved && (data.errors ?? []).length === 0 && roundsRef.current < MAX_INTERACTIVE_ROUNDS;
          const fullOut = data.output ?? "";
          // Show the program only up to the point where it asked for input -
          // exactly like a real interactive console that halts at ACCEPT.
          const visible = willPause && typeof data.inputStarvedAt === "number" ? fullOut.slice(0, data.inputStarvedAt) : fullOut;
          const rendered = renderTranscript(visible, data.acceptPoints ?? [], echoRef.current, countPrefill(prefillRef.current));
          for (const [name, content] of Object.entries(data.fileOutput ?? {})) writtenRef.current[name] = content;
          const wroteLines: TermLine[] = Object.entries(writtenRef.current).map(([name, content]) => ({
            kind: "sys" as const,
            text: `wrote ${name} (${content.length} bytes) - type 'cat ${name}' to view`,
          }));
          const tail: TermLine[] = [...wroteLines];
          if ((data.errors ?? []).length) {
            for (const e of data.errors ?? []) tail.push({ kind: "err", text: `error: ${e}` });
          } else if (willPause) {
            tail.push({ kind: "sys", text: "(waiting for input - type it and press Enter)" });
          } else if (starved) {
            tail.push({ kind: "sys", text: "input limit reached - type 'run' with fewer ACCEPTs, or prefill via a data file." });
          } else {
            tail.push({ kind: "sys", text: `'${exe}' exited in ${data.runMs} ms` });
          }
          // Replace everything after the last "$ ./prog" invocation line: the
          // shell history above stays put, the program transcript below is
          // rebuilt from scratch - duplicates are impossible by construction.
          setTermLines((prev) => {
            let cut = prev.length;
            for (let i = prev.length - 1; i >= 0; i--) {
              if (prev[i].kind === "sys" && prev[i].text.startsWith("$ ")) {
                cut = i + 1;
                break;
              }
            }
            return [...prev.slice(0, cut), ...rendered, ...tail];
          });
          setAwaitingInput((data.errors ?? []).length === 0 && willPause);
          if (fresh) rememberRun((data.errors ?? []).length === 0, data.runMs);
        }
      } catch (e) {
        if ((e as { name?: string })?.name === "AbortError") {
          print([{ kind: "sys", text: "^C - run cancelled. Type 'run' to start again." }]);
        } else {
          const msg = e instanceof Error ? e.message : "Could not run the program.";
          setError(msg);
          print([{ kind: "err", text: `error: ${msg}` }]);
        }
      } finally {
        setRunning(false);
        abortRef.current = null;
      }
    },
    [combinedCode, dataFiles, isCobol, print, rememberRun],
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
        // Like GnuCOBOL's cobc -x prog.cbl && ./prog: auto-compile if needed.
        if (!compiledRef.current) {
          if (!compileDocs(cobolDocs, defaultExe)) return;
        }
        shellRun(compiledRef.current ?? defaultExe);
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
    if (running) return;
    const line = inputValue;
    setInputValue("");
    if (awaitingInput) {
      echoRef.current.push(line);
      roundsRef.current += 1;
      const acc = stdinAccRef.current;
      const nextStdin = acc + (acc === "" || acc.endsWith("\n") ? "" : "\n") + line + "\n";
      stdinAccRef.current = nextStdin;
      void runWith(nextStdin, false, compiledRef.current ?? defaultExe);
    } else {
      if (line.trim()) {
        cmdHistoryRef.current.push(line);
        if (cmdHistoryRef.current.length > 100) cmdHistoryRef.current.shift();
        cmdIdxRef.current = cmdHistoryRef.current.length;
      }
      handleCommand(line);
    }
  }, [awaitingInput, defaultExe, handleCommand, inputValue, runWith, running]);

  /** Stop a run in flight (Stop button / Ctrl+C): abort the request like a real ^C. */
  const stopRun = useCallback(() => {
    abortRef.current?.abort();
    setInputValue("");
  }, []);

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
    prefillRef.current = example.stdin ?? "";
    stdinAccRef.current = example.stdin ?? "";
    resetTerminal(`Loaded '${example.name}' - compile it:  cobc -x -free ${example.id}.cbl`);
  };

  /** Restore a run-history snapshot: files, title and stdin prefill. */
  const restoreEntry = (entry: HistoryEntry) => {
    resetTerminal(`Restored '${entry.title}' from local history.`);
    setDocs(entry.docs.map((d) => ({ ...d, kind: kindOf(d.name) })));
    setActive(0);
    setTitle(entry.title);
    prefillRef.current = entry.stdin ?? "";
    stdinAccRef.current = entry.stdin ?? "";
    setResult(null);
    setShareUrl(null);
    setShowHistory(false);
  };

  const deleteEntry = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  };

  /** Wipe everything this browser remembers: workspace, history and settings. */
  const resetLocalData = () => {
    try {
      localStorage.removeItem(WORKSPACE_KEY);
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(SETTINGS_KEY);
    } catch {}
    setHistory([]);
    setSettings(DEFAULT_SETTINGS);
    setDocs([{ name: "HelloWorld.cbl", content: DEFAULT_CODE, kind: "cobol" }]);
    setActive(0);
    setTitle("Hello, World!");
    prefillRef.current = "";
    setShowSettings(false);
    resetTerminal("Cleared saved workspace, history and settings for this browser.");
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
      const text = (await f.text()).replace(/\r\n/g, "\n");
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
      const indent = " ".repeat(settings.tabSize);
      updateActive(`${content.slice(0, start)}${indent}${content.slice(end)}`);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + settings.tabSize;
      });
    }
  };

  const writtenFiles = Object.entries(result?.fileOutput ?? {});
  const visibleWarnings = (result?.warnings ?? []).filter((w) => !(awaitingInput && w.includes(STARVED_MARKER)));

  return (
    <div>
      <input ref={uploadRef} type="file" multiple accept=".cbl,.cob,.dat,.txt" onChange={onUpload} className="hidden" />
      {/* IDE window */}
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#091524] shadow-2xl">
        {/* top toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-700 bg-[#0b1625] px-3 py-2">
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
            <span className="inline-flex items-center gap-1.5">
              <PlayIcon width={12} height={12} />
              {running ? "Running…" : "Run"}
            </span>
          </button>
          <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white">Cobol</span>
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
            <span className="inline-flex items-center gap-1.5">
              <SaveIcon width={12} height={12} />
              {saving ? "Saving…" : "Save"}
            </span>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowHistory((v) => !v);
                setShowSettings(false);
              }}
              title="Local run history (saved in this browser)"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                showHistory ? "border-indigo-400 text-white" : "border-slate-600 text-slate-200 hover:border-indigo-400 hover:text-white"
              }`}
            >
              <ClockIcon width={12} height={12} />
              History{history.length ? ` (${history.length})` : ""}
            </button>
            {showHistory ? (
              <div className="absolute right-0 top-full z-50 mt-1 max-h-80 w-80 overflow-auto rounded-lg border border-slate-600 bg-[#0b1625] p-2 shadow-2xl">
                <div className="flex items-center justify-between px-1 pb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Local history</p>
                  {history.length ? (
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="text-[11px] font-semibold text-rose-400 hover:text-rose-300"
                    >
                      Clear all
                    </button>
                  ) : null}
                </div>
                {history.length === 0 ? (
                  <p className="px-1 py-3 text-xs text-slate-500">
                    No runs saved yet. Every time you press Run, a snapshot of your program is kept here (this browser only).
                  </p>
                ) : (
                  history.map((entry) => (
                    <div key={entry.id} className="group flex items-center gap-1 rounded-md px-1 hover:bg-slate-800">
                      <button type="button" onClick={() => restoreEntry(entry)} className="min-w-0 flex-1 py-1 text-left">
                        <p className="truncate text-xs font-semibold text-slate-200">{entry.title}</p>
                        <p className="font-mono text-[10px] text-slate-500">
                          {timeAgo(entry.ts)} · {entry.ok ? `ran in ${entry.runMs} ms` : "had errors"} · {entry.docs.length} file(s)
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEntry(entry.id)}
                        title="Delete entry"
                        className="rounded p-1 text-slate-500 opacity-0 transition hover:bg-slate-700 hover:text-rose-300 group-hover:opacity-100"
                      >
                        <XIcon width={12} height={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              setShowSettings((v) => !v);
              setShowHistory(false);
            }}
            title="Compiler settings"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              showSettings ? "border-indigo-400 text-white" : "border-slate-600 text-slate-200 hover:border-indigo-400 hover:text-white"
            }`}
          >
            <GearIcon width={12} height={12} />
            Settings
          </button>
        </div>

        {/* main 2-pane area: explorer+editor | terminal */}
        <div className="flex min-h-[480px] flex-col lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col sm:flex-row">
            {/* explorer */}
            <div className="shrink-0 border-b border-slate-800 bg-[#0a1422] sm:w-52 sm:border-b-0 sm:border-r">
              <div className="flex items-center justify-between px-3 pt-3 pb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Explorer</p>
                <div className="flex gap-1">
                  <button type="button" onClick={() => uploadRef.current?.click()} title="Add files from your computer (.cbl, .dat)" className="flex items-center rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white">
                    <UploadIcon width={14} height={14} />
                  </button>
                  <button type="button" onClick={addCobolFile} title="New COBOL file" className="flex items-center rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white">
                    <PlusIcon width={14} height={14} />
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
                        <span className={`shrink-0 ${doc.kind === "cobol" ? "text-indigo-400" : "text-amber-400/80"}`}>
                          {doc.kind === "cobol" ? <FileCodeIcon width={13} height={13} /> : <FileIcon width={13} height={13} />}
                        </span>
                        <span className="truncate">{doc.name}</span>
                      </button>
                      <span className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          title="Rename"
                          onClick={() => {
                            setRenaming(doc.name);
                            setRenameDraft(doc.name);
                          }}
                          className="rounded p-1 text-slate-500 hover:bg-slate-600 hover:text-white"
                        >
                          <PencilIcon width={12} height={12} />
                        </button>
                        <button
                          type="button"
                          title={`Download ${doc.name}`}
                          onClick={() => downloadDoc(doc)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-600 hover:text-white"
                        >
                          <DownloadIcon width={12} height={12} />
                        </button>
                        {(doc.kind === "data" || cobolDocs.length > 1) && (
                          <button
                            type="button"
                            title="Remove"
                            onClick={() => closeDoc(idx)}
                            className="rounded p-1 text-slate-500 hover:bg-slate-600 hover:text-white"
                          >
                            <XIcon width={12} height={12} />
                          </button>
                        )}
                      </span>
                    </div>
                  ),
                )}
              </div>
              <div className="flex items-center justify-between px-3 pt-1 pb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Data files</p>
                <button type="button" onClick={addDataFile} title="New data file (for SELECT … ASSIGN TO)" className="flex items-center rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-white">
                  <PlusIcon width={14} height={14} />
                </button>
              </div>
              <p className="px-3 pb-3 text-[11px] leading-relaxed text-slate-600">Tip: double-click a file to rename it. Hover a file for rename and download.</p>
            </div>

            {/* editor */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 bg-[#0a1422] px-2 pt-1.5">
                {docs.map((doc, idx) => (
                  <button
                    key={`${doc.kind}-${doc.name}`}
                    type="button"
                    onClick={() => setActive(idx)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-t-md px-3 py-1.5 font-mono text-xs transition ${
                      idx === safeActive ? "bg-[#091524] font-semibold text-white" : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
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
                  className="hidden select-none overflow-hidden border-r border-slate-800 bg-[#0a1422] px-2 py-3 text-right font-mono text-slate-600 sm:block"
                  style={{ fontSize: settings.editorFont, lineHeight: 1.55 }}
                >
                  {Array.from({ length: lineCount }, (_, idx) => (
                    <div key={idx}>{idx + 1}</div>
                  ))}
                </div>
                <div className="relative flex-1">
                  <pre
                    ref={preRef}
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 overflow-hidden px-3 py-3 font-mono text-slate-200 ${
                      settings.wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
                    }`}
                    style={{ fontSize: settings.editorFont, lineHeight: 1.55 }}
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
                    wrap={settings.wrap ? "soft" : "off"}
                    className={`relative h-full min-h-[380px] w-full resize-none overflow-auto bg-transparent px-3 py-3 font-mono text-transparent caret-emerald-300 outline-none selection:bg-indigo-500/40 ${
                      settings.wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
                    }`}
                    style={{ fontSize: settings.editorFont, lineHeight: 1.55, WebkitTextFillColor: "transparent" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* terminal */}
          <div className="flex min-h-[300px] shrink-0 flex-col border-t border-slate-800 bg-black lg:w-[380px] lg:border-t-0 lg:border-l">
            <div className="flex items-center gap-2 border-b border-slate-800 bg-[#0b1625] px-3 py-1.5">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">Terminal</p>
              {exeName ? <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">./{exeName}</span> : null}
              {writtenFiles.length ? <span className="font-mono text-[10px] text-slate-500">{writtenFiles.length} file(s) written</span> : null}
              {running ? (
                <button
                  type="button"
                  onClick={stopRun}
                  title="Stop the run (like Ctrl+C)"
                  className="rounded bg-rose-600/80 px-2 py-0.5 font-mono text-[10px] font-bold text-white transition hover:bg-rose-500"
                >
                  Stop
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setTermLines([])}
                title="Clear terminal (like the 'clear' command)"
                className="ml-auto rounded p-1 text-slate-500 transition hover:bg-slate-700 hover:text-slate-200"
              >
                <TrashIcon width={13} height={13} />
              </button>
            </div>
            <div
              className="max-h-[480px] min-h-[260px] flex-1 overflow-auto p-3 outline-none"
              tabIndex={0}
              onClick={(e) => {
                if (termInputRef.current) termInputRef.current.focus();
                else e.currentTarget.focus();
              }}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "c") {
                  e.preventDefault();
                  if (running) stopRun();
                  else setInputValue("");
                }
              }}
            >
              <div className="font-mono leading-relaxed" style={{ fontSize: settings.termFont }}>
                {(() => {
                  // VS Code-style input: when the program waits for ACCEPT, the
                  // cursor sits directly at the end of the program's last
                  // non-empty output line - no shell prompt, no blank line.
                  const waiting = awaitingInput && !running;

                  // Where did the program stop printing? A trailing blank line (or
                  // no output at all) means it ended at the start of a line - the
                  // prompt advanced with a newline, so the cursor belongs on a fresh
                  // line, exactly like a real console. Otherwise the prompt had no
                  // newline (DISPLAY ... WITH NO ADVANCING) and typing continues on
                  // that same line.
                  let lastOutIdx = -1;
                  for (let i = termLines.length - 1; i >= 0; i--) {
                    if (termLines[i].kind === "out") {
                      lastOutIdx = i;
                      break;
                    }
                  }
                  const endedAtLineStart = lastOutIdx < 0 || termLines[lastOutIdx].text.trim() === "";

                  // The anchor is the last non-empty output line (trailing blanks
                  // and the "waiting" hint stay hidden while typing).
                  let anchorIdx = -1;
                  if (waiting) {
                    for (let i = termLines.length - 1; i >= 0; i--) {
                      const l = termLines[i];
                      if (l.kind === "out" && l.text.trim() === "") continue; // trailing blank
                      anchorIdx = i;
                      break;
                    }
                  }
                  const anchor = anchorIdx >= 0 ? termLines[anchorIdx] : null;
                  const inline = waiting && anchor?.kind === "out" && !endedAtLineStart;
                  // While waiting, don't render the skipped trailing blanks.
                  const shown = waiting && anchorIdx >= 0 ? termLines.slice(0, anchorIdx + 1) : termLines;

                  const lineClass = (kind: string) =>
                    kind === "in"
                      ? "whitespace-pre-wrap text-emerald-300"
                      : kind === "err"
                        ? "whitespace-pre-wrap text-rose-400"
                        : kind === "sys"
                          ? "whitespace-pre-wrap text-slate-500"
                          : "whitespace-pre-wrap text-slate-200";

                  return (
                    <>
                      {shown.map((line, idx) => (
                        <div key={idx} className={lineClass(line.kind)}>
                          {line.text === "" ? " " : line.text}
                        </div>
                      ))}
                      {running ? <p className="animate-pulse text-slate-500">● running…</p> : null}
                      {!running && waiting ? (
                        // Program input: typed characters appear right on the
                        // program's own prompt line (or a bare line if it
                        // printed nothing before ACCEPT).
                        <form
                          className={inline ? "flex items-center" : "flex items-center"}
                          onSubmit={(e) => {
                            e.preventDefault();
                            submitInput();
                          }}
                        >
                          {inline ? <span className="whitespace-pre text-slate-200">{anchor?.text}</span> : null}
                          <input
                            ref={termInputRef}
                            autoFocus
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.ctrlKey && e.key === "c") {
                                e.preventDefault();
                                setAwaitingInput(false);
                                setInputValue("");
                                print([{ kind: "sys", text: "^C - input cancelled. Type 'run' to start the program again." }]);
                              }
                            }}
                            aria-label="Type program input"
                            placeholder={inline ? undefined : "Type input, Enter to send"}
                            className="min-w-[80px] flex-1 border-0 bg-transparent p-0 font-mono text-slate-100 caret-emerald-400 outline-none placeholder:text-slate-600"
                            style={{ fontSize: settings.termFont }}
                          />
                        </form>
                      ) : !running ? (
                        // Shell mode: commands typed at the cobol-dev:~$ prompt.
                        <form
                          className="flex items-center gap-1 pt-0.5"
                          onSubmit={(e) => {
                            e.preventDefault();
                            submitInput();
                          }}
                        >
                          <span className="shrink-0 font-bold text-indigo-400">{`${PROMPT} `}</span>
                          <input
                            ref={termInputRef}
                            autoFocus
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.ctrlKey && e.key === "c") {
                                e.preventDefault();
                                setInputValue("");
                                cmdIdxRef.current = cmdHistoryRef.current.length;
                              } else if (e.key === "ArrowUp" && cmdHistoryRef.current.length) {
                                e.preventDefault();
                                cmdIdxRef.current = Math.max(0, cmdIdxRef.current - 1);
                                setInputValue(cmdHistoryRef.current[cmdIdxRef.current] ?? "");
                              } else if (e.key === "ArrowDown") {
                                e.preventDefault();
                                cmdIdxRef.current = Math.min(cmdHistoryRef.current.length, cmdIdxRef.current + 1);
                                setInputValue(cmdHistoryRef.current[cmdIdxRef.current] ?? "");
                              }
                            }}
                            aria-label="Type a terminal command"
                            className="min-w-[60px] flex-1 border-0 bg-transparent p-0 font-mono text-slate-100 caret-emerald-400 outline-none"
                            style={{ fontSize: settings.termFont }}
                          />
                        </form>
                      ) : null}
                    </>
                  );
                })()}
                <div ref={termEndRef} />
              </div>
            </div>
          </div>
          </div>

        <AiPanel code={combinedCode} title={title} />

        {/* status bar */}
        <div className="flex items-center gap-3 border-t border-slate-700 bg-[#0b1625] px-3 py-1.5 font-mono text-[11px] text-slate-400">
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

      {showSettings ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowSettings(false)}>
          <div
            className="w-full max-w-md rounded-xl border border-slate-600 bg-[#0b1625] p-4 text-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-bold text-white">Compiler settings</p>
              <button type="button" onClick={() => setShowSettings(false)} className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white">
                <XIcon width={14} height={14} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <label className="flex items-center justify-between gap-3">
                <span>Editor font size</span>
                <span className="flex items-center gap-2">
                  <input
                    type="range"
                    min={11}
                    max={20}
                    value={settings.editorFont}
                    onChange={(e) => setSettings((s) => ({ ...s, editorFont: Number(e.target.value) }))}
                    className="w-36 accent-indigo-500"
                  />
                  <span className="w-9 text-right font-mono text-slate-400">{settings.editorFont}px</span>
                </span>
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Terminal font size</span>
                <span className="flex items-center gap-2">
                  <input
                    type="range"
                    min={10}
                    max={18}
                    value={settings.termFont}
                    onChange={(e) => setSettings((s) => ({ ...s, termFont: Number(e.target.value) }))}
                    className="w-36 accent-indigo-500"
                  />
                  <span className="w-9 text-right font-mono text-slate-400">{settings.termFont}px</span>
                </span>
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Indent size (Tab key)</span>
                <select
                  value={settings.tabSize}
                  onChange={(e) => setSettings((s) => ({ ...s, tabSize: Number(e.target.value) }))}
                  className="rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-400"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span>Wrap long lines in the editor</span>
                <input
                  type="checkbox"
                  checked={settings.wrap}
                  onChange={(e) => setSettings((s) => ({ ...s, wrap: e.target.checked }))}
                  className="h-4 w-4 accent-indigo-500"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span>Save every run to local history</span>
                <input
                  type="checkbox"
                  checked={settings.autoHistory}
                  onChange={(e) => setSettings((s) => ({ ...s, autoHistory: e.target.checked }))}
                  className="h-4 w-4 accent-indigo-500"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span>Keep my code between visits (this browser)</span>
                <input
                  type="checkbox"
                  checked={settings.autoWorkspace}
                  onChange={(e) => setSettings((s) => ({ ...s, autoWorkspace: e.target.checked }))}
                  className="h-4 w-4 accent-indigo-500"
                />
              </label>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
              Settings, history and your workspace are stored only in this browser (localStorage). Shortcuts: Ctrl+Enter to
              run, Ctrl+C in the terminal to cancel program input.
            </p>
            <button
              type="button"
              onClick={resetLocalData}
              className="mt-3 w-full rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10"
            >
              Clear saved workspace, history & settings
            </button>
          </div>
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
          <li>↑ / ↓ recall previous commands · Ctrl+C or Stop cancels a run · clear wipes the terminal</li>
        </ul>
        <p className="mt-2">
          Explorer: double-click a file (or the pencil button) to <strong>rename</strong>, use the upload button to add
          .cbl/.dat files from your computer, and the download button to save any file. Editing any file un-compiles the
          program - run <span className="font-mono">cobc</span> again (just like real GnuCOBOL).
        </p>
        <p className="mt-2">
          <strong>History</strong> keeps a snapshot of every run in this browser - click one to restore its files.
          <strong> Settings</strong> controls editor/terminal font size, indent size, line wrap and autosave. Ctrl+Enter
          runs the program from anywhere.
        </p>
      </details>
    </div>
  );
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
