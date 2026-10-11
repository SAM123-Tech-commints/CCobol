"use client";

import { useMemo, useState } from "react";
import { quizFor } from "@/content/quizzes";
import { getQuizBest, saveQuizBest } from "@/lib/progress";
import { markLessonDone } from "@/lib/progress";

/**
 * SoloLearn-style quiz: one question at a time, instant feedback,
 * best score saved to localStorage. Emits XP via quiz-best store.
 */
export default function Quiz({ slug }: { slug: string }) {
  const quiz = useMemo(() => quizFor(slug), [slug]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState<number | null>(() => getQuizBest()[slug] ?? null);

  const current = quiz.questions[index];
  const pct = Math.round((score / quiz.questions.length) * 100);

  const pick = (option: number) => {
    if (picked !== null) return;
    setPicked(option);
    if (option === current.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 >= quiz.questions.length) {
      const finalScore = score;
      const finalPct = Math.round((finalScore / quiz.questions.length) * 100);
      saveQuizBest(slug, finalPct);
      setBest(Math.max(best ?? -1, finalPct));
      setDone(true);
      if (finalPct >= 60) markLessonDone(slug);
    } else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 text-center">
        <p className="text-3xl font-extrabold text-slate-900">{pct}%</p>
        <p className="mt-1 text-sm text-slate-600">
          You scored {score} of {quiz.questions.length}
          {best !== null ? ` · best ${best}%` : ""} · +{Math.round(pct / 10)} XP
        </p>
        <p className="mt-1 text-sm font-medium text-indigo-700">
          {pct === 100 ? "Perfect - COBOL master!" : pct >= 60 ? "Passed! Lesson marked complete." : "Keep going - retry to pass (60%+)."}
        </p>
        <button
          type="button"
          onClick={restart}
          className="mt-4 rounded-xl border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
        >
          Retry quiz
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-bold uppercase tracking-wider text-indigo-600">Quiz · {quiz.title}</span>
        <span>
          {index + 1} / {quiz.questions.length} · score {score}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${((index + (picked !== null ? 1 : 0)) / quiz.questions.length) * 100}%` }} />
      </div>
      <p className="mt-4 text-[15px] font-semibold text-slate-900">{current.q}</p>
      <div className="mt-3 grid gap-2">
        {current.options.map((option, i) => {
          const isAnswer = i === current.answer;
          const isPicked = picked === i;
          let cls = "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40";
          if (picked !== null && isAnswer) cls = "border-emerald-400 bg-emerald-50 font-semibold";
          else if (picked !== null && isPicked) cls = "border-rose-400 bg-rose-50";
          else if (picked !== null) cls = "border-slate-200 opacity-60";
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={picked !== null}
              className={`rounded-xl border px-3.5 py-2.5 text-left text-sm text-slate-800 transition ${cls}`}
            >
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          );
        })}
      </div>
      {picked !== null ? (
        <div className="mt-3 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm">
          <p className={picked === current.answer ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
            {picked === current.answer ? "Correct!" : "Not quite."}
          </p>
          <p className="mt-0.5 text-slate-600">{current.explanation}</p>
          <button
            type="button"
            onClick={next}
            className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {index + 1 >= quiz.questions.length ? "See results" : "Next question →"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
