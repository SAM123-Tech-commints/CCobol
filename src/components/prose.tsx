import type { ReactNode } from "react";

/** Professional typography engine for lesson text.
 *  - Supports **bold**, *italic* and `code` markers.
 *  - Auto-highlights COBOL keywords (uppercase occurrences only, so normal
 *    English prose is never touched) as code chips.
 *  - Block renderer: paragraphs, bullet lists, numbered lists.
 */

const PHRASES = [
  "IDENTIFICATION DIVISION", "ENVIRONMENT DIVISION", "DATA DIVISION", "PROCEDURE DIVISION",
  "WORKING-STORAGE SECTION", "FILE SECTION", "CONFIGURATION SECTION", "INPUT-OUTPUT SECTION",
  "ORGANIZATION IS SEQUENTIAL", "GREATER THAN OR EQUAL TO", "LESS THAN OR EQUAL TO",
  "IS GREATER THAN", "IS LESS THAN", "IS EQUAL TO", "NOT EQUAL TO", "NOT LESS THAN", "NOT GREATER THAN",
  "IS NUMERIC", "NOT NUMERIC", "NON NUMERIC", "IS ALPHABETIC", "NOT ALPHABETIC",
  "IS POSITIVE", "NOT POSITIVE", "IS NEGATIVE", "NON NEGATIVE", "IS ZERO", "NOT ZERO",
  "PERFORM VARYING", "PERFORM UNTIL", "PERFORM THRU", "PERFORM THROUGH", "PERFORM TIMES",
  "MOVE ALL", "GO TO", "STOP RUN", "NEXT SENTENCE", "WHEN OTHER", "AT END", "ON SIZE ERROR", "SIZE ERROR",
  "SOURCE-COMPUTER", "OBJECT-COMPUTER", "SPECIAL-NAMES", "FILE-CONTROL", "PROGRAM-ID",
  "END-OF-FILE", "NO-MORE-DATA", "MORE-DATA", "CONTINUE-FLAG",
  "END-EVALUATE", "END-PERFORM", "END-SEARCH", "END-READ", "END-IF", "END-ACCEPT", "END-COMPUTE",
  "END-STRING", "END-UNSTRING", "END-ADD", "END-SUBTRACT", "END-MULTIPLY", "END-DIVIDE",
];

const WORDS = [
  "PERFORM", "EVALUATE", "DISPLAY", "ACCEPT", "MOVE", "COMPUTE", "ADD", "SUBTRACT", "MULTIPLY", "DIVIDE",
  "READ", "WRITE", "OPEN", "CLOSE", "SELECT", "ASSIGN", "INITIALIZE", "INSPECT", "STRING", "UNSTRING",
  "DELIMITED", "TALLYING", "REPLACING", "CONVERTING", "CONTINUE", "EXIT", "GOBACK",
  "IF", "ELSE", "WHEN", "THEN", "AND", "OR", "NOT", "ALL", "TRUE", "FALSE",
  "UNTIL", "VARYING", "THRU", "THROUGH", "TIMES", "VALUE", "VALUES",
  "PIC", "PICTURE", "FILLER", "OCCURS", "REDEFINES", "RENAMES", "SEARCH", "SET", "USAGE", "COMP",
  "ZERO", "ZEROS", "ZEROES", "SPACE", "SPACES", "QUOTE", "QUOTES",
  "NUMERIC", "ALPHABETIC", "ALPHANUMERIC", "POSITIVE", "NEGATIVE", "EOFSW", "DECLARATIVES",
];

const ALL = [...PHRASES, ...WORDS].sort((a, b) => b.length - a.length);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const KW_RE = new RegExp(`\\b(${ALL.map(esc).join("|")})\\b`, "g");
const MARK_RE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

const chip = "rounded bg-indigo-50 px-1 py-0.5 font-mono text-[0.85em] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-[#6aa1ff]";
const inlineCode =
  "rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-indigo-700 dark:bg-slate-700 dark:text-[#6aa1ff]";

/** Inline formatting: **bold**, *italic*, `code`, and COBOL keyword chips. */
export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let key = 0;
  const parts = text.split(MARK_RE);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      out.push(
        <strong key={key++} className="font-bold text-slate-900 dark:text-white">
          {renderInline(part.slice(2, -2))}
        </strong>,
      );
    } else if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      out.push(
        <code key={key++} className={inlineCode}>
          {part.slice(1, -1)}
        </code>,
      );
    } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      out.push(<em key={key++}>{renderInline(part.slice(1, -1))}</em>);
    } else {
      // COBOL keyword chips (uppercase matches only).
      let last = 0;
      let m: RegExpExecArray | null;
      KW_RE.lastIndex = 0;
      while ((m = KW_RE.exec(part)) !== null) {
        if (m.index > last) out.push(part.slice(last, m.index));
        out.push(
          <code key={key++} className={chip}>
            {m[0]}
          </code>,
        );
        last = m.index + m[0].length;
      }
      out.push(part.slice(last));
    }
  }
  return out;
}

const P = "my-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300";
const UL = "my-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-slate-700 marker:text-indigo-400 dark:text-slate-300";
const OL = "my-3 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed text-slate-700 marker:font-semibold marker:text-indigo-500 dark:text-slate-300";

/** Block renderer: paragraphs, "- " bullets and "1. " numbered lists. */
export function TextBody({ text }: { text: string }) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    const isBullet = /^\s*[-]\s+/.test(line);
    const isOrdered = /^\s*\d+[.)]\s+/.test(line);
    if (isBullet || isOrdered) {
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i];
        if (isOrdered ? /^\s*\d+[.)]\s+/.test(l) : /^\s*[-]\s+/.test(l)) {
          items.push(l.replace(/^\s*(?:\d+[.)]|-)\s+/, ""));
          i++;
        } else break;
      }
      const Tag = isOrdered ? "ol" : "ul";
      blocks.push(
        Tag === "ol" ? (
          <ol key={key++} className={OL}>
            {items.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ol>
        ) : (
          <ul key={key++} className={UL}>
            {items.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ul>
        ),
      );
      continue;
    }

    // paragraph: gather until a blank line or a list start
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*[-]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push(<p key={key++} className={P}>{renderInline(para.join(" "))}</p>);
  }

  return <div>{blocks}</div>;
}
