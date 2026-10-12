import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import Navbar from "@/components/Navbar";
import LessonProgress from "@/components/LessonProgress";
import SavePosition from "@/components/SavePosition";
import SidebarNav from "@/components/SidebarNav";
import ModuleBar from "@/components/ModuleBar";
import ChallengeCard from "@/components/ChallengeCard";
import ScrollToTop from "@/components/ScrollToTop";
import { challenges } from "@/content/challenges";
import { getLesson, getLessonNeighbours, lessons, modules } from "@/content";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: `${lesson.title} - COBOL Tutorial`,
    description: lesson.summary,
  };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const { prev, next } = getLessonNeighbours(slug);
  const index = lessons.findIndex((l) => l.slug === slug) + 1;
  const moduleLessons = modules.find((m) => m.name === lesson.module)?.lessons ?? [];

  return (
    <main className="min-h-screen">
      <Navbar active="tutorials" />

      <div className="page docs">
        <aside className="side card hidden lg:block">
          <SidebarNav
            current={slug}
            modules={modules.map((m) => ({ name: m.name, lessons: m.lessons.map((l) => ({ slug: l.slug, title: l.title })) }))}
          />
        </aside>

        <article className="doc">
          <nav className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-700">
              COBOL Tutorial
            </Link>
            <span>›</span>
            <span>{lesson.module}</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{lesson.title}</h1>
          <p className="mt-2 text-slate-600">{lesson.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2.5 py-1">
              Lesson {index} of {lessons.length}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">{moduleLessons.length} lessons in {lesson.module}</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-800">COBOL only</span>
          </div>
          <div className="mt-4">
            <LessonProgress slug={slug} />
          </div>
          <SavePosition slug={slug} />
          <div className="mt-3 max-w-xs">
            <ModuleBar slugs={lessons.map((l) => l.slug)} />
          </div>

          <div className="mt-6 border-y border-slate-100 py-2 text-sm">
            <div className="flex flex-wrap gap-3">
              {prev ? (
                <Link href={`/learn/${prev.slug}`} className="text-slate-500 hover:text-indigo-700">
                  ← {prev.title}
                </Link>
              ) : null}
              {next ? (
                <Link href={`/learn/${next.slug}`} className="ml-auto text-indigo-600 hover:text-indigo-800">
                  {next.title} →
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-2">
            <Markdown markdown={lesson.body} files={lesson.files} stdin={lesson.stdin} />
          </div>

          <div className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
            <h2 className="text-lg font-bold text-slate-900">Try it in the compiler</h2>
            <p className="mt-1 text-sm text-slate-600">
              Every runnable example in this lesson can be executed straight away - press the Run button on any COBOL block.
              The example below already has the data this lesson needs attached.
            </p>
            <div className="mt-3">
              <CodeBlock
                code={firstRunnable(lesson.body) ?? "       IDENTIFICATION DIVISION.\n       PROGRAM-ID. Demo.\n       PROCEDURE DIVISION.\n           DISPLAY 'COBOL'.\n           STOP RUN."}
                lang="cobol"
                runnable
                files={lesson.files}
                stdin={lesson.stdin}
                title={lesson.title}
              />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-900">Check what you learned</h2>
            <p className="mt-1 text-sm text-slate-600">Short quiz with instant explanations - 60%+ marks this lesson complete.</p>
            <div className="mt-3">
              <Quiz slug={slug} />
            </div>
          </div>

          {challenges.filter((c) => c.lessonSlug === slug).length ? (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-900">Practice exercises</h2>
              <p className="mt-1 text-sm text-slate-600">Hands-on COBOL tasks for this lesson - auto-checked in the compiler.</p>
              <div className="mt-3 grid gap-4">
                {challenges
                  .filter((c) => c.lessonSlug === slug)
                  .map((c) => (
                    <ChallengeCard key={c.id} challenge={c} />
                  ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-600">
                More practice? <Link href="/exercises" className="font-semibold text-indigo-600 hover:text-indigo-800">All COBOL exercises →</Link>
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
            {prev ? (
              <Link href={`/learn/${prev.slug}`} className="text-left">
                <span className="block text-xs text-slate-400">Previous</span>
                <span className="font-semibold text-slate-800">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/learn/${next.slug}`} className="text-right">
                <span className="block text-xs text-slate-400">Next</span>
                <span className="font-semibold text-indigo-700">{next.title}</span>
              </Link>
            ) : (
              <Link href="/compiler" className="text-right">
                <span className="block text-xs text-slate-400">Continue</span>
                <span className="font-semibold text-indigo-700">Open the compiler</span>
              </Link>
            )}
          </div>
        </article>
      </div>
      <ScrollToTop />
    </main>
  );
}

function firstRunnable(markdown: string): string | null {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const info = lines[i].trim();
    if (info.startsWith("```") && /\brun\b/.test(info)) {
      const body: string[] = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].trimStart().startsWith("```")) {
        body.push(lines[j]);
        j++;
      }
      return body.join("\n");
    }
  }
  return null;
}
