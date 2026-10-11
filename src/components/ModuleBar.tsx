"use client";

import { useEffect, useState } from "react";
import { getDoneLessons } from "@/lib/progress";

/** Thin per-module progress bar for the homepage tutorial cards. */
export default function ModuleBar({ slugs }: { slugs: string[] }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    const all = getDoneLessons();
    setDone(slugs.filter((s) => all.includes(s)).length);
    const onFocus = () => setDone(slugs.filter((s) => getDoneLessons().includes(s)).length);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [slugs]);

  const pct = slugs.length ? Math.round((done / slugs.length) * 100) : 0;

  return (
    <div className="mt-3">
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[11px] font-semibold text-slate-400">{done}/{slugs.length} done</p>
    </div>
  );
}
