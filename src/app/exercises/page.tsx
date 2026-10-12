import Navbar from "@/components/Navbar";
import ExercisesBrowser from "@/components/ExercisesBrowser";

export const metadata = {
  title: "COBOL Exercises - hands-on coding practice",
  description:
    "Bite-size COBOL coding exercises with starter code and auto-checking: DISPLAY, variables, arithmetic, IF/ELSE, PERFORM loops, EVALUATE, OCCURS tables, STRING and files.",
};

export default function ExercisesPage() {
  return (
    <div className="app-shell">
      <Navbar active="exercises" />
      <ExercisesBrowser />
      <footer className="site-footer">
        <span>© 2025 OpenCOBOL Studio · Learn the language that runs the world.</span>
      </footer>
    </div>
  );
}
