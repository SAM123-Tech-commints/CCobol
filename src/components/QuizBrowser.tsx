"use client";

import { useEffect, useState } from "react";
import Quiz from "@/components/Quiz";
import { quizzes } from "@/content/quizzes";
import { getQuizBest } from "@/lib/progress";

/** Quiz study room — template hero + study controls, wrapping the quiz engine. */
export default function QuizBrowser({ slugs, initial }: { slugs: string[]; initial: string }) {
  // School lessons first, then the tutorial quizzes.
  const ordered = [...slugs].sort((a, b) => (a.startsWith("school-") ? 0 : 1) - (b.startsWith("school-") ? 0 : 1));
  const [slug, setSlug] = useState(initial);
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    setBest(getQuizBest()[slug] ?? null);
  }, [slug]);

  return (
    <>
      <header className="quiz-hero">
        <div>
          <p className="pill">Study room</p>
          <h1>Practice until it sticks.</h1>
          <p className="lead">
            Flashcards, multiple choice, identification with letter hints, matching, true or false, enumeration and a
            mixed mode - with instant feedback on every answer.
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
      </section>

      <div key={slug}>
        <Quiz slug={slug} />
      </div>
    </>
  );
}
