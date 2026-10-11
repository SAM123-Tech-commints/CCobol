import Link from "next/link";
import QuizBrowser from "@/components/QuizBrowser";
import { quizzes } from "@/content/quizzes";

export const metadata = {
  title: "COBOL Quizzes - test yourself after every lesson",
  description: "Short SoloLearn-style COBOL quizzes with instant feedback: divisions, PIC clauses, arithmetic, control flow, tables, strings and files.",
};

export default function QuizPage() {
  const slugs = Object.keys(quizzes);
  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-slate-900">
            COBOL<span className="text-indigo-600">.</span>dev
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="text-slate-600 hover:text-indigo-700">
              Tutorials
            </Link>
            <Link href="/exercises" className="text-slate-600 hover:text-indigo-700">
              Exercises
            </Link>
            <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-indigo-700">Quizzes</span>
            <Link href="/compiler" className="rounded-full bg-indigo-600 px-3.5 py-1.5 text-white hover:bg-indigo-500">
              Compiler
            </Link>
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">COBOL Quizzes</h1>
        <p className="mt-2 text-slate-600">
          SoloLearn-style: pick a quiz, answer one question at a time, get instant explanations. Scoring 60%+ marks
          the lesson complete and earns XP - all saved in your browser.
        </p>
        <div className="mt-6">
          <QuizBrowser slugs={slugs} initial={slugs[0] ?? "hello-world"} />
        </div>
      </section>
    </main>
  );
}
