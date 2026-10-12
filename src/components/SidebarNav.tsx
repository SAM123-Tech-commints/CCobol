"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getDoneLessons, markLessonDone, unmarkLessonDone } from "@/lib/progress";
import { CheckIcon } from "@/components/icons";

interface SlimLesson {
  slug: string;
  title: string;
  subs?: { anchor: string; title: string }[];
}

interface SlimModule {
  name: string;
  lessons: SlimLesson[];
}

/**
 * Course sidebar with per-lesson progress checkboxes. The container itself is
 * not sticky/scrollable - the parent .side card owns the single scroll, so
 * there is no double scrollbar.
 */
export default function SidebarNav({
  modules,
  current,
  basePath = "/learn",
}: {
  modules: SlimModule[];
  current: string;
  basePath?: string;
}) {
  const [done, setDone] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
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

  const toggle = (slug: string) => {
    if (done.includes(slug)) {
      unmarkLessonDone(slug);
      setDone((d) => d.filter((s) => s !== slug));
    } else {
      markLessonDone(slug);
      setDone((d) => [...d, slug]);
    }
  };

  const toggleExpanded = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">COBOL Tutorial</p>
      <nav className="space-y-4">
        {modules.map((module) => {
          const moduleDone = module.lessons.filter((l) => done.includes(l.slug)).length;
          return (
            <div key={module.name}>
              <p className="mb-1 flex items-center justify-between text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                <span>{module.name}</span>
                <span className="text-[11px] font-bold text-slate-400">
                  {moduleDone}/{module.lessons.length}
                </span>
              </p>
              <ul className="space-y-0.5 border-l border-slate-200 pl-3 dark:border-[#243652]">
                {module.lessons.map((item) => {
                  const isDone = done.includes(item.slug);
                  const isActive = item.slug === current;
                  const showSubs = isActive || expanded.has(item.slug);
                  return (
                    <li key={item.slug}>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggle(item.slug)}
                          title={isDone ? "Mark incomplete" : "Mark complete"}
                          aria-label={isDone ? `Mark ${item.title} incomplete` : `Mark ${item.title} complete`}
                          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition ${
                            isDone
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-300 text-transparent hover:border-emerald-400 dark:border-[#2c3f5c]"
                          }`}
                        >
                          <CheckIcon width={11} height={11} />
                        </button>
                        <Link
                          ref={isActive ? activeRef : undefined}
                          href={`${basePath}/${item.slug}`}
                          className={`flex-1 rounded px-2 py-1 text-[13px] leading-snug transition ${
                            isActive
                              ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-[#1d5fcc] dark:text-white"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
                          }`}
                        >
                          {item.title}
                        </Link>
                        {item.subs?.length ? (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(item.slug)}
                            aria-label={showSubs ? `Collapse ${item.title} subtopics` : `Expand ${item.title} subtopics`}
                            aria-expanded={showSubs}
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 ${showSubs ? "rotate-90" : ""}`}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                      {showSubs && item.subs?.length ? (
                        <ul className="my-1 ml-[27px] space-y-0.5 border-l border-slate-200 pl-2.5 dark:border-[#2c3f5c]">
                          {item.subs.map((sub) => (
                            <li key={sub.anchor}>
                              <Link
                                href={`${basePath}/${item.slug}#${sub.anchor}`}
                                className="block rounded px-2 py-1 text-[12px] leading-snug text-slate-500 transition hover:bg-slate-50 hover:text-indigo-700 dark:text-slate-500 dark:hover:bg-slate-800/50 dark:hover:text-white"
                              >
                                {sub.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
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
