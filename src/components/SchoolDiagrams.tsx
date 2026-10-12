/** SVG/CSS diagrams for the school lesson slides. Pure presentational. */

/** Slide 13: the 80-column coding sheet split. */
export function CodingSheetDiagram() {
  const cell =
    "flex flex-col items-center justify-center border-r border-slate-400 px-1 py-3 text-center last:border-r-0 dark:border-slate-600";
  return (
    <div className="my-3">
      <div className="flex overflow-hidden rounded-lg border border-slate-400 font-mono text-[10px] dark:border-slate-600 sm:text-[11px]">
        <div className={`${cell} w-[10%] bg-slate-100 dark:bg-[#101d2f]`}>
          <span className="font-bold text-slate-700 dark:text-slate-200">1-6</span>
          <span className="text-slate-500 dark:text-slate-400">Sequence No.</span>
        </div>
        <div className={`${cell} w-[4%] bg-amber-100 dark:bg-amber-500/10`}>
          <span className="font-bold text-amber-700 dark:text-amber-300">7</span>
          <span className="text-slate-500 dark:text-slate-400">Ind.</span>
        </div>
        <div className={`${cell} w-[10%] bg-indigo-100 dark:bg-indigo-500/10`}>
          <span className="font-bold text-indigo-700 dark:text-[#8db8ff]">8-11</span>
          <span className="text-slate-500 dark:text-slate-400">Area A</span>
        </div>
        <div className={`${cell} flex-1 bg-emerald-50 dark:bg-emerald-500/5`}>
          <span className="font-bold text-emerald-700 dark:text-emerald-300">12-72</span>
          <span className="text-slate-500 dark:text-slate-400">Area B</span>
        </div>
        <div className={`${cell} w-[10%] bg-slate-100 dark:bg-[#101d2f]`}>
          <span className="font-bold text-slate-700 dark:text-slate-200">73-80</span>
          <span className="text-slate-500 dark:text-slate-400">System No.</span>
        </div>
      </div>
      <p className="mt-1.5 text-center text-[11px] text-slate-500 dark:text-slate-400">
        Column 7 flags: <span className="font-mono font-bold">-</span> continuation ·{" "}
        <span className="font-mono font-bold">*</span> comment · <span className="font-mono font-bold">/</span> new page
      </p>
    </div>
  );
}

/** Slide 10: the program structure hierarchy (nested boxes). */
export function StructureHierarchyDiagram() {
  const box = "rounded-lg border px-3 py-2 text-center font-mono text-xs font-semibold";
  return (
    <div className="my-3 space-y-1.5">
      <div className={`${box} border-slate-400 bg-slate-100 text-slate-800 dark:border-slate-600 dark:bg-[#101d2f] dark:text-slate-200`}>
        COBOL Program
      </div>
      <div className="pl-4">
        <div className={`${box} border-indigo-400 bg-indigo-50 text-indigo-800 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:text-[#6aa1ff]`}>
          DIVISION
        </div>
        <div className="pl-4">
          <div className={`${box} border-sky-400 bg-sky-50 text-sky-800 dark:border-sky-400/40 dark:bg-sky-500/10 dark:text-sky-300`}>
            Section
          </div>
          <div className="pl-4">
            <div className={`${box} border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-300`}>
              Paragraph
            </div>
            <div className="pl-4">
              <div className={`${box} border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300`}>
                Sentence
              </div>
              <div className="pl-4">
                <div className={`${box} border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-300`}>
                  Statement
                </div>
                <div className="pl-4">
                  <div className={`${box} border-slate-300 bg-white text-slate-600 dark:border-slate-600 dark:bg-[#0d1a2d] dark:text-slate-400`}>
                    Character Strings
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Slides 22-23: CUSTOMER-INFO level-number tree. */
export function CustomerInfoTree() {
  const node = "rounded-md border px-2.5 py-1.5 font-mono text-[11px]";
  return (
    <div className="my-3 overflow-x-auto">
      <div className="min-w-[420px]">
        <div className={`${node} mx-auto w-fit border-indigo-400 bg-indigo-50 font-bold text-indigo-800 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:text-[#6aa1ff]`}>
          01 CUSTOMER-INFO
        </div>
        <div className="mx-auto w-fit">
          <div className="mx-auto h-4 w-px bg-slate-300 dark:bg-slate-600" />
          <div className="grid grid-cols-4 gap-2 pt-0">
            {[
              {
                top: "02 NAME",
                kids: ["03 FIRST", "03 LAST"],
                color: "border-sky-400 bg-sky-50 text-sky-800 dark:border-sky-400/40 dark:bg-sky-500/10 dark:text-sky-300",
              },
              {
                top: "02 STREET",
                kids: ["03 NUMBER", "03 STR-NAME"],
                color: "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-300",
              },
              { top: "02 CITY", kids: ["QUEZON CITY"], color: "border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300" },
              { top: "02 ZIPCODE", kids: ["1118"], color: "border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-300" },
            ].map((group) => (
              <div key={group.top} className="flex flex-col items-center gap-1">
                <div className={`${node} ${group.color} font-bold`}>{group.top}</div>
                <div className="h-3 w-px bg-slate-300 dark:bg-slate-600" />
                {group.kids.map((k) => (
                  <div key={k} className={`${node} bg-white text-slate-600 dark:bg-[#0d1a2d] dark:text-slate-400`}>
                    {k}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
        01 = the whole record · 02 = groups inside it · 03 = the elementary items (levels 01-49 allowed)
      </p>
    </div>
  );
}

/** Slide 12 (Lesson 3 objectives area): basic flowchart symbols. */
export function FlowchartSymbolsDiagram() {
  const sym = "flex flex-col items-center gap-1";
  return (
    <div className="my-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className={sym}>
        <svg width="64" height="40" viewBox="0 0 64 40">
          <path d="M6 4h36l16 16-16 16H6Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 dark:text-slate-400" />
        </svg>
        <span className="text-center text-[10px] text-slate-500 dark:text-slate-400">Decision (IF)</span>
      </div>
      <div className={sym}>
        <svg width="64" height="40" viewBox="0 0 64 40">
          <rect x="8" y="6" width="48" height="28" rx="0" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 dark:text-slate-400" />
        </svg>
        <span className="text-center text-[10px] text-slate-500 dark:text-slate-400">Process (MOVE, ADD)</span>
      </div>
      <div className={sym}>
        <svg width="64" height="40" viewBox="0 0 64 40">
          <path d="M4 20c10-14 18-14 28 0s18 14 28 0" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 dark:text-slate-400" />
        </svg>
        <span className="text-center text-[10px] text-slate-500 dark:text-slate-400">Input / Output (ACCEPT, DISPLAY)</span>
      </div>
      <div className={sym}>
        <svg width="64" height="40" viewBox="0 0 64 40">
          <rect x="14" y="4" width="36" height="32" rx="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 dark:text-slate-400" />
        </svg>
        <span className="text-center text-[10px] text-slate-500 dark:text-slate-400">Start / Stop (STOP RUN)</span>
      </div>
    </div>
  );
}
