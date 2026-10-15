import Navbar from "@/components/Navbar";
import SchoolIndex from "@/components/SchoolIndex";

export const metadata = {
  title: "1st Semester COBOL - School Tutorial (Lessons 1-4)",
  description:
    "Structured 1st-semester COBOL course: Lesson 1 Introduction, Lesson 2 Identification & Environment Division with the PIC clause table, Lesson 3 Condition Statements, Lesson 4 PERFORM. Clear explanations, runnable programs and quizzes.",
};

export default function SchoolPage() {
  return (
    <div className="app-shell">
      <Navbar active="school" />
      <SchoolIndex />
      <footer className="site-footer">
        <span>© 2025 COBOL CodeLab · Learn the language that runs the world.</span>
      </footer>
    </div>
  );
}
