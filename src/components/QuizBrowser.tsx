"use client";

import { useState } from "react";
import Quiz from "@/components/Quiz";
import { quizzes } from "@/content/quizzes";

/** Quiz picker + runner (client). */
export default function QuizBrowser({ slugs, initial }: { slugs: string[]; initial: string }) {
  const [slug, setSlug] = useState(initial);
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-400" htmlFor="quiz-pick">
        Choose a quiz
      </label>
      <select
        id="quiz-pick"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none"
      >
        {slugs.map((s) => (
          <option key={s} value={s}>
            {quizzes[s].title}
          </option>
        ))}
      </select>
      <div className="mt-4" key={slug}>
        <Quiz slug={slug} />
      </div>
    </div>
  );
}
