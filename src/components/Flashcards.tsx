"use client";

import { useEffect, useState } from "react";
import type { TermPair } from "@/content/quizbank";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Quizlet-style flashcards: flip to reveal, "Still learning" keeps a card in
 *  rotation, "Got it" retires it. Built from the lesson's key terms. */
export default function Flashcards({ terms, title }: { terms: TermPair[]; title?: string }) {
  const fresh = () => shuffle(terms.map((_, i) => i));
  const [queue, setQueue] = useState<number[]>(fresh);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Record<number, boolean>>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    setQueue(shuffle(terms.map((_, i) => i)));
    setFlipped(false);
    setKnown({});
    setDone(false);
  }, [terms]);

  if (!terms.length) {
    return (
      <p className="flash-empty">
        Flashcards use the lesson&apos;s key terms — this set doesn&apos;t have any yet. Try a School lesson set.
      </p>
    );
  }

  const total = terms.length;
  const knownCount = Object.values(known).filter(Boolean).length;
  const pct = total ? Math.round((knownCount / total) * 100) : 0;
  const head = queue[0];
  const card = head !== undefined ? terms[head] : null;

  const advance = (gotIt: boolean) => {
    if (head === undefined) return;
    setFlipped(false);
    const rest = queue.slice(1);
    if (gotIt) {
      setKnown((k) => ({ ...k, [head]: true }));
      if (rest.length === 0) {
        setQueue([]);
        setDone(true);
      } else {
        setQueue(rest);
      }
    } else if (rest.length === 0) {
      setQueue([head]); // only card left — keep studying it
    } else {
      setQueue([...rest, head]); // back of the deck
    }
  };

  const restart = () => {
    setQueue(fresh());
    setFlipped(false);
    setKnown({});
    setDone(false);
  };

  if (done) {
    return (
      <div className="flash-done">
        <p className="flash-done-score">{pct}%</p>
        <p>
          You got through all {total} card{total === 1 ? "" : "s"} — {knownCount} marked &ldquo;got it&rdquo;.
        </p>
        <div className="flash-done-actions">
          <button type="button" className="btn primary sm" onClick={restart}>
            Study again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flash" tabIndex={0} onKeyDown={(e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        advance(true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        advance(false);
      }
    }}>
      <div className="flash-bar">
        <span className="flash-count">
          {knownCount} / {total} mastered
        </span>
        <div className="flash-progress">
          <span style={{ width: `${pct}%` }} />
        </div>
        <button type="button" className="flash-shuffle" onClick={() => setQueue((q) => shuffle(q))} title="Shuffle remaining cards">
          Shuffle
        </button>
      </div>

      {card ? (
        <div className="flashcard" onClick={() => setFlipped((f) => !f)} role="button" aria-label="Flip card" tabIndex={0}>
          {flipped ? (
            <div className="flashcard-face flashcard-back">
              <small>Definition</small>
              <span>{card.def}</span>
            </div>
          ) : (
            <div className="flashcard-face flashcard-front">
              <small>Term</small>
              <strong>{card.term}</strong>
              <em>tap to flip</em>
            </div>
          )}
        </div>
      ) : null}

      <div className="flash-actions">
        <button type="button" className="flash-btn again" onClick={() => advance(false)}>
          Still learning
        </button>
        <button type="button" className="flash-btn got" onClick={() => advance(true)}>
          Got it
        </button>
      </div>
      <p className="flash-hint">
        Space / tap the card to flip · ← still learning · → got it{title ? ` · ${title}` : ""}
      </p>
    </div>
  );
}
