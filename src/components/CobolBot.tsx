"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { BotIcon, MinusIcon, QuoteIcon, XIcon } from "@/components/icons";
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
  /** A reference excerpt to ask about (e.g. text the student highlighted). */
  seed?: { id: number; text: string } | null;
  /** Bump this number to clear the conversation. */
  resetSignal?: number;
  className?: string;
}

/** The COBOL BOT chat engine, shared by the compiler dock and the lesson launcher. */
export function BotChat({
  code,
  context,
  title,
  quickPrompts = [],
  placeholder = "Ask COBOL BOT anything…",
  seed,
  resetSignal,
  className,
}: ChatProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef({ code, context });
  ctxRef.current = { code, context };

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (resetSignal === undefined) return;
    setMessages([]);
    setInput("");
  }, [resetSignal]);

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
    if (!question) return;
    setMessages((m) => [...m, { id: uid++, role: "user", text: question }]);
    setInput("");
    const r = await post({ question });
    const text = (r.error as string) ?? (r.answer as string) ?? "Sorry, I could not answer that.";
    setMessages((m) => [...m, { id: uid++, role: "bot", text, ai: r.source === "gemini" }]);
  };

  // Ask automatically when a reference excerpt is supplied (highlight-to-ask).
  const lastSeed = useRef<number | null>(null);
  useEffect(() => {
    if (seed && seed.id !== lastSeed.current) {
      lastSeed.current = seed.id;
      void ask(seed.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

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
                  : `Ask me anything about ${title ?? "this lesson"} — or highlight any text on the page and I'll explain it.`}
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

/** Floating COBOL BOT for lesson pages: bottom-left launcher, minimizable/exitable,
 *  and a highlight-to-ask capture so the student can select text and quiz the bot. */
export default function CobolBot({ context, title, quickPrompts }: { context: string; title?: string; quickPrompts?: string[] }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [seed, setSeed] = useState<{ id: number; text: string } | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [sel, setSel] = useState<{ text: string; x: number; y: number } | null>(null);
  const selRef = useRef<{ text: string; x: number; y: number } | null>(null);
  const seedId = useRef(0);

  useEffect(() => {
    const onUp = () => {
      const s = window.getSelection();
      const text = s?.toString().replace(/\s+/g, " ").trim() ?? "";
      const anchor = s?.anchorNode as Node | null;
      const insideBot = anchor?.parentElement?.closest(".cobolbot-panel, .cobolbot-launcher") ?? null;
      if (hidden || insideBot || text.length < 4 || text.length > 600 || !s || s.rangeCount === 0) {
        selRef.current = null;
        setSel(null);
        return;
      }
      const rect = s.getRangeAt(0).getBoundingClientRect();
      const value = { text, x: Math.min(Math.max(rect.left + rect.width / 2, 90), window.innerWidth - 90), y: rect.top };
      selRef.current = value;
      setSel(value);
    };
    document.addEventListener("mouseup", onUp);
    return () => document.removeEventListener("mouseup", onUp);
  }, [hidden]);

  const askSelection = () => {
    const current = selRef.current;
    if (!current) return;
    seedId.current += 1;
    setSeed({ id: seedId.current, text: `Explain this highlighted part of the lesson:\n\n"${current.text}"` });
    setOpen(true);
    setHidden(false);
    selRef.current = null;
    setSel(null);
    window.getSelection()?.removeAllRanges();
  };

  if (hidden) return null;

  return (
    <>
      {sel ? (
        <button type="button" className="cobolbot-selectask" style={{ left: sel.x, top: sel.y }} onMouseDown={(e) => e.preventDefault()} onClick={askSelection}>
          <BotIcon width={14} height={14} />
          Ask COBOL BOT
        </button>
      ) : null}

      {open ? (
        <div className="cobolbot-panel" role="dialog" aria-label="COBOL BOT">
          <div className="cobolbot-panel-head">
            <BotAvatar size={30} />
            <div className="cobolbot-panel-title">
              <strong>COBOL BOT</strong>
              <small>{title ?? "Ask about this lesson"}</small>
            </div>
            <div className="cobolbot-panel-actions">
              <button type="button" title="New chat" onClick={() => setResetSignal((n) => n + 1)}>
                <QuoteIcon width={15} height={15} />
              </button>
              <button type="button" title="Minimize" onClick={() => setOpen(false)}>
                <MinusIcon width={15} height={15} />
              </button>
              <button type="button" title="Exit COBOL BOT" onClick={() => { setOpen(false); setHidden(true); }}>
                <XIcon width={15} height={15} />
              </button>
            </div>
          </div>
          <BotChat context={context} title={title} quickPrompts={quickPrompts} seed={seed} resetSignal={resetSignal} placeholder="Ask about this lesson…" />
        </div>
      ) : null}

      <button type="button" className="cobolbot-launcher" onClick={() => { setOpen((v) => !v); setSel(null); }} aria-label="Open COBOL BOT">
        <BotAvatar size={34} />
        <span>COBOL BOT</span>
        {!open ? <em className="cobolbot-launcher-dot" /> : null}
      </button>
    </>
  );
}
