"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { quizFor, type QuizQuestion } from "@/content/quizzes";
import { bankFor, type EnumQuestion, type TermPair, type TFQuestion } from "@/content/quizbank";
import { getQuizBest, markLessonDone, saveQuizBest } from "@/lib/progress";

export type QuizMode = "mc" | "ident" | "match" | "tf" | "enum" | "mixed";

const MODES: { id: QuizMode; label: string }[] = [
  { id: "mc", label: "Multiple Choice" },
  { id: "ident", label: "Identification" },
  { id: "match", label: "Matching" },
  { id: "tf", label: "True or False" },
  { id: "enum", label: "Enumeration" },
  { id: "mixed", label: "Mixed (all)" },
];

type QItem =
  | { t: "mc"; data: QuizQuestion }
  | { t: "ident"; data: TermPair }
  | { t: "tf"; data: TFQuestion }
  | { t: "enum"; data: EnumQuestion }
  | { t: "match"; data: TermPair[] };

const norm = (s: string) =>
  s
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ");

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Letters masked except the first `revealed` letters (spaces/hyphens always shown). */
function maskTerm(term: string, revealed: number): string {
  let letters = 0;
  return term
    .split("")
    .map((ch) => {
      if (ch === " " || ch === "-") return ch;
      const show = letters < revealed;
      letters++;
      return show ? ch : "_";
    })
    .join("");
}

/** Multi-mode quiz: multiple choice, identification (letter hints), matching,
 *  true/false, enumeration, and a mixed mode that combines them all. */
export default function Quiz({ slug, defaultMode = "mc" }: { slug: string; defaultMode?: QuizMode }) {
  const quiz = useMemo(() => quizFor(slug), [slug]);
  const bank = useMemo(() => bankFor(slug), [slug]);
  const hasBank = Boolean(bank);

  const [mode, setMode] = useState<QuizMode>(defaultMode);
  const [attempt, setAttempt] = useState(0);
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [done, setDone] = useState(false);

  // per-question UI state
  const [picked, setPicked] = useState<number | null>(null);
  const [identInput, setIdentInput] = useState("");
  const [identHints, setIdentHints] = useState(0);
  const [tfPicked, setTfPicked] = useState<boolean | null>(null);
  const [enumText, setEnumText] = useState("");
  const [matchSel, setMatchSel] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ ok: boolean; detail: string } | null>(null);
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    setBest(getQuizBest()[slug] ?? null);
  }, [slug]);

  const queue: QItem[] = useMemo(() => {
    const mcItems: QItem[] = quiz.questions.map((q) => ({ t: "mc" as const, data: q }));
    const terms = bank?.terms ?? [];
    const tfItems: QItem[] = (bank?.tf ?? []).map((q) => ({ t: "tf" as const, data: q }));
    const enumItems: QItem[] = (bank?.enum ?? []).map((q) => ({ t: "enum" as const, data: q }));

    let items: QItem[] = [];
    if (mode === "mc") items = mcItems;
    else if (mode === "ident") items = shuffle(terms).map((d) => ({ t: "ident" as const, data: d }));
    else if (mode === "match") {
      const rounds: QItem[] = [];
      const shuffled = shuffle(terms);
      for (let i = 0; i < shuffled.length; i += 6) rounds.push({ t: "match", data: shuffled.slice(i, i + 6) });
      items = rounds;
    } else if (mode === "tf") items = tfItems;
    else if (mode === "enum") items = enumItems;
    else if (mode === "mixed") {
      const matchQs: QItem[] = terms.length ? [{ t: "match" as const, data: shuffle(terms).slice(0, 5) }] : [];
      items = shuffle([
        ...shuffle(mcItems).slice(0, 3),
        ...shuffle(terms).slice(0, 3).map((d) => ({ t: "ident" as const, data: d })),
        ...shuffle(tfItems).slice(0, 3),
        ...enumItems.slice(0, 2),
        ...matchQs,
      ]);
    }
    return items;
  }, [mode, slug, attempt, quiz, bank]);

  const total = queue.length;
  const current = queue[index] as QItem | undefined;

  // Shuffled definition options for the current matching round (top-level hook).
  const matchOptions = useMemo(
    () => (current && current.t === "match" ? shuffle(current.data.map((p) => p.def)) : []),
    [current, attempt],
  );

  const pct = total ? Math.round((points / total) * 100) : 0;

  const resetQuestionState = () => {
    setPicked(null);
    setIdentInput("");
    setIdentHints(0);
    setTfPicked(null);
    setEnumText("");
    setMatchSel({});
    setFeedback(null);
  };

  const finish = useCallback(
    (finalPoints: number) => {
      const finalPct = total ? Math.round((finalPoints / total) * 100) : 0;
      saveQuizBest(slug, finalPct);
      setBest((b) => Math.max(b ?? -1, finalPct));
      setDone(true);
      if (finalPct >= 60) markLessonDone(slug);
    },
    [slug, total],
  );

  /** Grade the current question exactly once; add its score. */
  const grade = useCallback(
    (score: number, ok: boolean, detail: string) => {
      if (feedback) return; // already graded
      setPoints((p) => p + score);
      setFeedback({ ok, detail });
    },
    [feedback],
  );

  const gradeIdent = () => {
    if (!current || current.t !== "ident") return;
    const ok = norm(identInput) === norm(current.data.term);
    grade(ok ? 1 : 0, ok, ok ? `Correct - ${current.data.term}.` : `The answer is: ${current.data.term}.`);
  };

  const gradeEnum = () => {
    if (!current || current.t !== "enum") return;
    const lines = enumText.split("\n").map(norm).filter(Boolean);
    const found: string[] = [];
    const missing: string[] = [];
    for (const ans of current.data.answers) {
      const a = norm(ans);
      const hit = lines.some((l) => l === a || l.startsWith(a) || a.startsWith(l));
      if (hit) found.push(ans);
      else missing.push(ans);
    }
    const score = current.data.answers.length ? found.length / current.data.answers.length : 0;
    grade(
      score,
      missing.length === 0,
      missing.length === 0 ? `All ${found.length} found.` : `Found: ${found.join(", ") || "none"}. Missing: ${missing.join(", ")}.`,
    );
  };

  const gradeMatch = () => {
    if (!current || current.t !== "match") return;
    const correct = current.data.filter((p) => norm(matchSel[p.term] ?? "") === norm(p.def)).length;
    const score = current.data.length ? correct / current.data.length : 0;
    grade(score, correct === current.data.length, `${correct} of ${current.data.length} pairs correct.`);
  };

  const next = () => {
    if (index + 1 >= total) {
      finish(points);
    } else {
      setIndex((i) => i + 1);
      resetQuestionState();
    }
  };

  const restart = (newMode?: QuizMode) => {
    if (newMode) setMode(newMode);
    setAttempt((a) => a + 1);
    setIndex(0);
    setPoints(0);
    setDone(false);
    resetQuestionState();
  };

  const changeMode = (m: QuizMode) => {
    if (m === mode) return;
    if (m !== "mc" && !hasBank) return;
    restart(m);
  };

  const chip = (m: QuizMode) => {
    const disabled = m !== "mc" && !hasBank;
    return (
      <button
        key={m}
        type="button"
        onClick={() => changeMode(m)}
        disabled={disabled}
        title={disabled ? "Available on the School lessons" : undefined}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          mode === m
            ? "bg-indigo-600 text-white"
            : disabled
              ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
              : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
        }`}
      >
        {MODES.find((x) => x.id === m)?.label}
      </button>
    );
  };

  const chips = <div className="flex flex-wrap gap-1.5">{MODES.map((m) => chip(m.id))}</div>;

  if (done) {
    return (
      <div>
        {chips}
        <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 text-center dark:border-indigo-500/30 dark:bg-indigo-500/5">
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{pct}%</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {MODES.find((m) => m.id === mode)?.label} - {points.toFixed(1).replace(/\.0$/, "")} / {total} correct
            {best !== null ? ` · best ${best}%` : ""} · +{Math.round(pct / 10)} XP
          </p>
          <p className="mt-1 text-sm font-medium text-indigo-700 dark:text-[#4fc1ff]">
            {pct === 100 ? "Perfect!" : pct >= 60 ? "Passed! Lesson marked complete." : "Keep going - retry to pass (60%+)."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => restart()}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Retry {MODES.find((m) => m.id === mode)?.label}
            </button>
            {hasBank ? (
              <button
                type="button"
                onClick={() => restart("mixed")}
                className="rounded-xl border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-400/40 dark:bg-transparent dark:text-[#4fc1ff]"
              >
                Try Mixed (all types)
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div>
        {chips}
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/5 dark:text-amber-300">
          This quiz type has no questions for this lesson yet. Try Multiple Choice - or the extra modes on the School lessons.
        </p>
      </div>
    );
  }

  const feedbackBox = feedback ? (
    <div className="mt-3 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm dark:bg-slate-800">
      <p className={feedback.ok ? "font-semibold text-emerald-700 dark:text-emerald-400" : "font-semibold text-rose-700 dark:text-rose-400"}>
        {feedback.ok ? "Correct!" : "Not quite."}
      </p>
      <p className="mt-0.5 text-slate-600 dark:text-slate-300">{feedback.detail}</p>
      <button
        type="button"
        onClick={next}
        className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        {index + 1 >= total ? "See results" : "Next"}
      </button>
    </div>
  ) : null;

  return (
    <div>
      {chips}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#3c3c3c] dark:bg-[#252526]">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-[#4fc1ff]">
            {MODES.find((m) => m.id === current.t)?.label ?? "Question"}
          </span>
          <span>
            {index + 1} / {total} · score {points.toFixed(1).replace(/\.0$/, "")}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${(index / total) * 100}%` }} />
        </div>

        {/* MULTIPLE CHOICE */}
        {current.t === "mc" ? (
          <>
            <p className="mt-4 text-[15px] font-semibold text-slate-900 dark:text-white">{current.data.q}</p>
            <div className="mt-3 grid gap-2">
              {current.data.options.map((option, i) => {
                const isAnswer = i === current.data.answer;
                const isPicked = picked === i;
                let cls =
                  "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-transparent dark:hover:border-indigo-400";
                if (picked !== null && isAnswer) cls = "border-emerald-400 bg-emerald-50 font-semibold dark:bg-emerald-500/10";
                else if (picked !== null && isPicked) cls = "border-rose-400 bg-rose-50 dark:bg-rose-500/10";
                else if (picked !== null) cls = "border-slate-200 opacity-60 dark:border-slate-700";
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (picked !== null) return;
                      setPicked(i);
                      const ok = i === current.data.answer;
                      grade(ok ? 1 : 0, ok, current.data.explanation);
                    }}
                    disabled={picked !== null}
                    className={`rounded-xl border px-3.5 py-2.5 text-left text-sm text-slate-800 transition dark:text-slate-200 ${cls}`}
                  >
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {/* IDENTIFICATION */}
        {current.t === "ident" ? (
          <>
            <p className="mt-4 text-[15px] font-semibold text-slate-900 dark:text-white">Identify the term</p>
            <p className="mt-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-slate-700 dark:bg-amber-500/5 dark:text-slate-300">
              {current.data.def}
            </p>
            {identHints > 0 ? (
              <p className="mt-2 font-mono text-lg tracking-[0.3em] text-indigo-700 dark:text-[#4fc1ff]">
                {maskTerm(current.data.term, identHints)}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                value={identInput}
                onChange={(e) => setIdentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") gradeIdent();
                }}
                placeholder="Type the COBOL term..."
                spellCheck={false}
                className="min-w-[180px] flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setIdentHints((h) => h + 1)}
                disabled={feedback !== null}
                className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-40 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300"
              >
                Hint: letter {identHints + 1}
              </button>
              <button
                type="button"
                onClick={gradeIdent}
                disabled={feedback !== null || !identInput.trim()}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
              >
                Check
              </button>
            </div>
          </>
        ) : null}

        {/* TRUE / FALSE */}
        {current.t === "tf" ? (
          <>
            <p className="mt-4 text-[15px] font-semibold text-slate-900 dark:text-white">True or False?</p>
            <p className="mt-2 rounded-xl bg-sky-50 px-3.5 py-2.5 text-sm text-slate-700 dark:bg-sky-500/5 dark:text-slate-300">
              {current.data.statement}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[true, false].map((val) => {
                const isPicked = tfPicked === val;
                const isAnswer = current.data.answer === val;
                let cls =
                  "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-transparent dark:text-slate-300";
                if (tfPicked !== null && isAnswer) cls = "border-emerald-400 bg-emerald-50 font-semibold dark:bg-emerald-500/10";
                else if (tfPicked !== null && isPicked) cls = "border-rose-400 bg-rose-50 dark:bg-rose-500/10";
                else if (tfPicked !== null) cls = "border-slate-200 opacity-60 dark:border-slate-700";
                return (
                  <button
                    key={String(val)}
                    type="button"
                    disabled={tfPicked !== null}
                    onClick={() => {
                      setTfPicked(val);
                      const ok = val === current.data.answer;
                      grade(ok ? 1 : 0, ok, current.data.explanation);
                    }}
                    className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${cls}`}
                  >
                    {val ? "TRUE" : "FALSE"}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {/* ENUMERATION */}
        {current.t === "enum" ? (
          <>
            <p className="mt-4 text-[15px] font-semibold text-slate-900 dark:text-white">Enumerate</p>
            <p className="mt-2 rounded-xl bg-sky-50 px-3.5 py-2.5 text-sm text-slate-700 dark:bg-sky-500/5 dark:text-slate-300">
              {current.data.q}
            </p>
            <textarea
              value={enumText}
              onChange={(e) => setEnumText(e.target.value)}
              placeholder="One answer per line..."
              rows={Math.min(8, current.data.answers.length + 1)}
              spellCheck={false}
              className="mt-3 w-full resize-y rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={gradeEnum}
              disabled={feedback !== null || !enumText.trim()}
              className="mt-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
            >
              Check answers
            </button>
          </>
        ) : null}

        {/* MATCHING */}
        {current.t === "match" ? (
          <>
            <p className="mt-4 text-[15px] font-semibold text-slate-900 dark:text-white">
              Match each term to its definition ({current.data.length} pairs)
            </p>
            <div className="mt-3 space-y-2">
              {current.data.map((pair) => (
                <div key={pair.term} className="grid gap-2 sm:grid-cols-[170px_minmax(0,1fr)]">
                  <span className="rounded-lg bg-indigo-50 px-3 py-2 font-mono text-xs font-bold text-indigo-800 dark:bg-indigo-500/10 dark:text-[#9cdcfe]">
                    {pair.term}
                  </span>
                  <select
                    value={matchSel[pair.term] ?? ""}
                    onChange={(e) => setMatchSel((s) => ({ ...s, [pair.term]: e.target.value }))}
                    disabled={feedback !== null}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="">— choose the definition —</option>
                    {matchOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={gradeMatch}
              disabled={feedback !== null || current.data.some((p) => !matchSel[p.term])}
              className="mt-3 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
            >
              Check matches
            </button>
          </>
        ) : null}

        {feedbackBox}
      </div>
    </div>
  );
}
