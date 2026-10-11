import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { BookIcon, CodeIcon, GraduationCapIcon, LogoMark, QuizIcon, TerminalIcon } from "@/components/icons";

/** One navbar everywhere: pinned while scrolling, identical on every page. */
export default function Navbar({ active }: { active?: "tutorials" | "school" | "exercises" | "quiz" | "compiler" }) {
  const item = (id: "tutorials" | "school" | "exercises" | "quiz", href: string, label: string, Icon: typeof BookIcon) =>
    active === id ? (
      <span key={id} className="flex items-center gap-1.5 rounded-full bg-indigo-600/10 px-3 py-1 text-indigo-700 dark:bg-indigo-500/15 dark:text-[#4fc1ff]">
        <Icon width={14} height={14} />
        {label}
      </span>
    ) : (
      <Link key={id} href={href} className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-700 dark:text-slate-400 dark:hover:text-white">
        <Icon width={14} height={14} />
        {label}
      </Link>
    );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-[#3c3c3c] dark:bg-[#252526]/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
          <LogoMark />
          COBOL<span className="-ml-1.5 text-indigo-600 dark:text-[#4fc1ff]">.dev</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium sm:gap-4">
          {item("tutorials", "/", "Tutorials", BookIcon)}
          <span className="hidden sm:inline">{item("school", "/school", "School", GraduationCapIcon)}</span>
          <span className="hidden sm:inline">{item("exercises", "/exercises", "Exercises", CodeIcon)}</span>
          <span className="hidden sm:inline">{item("quiz", "/quiz", "Quizzes", QuizIcon)}</span>
          {active === "compiler" ? (
            <span className="flex items-center gap-1.5 rounded-full bg-indigo-600/10 px-3 py-1 text-indigo-700 dark:bg-indigo-500/15 dark:text-[#4fc1ff]">
              <TerminalIcon width={14} height={14} />
              Compiler
            </span>
          ) : (
            <Link
              href="/compiler"
              className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1.5 text-white transition hover:bg-indigo-500"
            >
              <TerminalIcon width={14} height={14} />
              Compiler
            </Link>
          )}
          <span className="ml-1 border-l border-slate-200 pl-2 dark:border-[#3c3c3c]">
            <ThemeToggle />
          </span>
        </nav>
      </div>
    </header>
  );
}
