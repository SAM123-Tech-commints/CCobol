"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getXp } from "@/lib/progress";

/** Homepage progress strip: lessons done, quizzes passed, XP. */
export default function ProgressStrip({ totalLessons, totalChallenges }: { totalLessons: number; totalChallenges: number }) {
  const [stats, setStats] = useState({ xp: 0, lessons: 0, quizzes: 0, challenges: 0 });

  useEffect(() => {
    setStats(getXp(totalLessons));
    const onFocus = () => setStats(getXp(totalLessons));
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [totalLessons]);

  const lessonPct = totalLessons ? Math.round((stats.lessons / totalLessons) * 100) : 0;

  return (
    <section className="border-b border-slate-200 bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-5 text-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-emerald-500 px-3 py-1.5 text-base font-extrabold text-slate-900">{stats.xp} XP</span>
          <div>
            <p className="font-semibold text-white">Your progress</p>
            <p className="text-xs text-slate-400">
              {stats.lessons}/{totalLessons} lessons · {stats.quizzes} quizzes · {stats.challenges}/{totalChallenges} exercises
            </p>
          </div>
        </div>
        <div className="min-w-[180px] flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-slate-700">
            <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${lessonPct}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-400">{lessonPct}% of the course complete - saved in this browser, no sign-up.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/exercises" className="rounded-xl bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20">
            Practice →
          </Link>
          <Link href="/quiz" className="rounded-xl bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20">
            Quizzes →
          </Link>
        </div>
      </div>
    </section>
  );
}
