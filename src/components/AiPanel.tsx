"use client";

import { useState } from "react";
import { BotChat, BotAvatar } from "@/components/CobolBot";

/** Bottom-docked COBOL Assist inside the compiler: explain the program line by line,
 *  then keep chatting about it — like a Gemini/ChatGPT panel inside the IDE. */
export default function AiPanel({ code, title }: { code: string; title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-slate-700 wb-chrome">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-slate-800/40"
        aria-expanded={open}
      >
        <BotAvatar size={26} />
        <span className="text-[12px] font-extrabold tracking-wide text-slate-100">COBOL Assist</span>
        <span className="hidden font-mono text-[10px] text-slate-500 sm:inline">explain this program · ask follow-ups</span>
        <span className="ml-auto rounded bg-slate-700/60 px-2 py-0.5 text-[10px] font-semibold text-slate-300">{open ? "Hide" : "Open"}</span>
      </button>

      {open ? (
        <BotChat
          code={code}
          title={title}
          className="cobolbot-docked"
          placeholder="Ask COBOL Assist about your code…"
          quickPrompts={["What does this program do?", "Explain the ACCEPT input", "How can I improve it?"]}
        />
      ) : null}
    </div>
  );
}
