"use client";

import { useState } from "react";
import type { TermPair } from "@/content/quizbank";

/** Key-terms flashcards for memorization: tap a card to reveal its definition. */
export default function KeyTerms({ terms }: { terms: TermPair[] }) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  if (!terms.length) return null;
  return (
    <div className="keyterms">
      {terms.map((t, i) => {
        const open = revealed[i];
        return (
          <button
            key={i}
            type="button"
            className={`keyterm${open ? " open" : ""}`}
            onClick={() => setRevealed((r) => ({ ...r, [i]: !r[i] }))}
            aria-expanded={open}
          >
            <span className="keyterm-term">{t.term}</span>
            <span className="keyterm-def">{open ? t.def : "Tap to reveal the definition"}</span>
          </button>
        );
      })}
    </div>
  );
}
