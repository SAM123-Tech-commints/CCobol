"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDoneLessons, getLastLesson } from "@/lib/progress";

/** "Continue where you left off" card + course progress bar for the homepage. */
export default function ResumeBar({ lessons }: { lessons: { slug: string; title: string }[] }) {
  const [ready, setReady] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    setLast(getLastLesson());
    setDone(getDoneLessons());
    setReady(true);
  }, []);

  if (!ready) return null;

  const lastLesson = lessons.find((l) => l.slug === last) ?? null;
  const pct = lessons.length ? Math.round((done.length / lessons.length) * 100) : 0;
  const nextUp = lastLesson && !done.includes(lastLesson.slug)
    ? lastLesson
    : (lessons.find((l) => !done.includes(l.slug)) ?? null);

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-5">
        <div className="min-w-[220px] flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-bold text-slate-900">
              {nextUp ? `Continue: ${nextUp.title}` : "Course complete - you finished everything!"}
            </p>
            <p className="text-xs font-semibold text-slate-500">{pct}% · {done.length}/{lessons.length} lessons</p>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">Your place is saved in this browser automatically - close the tab and come back anytime.</p>
        </div>
        {nextUp ? (
          <Link
            href={`/learn/${nextUp.slug}`}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500"
          >
            {lastLesson ? "Resume →" : "Start →"}
          </Link>
        ) : (
          <Link
            href="/exercises"
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Practice exercises →
          </Link>
        )}
      </div>
    </section>
  );
}
