/** Line-by-line COBOL explainer.
 *
 *  This is the always-available fallback used by /api/explain when no Gemini
 *  key is configured (or the AI call fails). It is a structural analyzer: it
 *  recognises divisions, sections, data declarations and statements and
 *  describes what each line does in plain English — no network required. */

export interface ExplainLine {
  line: number;
  code: string;
  explanation: string;
}

export interface ExplainResult {
  source: "gemini" | "local";
  overview: string;
  lines: ExplainLine[];
  note?: string;
}

interface Rule {
  test: RegExp;
  say: (m: RegExpMatchArray, line: string) => string;
}

const DIVISION: Rule[] = [
  {
    test: /^IDENTIFICATION\s+DIVISION/i,
    say: () => "IDENTIFICATION DIVISION — the first of the four divisions. It identifies the program (its name and author info). Nothing runs here; it is just the program's identity card.",
  },
  {
    test: /^ENVIRONMENT\s+DIVISION/i,
    say: () => "ENVIRONMENT DIVISION — describes the computer environment: which files the program uses and how they map to the outside world (CONFIGURATION and INPUT-OUTPUT sections).",
  },
  {
    test: /^DATA\s+DIVISION/i,
    say: () => "DATA DIVISION — declares every piece of data the program works with (variables, records and files).",
  },
  {
    test: /^PROCEDURE\s+DIVISION/i,
    say: () => "PROCEDURE DIVISION — the engine room. Every statement in here is an instruction the program actually executes, top to bottom.",
  },
];

const SECTIONS: Rule[] = [
  {
    test: /^CONFIGURATION\s+SECTION/i,
    say: () => "CONFIGURATION SECTION — names the source computer and the object computer (where the program is compiled and run).",
  },
  {
    test: /^INPUT-OUTPUT\s+SECTION/i,
    say: () => "INPUT-OUTPUT SECTION — connects COBOL file names to real storage (the SELECT/ASSIGN statements live here).",
  },
  {
    test: /^FILE\s+SECTION/i,
    say: () => "FILE SECTION — describes the layout (record structure) of each file the program will read or write.",
  },
  {
    test: /^WORKING-STORAGE\s+SECTION/i,
    say: () => "WORKING-STORAGE SECTION — declares variables and tables that live for the whole run. Anything you ACCEPT, compute or MOVE into is defined here.",
  },
  {
    test: /^LOCAL-STORAGE\s+SECTION/i,
    say: () => "LOCAL-STORAGE SECTION — variables that are created fresh each time this program/paragraph runs (and reset to their initial value).",
  },
  {
    test: /^LINKAGE\s+SECTION/i,
    say: () => "LINKAGE SECTION — data passed in from a calling program (used with PROCEDURE DIVISION USING).",
  },
];

/** Verb dictionary: the explanation is produced from the matched statement. */
const VERBS: Rule[] = [
  {
    test: /^PROGRAM-ID\.?\s+([A-Z0-9-]+)/i,
    say: (m) => `PROGRAM-ID. ${m[1].toUpperCase()} — gives the program its name. This name is what you "compiled" and what the operating system calls to run it.`,
  },
  {
    test: /^DISPLAY\s+(.+?)\.?$/i,
    say: (m) => `DISPLAY — prints ${m[1].trim()} to the screen (standard output). Literals in quotes are shown exactly; variable names are replaced by their current contents.`,
  },
  {
    test: /^ACCEPT\s+([A-Z0-9-]+)\s*(?:FROM\s+([A-Z-]+))?/i,
    say: (m) =>
      m[2]
        ? `ACCEPT ${m[1].toUpperCase()} FROM ${m[2].toUpperCase()} — fills ${m[1].toUpperCase()} with a system value (DATE, DAY, TIME or DAY-OF-WEEK).`
        : `ACCEPT ${m[1].toUpperCase()} — pauses and waits for the user to type a line, then stores it in ${m[1].toUpperCase()}. The program will not continue until input arrives.`,
  },
  {
    test: /^MOVE\s+(.+?)\s+TO\s+(.+?)\.?$/i,
    say: (m) => `MOVE — copies the value on the left (${m[1].trim()}) into the field(s) on the right (${m[2].trim()}). If the receiving field is shorter it is truncated; if longer it is padded (spaces or zeros).`,
  },
  {
    test: /^ADD\s+(.+?)\.?$/i,
    say: (m) => `ADD — adds numbers and stores the result. "${m[1].trim()}" means: add the listed values, optionally using TO (accumulate into a field) or GIVING (put the total in a new field).`,
  },
  {
    test: /^SUBTRACT\s+(.+?)\.?$/i,
    say: (m) => `SUBTRACT — subtracts the first value(s) FROM a field (or computes into a field with GIVING). "${m[1].trim()}".`,
  },
  {
    test: /^MULTIPLY\s+(.+?)\.?$/i,
    say: (m) => `MULTIPLY — multiplies values BY a field, or with GIVING stores the product in another field. "${m[1].trim()}".`,
  },
  {
    test: /^DIVIDE\s+(.+?)\.?$/i,
    say: (m) => `DIVIDE — divides values INTO a field or BY a field, optionally with GIVING (result) and REMAINDER. "${m[1].trim()}".`,
  },
  {
    test: /^COMPUTE\s+([A-Z0-9-]+)\s*=\s*(.+?)\.?$/i,
    say: (m) => `COMPUTE — evaluates the arithmetic expression ${m[2].trim()} and stores it in ${m[1].toUpperCase()}. ROUNDED controls how decimals are rounded; ON SIZE ERROR handles results too big for the field.`,
  },
  {
    test: /^IF\s+(.+?)\.?$/i,
    say: (m) => `IF — tests the condition "${m[1].trim()}". If it is TRUE the statements right after it run; if FALSE the ELSE branch runs (there may be none).`,
  },
  { test: /^ELSE\b/i, say: () => "ELSE — the branch that runs when the matching IF condition was FALSE." },
  { test: /^END-IF\b/i, say: () => "END-IF — closes the IF statement so nested statements know where the condition ends." },
  {
    test: /^EVALUATE\s+(.+?)\.?$/i,
    say: (m) => `EVALUATE — a multi-way decision (COBOL's switch). It evaluates ${m[1].trim()} and runs the branch whose WHEN matches; this is cleaner than many nested IFs.`,
  },
  { test: /^WHEN\s+(.+)/i, say: (m) => `WHEN — a branch of EVALUATE: these statements run when the value matches ${m[1].trim()}.` },
  { test: /^END-EVALUATE\b/i, say: () => "END-EVALUATE — closes the EVALUATE statement." },
  { test: /^PERFORM\s+UNTIL\s+(.+?)\.?$/i, say: (m) => `PERFORM UNTIL — repeats the paragraph/statements until "${m[1].trim()}" becomes TRUE (tests before each pass, so it can run zero times).` },
  { test: /^PERFORM\s+VARYING\s+(.+?)\.?$/i, say: (m) => `PERFORM VARYING — a counted loop: "${m[1].trim()}" sets a counter, tests it and increments it (FROM / BY / UNTIL) until the UNTIL condition is true.` },
  { test: /^PERFORM\s+(.+?)\.?$/i, say: (m) => `PERFORM — runs ${m[1].trim()} as a subroutine (a paragraph, section, or the inline statements up to END-PERFORM).` },
  { test: /^END-PERFORM\b/i, say: () => "END-PERFORM — marks the end of the inline statements that PERFORM repeats." },
  { test: /^GO\s+TO\s+(.+?)\.?$/i, say: (m) => `GO TO ${m[1].trim()} — an unconditional jump to another paragraph. Powerful but easy to make unreadable; modern COBOL prefers PERFORM.` },
  { test: /^STOP\s+RUN\b/i, say: () => "STOP RUN — ends the program and returns control to the operating system. Every program needs a way to stop; this is the usual one." },
  { test: /^GOBACK\b/i, say: () => "GOBACK — returns control to the caller (or ends the run if this is the main program). Common at the end of a paragraph." },
  { test: /^EXIT\s+PROGRAM\b/i, say: () => "EXIT PROGRAM — exits this program and gives control back to whoever CALLed it." },
  { test: /^EXIT\b/i, say: () => "EXIT — a no-operation point (does nothing); often the last statement of a paragraph, or EXIT PERFORM to break a loop." },
  { test: /^OPEN\s+(INPUT|OUTPUT|I-O|EXTEND)\s+(.+?)\.?$/i, say: (m) => `OPEN ${m[1].toUpperCase()} — opens the file(s) ${m[2].trim()} for ${m[1].toUpperCase()} so they can be read/written. Files must be opened before use.` },
  { test: /^CLOSE\s+(.+?)\.?$/i, say: (m) => `CLOSE — closes ${m[1].trim()} and flushes any buffered data to storage.` },
  { test: /^READ\s+([A-Z0-9-]+)(\s+.+)?\.?$/i, say: (m) => `READ ${m[1].toUpperCase()} — reads the next record from that file into its record area (defined in the FILE SECTION). AT END / INVALID KEY handle the end-of-file case.` },
  { test: /^WRITE\s+([A-Z0-9-]+)(\s+.+)?\.?$/i, say: (m) => `WRITE ${m[1].toUpperCase()} — writes the current record to the output file. FROM moves a field into the record first; INVALID KEY reports a problem.` },
  { test: /^REWRITE\s+([A-Z0-9-]+)(\s+.+)?\.?$/i, say: (m) => `REWRITE ${m[1].toUpperCase()} — replaces the record most recently read from that random/relative file.` },
  { test: /^DELETE\s+([A-Z0-9-]+)(\s+.+)?\.?$/i, say: (m) => `DELETE ${m[1].toUpperCase()} — removes the current record of that random/relative file.` },
  { test: /^STRING\s+(.+?)\.?$/i, say: (m) => `STRING — glues several fields/literals together into one field, piece by piece, until DELIMITED BY is hit or the target fills up. "${m[1].trim()}".` },
  { test: /^UNSTRING\s+(.+?)\.?$/i, say: (m) => `UNSTRING — the opposite of STRING: it splits one field into several, using DELIMITED BY separators. "${m[1].trim()}".` },
  { test: /^INSPECT\s+(.+?)\.?$/i, say: (m) => `INSPECT — examines a field character by character: TALLYING counts occurrences, REPLACING swaps characters/substrings, CONVERTING changes whole character sets. "${m[1].trim()}".` },
  { test: /^SEARCH\s+(ALL\s+)?(.+?)\.?$/i, say: (m) => `SEARCH${m[1] ? " ALL" : ""} — scans a table (OCCURS array) for an entry: SEARCH ALL uses a fast binary search on a sorted key, plain SEARCH walks the table in order.` },
  { test: /^SET\s+(.+?)\.?$/i, say: (m) => `SET — assigns a value: sets a condition-name to TRUE/FALSE, moves a value into an index, or toggles a switch. "${m[1].trim()}".` },
  { test: /^INITIALIZE\s+(.+?)\.?$/i, say: (m) => `INITIALIZE — resets a group or table to default values (zeros for numeric fields, spaces for text). "${m[1].trim()}".` },
  { test: /^CALL\s+["']?([A-Z0-9_-]+)["']?(.*)\.?$/i, say: (m) => `CALL '${m[1].toUpperCase()}' — runs another subprogram, optionally passing data with USING. Control returns after that program finishes.` },
  { test: /^(ADD|SUBTRACT|MULTIPLY|DIVIDE)\b/i, say: () => "An arithmetic statement." },
  { test: /^END-(ADD|SUBTRACT|MULTIPLY|DIVIDE|COMPUTE|STRING|UNSTRING|SEARCH|READ|WRITE|CALL)\b/i, say: () => "Scope terminator — closes the matching conditional statement (ON SIZE ERROR / AT END / etc.)." },
  { test: /^ELSE\b/i, say: () => "ELSE — runs when the previous IF condition was false." },
  { test: /^WHEN\s+OTHER\b/i, say: () => "WHEN OTHER — the default branch of an EVALUATE (matches anything not caught above)." },
  { test: /^ON\s+SIZE\s+ERROR/i, say: () => "ON SIZE ERROR — the statements to run if an arithmetic result does not fit the receiving field." },
  { test: /^AT\s+END/i, say: () => "AT END — the statements to run when READ hits the end of the file." },
  { test: /^NOT\s+AT\s+END/i, say: () => "NOT AT END — runs when a READ succeeded (not end-of-file)." },
  { test: /^INVALID\s+KEY/i, say: () => "INVALID KEY — runs when a random/relative file operation could not complete (e.g. duplicate key on WRITE)." },
  { test: /^NOT\s+INVALID\s+KEY/i, say: () => "NOT INVALID KEY — runs when the file operation succeeded." },
  { test: /^NO\s+ADVANCING/i, say: () => "WITH NO ADVANCING — keeps the cursor on the same line for the next DISPLAY (so output continues without a line break)." },
  { test: /^OTHERS?\b/i, say: () => "OTHER(S) — 'any value not handled above'." },
];

function explainDataLine(line: string): string | null {
  const trimmed = line.trim();
  // 01 WS-NAME PIC X(15).  /  01 TOTAL PIC 9(3) VALUE 0.
  const decl = trimmed.match(/^(\d{1,2})\s+([A-Z0-9-]+)(.*)$/i);
  if (!decl) return null;
  const level = Number(decl[1]);
  const name = decl[2].toUpperCase();
  const rest = decl[3] ?? "";
  if (name === "FILLER") {
    return `${String(level).padStart(2, "0")} FILLER — an unnamed data item. FILLER reserves space (padding) that the program never refers to by name.`;
  }
  const pic = rest.match(/PIC(TURE)?\s+(?:IS\s+)?([^\s.]+)/i);
  if (pic) {
    const p = pic[2];
    return `${String(level).padStart(2, "0")} ${name} — declares a data item named ${name} with PICTURE ${p}. The PIC describes its shape: 9 = digit, X = any character, V = implied decimal point, and a number in brackets is the length, so ${name} stores '${describePic(p)}'.`;
  }
  if (/REDEFINES/i.test(rest)) {
    return `${String(level).padStart(2, "0")} ${name} — REDEFINES another item: it shares the same storage but views it with a different layout.`;
  }
  if (/OCCURS/i.test(rest)) {
    return `${String(level).padStart(2, "0")} ${name} — a table (array): OCCURS repeats this item a fixed number of times, so it can be indexed by subscript.`;
  }
  if (level >= 1) {
    return `${String(level).padStart(2, "0")} ${name} — starts a new group/item at level ${level}. Level ${String(level).padStart(2, "0")} is a top-level record; lower level numbers are higher in the hierarchy.`;
  }
  return null;
}

function describePic(pic: string): string {
  const p = pic.toUpperCase();
  const map: Record<string, string> = { "9": "digits", X: "any characters", A: "letters", S: "a sign", V: "an implied decimal point" };
  let out = "";
  for (let i = 0; i < p.length; i++) {
    const ch = p[i];
    if (ch === "(") {
      const close = p.indexOf(")", i);
      const n = close > i ? p.slice(i + 1, close) : "";
      out += ` ×${n}`;
      i = close > i ? close : i;
    } else if (map[ch]) {
      out += ` ${map[ch]}`;
    }
  }
  return out.trim().replace(/\s+/g, " ").replace(/ ×/g, " repeated");
}

/** Explain a single source line. Returns "" for blank/comment lines. */
export function explainCobolLine(raw: string, _index: number): string {
  const trimmed = raw.trim();
  if (trimmed === "") return "";
  // Fixed-format comment: '*' in column 7 (index 6).
  if (raw.length > 6 && raw[6] === "*") return "Comment line — starts with '*' in the indicator area, so the compiler ignores it. Used for notes.";
  if (trimmed.startsWith("*>")) return "Free-format comment ( *> ) — ignored by the compiler.";
  if (trimmed.startsWith(">>")) return "Compiler directive — a special instruction to the compiler itself (not executed by the program).";

  for (const rule of DIVISION) {
    const m = trimmed.match(rule.test);
    if (m) return rule.say(m, trimmed);
  }
  for (const rule of SECTIONS) {
    const m = trimmed.match(rule.test);
    if (m) return rule.say(m, trimmed);
  }
  for (const rule of VERBS) {
    const m = trimmed.match(rule.test);
    if (m) return rule.say(m, trimmed);
  }
  const data = explainDataLine(raw);
  if (data) return data;
  // A bare paragraph/section name (no leading verb) ending with a period.
  if (/^[A-Z0-9-]+\.$/.test(trimmed.toUpperCase())) {
    return `${trimmed.slice(0, -1)} — a paragraph (or section) label. Statements after it belong to this named block, which can be run with PERFORM ${trimmed.slice(0, -1)}.`;
  }
  return "COBOL statement — see the matching verb (DISPLAY, MOVE, ADD, IF, PERFORM …) to see what this line does.";
}

/** Build a structural, line-by-line explanation without any network access. */
export function explainCobolLocally(code: string): ExplainResult {
  const rawLines = code.replace(/\r\n?/g, "\n").split("\n");
  const lines: ExplainLine[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    const explanation = explainCobolLine(rawLines[i], i);
    if (explanation) lines.push({ line: i + 1, code: rawLines[i], explanation });
  }
  const divisions = ["IDENTIFICATION", "ENVIRONMENT", "DATA", "PROCEDURE"].filter((d) =>
    code.toUpperCase().includes(`${d} DIVISION`),
  );
  const overview =
    `This program has ${divisions.length || 1} division(s) (${divisions.join(", ") || "PROCEDURE"}) and ` +
    `${lines.length} meaningful line(s). COBOL programs are read top to bottom: the IDENTIFICATION and DATA divisions ` +
    `describe the program and its variables (declarations — nothing executes), and the PROCEDURE DIVISION contains the ` +
    `statements that actually run in order. ` +
    (code.toUpperCase().includes("ACCEPT")
      ? "It reads input with ACCEPT, so the terminal will pause and wait for you to type when you run it."
      : "It produces its output with DISPLAY.");
  return {
    source: "local",
    overview,
    lines,
    note: "Built-in analyzer (no AI key configured). Add GEMINI_API_KEY on Vercel for richer AI explanations.",
  };
}
