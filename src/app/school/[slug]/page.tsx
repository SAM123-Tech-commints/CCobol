import Link from "next/link";
import Navbar from "@/components/Navbar";
import Quiz from "@/components/Quiz";
import CodeBlock from "@/components/CodeBlock";
import ScrollToTop from "@/components/ScrollToTop";
import VideoPlayer from "@/components/VideoPlayer";
import { videoFor } from "@/content/videos";
import { CodingSheetDiagram, CustomerInfoTree, StructureHierarchyDiagram } from "@/components/SchoolDiagrams";
import { getSchoolLesson, getSchoolNeighbours, schoolLessons } from "@/content/school";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return schoolLessons.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getSchoolLesson(slug);
  return {
    title: lesson ? `${lesson.title} - 1st Semester School Tutorial` : "School lesson not found",
    description: lesson ? `School COBOL tutorial: ${lesson.title}. Exact slide text with explanations in simpler words.` : undefined,
  };
}

/** Yellow box = exact slide text; blue box = "in simpler words" hint. */
function ExactBox({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/5">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Exact text from the slide</p>
      <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-slate-800 dark:text-slate-200">{text}</div>
    </div>
  );
}

/** Insert the matching slide diagram, keyed on the section heading. */
function SectionDiagram({ heading }: { heading: string }) {
  if (heading.includes("Coding Sheet Split")) return <CodingSheetDiagram />;
  if (heading.includes("Overall Structure")) return <StructureHierarchyDiagram />;
  if (heading.includes("Conceptual Structure") || heading.includes("Hierarchical Organization")) return <CustomerInfoTree />;
  return null;
}

export default async function SchoolLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getSchoolLesson(slug);
  if (!lesson) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#1e1e1e]">
        <Navbar active="school" />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold dark:text-white">Lesson not found</h1>
          <Link href="/school" className="mt-4 inline-block text-indigo-600 hover:underline dark:text-[#4fc1ff]">
            Back to the school tutorial
          </Link>
        </div>
      </main>
    );
  }
  const { prev, next } = getSchoolNeighbours(slug);

  return (
    <main className="min-h-screen bg-white dark:bg-[#1e1e1e]">
      <Navbar active="school" />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <nav className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/school" className="hover:text-indigo-700 dark:hover:text-white">
            1st Semester School Tutorial
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">Lesson {lesson.no}</span>
        </nav>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{lesson.title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Lessons by Royette H. Vergara - exact slide text with explanations in simpler words. Press Run on any full
          program to execute it in the online COBOL terminal.
        </p>

        {lesson.objectives?.length ? (
          <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/5">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-[#4fc1ff]">Lesson objectives</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
              {lesson.objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ol>
          </div>
        ) : null}

        {/* Video lecture with chapter timeline (add yours in src/content/videos.ts) */}
        {(() => {
          const video = videoFor(slug);
          return video ? (
            <div className="mt-6">
              <VideoPlayer source={video} />
            </div>
          ) : null;
        })()}

        <div className="mt-8 space-y-10">
          {lesson.sections.map((s, idx) => {
            const runnable = /IDENTIFICATION DIVISION|PROCEDURE DIVISION/i.test(s.code ?? "");
            return (
              <section key={idx}>
                <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">{s.heading}</h2>
                <div className="space-y-3">
                  <ExactBox text={s.exact} />
                  <SectionDiagram heading={s.heading} />
                  {s.code ? (
                    <CodeBlock
                      code={s.code}
                      lang="cobol"
                      runnable={runnable}
                      title={runnable ? `Lesson ${lesson.no} demo - ${s.heading}` : `Lesson ${lesson.no} - ${s.heading}`}
                    />
                  ) : null}
                  {s.table ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#3c3c3c]">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-[#2d2d2d]">
                            {s.table.headers.map((h, i) => (
                              <th key={i} className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-800 dark:border-[#3c3c3c] dark:text-slate-200">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {s.table.rows.map((row, r) => (
                            <tr key={r} className="align-top">
                              {row.map((cell, c) => (
                                <td
                                  key={c}
                                  className={`border-b border-slate-100 px-3 py-2 dark:border-[#333] ${
                                    c === 0 ? "font-mono font-semibold text-indigo-700 dark:text-[#4fc1ff]" : "text-slate-700 dark:text-slate-300"
                                  } ${/overline|Size error/.test(cell) ? "text-rose-600 dark:text-rose-400" : ""}`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                  {s.note ? (
                    <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/5 dark:text-rose-300">
                      <strong>Note:</strong> {s.note}
                    </p>
                  ) : null}
                  {s.simple ? (
                    <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-400/30 dark:bg-sky-500/5">
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">In simpler words (hint)</p>
                      <p className="text-[14px] leading-relaxed text-slate-700 dark:text-slate-300">{s.simple}</p>
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-10">
          <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">Check what you learned</h2>
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
            Quiz on the exact terms from this lesson. 60%+ marks it complete.
          </p>
          <Quiz slug={slug} />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 dark:border-[#3c3c3c]">
          {prev ? (
            <Link href={`/school/${prev.slug}`} className="text-left">
              <span className="block text-xs text-slate-400">Previous</span>
              <span className="font-semibold text-slate-800 hover:text-indigo-700 dark:text-slate-200 dark:hover:text-white">
                Lesson {prev.no}: {prev.title.split(" - ")[1]}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/school/${next.slug}`} className="text-right">
              <span className="block text-xs text-slate-400">Next</span>
              <span className="font-semibold text-indigo-700 hover:text-indigo-900 dark:text-[#4fc1ff] dark:hover:text-white">
                Lesson {next.no}: {next.title.split(" - ")[1]}
              </span>
            </Link>
          ) : (
            <Link href="/compiler" className="text-right">
              <span className="block text-xs text-slate-400">Continue</span>
              <span className="font-semibold text-indigo-700 hover:text-indigo-900 dark:text-[#4fc1ff] dark:hover:text-white">Open the compiler</span>
            </Link>
          )}
        </div>
      </div>
      <ScrollToTop />
    </main>
  );
}
