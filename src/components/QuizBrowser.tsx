"use client";

import { useEffect, useState } from "react";
import Quiz from "@/components/Quiz";
import Flashcards from "@/components/Flashcards";
import { quizzes } from "@/content/quizzes";
import { bankFor } from "@/content/quizbank";
import { getQuizBest } from "@/lib/progress";

/** Quiz study room — Quizlet-style: flip flashcards OR take the quiz, both built
 *  from the lesson's key terms and questions. */
export default function QuizBrowser({ slugs, initial }: { slugs: string[]; initial: string }) {
  // School lessons first, then the tutorial quizzes.
  const ordered = [...slugs].sort((a, b) => (a.startsWith("school-") ? 0 : 1) - (b.startsWith("school-") ? 0 : 1));
  const [slug, setSlug] = useState(initial);
  const [best, setBest] = useState<number | null>(null);
  const [mode, setMode] = useState<"quiz" | "flash">("flash");

  useEffect(() => {
    setBest(getQuizBest()[slug] ?? null);
  }, [slug]);

  const terms = bankFor(slug)?.terms ?? [];

  return (
    <>
      <header className="quiz-hero">
        <div>
          <p className="pill">Study room</p>
          <h1>Practice until it sticks.</h1>
          <p className="lead">
            Flip flashcards like Quizlet, then take the quiz — multiple choice, identification, matching, true or false,
            enumeration and mixed, with instant feedback on every answer.
          </p>
        </div>
        <div className="quiz-hero-stat">
          <strong>{best ?? 0}%</strong>
          <span>
            best score
            <br />
            for this set
          </span>
        </div>
      </header>

      <section className="study-controls">
        <label>
          <span>Choose a study set</span>
          <select value={slug} onChange={(e) => setSlug(e.target.value)}>
            {ordered.map((s) => (
              <option key={s} value={s}>
                {quizzes[s]?.title ?? s}
              </option>
            ))}
          </select>
        </label>
        <div className="study-mode" role="tablist" aria-label="Study mode">
          <button type="button" role="tab" aria-selected={mode === "flash"} className={mode === "flash" ? "chip on" : "chip"} onClick={() => setMode("flash")}>
            Flashcards{terms.length ? ` (${terms.length})` : ""}
          </button>
          <button type="button" role="tab" aria-selected={mode === "quiz"} className={mode === "quiz" ? "chip on" : "chip"} onClick={() => setMode("quiz")}>
            Quiz
          </button>
        </div>
      </section>

      {mode === "flash" ? (
        <div key={`flash-${slug}`} className="flash-wrap">
          <Flashcards terms={terms} title={quizzes[slug]?.title ?? slug} />
        </div>
      ) : (
        <div key={slug}>
          <Quiz slug={slug} />
        </div>
      )}
    </>
  );
}
