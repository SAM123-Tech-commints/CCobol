import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { snippets } from "@/db/schema";
import CodeBlock from "@/components/CodeBlock";
import ProgressStrip from "@/components/ProgressStrip";
import { lessons, modules } from "@/content";
import { examples } from "@/content/examples";
import { challenges } from "@/content/challenges";

export const dynamic = "force-dynamic";

const HERO_CODE = `       IDENTIFICATION DIVISION.
       PROGRAM-ID. HelloWorld.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-NAME           PIC X(15) VALUE 'COBOL'.
       01 WS-YEAR           PIC 9(4) VALUE 1959.
       PROCEDURE DIVISION.
           DISPLAY 'Hello from ' WS-NAME ' (' WS-YEAR ')'.
           DISPLAY 'Still running the world of banking.'.
           STOP RUN.`;

export default async function HomePage() {
  let recent: { shareId: string; title: string }[] = [];
  try {
    recent = (await db.select({ shareId: snippets.shareId, title: snippets.title }).from(snippets).orderBy(desc(snippets.id)).limit(6)) ?? [];
  } catch {
    recent = [];
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-slate-900">
            COBOL<span className="text-indigo-600">.</span>dev
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <a href="#tutorial" className="hidden text-slate-600 hover:text-indigo-700 sm:inline">
              Tutorial
            </a>
            <a href="#examples" className="hidden text-slate-600 hover:text-indigo-700 sm:inline">
              Examples
            </a>
            <Link href="/exercises" className="hidden text-slate-600 hover:text-indigo-700 sm:inline">
              Exercises
            </Link>
            <Link href="/quiz" className="hidden text-slate-600 hover:text-indigo-700 sm:inline">
              Quizzes
            </Link>
            <Link href="/learn/cobol-setup-mac" className="text-slate-600 hover:text-indigo-700">
              Cheat sheet
            </Link>
            <Link href="/compiler" className="rounded-full bg-indigo-600 px-3.5 py-1.5 text-white hover:bg-indigo-500">
              Compiler
            </Link>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
              Free · no sign-up · runs in your browser
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Learn COBOL Programming
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
              A complete, step-by-step COBOL tutorial - from the four divisions and <span className="font-mono text-[15px]">PIC</span> clauses
              all the way to file handling, debugging and mainframe concepts - with a working online COBOL compiler on every page.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/learn/hello-world"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
              >
                Start learning COBOL
              </Link>
              <Link
                href="/compiler"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-indigo-400 hover:text-indigo-700"
              >
                ▶ Open the compiler
              </Link>
              <Link
                href="/exercises"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-400 hover:text-emerald-700"
              >
                ✎ Practice exercises
              </Link>
            </div>
            <dl className="mt-9 grid grid-cols-3 gap-4 text-center">
              {[
                { k: `${lessons.length}`, v: "lessons" },
                { k: `${examples.length}+`, v: "runnable examples" },
                { k: "0", v: "installations" },
              ].map((item) => (
                <div key={item.v} className="rounded-xl border border-slate-200 bg-white p-3">
                  <dt className="text-2xl font-extrabold text-slate-900">{item.k}</dt>
                  <dd className="text-xs uppercase tracking-wide text-slate-500">{item.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <CodeBlock code={HERO_CODE} lang="cobol" runnable title="Hello, World! (COBOL)" />
            <p className="mt-2 text-center text-xs text-slate-500">Press Run - the program is compiled and executed instantly.</p>
          </div>
        </div>
      </section>

      <ProgressStrip totalLessons={lessons.length} totalChallenges={challenges.length} />

      {/* how you learn: SoloLearn + Programming Hub + Programiz style */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">How you&apos;ll learn</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Short lessons like SoloLearn, ready-to-run examples like Programming Hub, and step-by-step guidance like
          Programiz - but everything here is <strong>COBOL only</strong>: one language, one compiler, zero setup.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "1 · Learn", d: "Bite-size lessons: divisions, PIC clauses, arithmetic, control flow, tables, strings, files.", href: "/learn/hello-world", c: "Start lesson →" },
            { t: "2 · Quiz", d: "Instant-feedback quizzes after every lesson. 60%+ marks it complete and earns XP.", href: "/quiz", c: "Take a quiz →" },
            { t: "3 · Practice", d: "Hands-on COBOL exercises with auto-checking - your output is verified, not just shown.", href: "/exercises", c: "Try exercises →" },
            { t: "4 · Compile", d: "A COBOL-only online compiler on every page: stdin for ACCEPT, data files, share links.", href: "/compiler", c: "Open compiler →" },
          ].map((s) => (
            <Link key={s.t} href={s.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
              <p className="text-base font-bold text-slate-900 group-hover:text-indigo-700">{s.t}</p>
              <p className="mt-1 text-sm text-slate-600">{s.d}</p>
              <p className="mt-3 text-sm font-semibold text-indigo-600">{s.c}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* tutorial index */}
      <section id="tutorial" className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">COBOL Tutorial</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          The full course, in order. Every lesson includes the theory, worked examples and a program you can run straight away.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {modules.map((module, idx) => (
            <div key={module.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-sm font-bold text-indigo-700">
                  {idx + 1}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{module.name}</h3>
              </div>
              <ul className="mt-3 space-y-1.5">
                {module.lessons.map((lesson) => (
                  <li key={lesson.slug}>
                    <Link href={`/learn/${lesson.slug}`} className="group flex items-start gap-2 text-[14.5px] text-slate-700 hover:text-indigo-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 group-hover:bg-indigo-500" />
                      <span>
                        {lesson.title}
                        <span className="block text-xs text-slate-400">{lesson.summary.slice(0, 84)}…</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* compiler promo */}
      <section className="border-y border-slate-200 bg-slate-900">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Online COBOL Compiler</h2>
            <p className="mt-3 text-slate-300">
              Write COBOL in the browser and run it immediately - just like JDoodle, OneCompiler, OnlineGDB or TutorialsPoint,
              but built into the tutorial. It supports the four divisions, <span className="font-mono text-slate-100">PIC</span>/
              <span className="font-mono text-slate-100">VALUE</span> clauses, <span className="font-mono text-slate-100">OCCURS</span> tables,
              <span className="font-mono text-slate-100"> PERFORM</span> loops, <span className="font-mono text-slate-100">EVALUATE</span>,
              <span className="font-mono text-slate-100"> STRING/UNSTRING/INSPECT</span>, <span className="font-mono text-slate-100">SEARCH</span>,
              sequential / relative / indexed files, <span className="font-mono text-slate-100">CALL</span> between programs and intrinsic functions.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-300">
              <li>✓ stdin for <span className="font-mono">ACCEPT</span></li>
              <li>✓ data files for <span className="font-mono">SELECT … ASSIGN TO</span>, plus a tab showing the files your program writes</li>
              <li>✓ compiler-style error messages with line numbers</li>
              <li>✓ save &amp; share a permanent link to your program</li>
            </ul>
            <Link
              href="/compiler"
              className="mt-7 inline-block rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-emerald-400"
            >
              Run COBOL now →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {examples.slice(0, 8).map((example) => (
              <Link
                key={example.id}
                href={`/compiler?example=${example.id}`}
                className="group rounded-xl border border-slate-700 bg-slate-800/60 p-4 transition hover:border-emerald-400/60 hover:bg-slate-800"
              >
                <p className="text-sm font-semibold text-white group-hover:text-emerald-300">{example.name}</p>
                <p className="mt-1 text-xs text-slate-400">{example.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* exercises preview */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">COBOL Exercises</h2>
              <p className="mt-2 max-w-2xl text-slate-600">Hands-on practice with auto-checking - write COBOL, run it, get verified.</p>
            </div>
            <Link href="/exercises" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
              All {challenges.length} exercises →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {challenges.slice(0, 4).map((c) => (
              <Link key={c.id} href="/exercises" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">{c.difficulty}</p>
                <p className="mt-1 text-base font-bold text-slate-900 group-hover:text-emerald-700">{c.title}</p>
                <p className="mt-1 text-sm text-slate-600">{c.instructions}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* examples */}
      <section id="examples" className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">COBOL Examples</h2>
        <p className="mt-2 max-w-2xl text-slate-600">Complete programs you can load into the compiler with one click.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {examples.map((example) => (
            <Link
              key={example.id}
              href={`/compiler?example=${example.id}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <p className="text-base font-bold text-slate-900 group-hover:text-indigo-700">{example.name}</p>
              <p className="mt-1 text-sm text-slate-600">{example.description}</p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-wide text-slate-400">
                {example.code.trim().split("\n").length} lines · runs instantly
              </p>
            </Link>
          ))}
        </div>
      </section>

      {recent.length ? (
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Recently shared programs</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {recent.map((program) => (
                <Link
                  key={program.shareId}
                  href={`/compiler?share=${program.shareId}`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-700"
                >
                  {program.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500">
          <p>
            COBOL.dev - a free COBOL tutorial and online compiler. COBOL is not case sensitive, and neither are we.
          </p>
          <div className="flex gap-4">
            <Link href="/learn/cobol-setup-mac" className="hover:text-indigo-700">
              Setup guide
            </Link>
            <Link href="/learn/cobol-syntax-overview" className="hover:text-indigo-700">
              Syntax
            </Link>
            <Link href="/compiler" className="hover:text-indigo-700">
              Compiler
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
