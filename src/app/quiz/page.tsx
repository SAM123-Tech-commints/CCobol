import Navbar from "@/components/Navbar";
import QuizBrowser from "@/components/QuizBrowser";
import { quizzes } from "@/content/quizzes";

export const metadata = {
  title: "COBOL Quizzes - test yourself after every lesson",
  description: "Short SoloLearn-style COBOL quizzes with instant feedback: divisions, PIC clauses, arithmetic, control flow, tables, strings and files.",
};

export default function QuizPage() {
  const slugs = Object.keys(quizzes);
  const schoolFirst = [...slugs].sort((a, b) => (a.startsWith("school-") ? 0 : 1) - (b.startsWith("school-") ? 0 : 1));
  return (
    <main className="min-h-screen bg-[#07111f]">
      <Navbar active="quiz" />
      <section className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">COBOL Quizzes</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Six quiz types: multiple choice, identification with letter hints, matching, true or false, enumeration, and
          Mixed (all types combined). The extra types are available on the School lessons. 60%+ marks the lesson
          complete and earns XP - all saved in your browser.
        </p>
        <div className="mt-6">
          <QuizBrowser slugs={slugs} initial={schoolFirst[0] ?? "hello-world"} />
        </div>
      </section>
    </main>
  );
}
