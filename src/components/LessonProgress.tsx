"use client";

import { useEffect, useState } from "react";
import { isLessonDone, markLessonDone, unmarkLessonDone } from "@/lib/progress";

/** "Mark as complete" toggle + persisted state (feeds homepage XP/progress). */
export default function LessonProgress({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDone(isLessonDone(slug));
    setReady(true);
  }, [slug]);

  if (!ready) return null;

  const toggle = () => {
    if (done) {
      unmarkLessonDone(slug);
      setDone(false);
    } else {
      markLessonDone(slug);
      setDone(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        done ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-slate-900 text-white hover:bg-slate-700"
      }`}
    >
      {done ? "✓ Completed - click to undo" : "Mark lesson complete (+20 XP)"}
    </button>
  );
}
