import Navbar from "@/components/Navbar";
import QuizBrowser from "@/components/QuizBrowser";
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
      <footer className="site-footer">
        <span>© 2025 OpenCOBOL Studio · Learn the language that runs the world.</span>
      </footer>
    </div>
  );
}
