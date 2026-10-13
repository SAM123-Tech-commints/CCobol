"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { BotIcon, XIcon } from "@/components/icons";
import type { ExplainResult } from "@/lib/cobol/explain";

type Msg =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "bot"; text: string; ai: boolean }
  | { id: number; role: "explain"; result: ExplainResult };

let uid = 0;

export function BotAvatar({ size = 28 }: { size?: number }) {
  return (
    <span className="cobolbot-avatar" style={{ width: size, height: size }}>
      <BotIcon width={Math.round(size * 0.6)} height={Math.round(size * 0.6)} />
    </span>
  );
}

interface ChatProps {
  /** Program source — enables the "Explain this program" action. */
  code?: string;
  /** Topic text (lesson content) for topic questions. */
  context?: string;
  title?: string;
  quickPrompts?: string[];
  placeholder?: string;
  footer?: ReactNode;
  className?: string;
}

/** The COBOL BOT chat engine, shared by the compiler dock and the lesson launcher. */
export function BotChat({ code, context, title, quickPrompts = [], placeholder = "Ask COBOL BOT anything…", footer, className }: ChatProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef({ code, context });
  ctxRef.current = { code, context };

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const post = async (payload: { question?: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: ctxRef.current.code ?? "", context: ctxRef.current.context ?? "", ...payload }),
      });
      return (await res.json()) as Record<string, unknown>;
    } finally {
      setLoading(false);
    }
  };

  const explain = async () => {
    if (!ctxRef.current.code) return;
    setMessages((m) => [...m, { id: uid++, role: "user", text: "Explain this program line by line." }]);
    const r = (await post({})) as unknown as ExplainResult & { error?: string };
    if (r.error) setMessages((m) => [...m, { id: uid++, role: "bot", text: r.error as string, ai: false }]);
    else setMessages((m) => [...m, { id: uid++, role: "explain", result: r }]);
  };

  const ask = async (q: string) => {
    const question = q.trim();
    if (!question || loading) return;
    setMessages((m) => [...m, { id: uid++, role: "user", text: question }]);
    setInput("");
    const r = await post({ question });
    const text = (r.error as string) ?? (r.answer as string) ?? "Sorry, I could not answer that.";
    setMessages((m) => [...m, { id: uid++, role: "bot", text, ai: r.source === "gemini" }]);
  };

  return (
    <div className={`cobolbot-chat${className ? ` ${className}` : ""}`}>
      <div ref={bodyRef} className="cobolbot-body">
        {messages.length === 0 ? (
          <div className="cobolbot-hello">
            <BotAvatar size={40} />
            <div>
              <strong>Hi, I am COBOL BOT 👋</strong>
              <p>
                {code
                  ? "I can explain your program line by line, or answer anything about it."
                  : `Ask me anything about ${title ?? "this topic"} — I'll explain it in plain words.`}
              </p>
              {code ? (
                <button type="button" className="cobolbot-explain" onClick={explain} disabled={loading}>
                  Explain this program
                </button>
              ) : null}
              {quickPrompts.length ? (
                <div className="cobolbot-chips">
                  {quickPrompts.map((p) => (
                    <button key={p} type="button" className="cobolbot-chip" onClick={() => ask(p)} disabled={loading}>
                      {p}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {messages.map((m) => (
          <BotBubble key={m.id} msg={m} />
        ))}
        {loading ? (
          <div className="cobolbot-typing">
            <BotAvatar size={22} />
            <span>COBOL BOT is thinking…</span>
          </div>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
        className="cobolbot-inputrow"
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} aria-label="Message COBOL BOT" />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
      {footer}
    </div>
  );
}

function BotBubble({ msg }: { msg: Msg }) {
  if (msg.role === "user") {
    return (
      <div className="cobolbot-row user">
        <div className="cobolbot-user-bubble">{msg.text}</div>
      </div>
    );
  }
  if (msg.role === "bot") {
    return (
      <div className="cobolbot-row bot">
        <BotAvatar size={24} />
        <div className="cobolbot-bot-bubble">
          <span className={`cobolbot-tag ${msg.ai ? "ai" : "builtin"}`}>{msg.ai ? "COBOL BOT · AI" : "COBOL BOT"}</span>
          <p>{msg.text}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="cobolbot-row bot">
      <BotAvatar size={24} />
      <div className="cobolbot-bot-bubble wide">
        <span className={`cobolbot-tag ${msg.result.source === "gemini" ? "ai" : "builtin"}`}>
          {msg.result.source === "gemini" ? "COBOL BOT · AI explanation" : "COBOL BOT explanation"}
        </span>
        <p>{msg.result.overview}</p>
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
    </div>
  );
}

/** Floating COBOL BOT launcher for lesson pages (school + tutorial). */
export default function CobolBot({ context, title, quickPrompts }: { context: string; title?: string; quickPrompts?: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open ? (
        <div className="cobolbot-panel" role="dialog" aria-label="COBOL BOT">
          <div className="cobolbot-panel-head">
            <BotAvatar size={30} />
            <div>
              <strong>COBOL BOT</strong>
              <small>{title ?? "Ask about this topic"}</small>
            </div>
            <button type="button" className="cobolbot-close" onClick={() => setOpen(false)} aria-label="Close COBOL BOT">
              <XIcon width={16} height={16} />
            </button>
          </div>
          <BotChat context={context} title={title} quickPrompts={quickPrompts} placeholder="Ask about this lesson…" />
        </div>
      ) : null}
      <button type="button" className="cobolbot-launcher" onClick={() => setOpen((v) => !v)} aria-label="Open COBOL BOT">
        <BotAvatar size={34} />
        <span>COBOL BOT</span>
      </button>
    </>
  );
}
