"use client";

import { useEffect, useState } from "react";
import { SparkleIcon } from "@/components/icons";
import type { ExplainResult } from "@/lib/cobol/explain";

interface Props {
  code: string;
  title?: string;
  focus?: string;
  label?: string;
  compact?: boolean;
  defaultOpen?: boolean;
}

/** Line-by-line COBOL explainer button + panel. Uses /api/explain (Gemini when
 *  configured, otherwise the built-in analyzer). */
export default function CodeExplainer({ code, title, focus, label = "Explain line by line", compact, defaultOpen }: Props) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, focus }),
      });
      const data = (await res.json()) as ExplainResult & { error?: string };
      if (data.error) setError(data.error);
      else setResult(data);
    } catch {
      setError("Could not load the explanation. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (defaultOpen) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !result && !loading) void load();
  };

  return (
    <div className={`explain${compact ? " compact" : ""}`}>
      <button type="button" className={`explain-toggle${open ? " on" : ""}`} onClick={toggle} aria-expanded={open}>
        <SparkleIcon width={15} height={15} />
        {open ? "Hide explanation" : label}
      </button>
      {open ? (
        <div className="explain-body">
          {loading ? <p className="muted">Analyzing your COBOL…</p> : null}
          {error ? <p className="explain-error">{error}</p> : null}
          {result ? (
            <>
              <div className="explain-head">
                <span className={`explain-badge ${result.source === "gemini" ? "ai" : "builtin"}`}>
                  {result.source === "gemini" ? "AI explanation (Gemini)" : "Built-in explanation"}
                </span>
                {title ? <strong>{title}</strong> : null}
              </div>
              <p className="explain-overview">{result.overview}</p>
              <ol className="explain-lines">
                {result.lines.map((l) => (
                  <li key={l.line}>
                    <span className="explain-no">{l.line}</span>
                    <code className="explain-code">{l.code.trim() || " "}</code>
                    <span className="explain-text">{l.explanation}</span>
                  </li>
                ))}
              </ol>
              {result.note ? <p className="explain-note">{result.note}</p> : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
