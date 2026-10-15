"use client";

import { useMemo, useState } from "react";
import { highlightCobol } from "@/lib/cobol/highlight";

interface CheatSection {
  id: string;
  title: string;
  summary: string;
  details: string[];
  code: string;
  runnable?: boolean;
}

/** Figma "lofi" cheat-sheet content + layout (ported verbatim). */
const cheatSections: CheatSection[] = [
  {
    id: "what-is-cobol",
    title: "What is COBOL?",
    summary:
      "COBOL means Common Business-Oriented Language. It is a rigidly structured, data-oriented language that still processes a major share of financial and government transactions.",
    details: [
      "Programs read like natural language and are organized as program → division → section → paragraph → sentence → statements.",
      "The four divisions are IDENTIFICATION, ENVIRONMENT, DATA and PROCEDURE. SOURCE FORMAT FREE removes traditional fixed-column rules.",
    ],
    code: `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. hello.
ENVIRONMENT DIVISION.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 UserName PIC X(30) VALUE "You".
PROCEDURE DIVISION.
    DISPLAY "What is your name " WITH NO ADVANCING
    ACCEPT UserName
    DISPLAY "Hello " UserName
    STOP RUN.`,
    runnable: true,
  },
  {
    id: "data-types",
    title: "Data & types",
    summary: "COBOL works primarily with numeric, alphanumeric and alphabetic fields. PICTURE defines the shape and size of each elementary item.",
    details: [
      "X accepts any character, 9 is a digit, A is a letter or space, S allows a sign, and V marks an implied decimal point.",
      "Level numbers build records: 01 is the highest group, while lower levels describe nested fields.",
    ],
    code: `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. data-demo.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 SampleData PIC X(10) VALUE "Stuff".
01 JustLetters PIC AAA VALUE "ABC".
01 SignedInt PIC S9(4) VALUE -1234.
01 PayCheck PIC 9(4)V99 VALUE ZEROS.
01 Customer.
   02 Ident PIC 9(3).
   02 CustName PIC X(20).
PROCEDURE DIVISION.
    MOVE "More Stuff" TO SampleData
    DISPLAY SampleData
    STOP RUN.`,
    runnable: true,
  },
  {
    id: "arithmetic",
    title: "Arithmetic",
    summary: "Use ADD, SUBTRACT, MULTIPLY and DIVIDE with GIVING, or COMPUTE for expressions. ROUNDED controls discarded decimal positions.",
    details: ["DIVIDE can return a REMAINDER. Exponentiation uses **, and parentheses explicitly control evaluation order."],
    code: `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. arithmetic.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 Num1 PIC 9 VALUE 5.
01 Num2 PIC 9 VALUE 4.
01 Ans PIC S99V99 VALUE 0.
01 Rem PIC 9V99.
PROCEDURE DIVISION.
    ADD Num1 TO Num2 GIVING Ans
    DIVIDE Num2 INTO Num1 GIVING Ans REMAINDER Rem
    COMPUTE Ans = (Num1 + Num2) * 2
    COMPUTE Ans ROUNDED = 3.0 + 2.005
    DISPLAY Ans " REMAINDER " Rem
    STOP RUN.`,
    runnable: true,
  },
  {
    id: "conditions",
    title: "Conditions (IF, EVALUATE)",
    summary: "COBOL supports symbolic and word-based comparisons plus AND, OR and NOT. EVALUATE is the multi-branch equivalent of switch.",
    details: [
      "Class tests include IS NUMERIC and IS ALPHABETIC. Level-88 condition names turn stored values into readable business conditions.",
      "WHEN OTHER is the safe fallback branch in an EVALUATE block.",
    ],
    code: `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. conditions.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 Age PIC 99 VALUE 21.
01 Score PIC X VALUE "B".
   88 PassingScore VALUE "A" THRU "D".
PROCEDURE DIVISION.
    IF Age >= 18 AND PassingScore
        DISPLAY "ELIGIBLE AND PASSED"
    ELSE
        DISPLAY "REVIEW REQUIRED"
    END-IF
    EVALUATE Score
        WHEN "A" DISPLAY "EXCELLENT"
        WHEN "B" DISPLAY "GOOD"
        WHEN OTHER DISPLAY "KEEP LEARNING"
    END-EVALUATE
    STOP RUN.`,
    runnable: true,
  },
  {
    id: "paragraphs-perform",
    title: "Paragraphs & PERFORM",
    summary: "Named paragraphs organize procedure logic. PERFORM invokes a paragraph or repeats inline statements with TIMES, UNTIL or VARYING.",
    details: [
      "Execution can fall through into following paragraphs, so explicit main-flow paragraphs and scoped PERFORM blocks are easier to maintain.",
    ],
    code: `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. paragraphs.
PROCEDURE DIVISION.
MAIN.
    PERFORM SHOW-MESSAGE 2 TIMES
    DISPLAY "RETURNED TO MAIN"
    STOP RUN.
SHOW-MESSAGE.
    DISPLAY "IN A PARAGRAPH".`,
    runnable: true,
  },
  {
    id: "loops-goto",
    title: "Loops & GO TO",
    summary: "PERFORM WITH TEST AFTER runs at least once. PERFORM VARYING behaves like a for loop. GO TO transfers control to another paragraph.",
    details: ["Prefer structured PERFORM blocks for modern code. Use GO TO only when maintaining flow that genuinely depends on paragraph jumps."],
    code: `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. loops.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 Counter PIC 99.
PROCEDURE DIVISION.
    PERFORM VARYING Counter FROM 1 BY 1
        UNTIL Counter > 5
        DISPLAY Counter
    END-PERFORM
    STOP RUN.`,
    runnable: true,
  },
  {
    id: "edited-pictures",
    title: "Edited pictures",
    summary: "Edited PICTURE symbols format output without changing the source value.",
    details: ["Z suppresses leading zeroes, comma inserts separators, $ floats a currency sign, and slash or B inserts display separators."],
    code: `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. edited-pictures.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 StartNum PIC 9(8)V99 VALUE 00001123.55.
01 WithCommas PIC ZZ,ZZZ,ZZ9.99.
01 DollarValue PIC $$,$$$,$$9.99.
01 BirthDate PIC 9(8) VALUE 12211974.
01 DisplayDate PIC 99/99/9999.
PROCEDURE DIVISION.
    MOVE StartNum TO WithCommas
    MOVE StartNum TO DollarValue
    MOVE BirthDate TO DisplayDate
    DISPLAY WithCommas " " DollarValue " " DisplayDate
    STOP RUN.`,
    runnable: true,
  },
  {
    id: "strings",
    title: "Strings (INSPECT, STRING, UNSTRING)",
    summary: "INSPECT counts or replaces characters, STRING joins fields, and UNSTRING splits a field around a delimiter.",
    details: ["STRING supports DELIMITED BY SIZE, SPACES or a character. A POINTER tracks the current destination position."],
    code: `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. strings.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 FirstName PIC X(6) VALUE "Martin".
01 LastName PIC X(4) VALUE "King".
01 FullName PIC X(12).
01 WordOne PIC X(6).
01 WordTwo PIC X(6).
PROCEDURE DIVISION.
    STRING FirstName DELIMITED BY SIZE SPACE
           LastName DELIMITED BY SIZE INTO FullName
    UNSTRING FullName DELIMITED BY SPACE
        INTO WordOne WordTwo
    END-UNSTRING
    INSPECT FullName REPLACING ALL "i" BY "I"
    DISPLAY FullName
    STOP RUN.`,
    runnable: true,
  },
  {
    id: "tables",
    title: "Tables (OCCURS, SEARCH)",
    summary: "OCCURS declares repeated fields. Subscripts start at 1, while INDEXED BY creates indexes managed with SET.",
    details: ["SEARCH scans in order. SEARCH ALL performs a binary search when the table declares a sorted key."],
    code: `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. tables.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 Friends.
   02 Friend PIC X(15) OCCURS 4 TIMES.
01 I PIC 9.
PROCEDURE DIVISION.
    MOVE "Joy" TO Friend(1)
    MOVE "Willow" TO Friend(2)
    PERFORM VARYING I FROM 1 BY 1 UNTIL I > 2
        DISPLAY Friend(I)
    END-PERFORM
    STOP RUN.`,
    runnable: true,
  },
  {
    id: "redefines",
    title: "REDEFINES",
    summary: "REDEFINES overlays a second record layout on the same storage without allocating more memory.",
    details: ["It is useful for interpreting one input record in multiple ways or preloading a table from a contiguous text area."],
    code: `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. redefines-demo.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 ChangeMe.
   02 TextNum PIC X(6) VALUE "123456".
   02 FloatNum REDEFINES TextNum PIC 9(4)V99.
PROCEDURE DIVISION.
    DISPLAY TextNum
    DISPLAY FloatNum
    STOP RUN.`,
    runnable: true,
  },
  {
    id: "sort-merge",
    title: "SORT & MERGE",
    summary: "SORT orders file records by one or more keys. MERGE combines two or more identically structured, already sorted files.",
    details: ["A sort work file uses an SD entry. USING identifies input files and GIVING identifies the sorted output."],
    code: `       >>SOURCE FORMAT FREE
*> Core SORT syntax
SORT WorkFile
    ON ASCENDING KEY StudentId
    USING OriginalFile
    GIVING SortedFile.

*> Core MERGE syntax
MERGE WorkFile
    ON ASCENDING KEY StudentId
    USING FirstFile SecondFile
    GIVING CombinedFile.`,
  },
  {
    id: "object-oriented",
    title: "Object-oriented COBOL",
    summary: "Modern COBOL can define classes, create object references and invoke methods while interoperating with procedural programs.",
    details: ["Classes appear in the REPOSITORY. USAGE OBJECT REFERENCE stores an instance, and INVOKE calls class or instance methods."],
    code: `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. object-demo.
REPOSITORY.
    CLASS ToDoClass AS "todolist".
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WorkList USAGE OBJECT REFERENCE ToDoClass.
PROCEDURE DIVISION.
    INVOKE ToDoClass "new"
        RETURNING WorkList
    INVOKE WorkList "PrintItems"
    STOP RUN.`,
  },
];

function compilerLink(code: string) {
  const payload = { code, stdin: "", files: {}, title: "COBOL example" };
  return `/compiler?code=${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))))}`;
}

function CheatCode({ code, runnable }: { code: string; runnable?: boolean }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");
  return (
    <div className="code">
      <div className="code-bar">
        <span className="dots">
          <i />
          <i />
          <i />
        </span>
        <div className="row">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
          {runnable ? (
            <a className="try" href={compilerLink(code)}>
              Try it →
            </a>
          ) : null}
        </div>
      </div>
      <pre>
        <code>
          {lines.map((line, index) => (
            <span className="code-line" key={index}>
              <span dangerouslySetInnerHTML={{ __html: highlightCobol(line) }} />
              {index < lines.length - 1 ? "\n" : ""}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export default function CheatSheetReference() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(cheatSections[0].id);
  const visible = useMemo(
    () =>
      cheatSections.filter((s) =>
        `${s.title} ${s.summary} ${s.details.join(" ")} ${s.code}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const jumpTo = (id: string) => {
    setActive(id);
    document.getElementById(`cheat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="cheat-page-inner">
      <header className="cheat-hero">
        <div>
          <span className="overline">Complete language reference / COBOL 85</span>
          <h1>COBOL Cheat Sheet</h1>
          <p className="lead">
            A fast reference for everything in the course—from divisions and PICTURE clauses to files, tables, sorting
            and object-oriented COBOL.
          </p>
          <div className="row">
            <a className="btn primary" href="/compiler">
              Open compiler
            </a>
            <span className="cheat-hint">Every runnable block opens with one click.</span>
          </div>
        </div>
        <div className="cheat-hero-stats">
          <div>
            <strong>{cheatSections.length}</strong>
            <span>topics</span>
          </div>
          <div>
            <strong>{cheatSections.filter((s) => s.runnable).length}</strong>
            <span>runnable demos</span>
          </div>
          <div>
            <strong>1</strong>
            <span>quick reference</span>
          </div>
        </div>
      </header>
      <div className="cheat-workspace">
        <aside className="cheat-nav">
          <label>
            <span>Search this reference</span>
            <input className="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try PIC, SEARCH, CALL…" />
          </label>
          <nav aria-label="Cheat sheet topics">
            {visible.map((s, index) => (
              <button className={active === s.id ? "active" : ""} onClick={() => jumpTo(s.id)} key={s.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {s.title}
              </button>
            ))}
          </nav>
          <div className="cheat-nav-note">
            <strong>Compiler ready</strong>
            <p>Use “Try it” on supported examples to preload the code editor.</p>
          </div>
        </aside>
        <article className="cheat-content">
          {visible.map((s, index) => (
            <section className="cheat-reference" id={`cheat-${s.id}`} key={s.id}>
              <header>
                <span>{String(cheatSections.indexOf(s) + 1).padStart(2, "0")}</span>
                <div>
                  <small>Reference topic</small>
                  <h2>{s.title}</h2>
                </div>
              </header>
              <p className="cheat-summary">{s.summary}</p>
              <div className="cheat-details">
                {s.details.map((d) => (
                  <p key={d}>{d}</p>
                ))}
              </div>
              <CheatCode code={s.code} runnable={s.runnable} />
              <button className="cheat-next" onClick={() => jumpTo(visible[index + 1]?.id ?? visible[0].id)}>
                {visible[index + 1] ? `Next: ${visible[index + 1].title}` : "Back to first topic"} <span>→</span>
              </button>
            </section>
          ))}
          {!visible.length ? <div className="empty-state">No reference entries match “{query}”. Try a verb such as PERFORM or SEARCH.</div> : null}
        </article>
      </div>
    </div>
  );
}
