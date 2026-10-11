"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDoneLessons } from "@/lib/progress";

interface SlimModule {
  name: string;
  lessons: { slug: string; title: string }[];
}

/** Course sidebar with ✓ on completed lessons and per-module counts. */
export default function SidebarNav({ modules, current }: { modules: SlimModule[]; current: string }) {
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    setDone(getDoneLessons());
    const onFocus = () => setDone(getDoneLessons());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-auto pr-2">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">COBOL Tutorial</p>
      <nav className="space-y-4">
        {modules.map((module) => {
          const moduleDone = module.lessons.filter((l) => done.includes(l.slug)).length;
          return (
            <div key={module.name}>
              <p className="mb-1 flex items-center justify-between text-[13px] font-semibold text-slate-800">
                <span>{module.name}</span>
                <span className="text-[11px] font-bold text-slate-400">{moduleDone}/{module.lessons.length}</span>
              </p>
              <ul className="space-y-0.5 border-l border-slate-200 pl-3">
                {module.lessons.map((item) => {
                  const isDone = done.includes(item.slug);
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/learn/${item.slug}`}
                        className={`flex items-start gap-1.5 rounded px-2 py-1 text-[13px] leading-snug transition ${
                          item.slug === current
                            ? "bg-indigo-50 font-semibold text-indigo-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isDone ? "bg-emerald-500 text-white" : "bg-slate-100 text-transparent"}`}>
                          ✓
                        </span>
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
