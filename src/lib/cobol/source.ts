/**
 * COBOL source handling: fixed/free format detection, comment stripping and
 * a tokenizer that understands COBOL punctuation, PICTURE strings and literals.
 */

export type TokType = "w" | "n" | "s" | "p";

export interface Tok {
  t: TokType;
  /** raw text of the token */
  v: string;
  /** upper-cased text (COBOL is not case sensitive) */
  u: string;
  line: number;
}

const PIC_SYMBOLS = new Set("S9XAVPZB0*+-,.$/".split(""));

/** Strips a trailing free-format comment ( *> ... ) honouring quotes. */
function stripInlineComment(line: string): string {
  const quoteChars = ["'", '"'];
  let quote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (quoteChars.includes(ch)) {
      quote = ch;
      continue;
    }
    if (ch === "*" && line[i + 1] === ">") return line.slice(0, i);
    if (ch === "/" && line[i + 1] === ">") return line.slice(0, i);
  }
  return line;
}

/** Removes compiler directives, normalises format and strips comments. */
export function normalizeSource(src: string): { lines: string[]; fixed: boolean } {
  const raw = src.replace(/\r\n?/g, "\n").split("\n");
  let votes = 0;
  let total = 0;
  for (const line of raw) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(">>")) continue;
    total++;
    const first6 = line.slice(0, 6);
    const indicator = line[6];
    if (/^[0-9 ]{6}$/.test(first6) && (indicator === undefined || indicator === " " || indicator === "*" || indicator === "/" || indicator === "-")) {
      votes++;
    }
  }
  const fixed = total > 0 && votes / total >= 0.5;
  const out: string[] = [];
  for (let line of raw) {
    if (line.includes("\t")) {
      // A leading tab is the usual way of saying "start in area A".
      line = line.replace(/^\t/, "       ");
      line = line.replace(/\t/g, "    ");
    }
    const trimmed = line.trim();
    if (!trimmed) {
      out.push("");
      continue;
    }
    if (trimmed.toUpperCase().startsWith(">>")) {
      out.push("");
      continue;
    }
    // A '*' (or '*>') starting a line is a comment in both source formats.
    if (trimmed.startsWith("*") || trimmed.startsWith("*/")) {
      out.push("");
      continue;
    }
    line = stripInlineComment(line);
    if (fixed) {
      const first6 = line.slice(0, 6);
      const indicator = line[6];
      if (/^[0-9 ]{6}$/.test(first6)) {
        if (indicator === "*" || indicator === "/") {
          out.push("");
          continue;
        }
        if (indicator === "-") {
          // continuation line: keep as-is, the tokenizer just keeps reading
          out.push(line.slice(7));
          continue;
        }
        out.push(line.slice(7));
        continue;
      }
      if (trimmed.startsWith("*")) {
        out.push("");
        continue;
      }
      out.push(line);
    } else {
      out.push(line);
    }
  }
  return { lines: out, fixed };
}

function isDigit(ch: string) {
  return ch >= "0" && ch <= "9";
}
function isLetter(ch: string) {
  return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
}
function isWordChar(ch: string) {
  return isLetter(ch) || isDigit(ch) || ch === "-" || ch === "_" || ch === "$" || ch === "#" || ch === "@";
}

/** Tokenize already-normalised source text. */
export function tokenize(lines: string[]): Tok[] {
  const text = lines.join("\n");
  const toks: Tok[] = [];
  let i = 0;
  let line = 1;
  let prevWord = "";
  let prevPrevWord = "";

  const push = (t: TokType, v: string) => {
    toks.push({ t, v, u: v.toUpperCase(), line });
  };

  while (i < text.length) {
    const ch = text[i];
    if (ch === "\n") {
      line++;
      i++;
      continue;
    }
    if (ch === " " || ch === "\t") {
      i++;
      continue;
    }

    // string literals
    if (ch === "'" || ch === '"') {
      const quote = ch;
      i++;
      let value = "";
      while (i < text.length && text[i] !== "\n") {
        if (text[i] === quote) {
          if (text[i + 1] === quote) {
            value += quote;
            i += 2;
            continue;
          }
          i++;
          break;
        }
        value += text[i];
        i++;
      }
      push("s", value);
      prevPrevWord = prevWord;
      prevWord = "";
      continue;
    }

    // PICTURE strings are context sensitive: they directly follow PIC/PICTURE.
    const picContext =
      prevWord === "PIC" ||
      prevWord === "PICTURE" ||
      (prevWord === "IS" && (prevPrevWord === "PIC" || prevPrevWord === "PICTURE"));
    if (picContext) {
      let value = "";
      while (i < text.length) {
        const c = text[i];
        if (c === " " || c === "\n" || c === "\t") break;
        if (c === "(") {
          let group = "";
          while (i < text.length && text[i] !== ")") {
            group += text[i];
            i++;
          }
          group += ")";
          i++;
          value += group;
          continue;
        }
        if (c === "." && !(i + 1 < text.length && (isDigit(text[i + 1]) || PIC_SYMBOLS.has(text[i + 1])))) {
          break;
        }
        if (PIC_SYMBOLS.has(c) || isLetter(c) || isDigit(c)) {
          value += c;
          i++;
          continue;
        }
        break;
      }
      if (value.length) {
        push("w", value);
        prevPrevWord = prevWord;
        prevWord = value.toUpperCase();
        continue;
      }
    }

    if (ch === "=") {
      if (text[i + 1] === "=") {
        push("p", "==");
        i += 2;
      } else {
        push("p", "=");
        i++;
      }
      continue;
    }
    if (ch === "<" || ch === ">") {
      if (text[i + 1] === "=") {
        push("p", "<=" === ch + "=" ? "<=" : ">=");
        i += 2;
      } else if (ch === "<" && text[i + 1] === ">") {
        push("p", "<>");
        i += 2;
      } else {
        push("p", ch);
        i++;
      }
      continue;
    }
    if (ch === "*" && text[i + 1] === "*") {
      push("p", "**");
      i += 2;
      continue;
    }
    if ("+-/(),.;:&".includes(ch)) {
      push("p", ch);
      i++;
      continue;
    }

    // numeric literal (or a name that starts with digits, e.g. 100-MAIN)
    if (isDigit(ch)) {
      let value = "";
      let j = i;
      while (j < text.length && isDigit(text[j])) {
        value += text[j];
        j++;
      }
      if (text[j] === "-" && isLetter(text[j + 1])) {
        let word = value;
        while (j < text.length && isWordChar(text[j])) {
          word += text[j];
          j++;
        }
        i = j;
        push("w", word);
        prevPrevWord = prevWord;
        prevWord = word.toUpperCase();
        continue;
      }
      i = j;
      if (text[i] === "." && isDigit(text[i + 1])) {
        value += ".";
        i++;
        while (i < text.length && isDigit(text[i])) {
          value += text[i];
          i++;
        }
      }
      push("n", value);
      prevPrevWord = prevWord;
      prevWord = "";
      continue;
    }

    // word
    if (isLetter(ch) || ch === "_") {
      let value = "";
      while (i < text.length) {
        const c = text[i];
        if (isWordChar(c)) {
          value += c;
          i++;
          continue;
        }
        // A period ends a word only when it terminates the sentence.
        if (c === "." && !(i + 1 < text.length && (isDigit(text[i + 1]) || isLetter(text[i + 1])))) {
          break;
        }
        if (c === "(" || c === " " || c === "\n" || c === "\t" || c === ")") break;
        break;
      }
      push("w", value);
      prevPrevWord = prevWord;
      prevWord = value.toUpperCase();
      continue;
    }

    // unknown character: skip
    i++;
  }
  return toks;
}

/** Simple cursor over a token list. */
export class TokenStream {
  toks: Tok[];
  pos = 0;
  /** Counts consumed sentence periods - used to detect sentence ends. */
  periodCount = 0;

  constructor(toks: Tok[]) {
    this.toks = toks;
  }

  get atEnd() {
    return this.pos >= this.toks.length;
  }

  peek(offset = 0): Tok | undefined {
    return this.toks[this.pos + offset];
  }

  next(): Tok {
    const t = this.toks[this.pos++];
    if (!t) throw new Error("Unexpected end of program");
    return t;
  }

  /** Consume the token if it matches (word comparison, case-insensitive). */
  acceptWord(...words: string[]): boolean {
    const t = this.peek();
    if (t && t.t === "w" && words.includes(t.u)) {
      this.pos++;
      return true;
    }
    return false;
  }

  /** Consume the token if it is the given punctuation. */
  acceptPunct(p: string): boolean {
    const t = this.peek();
    if (t && t.t === "p" && t.v === p) {
      this.pos++;
      return true;
    }
    return false;
  }

  /** Consume optional sentence periods (and commas). */
  acceptSeparators(): boolean {
    let found = false;
    while (true) {
      const t = this.peek();
      if (t && t.t === "p" && (t.v === "." || t.v === "," || t.v === ";")) {
        if (t.v === ".") this.periodCount++;
        this.pos++;
        found = true;
        continue;
      }
      break;
    }
    return found;
  }

  isWord(...words: string[]): boolean {
    const t = this.peek();
    return !!t && t.t === "w" && words.includes(t.u);
  }

  isPunct(p: string): boolean {
    const t = this.peek();
    return !!t && t.t === "p" && t.v === p;
  }

  expectWord(word: string): Tok {
    const t = this.peek();
    if (!t || t.t !== "w" || t.u !== word) {
      throw new Error(`Expected ${word} but found '${t ? t.v : "end of program"}' on line ${t ? t.line : "?"}`);
    }
    return this.next();
  }

  /** Collect raw tokens until (and including) the sentence period. */
  readUntilPeriod(): Tok[] {
    const out: Tok[] = [];
    while (!this.atEnd) {
      const t = this.next();
      if (t.t === "p" && t.v === ".") break;
      out.push(t);
    }
    return out;
  }
}
