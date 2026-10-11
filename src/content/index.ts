import { generatedLessons } from "./lessons.generated";

export interface Lesson {
  slug: string;
  title: string;
  module: string;
  order: number;
  summary: string;
  body: string;
  files: Record<string, string>;
  stdin: string;
}

/** Files / stdin that each lesson's runnable example needs. */
const LESSON_DATA: Record<string, { files?: Record<string, string>; stdin?: string }> = {
  "cobol-input": {
    stdin: "Maria\n30\n",
  },
  "cobol-file-handling": {
    // Fixed width records: 3 digits id + 10 char name + 4 digit salary.
    files: {
      "SAMPLE.DAT": "001John      5000\n002Alice     6000\n003Bob       5500\n",
    },
  },
  "cobol-relative-files": {
    files: {
      "FILEA.DAT": "Alice\nBob\nCharlie\n",
      "FILEB.DAT": "Anna\nBrian\nDavid\n",
      "STUDENTS.DAT": "",
    },
  },
  "cobol-library-system": {
    stdin: "1\n10001\n101\n",
    files: {
      "USER-FILE": "10001Maria Santos        \\n",
      "BOOK-FILE": "00101COBOL FOR BUSINESS            Murach              \\n",
      "USERS.DAT": "10001Maria Santos        \\n",
      "BOOKS.DAT": "00101COBOL FOR BUSINESS            Murach              \\n",
    },
  },
  "cobol-procedures-paragraphs": { stdin: "Jane\n23\n" },
};

export const lessons: Lesson[] = generatedLessons.map((l) => ({
  ...l,
  files: LESSON_DATA[l.slug]?.files ?? {},
  stdin: LESSON_DATA[l.slug]?.stdin ?? "",
}));

export const modules: { name: string; lessons: Lesson[] }[] = (() => {
  const out: { name: string; lessons: Lesson[] }[] = [];
  for (const lesson of lessons) {
    const existing = out.find((m) => m.name === lesson.module);
    if (existing) existing.lessons.push(lesson);
    else out.push({ name: lesson.module, lessons: [lesson] });
  }
  return out;
})();

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function getLessonNeighbours(slug: string): { prev?: Lesson; next?: Lesson } {
  const idx = lessons.findIndex((l) => l.slug === slug);
  if (idx === -1) return {};
  return { prev: lessons[idx - 1], next: lessons[idx + 1] };
}

export function lessonIndex(slug: string): number {
  return lessons.findIndex((l) => l.slug === slug);
}
