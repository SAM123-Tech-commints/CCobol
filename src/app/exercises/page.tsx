import Navbar from "@/components/Navbar";
import ChallengeCard from "@/components/ChallengeCard";
import { challenges } from "@/content/challenges";

export const metadata = {
  title: "COBOL Exercises - hands-on coding practice",
  description: "Bite-size COBOL coding exercises with starter code and auto-checking: DISPLAY, variables, arithmetic, IF/ELSE, PERFORM loops, EVALUATE, OCCURS tables and STRING.",
};

export default function ExercisesPage() {
  return (
    <main className="min-h-screen bg-[#07111f]">
      <Navbar active="exercises" />
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
