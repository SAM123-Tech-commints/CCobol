import Link from "next/link";
import ChallengeCard from "@/components/ChallengeCard";
import { challenges } from "@/content/challenges";

export const metadata = {
  title: "COBOL Exercises - hands-on coding practice",
  description: "Bite-size COBOL coding exercises with starter code and auto-checking: DISPLAY, variables, arithmetic, IF/ELSE, PERFORM loops, EVALUATE, OCCURS tables and STRING.",
};

export default function ExercisesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-slate-900">
            COBOL<span className="text-indigo-600">.</span>dev
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="text-slate-600 hover:text-indigo-700">
              Tutorials
            </Link>
            <Link href="/quiz" className="text-slate-600 hover:text-indigo-700">
              Quizzes
            </Link>
            <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-indigo-700">Exercises</span>
            <Link href="/compiler" className="rounded-full bg-indigo-600 px-3.5 py-1.5 text-white hover:bg-indigo-500">
              Compiler
            </Link>
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">COBOL Exercises</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Programming-Hub-style practice: every exercise has starter COBOL code, a hint, and a{" "}
          <strong>Check my code</strong> button that runs your program in the built-in COBOL-only compiler and
          verifies the output. Passing earns 30 XP.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {challenges.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      </section>
    </main>
  );
}
