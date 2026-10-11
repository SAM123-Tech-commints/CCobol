import Link from "next/link";
import Navbar from "@/components/Navbar";
import Quiz from "@/components/Quiz";
import VideoPlayer from "@/components/VideoPlayer";
import { GraduationCapIcon } from "@/components/icons";
import { schoolLessons } from "@/content/school";
import { videoFor } from "@/content/videos";

export const metadata = {
  title: "1st Semester COBOL - School Tutorial (Lessons 1-4)",
  description:
    "School COBOL tutorial for the first semester: Lesson 1 Introduction, Lesson 2 Identification & Environment Division with the PIC clause table, Lesson 3 Condition Statements, Lesson 4 PERFORM. Exact slide text plus explanations in simpler words.",
};

export default function SchoolIndexPage() {
  const video = videoFor("school");
  return (
    <main className="min-h-screen bg-white dark:bg-[#1e1e1e]">
      <Navbar active="school" />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-700 dark:bg-indigo-500/15 dark:text-[#4fc1ff]">
            <GraduationCapIcon width={22} height={22} />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">School Tutorial - 1st Semester</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Lessons by Royette H. Vergara</p>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
          Your class notes, online. Every section shows the <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">exact text from the slides</span>{" "}
          followed by an <span className="rounded bg-sky-100 px-1.5 py-0.5 font-medium text-sky-800 dark:bg-sky-500/10 dark:text-sky-300">explanation in simpler words</span>.
          Finish each lesson with a quiz on the exact terms your teacher uses.
        </p>

        {video ? (
          <div className="mt-8">
            <VideoPlayer source={video} />
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {schoolLessons.map((lesson) => (
            <Link
              key={lesson.slug}
              href={`/school/${lesson.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-[#3c3c3c] dark:bg-[#252526] dark:hover:border-indigo-400/60"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-[#4fc1ff]">Lesson {lesson.no}</p>
              <p className="mt-1 text-base font-bold text-slate-900 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-[#9cdcfe]">
                {lesson.title.split(" - ")[1] ?? lesson.title}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{lesson.sections.length} slide sections</p>
              <p className="mt-3 text-sm font-semibold text-indigo-600 group-hover:text-indigo-800 dark:text-[#4fc1ff]">Start lesson</p>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick quiz warm-up</h2>
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Sample questions from the school quizzes.</p>
          <Quiz slug="school-l1" />
        </div>
      </div>
    </main>
  );
}
