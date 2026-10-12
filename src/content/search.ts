import { lessons } from "./index";
import { schoolLessons } from "./school";
import { challenges } from "./challenges";
import { examples } from "./examples";
import { quizzes } from "./quizzes";
import { slugify } from "@/lib/slug";

export type SearchKind = "Tutorial" | "School" | "Exercise" | "Example" | "Quiz";

export interface SearchEntry {
  kind: SearchKind;
  title: string;
  href: string;
  snippet: string;
  /** lowercased searchable text */
  hay: string;
}

function clean(s: string): string {
  return s
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*`>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Full search index: every lesson, section/subtopic, exercise and example. */
export const searchIndex: SearchEntry[] = (() => {
  const out: SearchEntry[] = [];
  const add = (e: Omit<SearchEntry, "hay">) => {
    out.push({ ...e, hay: `${e.title} ${e.snippet}`.toLowerCase() });
  };

  // Tutorial lessons + every heading (section / subtopic)
  for (const lesson of lessons) {
    add({ kind: "Tutorial", title: lesson.title, href: `/learn/${lesson.slug}`, snippet: lesson.summary });
    const lines = lesson.body.replace(/\r\n?/g, "\n").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^#{1,6}\s+(.*)$/);
      if (!m) continue;
      const heading = m[1].replace(/\*\*/g, "").trim();
      let snip = "";
      for (let j = i + 1; j < lines.length && snip.length < 160; j++) {
        if (!lines[j].trim() || lines[j].trimStart().startsWith("#") || lines[j].trimStart().startsWith("```")) continue;
        snip += ` ${lines[j]}`;
      }
      add({
        kind: "Tutorial",
        title: `${lesson.title} › ${heading}`,
        href: `/learn/${lesson.slug}#${slugify(heading)}`,
        snippet: clean(snip).slice(0, 160),
      });
    }
  }

  // School lessons + every section
  for (const lesson of schoolLessons) {
    const short = lesson.title.split(" - ")[1] ?? lesson.title;
    add({ kind: "School", title: lesson.title, href: `/school/${lesson.slug}`, snippet: lesson.objectives?.[0] ?? "" });
    lesson.sections.forEach((s, idx) => {
      add({
        kind: "School",
        title: `Lesson ${lesson.no}: ${short} › ${s.heading}`,
        href: `/school/${lesson.slug}#s-${idx}`,
        snippet: clean(s.exact || s.simple).slice(0, 160),
      });
    });
  }

  // Exercises
  for (const c of challenges) {
    add({ kind: "Exercise", title: c.title, href: `/exercises#${c.id}`, snippet: c.instructions });
  }

  // Runnable examples
  for (const ex of examples) {
    add({ kind: "Example", title: ex.name, href: `/compiler?example=${ex.id}`, snippet: ex.description });
  }

  // Quiz sets
  for (const [slug, set] of Object.entries(quizzes)) {
    add({ kind: "Quiz", title: set.title, href: "/quiz", snippet: `${slug.startsWith("school-") ? "School set" : "Tutorial set"} · ${set.questions.length} questions` });
  }

  return out;
})();
