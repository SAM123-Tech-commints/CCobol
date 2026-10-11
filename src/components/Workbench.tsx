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

type Tab = "stdin" | "files" | "notes";

export default function Workbench({ examples, initialCode, initialStdin, initialFiles, initialTitle }: Props) {
  const [code, setCode] = useState(initialCode || DEFAULT_CODE);
  const [stdin, setStdin] = useState(initialStdin || "");
  const [files, setFiles] = useState<{ name: string; content: string }[]>(
    Object.entries(initialFiles ?? {}).map(([name, content]) => ({ name, content })),
  );
  const [title, setTitle] = useState(initialTitle || "Untitled COBOL program");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("stdin");
  const [outputTab, setOutputTab] = useState<"output" | "written">("output");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const highlighted = useMemo(() => highlightCobol(code), [code]);
  const lineCount = useMemo(() => code.split("\n").length, [code]);
  const isCobol = useMemo(() => {
    const upper = code.toUpperCase();
    return upper.includes("IDENTIFICATION DIVISION") || upper.includes("PROCEDURE DIVISION");
  }, [code]);

  const run = useCallback(async () => {
    if (!isCobol) {
      setError(null);
      setResult({
        output: "",
        fileOutput: {},
        errors: ["Only COBOL is supported here. Your program must contain an IDENTIFICATION DIVISION and a PROCEDURE DIVISION."],
        warnings: [],
        runMs: 0,
      });
      return;
    }
    setRunning(true);
    setError(null);
    try {
      const payload = {
        code,
        stdin,
        files: Object.fromEntries(files.map((f) => [f.name, contentOf(f)])),
      };
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as RunResult & { error?: string };
      if (data.error) setError(data.error);
      else {
        setResult(data);
        setOutputTab(Object.keys(data.fileOutput ?? {}).length ? "written" : "output");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not run the program.");
    } finally {
      setRunning(false);
    }
  }, [code, files, isCobol, stdin]);

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

  const loadExample = (id: string) => {
    const example = examples.find((e) => e.id === id);
    if (!example) return;
    setCode(example.code);
    setStdin(example.stdin ?? "");
    setFiles(Object.entries(example.files ?? {}).map(([name, content]) => ({ name, content })));
    setTitle(example.name);
    setResult(null);
    setShareUrl(null);
  };

  const save = async () => {
    setSaving(true);
    setShareUrl(null);
    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          code,
          stdin,
          files: Object.fromEntries(files.map((f) => [f.name, contentOf(f)])),
        }),
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
      const next = `${code.slice(0, start)}    ${code.slice(end)}`;
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  };

  const writtenFiles = Object.entries(result?.fileOutput ?? {});

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* editor column */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            onChange={(e) => loadExample(e.target.value)}
            defaultValue=""
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none"
          >
            <option value="">Load an example…</option>
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
            className="min-w-[140px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-400 hover:text-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save & Share"}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#0b1220] shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-700 bg-[#111a2e] px-3 py-2">
            <span className="font-mono text-xs text-slate-400">program.cob <span className="ml-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">COBOL ONLY</span></span>
            <span className="text-[11px] text-slate-500">{lineCount} lines · fixed or free format</span>
          </div>
          <div className="relative flex max-h-[460px] min-h-[320px]">
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
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={syncScroll}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                wrap="off"
                className="relative h-full min-h-[320px] w-full resize-none overflow-auto whitespace-pre bg-transparent px-3 py-3 font-mono text-[13px] leading-[1.55] text-transparent caret-emerald-300 outline-none selection:bg-indigo-500/40"
                style={{ WebkitTextFillColor: "transparent" }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex gap-1 border-b border-slate-200 px-2 pt-2">
            {([
              ["stdin", `Input (stdin)`],
              ["files", `Data files (${files.length})`],
              ["notes", "How it works"],
            ] as [Tab, string][]).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-t-lg px-3 py-2 text-sm font-medium transition ${
                  tab === id ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="p-3">
            {tab === "stdin" ? (
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder={"One line per ACCEPT statement, e.g.\nMaria\n30"}
                className="h-24 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-mono text-[12.5px] text-slate-800 outline-none focus:border-indigo-400"
              />
            ) : null}
            {tab === "files" ? (
              <div className="space-y-3">
                {files.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No data files. Add one (for example <span className="font-mono">SAMPLE.DAT</span>) if your program uses
                    <span className="font-mono"> SELECT … ASSIGN TO</span>.
                  </p>
                ) : null}
                {files.map((file, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 border-b border-slate-200 px-2 py-1.5">
                      <input
                        value={file.name}
                        onChange={(e) => {
                          const next = [...files];
                          next[idx] = { ...file, name: e.target.value };
                          setFiles(next);
                        }}
                        className="flex-1 bg-transparent font-mono text-xs text-slate-700 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                        className="text-xs text-slate-400 hover:text-rose-600"
                      >
                        remove
                      </button>
                    </div>
                    <textarea
                      value={file.content}
                      onChange={(e) => {
                        const next = [...files];
                        next[idx] = { ...file, content: e.target.value };
                        setFiles(next);
                      }}
                      className="h-24 w-full resize-y rounded-b-lg bg-slate-50 p-2.5 font-mono text-[12.5px] text-slate-800 outline-none focus:border-indigo-400"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFiles([...files, { name: `FILE${files.length + 1}.DAT`, content: "" }])}
                  className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-700"
                >
                  + Add data file
                </button>
              </div>
            ) : null}
            {tab === "notes" ? (
              <div className="space-y-2 text-sm leading-relaxed text-slate-600">
                <p>
                  Programs are compiled and executed by the built-in GnuCOBOL-compatible engine: the four divisions,
                  <span className="font-mono"> PIC</span> clauses, <span className="font-mono">OCCURS</span>,<span className="font-mono"> PERFORM</span>,
                  <span className="font-mono"> EVALUATE</span>,<span className="font-mono"> STRING/UNSTRING/INSPECT</span>,<span className="font-mono"> SEARCH</span>,
                  sequential / relative / indexed files, <span className="font-mono">CALL</span> between programs in the same source and
                  most intrinsic functions.
                </p>
                <p>
                  Numeric <span className="font-mono">DISPLAY</span> keeps COBOL&apos;s fixed-width fields (leading zeros, decimal
                  point inserted for <span className="font-mono">V</span> pictures). <span className="font-mono">ACCEPT</span> reads one
                  line at a time from the stdin box, and files created by your program appear in the{' '}
                  <em>Files written</em> tab.
                </p>
                <p>
                  Compiler extensions such as <span className="font-mono">ALLOCATE</span>,<span className="font-mono"> EXEC SQL</span> or
                  <span className="font-mono"> COPY</span> are reported as warnings instead of being executed.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={running || !isCobol}
            title={isCobol ? "Compile and run this COBOL program" : "Only COBOL programs can run here"}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {running ? "Running…" : "▶ Run COBOL"}
          </button>
          <span className="text-xs text-slate-500">
            or press <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[11px]">Ctrl</kbd> +{" "}
            <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[11px]">Enter</kbd>
          </span>
        </div>
        {!isCobol ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            This compiler runs <strong>COBOL only</strong> (GnuCOBOL-compatible). Add an{" "}
            <span className="font-mono">IDENTIFICATION DIVISION</span> and a{" "}
            <span className="font-mono">PROCEDURE DIVISION</span> to enable Run.
          </p>
        ) : null}

        {shareUrl ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Share link copied to your clipboard: <span className="font-mono text-xs">{shareUrl}</span>
          </div>
        ) : null}
      </div>

      {/* output column */}
      <div className="flex flex-col gap-3">
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#0b1220] shadow-xl">
          <div className="flex items-center gap-1 border-b border-slate-700 bg-[#111a2e] px-2 py-2">
            {([
              ["output", "Output"],
              ["written", `Files written (${writtenFiles.length})`],
            ] as ["output" | "written", string][]).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setOutputTab(id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  outputTab === id ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
            {result ? <span className="ml-auto pr-2 text-[11px] text-slate-500">{result.runMs} ms</span> : null}
          </div>
          <div className="max-h-[520px] min-h-[220px] overflow-auto p-4">
            {error ? (
              <p className="font-mono text-[12.5px] text-rose-400">{error}</p>
            ) : outputTab === "output" ? (
              <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-[1.6] text-slate-200">
                {result ? result.output || "(no output)" : "Press Run to compile and execute your program."}
              </pre>
            ) : writtenFiles.length ? (
              <div className="space-y-4">
                {writtenFiles.map(([name, content]) => (
                  <div key={name}>
                    <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-emerald-400">{name}</p>
                    <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-[1.6] text-slate-200">{content}</pre>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-[12.5px] text-slate-500">No files were written by this program.</p>
            )}
          </div>
        </div>

        {result && result.errors.length ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
            <p className="mb-1 text-sm font-semibold text-rose-800">Compiler / runtime messages</p>
            <ul className="space-y-1 font-mono text-[12px] text-rose-700">
              {result.errors.map((e, idx) => (
                <li key={idx}>error: {e}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {result && result.warnings.length ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="mb-1 text-sm font-semibold text-amber-800">Notes ({result.warnings.length})</p>
            <ul className="max-h-52 space-y-1 overflow-auto font-mono text-[11.5px] text-amber-800">
              {result.warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function contentOf(file: { name: string; content: string }): string {
  return file.content;
}
