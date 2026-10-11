"use client";

/** Progress tracking (SoloLearn-style XP + completed lessons), stored in localStorage. */

const LESSONS_KEY = "cobol-done-lessons";
const QUIZ_KEY = "cobol-quiz-best";
const CHALLENGE_KEY = "cobol-done-challenges";
const LAST_KEY = "cobol-last-lesson";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore (private mode etc.)
  }
}

export function getDoneLessons(): string[] {
  return readJson<string[]>(LESSONS_KEY, []);
}

export function isLessonDone(slug: string): boolean {
  return getDoneLessons().includes(slug);
}

export function markLessonDone(slug: string) {
  const done = getDoneLessons();
  if (!done.includes(slug)) writeJson(LESSONS_KEY, [...done, slug]);
}

export function unmarkLessonDone(slug: string) {
  writeJson(
    LESSONS_KEY,
    getDoneLessons().filter((s) => s !== slug),
  );
}

export function getQuizBest(): Record<string, number> {
  return readJson<Record<string, number>>(QUIZ_KEY, {});
}

export function saveQuizBest(slug: string, pct: number) {
  const best = getQuizBest();
  if (pct > (best[slug] ?? -1)) {
    writeJson(QUIZ_KEY, { ...best, [slug]: pct });
  }
}

export function getDoneChallenges(): string[] {
  return readJson<string[]>(CHALLENGE_KEY, []);
}

/** Last lesson the learner opened - used for "continue where you left off". */
export function getLastLesson(): string | null {
  return readJson<string | null>(LAST_KEY, null);
}

export function setLastLesson(slug: string) {
  writeJson(LAST_KEY, slug);
}

export function markChallengeDone(id: string) {
  const done = getDoneChallenges();
  if (!done.includes(id)) writeJson(CHALLENGE_KEY, [...done, id]);
}

/** XP: 20 per finished lesson, quiz best % counts, 30 per challenge. */
export function getXp(totalLessons: number): { xp: number; lessons: number; quizzes: number; challenges: number } {
  void totalLessons;
  const lessons = getDoneLessons().length;
  const quizzes = Object.values(getQuizBest()).reduce((a, b) => a + b, 0);
  const challenges = getDoneChallenges().length;
  return { xp: lessons * 20 + Math.round(quizzes / 10) + challenges * 30, lessons, quizzes: Object.keys(getQuizBest()).length, challenges };
}
