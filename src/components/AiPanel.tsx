"use client";

import { useEffect, useRef, useState } from "react";
import { SparkleIcon } from "@/components/icons";
import type { ExplainResult } from "@/lib/cobol/explain";

type Msg =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "ai"; text: string; ai: boolean }
  | { id: number; role: "explain"; result: ExplainResult };

let uid = 0;

/** Bottom-docked AI assistant for the compiler: explain the program line by line,
 *  then keep chatting about it — like a Gemini/ChatGPT panel inside the IDE. */
export default function AiPanel({ code, title }: { code: string; title?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(code);
  codeRef.current = code;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  const post = async (payload: { question?: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeRef.current, ...payload }),
      });
      return (await res.json()) as Record<string, unknown>;
    } finally {
      setLoading(false);
    }
  };

  const explain = async () => {
    const r = (await post({})) as unknown as ExplainResult & { error?: string };
    if (r.error) {
      setMessages((m) => [...m, { id: uid++, role: "ai", text: r.error as string, ai: false }]);
    } else {
      setMessages((m) => [...m, { id: uid++, role: "explain", result: r }]);
    }
  };

  const ask = async (q: string) => {
    const question = q.trim();
    if (!question) return;
    setMessages((m) => [...m, { id: uid++, role: "user", text: question }]);
    setInput("");
    const r = await post({ question });
    const text = (r.error as string) ?? (r.answer as string) ?? "Sorry, I could not answer that.";
    setMessages((m) => [...m, { id: uid++, role: "ai", text, ai: r.source === "gemini" }]);
  };

  return (
    <div className="border-t border-slate-700 bg-[#0b1625]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-slate-800/40"
        aria-expanded={open}
      >
        <span className="text-violet-300">
          <SparkleIcon width={14} height={14} />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">AI Assistant</span>
        <span className="hidden font-mono text-[10px] text-slate-500 sm:inline">explain this program · ask follow-ups</span>
        <span className="ml-auto rounded bg-slate-700/60 px-2 py-0.5 text-[10px] font-semibold text-slate-300">{open ? "Hide" : "Open"}</span>
      </button>

      {open ? (
        <div className="border-t border-slate-800">
          <div ref={bodyRef} className="max-h-[320px] space-y-3 overflow-y-auto p-3">
            {messages.length === 0 ? (
              <div className="rounded-lg border border-slate-700 bg-[#091524] p-3 text-xs text-slate-400">
                Ask the assistant to explain your program line by line, or ask anything about it — for example{" "}
                <span className="font-mono text-slate-300">what does ACCEPT do here?</span>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={explain}
                    disabled={loading}
                    className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                  >
                    Explain this program
                  </button>
                </div>
              </div>
            ) : null}
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
            {loading ? <p className="animate-pulse text-xs text-slate-500">● thinking…</p> : null}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(input);
            }}
            className="flex items-center gap-2 border-t border-slate-800 p-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your COBOL code…"
              className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              Ask
            </button>
            <button
              type="button"
              onClick={explain}
              disabled={loading}
              title="Explain this program line by line"
              className="hidden rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-violet-400 disabled:opacity-50 sm:block"
            >
              Explain
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600/80 px-3 py-2 text-xs text-white">{msg.text}</div>
      </div>
    );
  }
  if (msg.role === "ai") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-slate-700 bg-[#091524] px-3 py-2 text-xs text-slate-200">
          <span className={`explain-badge ${msg.ai ? "ai" : "builtin"} mb-1 inline-block`}>{msg.ai ? "AI (Gemini)" : "Built-in"}</span>
          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl rounded-bl-sm border border-slate-700 bg-[#091524] p-3">
      <div className="mb-2">
        <span className={`explain-badge ${msg.result.source === "gemini" ? "ai" : "builtin"}`}>
          {msg.result.source === "gemini" ? "AI explanation (Gemini)" : "Built-in explanation"}
        </span>
      </div>
      <p className="mb-2 text-xs leading-relaxed text-slate-300">{msg.result.overview}</p>
      <ol className="explain-lines">
        {msg.result.lines.map((l) => (
          <li key={l.line}>
            <span className="explain-no">{l.line}</span>
            <code className="explain-code">{l.code.trim() || " "}</code>
            <span className="explain-text">{l.explanation}</span>
          </li>
        ))}
      </ol>
      {msg.result.note ? <p className="explain-note">{msg.result.note}</p> : null}
    </div>
  );
}
