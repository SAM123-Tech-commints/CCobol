import Link from "next/link";
import Navbar from "@/components/Navbar";
import Quiz from "@/components/Quiz";
import CodeBlock from "@/components/CodeBlock";
import ScrollToTop from "@/components/ScrollToTop";
import VideoPlayer from "@/components/VideoPlayer";
import SidebarNav from "@/components/SidebarNav";
import LessonProgress from "@/components/LessonProgress";
import CobolBot from "@/components/CobolBot";
import { CodingSheetDiagram, CustomerInfoTree, StructureHierarchyDiagram } from "@/components/SchoolDiagrams";
import { renderInline, TextBody } from "@/components/prose";
import { getSchoolLesson, getSchoolNeighbours, schoolLessons } from "@/content/school";
import { videoFor } from "@/content/videos";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return schoolLessons.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getSchoolLesson(slug);
  return {
    title: lesson ? `${lesson.title} - 1st Semester COBOL Tutorial` : "School lesson not found",
    description: lesson ? `${lesson.title}: clear explanations, runnable programs and a quiz - COBOL 1st semester.` : undefined,
  };
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
      <main className="min-h-screen">
        <Navbar active="school" />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold dark:text-white">Lesson not found</h1>
          <Link href="/school" className="mt-4 inline-block text-indigo-600 hover:underline dark:text-[#8db8ff]">
            Back to the school tutorial
          </Link>
        </div>
      </main>
    );
  }
  const { prev, next } = getSchoolNeighbours(slug);
  const video = videoFor(slug);
  const botContext =
    `Lesson ${lesson.no}: ${lesson.title}\n\n` +
    lesson.sections.map((s) => `${s.heading}\n${s.exact}\n${s.simple ?? ""}`).join("\n\n");

  return (
    <main className="min-h-screen">
      <Navbar active="school" />
      <div className="page docs">
        {/* lesson navigation - same as the tutorial sidebar */}
        <aside className="side card hidden lg:block">
          <SidebarNav
            current={slug}
            basePath="/school"
            modules={[
              {
                name: "1st Semester",
                lessons: schoolLessons.map((l) => ({
                  slug: l.slug,
                  title: `${l.no}. ${l.title.split(" - ")[1] ?? l.title}`,
                  subs: l.sections.map((s, idx) => ({
                    anchor: `s-${idx}`,
                    title: s.heading.replace(/^\d+\.\s*/, ""),
                  })),
                })),
              },
            ]}
          />
        </aside>

        <article className="doc">
        {/* breadcrumb */}
        <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/school" className="hover:text-indigo-700 dark:hover:text-white">
            1st Semester COBOL
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">Lesson {lesson.no}</span>
        </nav>

        {/* title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{lesson.title}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Lessons by Royette H. Vergara. Press <span className="font-semibold">Run</span> on any program to compile and
          execute it in the online COBOL terminal.
        </p>
        <div className="mt-4">
          <LessonProgress slug={slug} />
        </div>

        {/* objectives */}
        {lesson.objectives?.length ? (
          <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-500/30 dark:bg-indigo-500/5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-[#8db8ff]">Objectives</p>
            <ol className="list-decimal space-y-1.5 pl-5 text-[15px] text-slate-700 dark:text-slate-300">
              {lesson.objectives.map((o, i) => (
                <li key={i}>{renderInline(o)}</li>
              ))}
            </ol>
          </div>
        ) : null}

        {/* video lecture (if configured in src/content/videos.ts) */}
        {video ? (
          <div className="mt-8">
            <VideoPlayer source={video} />
          </div>
        ) : null}

        {/* content */}
        <article className="mt-4">
          {lesson.sections.map((s, idx) => {
            const runnable = /IDENTIFICATION DIVISION|PROCEDURE DIVISION/i.test(s.code ?? "");
            return (
              <section key={idx} id={`s-${idx}`} className="scroll-mt-20">
                <h2 className="mb-5 mt-12 border-b border-slate-200 pb-2.5 text-2xl font-bold tracking-tight text-slate-900 dark:border-[#243652] dark:text-white">
                  {renderInline(s.heading)}
                </h2>

                <TextBody text={s.exact} />

                <SectionDiagram heading={s.heading} />

                {s.code ? (
                  <CodeBlock
                    code={s.code}
                    lang="cobol"
                    runnable={runnable}
                    title={runnable ? `Demo - ${s.heading}` : s.heading}
                  />
                ) : null}

                {s.table ? (
                  <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-[#243652]">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-[#101d2f]">
                          {s.table.headers.map((h, i) => (
                            <th
                              key={i}
                              className="border-b border-slate-200 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-[#243652] dark:text-slate-400"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.table.rows.map((row, r) => (
                          <tr key={r} className="align-top even:bg-slate-50/60 dark:even:bg-white/[0.02]">
                            {row.map((cell, c) => (
                              <td
                                key={c}
                                className={`border-b border-slate-100 px-4 py-2.5 leading-relaxed dark:border-[#22354f] ${
                                  c === 0
                                    ? "whitespace-nowrap font-mono font-semibold text-indigo-700 dark:text-[#8db8ff]"
                                    : "text-slate-700 dark:text-slate-300"
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
                  <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm leading-relaxed text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/5 dark:text-amber-200">
                    <strong className="font-bold">Note:</strong>{" "}
                    {renderInline(s.note.replace(/^Slide issue:?\s*/i, ""))}
                  </p>
                ) : null}

                {s.simple ? (
                  <div className="mt-5 border-l-4 border-sky-300 pl-4 dark:border-sky-400/40">
                    <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
                      {renderInline(s.simple)}
                    </p>
                  </div>
                ) : null}
              </section>
            );
          })}
        </article>

        {/* quiz */}
        <div className="mt-14 border-t border-slate-200 pt-10 dark:border-[#243652]">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Check what you learned</h2>
          <p className="mb-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
            Quiz on this lesson's terms - pass with 60%+ to mark it complete.
          </p>
          <Quiz slug={slug} />
        </div>

        {/* prev / next */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 dark:border-[#243652]">
          {prev ? (
            <Link href={`/school/${prev.slug}`} className="group text-left">
              <span className="block text-xs text-slate-400">Previous</span>
              <span className="font-semibold text-slate-800 group-hover:text-indigo-700 dark:text-slate-200 dark:group-hover:text-white">
                Lesson {prev.no}: {prev.title.split(" - ")[1]}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/school/${next.slug}`} className="group text-right">
              <span className="block text-xs text-slate-400">Next</span>
              <span className="font-semibold text-indigo-700 group-hover:text-indigo-900 dark:text-[#8db8ff] dark:group-hover:text-white">
                Lesson {next.no}: {next.title.split(" - ")[1]}
              </span>
            </Link>
          ) : (
            <Link href="/compiler" className="group text-right">
              <span className="block text-xs text-slate-400">Continue</span>
              <span className="font-semibold text-indigo-700 group-hover:text-indigo-900 dark:text-[#8db8ff] dark:group-hover:text-white">
                Open the compiler
              </span>
            </Link>
          )}
        </div>
        </article>
      </div>
      <CobolBot
        context={botContext}
        title={lesson.title}
        quickPrompts={["Explain this in simple words", "Show me a small example", "What should I memorize for the exam?"]}
      />
      <ScrollToTop />
    </main>
  );
}
