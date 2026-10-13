import Navbar from "@/components/Navbar";
import ExercisesBrowser from "@/components/ExercisesBrowser";
import CobolBot from "@/components/CobolBot";

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
      <CobolBot
        context="COBOL coding exercises: DISPLAY, variables and PICTURE, arithmetic (ADD/COMPUTE), IF/ELSE conditions, PERFORM loops, EVALUATE, OCCURS tables, STRING/UNSTRING and sequential files."
        title="COBOL Exercises"
        quickPrompts={["How do I start an exercise?", "Explain the PICTURE clause", "How does PERFORM UNTIL work?", "What is a group item?"]}
      />
      <footer className="site-footer">
        <span>Ac 2025 OpenCOBOL Studio A� Learn the language that runs the world.</span>
      </footer>
    </div>
  );
}
