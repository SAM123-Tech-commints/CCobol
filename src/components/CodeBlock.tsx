"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { highlightCobol } from "@/lib/cobol/highlight";

interface Props {
  code: string;
  lang?: string;
  runnable?: boolean;
  stdin?: string;
  files?: Record<string, string>;
  title?: string;
}

/** Code block with COBOL syntax highlighting and an optional "Run" button. */
export default function CodeBlock({ code, lang = "cobol", runnable, stdin, files, title }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const trimmed = code.replace(/\s+$/, "");
  const html = useMemo(() => (lang === "cobol" || lang === "cbl" ? highlightCobol(trimmed) : `<span>${escapePlainText(trimmed)}</span>`), [trimmed, lang]);

  const run = () => {
    const payload = { code: trimmed, stdin: stdin ?? "", files: files ?? {}, title: title ?? "COBOL program" };
    router.push(`/compiler?code=${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))))}`);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-slate-700 bg-[#0b1220] shadow-lg">
      <div className="flex items-center justify-between gap-2 border-b border-slate-700 bg-[#111a2e] px-3 py-2">
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          {lang === "cobol" ? "COBOL" : lang}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="rounded-md border border-slate-600 px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:border-slate-400 hover:text-white"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          {runnable ? (
            <button
              type="button"
              onClick={run}
              className="rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-slate-900 transition hover:bg-emerald-400"
            >
              ▶ Run
            </button>
          ) : null}
        </div>
      </div>
      <pre className="max-h-[520px] overflow-auto p-4 text-[12.5px] leading-[1.55]">
        <code className="font-mono text-slate-200" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}

function escapePlainText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
