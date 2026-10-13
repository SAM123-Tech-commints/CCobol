"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import ExercisesBrowser from "@/components/ExercisesBrowser";
import { BookIcon, CheckIcon, CodeIcon, LayersIcon, RouteIcon, ServerIcon, VideoIcon } from "@/components/icons";
import { schoolLessons } from "@/content/school";
import { schoolExercises } from "@/content/schoolExercises";
import { videoFor } from "@/content/videos";
import { getDoneLessons, markLessonDone, unmarkLessonDone } from "@/lib/progress";

const TIMES = ["40 min", "50 min", "60 min", "55 min"];

function levelOf(no: number) {
  return no <= 2 ? { label: "Beginner", cls: "beginner" } : { label: "Intermediate", cls: "intermediate" };
}

/** School landing page — the template's course layout, wired to the real lessons. */
export default function SchoolIndex() {
  const [done, setDone] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<"lessons" | "videos" | "practice">("lessons");
  const [level, setLevel] = useState("All");

  useEffect(() => {
    setDone(getDoneLessons());
    setReady(true);
  }, []);

  const video = videoFor("school");
  const total = schoolLessons.length;
  const doneCount = schoolLessons.filter((l) => done.includes(l.slug)).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const nextIdx = schoolLessons.findIndex((l) => !done.includes(l.slug));
  const nextLesson = nextIdx === -1 ? undefined : schoolLessons[nextIdx];

  const toggle = (slug: string) => {
    if (done.includes(slug)) {
      unmarkLessonDone(slug);
      setDone((d) => d.filter((s) => s !== slug));
    } else {
      markLessonDone(slug);
      setDone((d) => [...d, slug]);
    }
  };

  const shown = schoolLessons.filter((l) => level === "All" || levelOf(l.no).label === level);

  return (
    <main className="page school-page">
      {/* banner */}
      <section className="school-banner">
        <div>
          <p className="pill">OpenCOBOL Learning Path</p>
          <h1>From first program to mainframe-ready.</h1>
          <p className="lead">
            A guided {total}-lesson curriculum built from your class slides - practical examples, milestones and a
            browser-based workspace.
          </p>
          <div className="row">
            <Link className="btn primary" href={nextLesson ? `/school/${nextLesson.slug}` : `/school/${schoolLessons[0].slug}`}>
              {nextLesson ? `Continue lesson ${nextLesson.no}` : "Review course"}
            </Link>
            <Link className="btn ghost" href="/compiler">
              Open compiler
            </Link>
          </div>
        </div>
        <div className="school-score">
          <div className="progress-orbit" style={{ "--progress": `${pct * 3.6}deg` } as CSSProperties}>
            <span>
              <strong>{pct}%</strong>
              <small>complete</small>
            </span>
          </div>
          <div>
            <strong>
              {doneCount} / {total}
            </strong>
            <span>Lessons finished</span>
          </div>
        </div>
      </section>

      {/* metrics */}
      <section className="school-metrics">
        <div>
          <span>
            <BookIcon width={18} height={18} />
          </span>
          <strong>Foundations</strong>
          <small>Syntax, data and structure</small>
        </div>
        <div>
          <span>
            <CodeIcon width={18} height={18} />
          </span>
          <strong>Core programming</strong>
          <small>Logic, loops and files</small>
        </div>
        <div>
          <span>
            <ServerIcon width={18} height={18} />
          </span>
          <strong>Exam ready</strong>
          <small>Terms, quizzes and drills</small>
        </div>
      </section>

      {/* tabs */}
      <nav className="school-tabs" aria-label="School content">
        <button type="button" className={view === "lessons" ? "active" : ""} onClick={() => setView("lessons")}>
          <RouteIcon width={16} height={16} />
          Learning path
        </button>
        <button type="button" className={view === "videos" ? "active" : ""} onClick={() => setView("videos")}>
          <VideoIcon width={16} height={16} />
          Video library {video ? null : <span>Coming soon</span>}
        </button>
        <button type="button" className={view === "practice" ? "active" : ""} onClick={() => setView("practice")}>
          <CodeIcon width={16} height={16} />
          Practice
        </button>
      </nav>

      {view === "lessons" ? (
        <div className="school-layout">
          <section className="curriculum">
            <div className="curriculum-head">
              <div>
                <span className="tag">Course curriculum</span>
                <h2>Build your COBOL foundation</h2>
              </div>
              <div className="row chips filters">
                {["All", "Beginner", "Intermediate"].map((l) => (
                  <button key={l} type="button" className={level === l ? "chip on" : "chip"} onClick={() => setLevel(l)}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="school-roadmap">
              {shown.map((lesson) => {
                const isDone = done.includes(lesson.slug);
                const isCurrent = nextLesson?.slug === lesson.slug;
                const lvl = levelOf(lesson.no);
                return (
                  <article key={lesson.slug} className={`roadmap-lesson${isDone ? " done" : isCurrent ? " current" : ""}`}>
                    <button
                      type="button"
                      className="lesson-status"
                      onClick={() => toggle(lesson.slug)}
                      aria-label={isDone ? "Mark lesson incomplete" : "Mark lesson complete"}
                    >
                      {isDone ? <CheckIcon width={18} height={18} /> : String(lesson.no).padStart(2, "0")}
                    </button>
                    <div className="lesson-main">
                      <div className="row">
                        <span className={`level ${lvl.cls}`}>{lvl.label}</span>
                        <span className="lesson-time">{TIMES[lesson.no - 1] ?? "45 min"}</span>
                      </div>
                      <h3>{lesson.title.split(" - ")[1] ?? lesson.title}</h3>
                      <p>{lesson.sections[0]?.heading ?? lesson.objectives?.[0] ?? "Lesson content"}</p>
                    </div>
                    <Link className="lesson-open" href={`/school/${lesson.slug}`}>
                      {isDone ? "Review" : isCurrent ? "Continue" : "Start"} →
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="course-sidebar">
            <div className="card next-up">
              <span className="tag">Up next</span>
              <strong>{nextLesson ? nextLesson.title.split(" - ")[1] : "Course completed"}</strong>
              <p>
                {nextLesson
                  ? nextLesson.objectives?.[0] ?? "Continue where you left off."
                  : "You finished the full learning path. Revisit any lesson to keep your skills sharp."}
              </p>
              <Link className="btn primary" href={nextLesson ? `/school/${nextLesson.slug}` : `/school/${schoolLessons[0].slug}`}>
                {nextLesson ? "Continue learning" : "Review lessons"}
              </Link>
            </div>
            <div className="card course-details">
              <span className="tag">Course details</span>
              <div>
                <span>Lessons</span>
                <strong>{total}</strong>
              </div>
              <div>
                <span>Estimated time</span>
                <strong>3.5 hours</strong>
              </div>
              <div>
                <span>Practice exercises</span>
                <strong>{schoolExercises.length}</strong>
              </div>
              <div>
                <span>Level</span>
                <strong>All levels</strong>
              </div>
            </div>
          </aside>
        </div>
      ) : view === "videos" ? (
        <section className="video-library">
          <div className="video-library-head">
            <div>
              <span className="tag">Video library</span>
              <h2>Learn COBOL with guided video</h2>
              <p>The full lecture recording, with chapter notes and the online workspace beside it.</p>
            </div>
            <div className="video-count">
              <VideoIcon width={20} height={20} />
              <strong>{video ? 1 : 0}</strong>
              <span>lecture available</span>
            </div>
          </div>
          {video ? (
            <VideoPlayer source={video} />
          ) : (
            <div className="video-placeholder">
              <span>
                <LayersIcon width={22} height={22} />
              </span>
              <div>
                <strong>Ready for your video series</strong>
                <p>Add lesson URLs or embedded players in src/content/videos.ts when your recordings are available.</p>
              </div>
            </div>
          )}
        </section>
      ) : (
        <ExercisesBrowser
          items={schoolExercises}
          embedded
          title="School practice"
          lead="Exercises that follow your class lessons (school-l1 to school-l4). Reveal the reference solution, explain it line by line, then check your own code."
        />
      )}

      {/* footer */}
      <div className="learning-footer school-footer">
        <div className="learning-footer-copy">
          <span className="tag">Course progress</span>
          <strong>{ready && doneCount === total ? "Learning path complete" : `${total - doneCount} lessons remaining`}</strong>
          <small>Your progress is saved automatically on this device.</small>
        </div>
        <div className="learning-footer-progress">
          <div className="bar">
            <span style={{ width: `${pct}%` }} />
          </div>
          <span>{pct}%</span>
        </div>
        <Link className="btn primary" href={nextLesson ? `/school/${nextLesson.slug}` : `/school/${schoolLessons[0].slug}`}>
          {nextLesson ? "Keep learning" : "Review course"}
        </Link>
      </div>
    </main>
  );
}
