"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { quizFor, type QuizQuestion } from "@/content/quizzes";
import { bankFor, type EnumQuestion, type TermPair, type TFQuestion } from "@/content/quizbank";
import { getQuizBest, markLessonDone, saveQuizBest } from "@/lib/progress";
import { CheckIcon, XIcon } from "@/components/icons";

/** Each matched pair locks in its own color so connections are visible. */
const PAIR_COLORS = [
  { chip: "border-indigo-400 bg-indigo-100 text-indigo-900", dot: "bg-indigo-500", dark: "dark:border-indigo-400/50 dark:bg-indigo-500/15 dark:text-indigo-200" },
  { chip: "border-emerald-400 bg-emerald-100 text-emerald-900", dot: "bg-emerald-500", dark: "dark:border-emerald-400/50 dark:bg-emerald-500/15 dark:text-emerald-200" },
  { chip: "border-amber-400 bg-amber-100 text-amber-900", dot: "bg-amber-500", dark: "dark:border-amber-400/50 dark:bg-amber-500/15 dark:text-amber-200" },
  { chip: "border-rose-400 bg-rose-100 text-rose-900", dot: "bg-rose-500", dark: "dark:border-rose-400/50 dark:bg-rose-500/15 dark:text-rose-200" },
  { chip: "border-sky-400 bg-sky-100 text-sky-900", dot: "bg-sky-500", dark: "dark:border-sky-400/50 dark:bg-sky-500/15 dark:text-sky-200" },
  { chip: "border-violet-400 bg-violet-100 text-violet-900", dot: "bg-violet-500", dark: "dark:border-violet-400/50 dark:bg-violet-500/15 dark:text-violet-200" },
];

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
    .replace(/[^A-Z0-9 ]/g, " ")
    .trim()
    .replace(/\s+/g, " ");

/** Ask COBOL BOT whether a close-but-not-exact answer is acceptable
 *  (caps, spacing, spelling and small wording differences). */
async function aiGrade(given: string, expected: string): Promise<boolean> {
  try {
    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ given, expected }),
    });
    const data = (await res.json()) as { correct?: boolean };
    return Boolean(data.correct);
  } catch {
    return false;
  }
}

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
  const [count, setCount] = useState(0);

  // per-question UI state
  const [picked, setPicked] = useState<number | null>(null);
  const [identInput, setIdentInput] = useState("");
  const [identHints, setIdentHints] = useState(0);
  const [tfPicked, setTfPicked] = useState<boolean | null>(null);
  const [enumText, setEnumText] = useState("");
  // matching: click-to-pair with colors
  const [matchPick, setMatchPick] = useState<{ side: "term" | "def"; value: string } | null>(null);
  const [matchLocked, setMatchLocked] = useState<Record<string, number>>({}); // term -> color index
  const [matchWrong, setMatchWrong] = useState<Record<string, boolean>>({}); // term -> had a wrong attempt
  const [matchFlash, setMatchFlash] = useState<{ term: string; def: string } | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; detail: string } | null>(null);
  const [best, setBest] = useState<number | null>(null);
  // Quizlet-style hints
  const [mcElim, setMcElim] = useState<number[] | null>(null); // 50:50 removed options
  const [enumHint, setEnumHint] = useState(false); // reveal first letters
  const [matchHint, setMatchHint] = useState<string | null>(null); // def to spotlight

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
    return count > 0 ? items.slice(0, count) : items;
  }, [mode, slug, attempt, quiz, bank, count]);

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
    setMatchPick(null);
    setMatchLocked({});
    setMatchWrong({});
    setMatchFlash(null);
    setFeedback(null);
    setMcElim(null);
    setEnumHint(false);
    setMatchHint(null);
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

  const gradeIdent = async () => {
    if (!current || current.t !== "ident") return;
    const given = norm(identInput);
    const want = norm(current.data.term);
    let ok = given === want || (given.length >= 3 && (want.includes(given) || given.includes(want)));
    let detail = ok ? `Correct - ${current.data.term}.` : `The answer is: ${current.data.term}.`;
    if (!ok && given) {
      const accepted = await aiGrade(identInput, current.data.term);
      if (accepted) {
        ok = true;
        detail = `Accepted by COBOL BOT - the answer is ${current.data.term}.`;
      }
    }
    grade(ok ? 1 : 0, ok, detail);
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

  /** Matching: lock a term+definition pair. Correct pairs take the next
   *  palette color; wrong pairs flash red and count against first-try. */
  const attemptMatchPair = (term: string, def: string) => {
    if (!current || current.t !== "match" || feedback) return;
    if (matchLocked[term] !== undefined) return; // already locked
    const pair = current.data.find((p) => p.term === term);
    if (pair && norm(pair.def) === norm(def)) {
      const colorIdx = Object.keys(matchLocked).length % PAIR_COLORS.length;
      const nextLocked = { ...matchLocked, [term]: colorIdx };
      setMatchLocked(nextLocked);
      setMatchPick(null);
      if (Object.keys(nextLocked).length === current.data.length) {
        // All pairs matched - grade automatically.
        const firstTry = current.data.filter((p) => !matchWrong[p.term]).length;
        const score = current.data.length ? firstTry / current.data.length : 0;
        const wrongs = current.data.length - firstTry;
        grade(
          score,
          wrongs === 0,
          wrongs === 0
            ? `Perfect matching - all ${current.data.length} pairs on the first try.`
            : `Matched all ${current.data.length} pairs - ${firstTry} on the first try, ${wrongs} after a wrong attempt.`,
        );
      }
    } else {
      setMatchWrong((w) => ({ ...w, [term]: true }));
      setMatchFlash({ term, def });
      setMatchPick(null);
      setTimeout(() => setMatchFlash(null), 700);
    }
  };

  const onTermClick = (term: string) => {
    if (feedback || matchLocked[term] !== undefined) return;
    if (matchPick?.side === "def") attemptMatchPair(term, matchPick.value);
    else setMatchPick({ side: "term", value: term });
  };

  const onDefClick = (def: string) => {
    if (feedback) return;
    const used =
      current?.t === "match" &&
      current.data.some((p) => matchLocked[p.term] !== undefined && norm(p.def) === norm(def));
    if (used) return;
    if (matchPick?.side === "term") attemptMatchPair(matchPick.value, def);
    else setMatchPick({ side: "def", value: def });
  };

  /** Quizlet-style hint: eliminate two wrong options (50:50). */
  const hintMc = () => {
    if (!current || current.t !== "mc" || picked !== null || mcElim) return;
    const wrong = current.data.options.map((_, i) => i).filter((i) => i !== current.data.answer);
    setMcElim(shuffle(wrong).slice(0, Math.max(0, wrong.length - 1)));
  };

  /** Quizlet-style hint: spotlight the matching definition for the selected chip. */
  const hintMatch = () => {
    if (!current || current.t !== "match" || feedback || !matchPick) return;
    const pair =
      matchPick.side === "term"
        ? current.data.find((p) => p.term === matchPick.value)
        : current.data.find((p) => norm(p.def) === norm(matchPick.value));
    if (pair && matchLocked[pair.term] === undefined) setMatchHint(pair.def);
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

  const chips = (
    <div className="flex flex-wrap items-center gap-1.5">
      {MODES.map((m) => chip(m.id))}
      <label className="ml-auto flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        Questions
        <select
          value={count}
          onChange={(e) => {
            setCount(Number(e.target.value));
            restart();
          }}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value={0}>All</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </label>
    </div>
  );

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
          <p className="mt-1 text-sm font-medium text-indigo-700 dark:text-[#8db8ff]">
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
                className="rounded-xl border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-400/40 dark:bg-transparent dark:text-[#8db8ff]"
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
    <div
      className={`mt-3 rounded-xl border px-3.5 py-3 text-sm ${
        feedback.ok
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-500/10"
          : "border-rose-200 bg-rose-50 dark:border-rose-400/30 dark:bg-rose-500/10"
      }`}
    >
      <p
        className={`flex items-center gap-1.5 font-semibold ${
          feedback.ok ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
        }`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${
            feedback.ok ? "bg-emerald-500" : "bg-rose-500"
          }`}
        >
          {feedback.ok ? <CheckIcon width={12} height={12} /> : <XIcon width={12} height={12} />}
        </span>
        {feedback.ok ? "Correct!" : "Not quite."}
      </p>
      <p className="mt-1 text-slate-600 dark:text-slate-300">{feedback.detail}</p>
      <button
        type="button"
        onClick={next}
        className="mt-3 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
      >
        {index + 1 >= total ? "See results" : "Next"}
      </button>
    </div>
  ) : null;

  return (
    <div>
      {chips}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#243652] dark:bg-[#0d1a2d]">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-[#8db8ff]">
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
            <div className="mt-4 flex flex-wrap items-start justify-between gap-2">
              <p className="text-[15px] font-semibold text-slate-900 dark:text-white">{current.data.q}</p>
              {picked === null && !mcElim && current.data.options.length > 2 ? (
                <button
                  type="button"
                  onClick={hintMc}
                  className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-800 transition hover:bg-amber-100 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300"
                >
                  Hint: 50/50
                </button>
              ) : null}
            </div>
            <div className="mt-3 grid gap-2">
              {current.data.options.map((option, i) => {
                const isAnswer = i === current.data.answer;
                const isPicked = picked === i;
                const eliminated = mcElim?.includes(i);
                let cls =
                  "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-transparent dark:hover:border-indigo-400";
                if (eliminated && picked === null)
                  cls = "border-slate-200 bg-slate-50 text-slate-400 line-through opacity-50 dark:border-slate-700 dark:bg-slate-800/40";
                if (picked !== null && isAnswer) cls = "border-emerald-400 bg-emerald-50 font-semibold dark:bg-emerald-500/10";
                else if (picked !== null && isPicked) cls = "border-rose-400 bg-rose-50 dark:bg-rose-500/10";
                else if (picked !== null) cls = "border-slate-200 opacity-60 dark:border-slate-700";
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (picked !== null || eliminated) return;
                      setPicked(i);
                      const ok = i === current.data.answer;
                      grade(ok ? 1 : 0, ok, current.data.explanation);
                    }}
                    disabled={picked !== null || eliminated}
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
              <p className="mt-2 font-mono text-lg tracking-[0.3em] text-indigo-700 dark:text-[#8db8ff]">
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
            {enumHint ? (
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tracking-[0.25em] text-indigo-700 dark:text-[#8db8ff]">
                {current.data.answers.map((a) => (
                  <span key={a}>{a.trim().charAt(0).toUpperCase()} · · ·</span>
                ))}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={gradeEnum}
                disabled={feedback !== null || !enumText.trim()}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
              >
                Check answers
              </button>
              {!enumHint && feedback === null ? (
                <button
                  type="button"
                  onClick={() => setEnumHint(true)}
                  className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300"
                >
                  Hint: first letters
                </button>
              ) : null}
            </div>
          </>
        ) : null}

        {/* MATCHING - click a term, then its definition (or the other way). */}
        {current.t === "match" ? (
          <>
            <p className="mt-4 text-[15px] font-semibold text-slate-900 dark:text-white">
              Match each term to its definition ({current.data.length} pairs)
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Click a term, then its definition (or the other way around). Correct pairs lock in{" "}
              <span className="font-semibold text-indigo-600 dark:text-[#8db8ff]">their own color</span>; wrong picks flash red.
            </p>
            {matchPick && !feedback && matchHint === null ? (
              <button
                type="button"
                onClick={hintMatch}
                className="mt-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-800 transition hover:bg-amber-100 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300"
              >
                Hint: show the pair
              </button>
            ) : null}
            {matchHint ? (
              <p className="mt-2 rounded-lg border border-dashed border-amber-400/60 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/5 dark:text-amber-300">
                Look for the definition glowing amber.
              </p>
            ) : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {/* terms column */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Terms</p>
                {current.data.map((pair) => {
                  const locked = matchLocked[pair.term];
                  const isSel = matchPick?.side === "term" && matchPick.value === pair.term;
                  const isFlash = matchFlash?.term === pair.term;
                  const color = locked !== undefined ? PAIR_COLORS[locked % PAIR_COLORS.length] : null;
                  return (
                    <button
                      key={pair.term}
                      type="button"
                      onClick={() => onTermClick(pair.term)}
                      disabled={feedback !== null || locked !== undefined}
                      className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left font-mono text-xs font-bold transition ${
                        color
                          ? `${color.chip} ${color.dark} cursor-default`
                          : isFlash
                            ? "border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-400/60 dark:bg-rose-500/10 dark:text-rose-300"
                            : isSel
                              ? "border-indigo-500 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-400 ring-offset-1 dark:bg-indigo-500/20 dark:text-white dark:ring-offset-[#0d1a2d]"
                              : "cursor-pointer border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-sm dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:border-indigo-400"
                      }`}
                    >
                      {color ? (
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color.dot}`} aria-hidden />
                      ) : null}
                      <span className="flex-1">{pair.term}</span>
                      {color ? <CheckIcon width={14} height={14} /> : null}
                    </button>
                  );
                })}
              </div>
              {/* definitions column */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Definitions</p>
                {matchOptions.map((def) => {
                  const isSel = matchPick?.side === "def" && matchPick.value === def;
                  const isFlash = matchFlash?.def === def;
                  const isHint = matchHint === def;
                  const usedBy =
                    current.t === "match"
                      ? current.data.find((p) => matchLocked[p.term] !== undefined && norm(p.def) === norm(def))
                      : undefined;
                  const color = usedBy ? PAIR_COLORS[matchLocked[usedBy.term] % PAIR_COLORS.length] : null;
                  return (
                    <button
                      key={def}
                      type="button"
                      onClick={() => onDefClick(def)}
                      disabled={feedback !== null || Boolean(usedBy)}
                      className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs leading-snug transition ${
                        color
                          ? `${color.chip} ${color.dark} cursor-default`
                          : isFlash
                            ? "border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-400/60 dark:bg-rose-500/10 dark:text-rose-300"
                            : isHint
                              ? "border-amber-400 bg-amber-50 ring-2 ring-amber-300/60 dark:border-amber-400/60 dark:bg-amber-500/10"
                              : isSel
                                ? "border-indigo-500 bg-indigo-50 text-slate-800 ring-2 ring-indigo-400 ring-offset-1 dark:bg-indigo-500/20 dark:text-white dark:ring-offset-[#0d1a2d]"
                                : "cursor-pointer border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-sm dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:border-indigo-400"
                      }`}
                    >
                      {color ? (
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color.dot}`} aria-hidden />
                      ) : null}
                      <span className="flex-1">{def}</span>
                      {color ? <CheckIcon width={14} height={14} /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}

        {feedbackBox}
      </div>
    </div>
  );
}
