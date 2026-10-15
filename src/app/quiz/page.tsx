import Navbar from "@/components/Navbar";
import QuizBrowser from "@/components/QuizBrowser";
import CobolBot from "@/components/CobolBot";
import { quizzes } from "@/content/quizzes";

export const metadata = {
  title: "COBOL Quizzes - test yourself after every lesson",
  description: "COBOL quizzes with six modes: multiple choice, identification with letter hints, matching, true or false, enumeration and mixed - with instant feedback.",
};

export default function QuizPage() {
  const slugs = Object.keys(quizzes);
  const schoolFirst = [...slugs].sort((a, b) => (a.startsWith("school-") ? 0 : 1) - (b.startsWith("school-") ? 0 : 1));
  return (
    <div className="app-shell">
      <Navbar active="quiz" />
      <main className="page quiz-page">
        <QuizBrowser slugs={slugs} initial={schoolFirst[0] ?? "hello-world"} />
      </main>
      <CobolBot
        context="COBOL quizzes and flashcards: definitions of COBOL terminology, divisions, PICTURE clauses, conditions (IF/EVALUATE), PERFORM loops, files, tables and object-oriented COBOL. Help the student study and explain anything they are stuck on."
        title="COBOL Quiz Helper"
        quickPrompts={["Quiz me on COBOL terms", "Explain a term I'm stuck on", "Difference between PIC 9 and PIC X?", "Tips to remember the divisions"]}
      />
      <footer className="site-footer">
        <span>Ac 2025 COBOL CodeLab A� Learn the language that runs the world.</span>
      </footer>
    </div>
  );
}
