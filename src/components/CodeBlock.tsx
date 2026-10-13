"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { highlightCobol } from "@/lib/cobol/highlight";
import { PlayIcon } from "@/components/icons";
import CodeExplainer from "@/components/CodeExplainer";

interface Props {
  code: string;
  lang?: string;
  runnable?: boolean;
  stdin?: string;
  files?: Record<string, string>;
  title?: string;
  /** Show the line-by-line explainer under the code (COBOL only). Default: on. */
  explain?: boolean;
}

/** Code block with COBOL syntax highlighting, an optional "Run" button and a
 *  line-by-line explanation toggle. */
export default function CodeBlock({ code, lang = "cobol", runnable, stdin, files, title, explain = true }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const isCobol = lang === "cobol" || lang === "cbl";
  const trimmed = code.replace(/\s+$/, "");
  const html = useMemo(() => (isCobol ? highlightCobol(trimmed) : `<span>${escapePlainText(trimmed)}</span>`), [trimmed, isCobol]);

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
    <>
    <div className="my-5 overflow-hidden rounded-xl border border-slate-700 bg-[#091524] shadow-lg">
      <div className="flex items-center justify-between gap-2 border-b border-slate-700 bg-[#0b1625] px-3 py-2">
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
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-slate-900 transition hover:bg-emerald-400"
            >
              <PlayIcon width={10} height={10} />
              Run
            </button>
          ) : null}
        </div>
      </div>
      <pre className="max-h-[520px] overflow-auto p-4 text-[12.5px] leading-[1.55]">
        <code className="font-mono text-slate-200" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
    {explain && isCobol ? <CodeExplainer code={trimmed} title={title} compact /> : null}
    </>
  );
}

function escapePlainText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
