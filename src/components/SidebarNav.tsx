"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getDoneLessons } from "@/lib/progress";
import { CheckIcon } from "@/components/icons";

interface SlimModule {
  name: string;
  lessons: { slug: string; title: string }[];
}

/**
 * Course sidebar. It scrolls on its own (the page body stays put) and
 * automatically brings the current topic into view when you open a lesson.
 */
export default function SidebarNav({ modules, current }: { modules: SlimModule[]; current: string }) {
  const [done, setDone] = useState<string[]>([]);
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    setDone(getDoneLessons());
    const onFocus = () => setDone(getDoneLessons());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Center the current topic in the sidebar without moving the page.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "center" });
  }, [current]);

  return (
    <div className="sticky top-14 max-h-[calc(100vh-4.5rem)] overflow-y-auto overscroll-contain pr-2">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">COBOL Tutorial</p>
      <nav className="space-y-4">
        {modules.map((module) => {
          const moduleDone = module.lessons.filter((l) => done.includes(l.slug)).length;
          return (
            <div key={module.name}>
              <p className="mb-1 flex items-center justify-between text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                <span>{module.name}</span>
                <span className="text-[11px] font-bold text-slate-400">{moduleDone}/{module.lessons.length}</span>
              </p>
              <ul className="space-y-0.5 border-l border-slate-200 pl-3 dark:border-[#243652]">
                {module.lessons.map((item) => {
                  const isDone = done.includes(item.slug);
                  const isActive = item.slug === current;
                  return (
                    <li key={item.slug}>
                      <Link
                        ref={isActive ? activeRef : undefined}
                        href={`/learn/${item.slug}`}
                        className={`flex items-start gap-1.5 rounded px-2 py-1 text-[13px] leading-snug transition ${
                          isActive
                            ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-[#1d5fcc] dark:text-white"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#2a2d2e] dark:hover:text-white"
                        }`}
                      >
                        <span
                          className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                            isDone ? "bg-emerald-500 text-white" : "bg-slate-100 text-transparent dark:bg-slate-700"
                          }`}
                        >
                          <CheckIcon width={10} height={10} />
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
