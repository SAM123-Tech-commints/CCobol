/** PROCEDURE DIVISION parser: builds a statement tree for the interpreter. */
import type { Cond, Expr } from "./expr";
import { parseCondition, parseExpr } from "./expr";
import type { ProgramData } from "./data";
import type { TokenStream } from "./source";

export type Stmt =
  | { k: "display"; items: Expr[]; noAdvancing: boolean; line: number }
  | { k: "move"; src: Expr; dsts: Expr[]; corresponding: boolean; line: number }
  | { k: "initialize"; items: Expr[]; line: number }
  | { k: "set"; targets: Expr[]; value?: Expr; direction: "to" | "up" | "down" | "true" | "address" | "switch"; line: number }
  | { k: "add"; operands: Expr[]; tos: Expr[]; giving: Expr[]; onSize: Stmt[]; notOnSize: Stmt[]; line: number }
  | { k: "subtract"; operands: Expr[]; from: Expr[]; giving: Expr[]; onSize: Stmt[]; notOnSize: Stmt[]; line: number }
  | { k: "multiply"; a: Expr; b: Expr; giving: Expr[]; onSize: Stmt[]; notOnSize: Stmt[]; line: number }
  | { k: "divide"; a: Expr; b: Expr; dir: "into" | "by"; giving: Expr[]; remainder?: Expr; onSize: Stmt[]; notOnSize: Stmt[]; line: number }
  | { k: "compute"; target: Expr; expr: Expr; onSize: Stmt[]; notOnSize: Stmt[]; line: number }
  | { k: "if"; cond: Cond; then: Stmt[]; els: Stmt[]; line: number }
  | { k: "evaluate"; subject: Expr | null; subjectTrue: boolean; whens: { conds: Cond[]; body: Stmt[] }[]; other: Stmt[]; line: number }
  | { k: "perform"; line: number; target?: string; thru?: string; times?: Expr; until?: Cond; varying?: { varName: string; from: Expr; by: Expr; until: Cond }; inline: Stmt[]; testAfter: boolean }
  | { k: "goto"; target: string; line: number }
  | { k: "stopRun"; line: number }
  | { k: "exitProgram"; line: number }
  | { k: "goback"; line: number }
  | { k: "exit"; line: number }
  | { k: "continue"; line: number }
  | { k: "accept"; target: Expr; from: string | null; line: number }
  | { k: "open"; items: { mode: string; files: string[] }[]; line: number }
  | { k: "close"; files: string[]; line: number }
  | { k: "read"; file: string; into: Expr | null; next: boolean; key: Expr | null; atEnd: Stmt[]; notAtEnd: Stmt[]; invalid: Stmt[]; notInvalid: Stmt[]; line: number }
  | { k: "write"; record: Expr; from: Expr | null; invalid: Stmt[]; notInvalid: Stmt[]; line: number }
  | { k: "rewrite"; record: Expr; invalid: Stmt[]; notInvalid: Stmt[]; line: number }
  | { k: "delete"; file: string; invalid: Stmt[]; notInvalid: Stmt[]; line: number }
  | {
      k: "string";
      sources: { src: Expr; delim: Expr | null; size: boolean }[];
      dest: Expr;
      pointer: Expr | null;
      onOverflow: Stmt[];
      notOnOverflow: Stmt[];
      line: number;
    }
  | { k: "unstring"; src: Expr; delims: { e: Expr; all: boolean }[]; dests: { target: Expr; countIn: Expr | null }[]; onOverflow: Stmt[]; line: number }
  | { k: "inspect"; target: Expr; actions: InspectAction[]; line: number }
  | { k: "search"; table: Expr; varying: Expr | null; all: boolean; atEnd: Stmt[]; whens: { cond: Cond; body: Stmt[] }[]; line: number }
  | { k: "call"; program: Expr; using: Expr[]; returning: Expr | null; onException: Stmt[]; line: number }
  | { k: "exec"; text: string; line: number }
  | { k: "unsupported"; verb: string; text: string; line: number }
  | { k: "nop"; line: number };

export interface InspectAction {
  kind: "tally" | "replace" | "convert";
  counter?: Expr;
  what: Expr | null;
  by?: Expr | null;
  mode: "all" | "leading" | "first" | "char";
}

export interface Paragraph {
  name: string;
  section: string | null;
  statements: Stmt[];
}

export interface Procedure {
  paragraphs: Paragraph[];
  index: Map<string, number>;
}

const VERBS = new Set([
  "DISPLAY", "MOVE", "ADD", "SUBTRACT", "MULTIPLY", "DIVIDE", "COMPUTE", "IF", "EVALUATE", "PERFORM", "GO", "STOP", "ACCEPT",
  "OPEN", "CLOSE", "READ", "WRITE", "REWRITE", "DELETE", "START", "STRING", "UNSTRING", "INSPECT", "SEARCH", "CALL", "SET",
  "EXIT", "CONTINUE", "GOBACK", "INITIALIZE", "SORT", "MERGE", "RELEASE", "RETURN", "CANCEL", "USE", "COPY", "EXEC", "EXHIBIT",
  "READY", "RESET", "TRACE", "ENABLE", "DISABLE", "GENERATE", "SUPPRESS", "TERMINATE", "INITIATE", "ALTER", "ENTRY", "DECLARE",
]);

const CLAUSE_WORDS = new Set([
  "TO", "FROM", "GIVING", "INTO", "BY", "TIMES", "UNTIL", "VARYING", "THRU", "THROUGH", "AND", "OR", "WHEN", "ELSE", "END-IF",
  "END-EVALUATE", "END-PERFORM", "END-READ", "END-WRITE", "END-REWRITE", "END-DELETE", "END-STRING", "END-UNSTRING", "END-SEARCH",
  "END-CALL", "END-START", "END-ADD", "END-SUBTRACT", "END-MULTIPLY", "END-DIVIDE", "END-COMPUTE", "AT", "NOT", "INVALID", "ON",
  "REMAINDER", "ROUNDED", "WITH", "UPON", "DELIMITED", "POINTER", "TALLYING", "COUNT", "REPLACING", "CONVERTING", "KEY", "RECORD",
  "NEXT", "SIZE", "ERROR", "ADVANCING", "BEFORE", "AFTER", "PAGE", "LINES", "MODE", "USING", "RETURNING", "SECTION", "DIVISION",
  "THEN", "OTHER", "ALL", "LEADING", "FIRST", "CHARACTERS", "OVERFLOW", "EXCEPTION", "CORRESPONDING", "CORR", "TEST", "BEFORE",
  "AFTERWARDS", "IS", "ARE", "NO", "FOR", "RUN", "PROGRAM", "TRUE", "FALSE", "CONSOLE", "DATE", "TIME", "DAY", "DAY-OF-WEEK",
  "REFERENCE", "CONTENT", "VALUE", "ADDRESS", "OF", "IN", "OUT", "I-O", "EXTEND", "INPUT", "OUTPUT", "RANDOM", "DYNAMIC",
  "SEQUENTIAL", "OPTIONAL", "SPACE", "SPACES", "ZERO", "ZEROS", "EVALUATE", "END",
]);

const FIGURATIVE_OPERANDS = new Set([
  "ZERO", "ZEROS", "ZEROES", "SPACE", "SPACES", "HIGH-VALUE", "HIGH-VALUES", "LOW-VALUE", "LOW-VALUES",
  "QUOTE", "QUOTES", "NULL", "NULLS", "ALL", "FUNCTION", "TRUE", "FALSE",
]);

const OPERAND_STOP = new Set([...VERBS, ...CLAUSE_WORDS]);

export interface ParserCtx {
  isConditionName: (name: string) => boolean;
}

export class ProcedureParser {
  warnings: string[] = [];

  constructor(private ts: TokenStream, private ctx: ParserCtx, private data: ProgramData) {}

  /** Called with the stream positioned at PROCEDURE DIVISION. */
  parse(): Procedure {
    const ts = this.ts;
    ts.next(); // PROCEDURE
    ts.next(); // DIVISION
    while (!ts.atEnd && !ts.isPunct(".")) {
      // USING parameters
      ts.next();
    }
    ts.acceptSeparators();
    const paragraphs: Paragraph[] = [];
    const index = new Map<string, number>();
    let current: Paragraph | null = null;
    let skippingDeclaratives = false;

    const ensure = () => {
      if (!current) {
        current = { name: "$MAIN", section: null, statements: [] };
        paragraphs.push(current);
        index.set("$MAIN", paragraphs.length - 1);
      }
      return current;
    };

    while (!ts.atEnd) {
      if (ts.isPunct(".") || ts.isPunct(",") || ts.isPunct(";")) {
        ts.next();
        continue;
      }
      const t = ts.peek()!;
      if (t.t !== "w") {
        // stray tokens (shouldn't happen) - skip
        ts.next();
        continue;
      }
      if (t.u === "DECLARATIVES") {
        skippingDeclaratives = true;
        ts.readUntilPeriod();
        continue;
      }
      if (skippingDeclaratives) {
        if (t.u === "END" && ts.peek(1)?.u === "DECLARATIVES") {
          skippingDeclaratives = false;
        }
        ts.readUntilPeriod();
        continue;
      }
      // section header?
      if (ts.peek(1)?.u === "SECTION" && (ts.peek(2)?.t === "p" && ts.peek(2)!.v === ".")) {
        const sectionName = ts.next().u;
        ts.next();
        ts.acceptSeparators();
        current = { name: sectionName, section: sectionName, statements: [] };
        paragraphs.push(current);
        index.set(sectionName, paragraphs.length - 1);
        continue;
      }
      // paragraph header?
      if (!VERBS.has(t.u) && ts.peek(1)?.t === "p" && ts.peek(1)!.v === ".") {
        const name = ts.next().u;
        ts.next();
        current = { name, section: current?.section ?? null, statements: [] };
        paragraphs.push(current);
        index.set(name, paragraphs.length - 1);
        continue;
      }
      const para = ensure();
      const before = ts.pos;
      const stmt = this.parseStatement();
      if (stmt) para.statements.push(stmt);
      if (ts.pos === before) ts.next(); // safety: always make progress
    }
    void this.data;
    return { paragraphs, index };
  }

  /** True when the token cannot start an operand (clause/verb keyword). */
  private isOperandBoundary(u: string | undefined): boolean {
    return !!u && OPERAND_STOP.has(u) && !FIGURATIVE_OPERANDS.has(u);
  }

  private line(): number {
    return this.ts.peek()?.line ?? 0;
  }

  /**
   * Parse statements until a stop word, a period or end of stream.
   * `imperative` mirrors the COBOL rule that conditional clause bodies
   * (AT END, INVALID KEY, ON SIZE ERROR ...) end at the sentence period.
   */
  parseBlock(stops: string[], imperative = false): Stmt[] {
    const out: Stmt[] = [];
    const ts = this.ts;
    while (!ts.atEnd) {
      if (ts.isPunct(".")) break;
      const t = ts.peek();
      if (!t) break;
      if (t.t === "w" && stops.includes(t.u)) break;
      // Never swallow a paragraph header into a statement body.
      if (t.t === "w" && !VERBS.has(t.u) && ts.peek(1)?.t === "p" && ts.peek(1)!.v === ".") break;
      const before = ts.pos;
      const periods = ts.periodCount;
      const stmt = this.parseStatement();
      if (stmt) out.push(stmt);
      if (ts.pos === before) break;
      if (imperative && ts.periodCount > periods) break;
    }
    return out;
  }

  parseStatement(): Stmt | null {
    const ts = this.ts;
    const t = ts.peek();
    if (!t) return null;
    if (t.t === "p") {
      ts.next();
      return null;
    }
    if (t.t !== "w") {
      ts.next();
      return null;
    }
    const line = t.line;
    const verb = t.u;
    switch (verb) {
      case "DISPLAY":
        return this.parseDisplay(line);
      case "MOVE":
        return this.parseMove(line);
      case "INITIALIZE":
        ts.next();
        return { k: "initialize", items: this.parseExprList(), line };
      case "SET":
        return this.parseSet(line);
      case "ADD":
        return this.parseAdd(line);
      case "SUBTRACT":
        return this.parseSubtract(line);
      case "MULTIPLY":
        return this.parseMultiply(line);
      case "DIVIDE":
        return this.parseDivide(line);
      case "COMPUTE":
        return this.parseCompute(line);
      case "IF":
        return this.parseIf(line);
      case "EVALUATE":
        return this.parseEvaluate(line);
      case "PERFORM":
        return this.parsePerform(line);
      case "GO":
        ts.next();
        ts.acceptWord("TO");
        return { k: "goto", target: ts.next().u, line };
      case "STOP":
        ts.next();
        if (ts.acceptWord("RUN")) return { k: "stopRun", line };
        // STOP 'literal'
        ts.readUntilPeriod();
        return { k: "stopRun", line };
      case "GOBACK":
        ts.next();
        ts.acceptSeparators();
        return { k: "goback", line };
      case "EXIT":
        ts.next();
        if (ts.acceptWord("PROGRAM")) return { k: "exitProgram", line };
        if (ts.acceptWord("SECTION") || ts.acceptWord("PARAGRAPH") || ts.acceptWord("PERFORM")) return { k: "exit", line };
        return { k: "exit", line };
      case "CONTINUE":
        ts.next();
        return { k: "continue", line };
      case "ACCEPT":
        return this.parseAccept(line);
      case "OPEN":
        return this.parseOpen(line);
      case "CLOSE":
        ts.next();
        return { k: "close", files: this.parseWordList(), line };
      case "READ":
        return this.parseRead(line);
      case "WRITE":
        return this.parseWrite(line);
      case "REWRITE":
        return this.parseRewrite(line);
      case "DELETE":
        return this.parseDelete(line);
      case "STRING":
        return this.parseString(line);
      case "UNSTRING":
        return this.parseUnstring(line);
      case "INSPECT":
        return this.parseInspect(line);
      case "SEARCH":
        return this.parseSearch(line);
      case "CALL":
        return this.parseCall(line);
      case "EXEC":
        return this.parseExec(line);
      case "COPY":
      case "SORT":
      case "MERGE":
      case "ALTER":
      case "CANCEL":
      case "EXHIBIT":
      case "USE":
      case "GENERATE":
      case "SUPPRESS":
      case "INITIATE":
      case "TERMINATE":
      case "RELEASE":
      case "RETURN":
      case "READY":
      case "RESET":
      case "TRACE": {
        ts.next();
        const toks = ts.readUntilPeriod();
        const text = toks.map((x) => x.v).join(" ");
        this.warnings.push(`Line ${line}: ${verb} is not supported by this online engine (ignored).`);
        return { k: "unsupported", verb, text, line };
      }
      default: {
        // Unknown word: treat as a possible paragraph reference inside a
        // sentence (rare) and skip the sentence.
        ts.next();
        const toks = ts.readUntilPeriod();
        const text = toks.map((x) => x.v).join(" ");
        this.warnings.push(`Line ${line}: could not interpret statement starting with '${verb}' (skipped).`);
        return { k: "unsupported", verb, text, line };
      }
    }
  }

  /** List of expressions until a clause word / verb / period. */
  private parseExprList(): Expr[] {
    const out: Expr[] = [];
    const ts = this.ts;
    while (!ts.atEnd) {
      const t = ts.peek()!;
      if (t.t === "p" && (t.v === "." || t.v === "," || t.v === ";")) {
        if (t.v === ".") break;
        ts.next();
        continue;
      }
      if (t.t === "w" && this.isOperandBoundary(t.u)) break;
      if (t.t === "p") break;
      const before = ts.pos;
      out.push(parseExpr(ts, this.ctx));
      if (ts.pos === before) break;
    }
    return out;
  }

  private parseWordList(): string[] {
    const out: string[] = [];
    const ts = this.ts;
    while (!ts.atEnd) {
      const t = ts.peek()!;
      if (t.t === "p" && t.v === ".") break;
      if (t.t === "w" && (VERBS.has(t.u) || CLAUSE_WORDS.has(t.u))) break;
      if (t.t !== "w") {
        if (t.t === "p" && (t.v === "," || t.v === ";")) {
          ts.next();
          continue;
        }
        break;
      }
      out.push(t.u);
      ts.next();
    }
    return out;
  }

  private parseDisplay(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const items: Expr[] = [];
    let noAdvancing = false;
    while (!ts.atEnd) {
      const t = ts.peek()!;
      if (t.t === "p" && t.v === ".") break;
      if (t.t === "w" && (t.u === "WITH" || t.u === "UPON" || t.u === "ON" || t.u === "NO")) {
        ts.next();
        if (ts.acceptWord("ADVANCING")) noAdvancing = true;
        else if (ts.acceptWord("CONSOLE")) {
          /* ignore */
        } else if (ts.acceptWord("NO")) {
          ts.acceptWord("ADVANCING");
          noAdvancing = true;
        }
        continue;
      }
      if (t.t === "w" && this.isOperandBoundary(t.u)) break;
      if (t.t === "p") {
        if (t.v === "," || t.v === ";") {
          ts.next();
          continue;
        }
        break;
      }
      const before = ts.pos;
      items.push(parseExpr(ts, this.ctx));
      if (ts.pos === before) break;
    }
    ts.acceptSeparators();
    return { k: "display", items, noAdvancing, line };
  }

  private parseMove(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    let corresponding = false;
    if (ts.acceptWord("CORRESPONDING") || ts.acceptWord("CORR")) corresponding = true;
    const src = parseExpr(ts, this.ctx);
    const dsts: Expr[] = [];
    if (ts.acceptWord("TO")) {
      for (const e of this.parseExprList()) dsts.push(e);
    } else {
      this.warnings.push(`Line ${line}: MOVE without TO.`);
    }
    ts.acceptSeparators();
    return { k: "move", src, dsts, corresponding, line };
  }

  private parseSet(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const targets: Expr[] = [];
    while (!ts.atEnd && !ts.isWord("TO", "UP", "DOWN", "ON", "OFF")) {
      const t = ts.peek()!;
      if (t.t === "w" && (VERBS.has(t.u) || CLAUSE_WORDS.has(t.u))) break;
      if (t.t === "p") break;
      targets.push(parseExpr(ts, this.ctx));
    }
    if (ts.acceptWord("TO")) {
      if (ts.isWord("ON", "OFF")) {
        const mode = ts.next().u;
        void mode;
        return { k: "set", targets, direction: "switch", line };
      }
      if (ts.isWord("TRUE")) {
        ts.next();
        return { k: "set", targets, direction: "true", line };
      }
      const value = parseExpr(ts, this.ctx);
      ts.acceptSeparators();
      return { k: "set", targets, value, direction: "to", line };
    }
    if (ts.acceptWord("UP")) {
      ts.acceptWord("BY");
      const value = parseExpr(ts, this.ctx);
      ts.acceptSeparators();
      return { k: "set", targets, value, direction: "up", line };
    }
    if (ts.acceptWord("DOWN")) {
      ts.acceptWord("BY");
      const value = parseExpr(ts, this.ctx);
      ts.acceptSeparators();
      return { k: "set", targets, value, direction: "down", line };
    }
    ts.acceptSeparators();
    return { k: "set", targets, direction: "to", line };
  }

  private parseErrorClauses(): { onSize: Stmt[]; notOnSize: Stmt[] } {
    const ts = this.ts;
    let onSize: Stmt[] = [];
    let notOnSize: Stmt[] = [];
    const readClause = (): Stmt[] => {
      // consumes: [NOT] ON SIZE ERROR / [NOT] ON OVERFLOW / INVALID KEY ...
      return this.parseBlock(["NOT", "ON", "END-IF"], true);
    };
    void readClause;
    while (true) {
      let negate = false;
      if (ts.isWord("NOT")) {
        ts.next();
        negate = true;
      }
      if (ts.acceptWord("ON")) {
        ts.acceptWord("SIZE");
        ts.acceptWord("ERROR");
        ts.acceptWord("OVERFLOW");
        ts.acceptWord("EXCEPTION");
        const body = this.parseBlock(["NOT", "END-IF"], true);
        if (negate) notOnSize = body;
        else onSize = body;
        continue;
      }
      if (ts.acceptWord("INVALID")) {
        ts.acceptWord("KEY");
        const body = this.parseBlock(["NOT", "END-IF"], true);
        if (negate) notOnSize = body;
        else onSize = body;
        continue;
      }
      if (negate) {
        // 'NOT' with nothing after it - put it back conceptually
        continue;
      }
      break;
    }
    return { onSize, notOnSize };
  }

  private parseAdd(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const operands: Expr[] = [];
    const tos: Expr[] = [];
    const giving: Expr[] = [];
    let phase = 0;
    while (!ts.atEnd) {
      const t = ts.peek()!;
      if (t.t === "p" && t.v === ".") break;
      if (t.t === "w" && t.u === "TO") {
        ts.next();
        phase = 1;
        continue;
      }
      if (t.t === "w" && t.u === "GIVING") {
        ts.next();
        phase = 2;
        continue;
      }
      if (t.t === "w" && (t.u === "ROUNDED" || t.u === "NOT" || t.u === "ON" || t.u === "SIZE" || t.u === "ERROR")) break;
      if (t.t === "w" && (VERBS.has(t.u) || t.u.startsWith("END-"))) break;
      if (t.t === "p" && (t.v === "," || t.v === ";")) {
        ts.next();
        continue;
      }
      if (t.t !== "w" && t.t !== "n" && t.t !== "s") break;
      const e = parseExpr(ts, this.ctx);
      if (phase === 0) operands.push(e);
      else if (phase === 1) tos.push(e);
      else giving.push(e);
    }
    const { onSize, notOnSize } = this.parseErrorClauses();
    ts.acceptWord("END-ADD");
    ts.acceptSeparators();
    return { k: "add", operands, tos, giving, onSize, notOnSize, line };
  }

  private parseSubtract(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const operands: Expr[] = [];
    const from: Expr[] = [];
    const giving: Expr[] = [];
    let phase = 0;
    while (!ts.atEnd) {
      const t = ts.peek()!;
      if (t.t === "p" && t.v === ".") break;
      if (t.t === "w" && t.u === "FROM") {
        ts.next();
        phase = 1;
        continue;
      }
      if (t.t === "w" && t.u === "GIVING") {
        ts.next();
        phase = 2;
        continue;
      }
      if (t.t === "w" && (t.u === "ROUNDED" || t.u === "NOT" || t.u === "ON" || t.u === "SIZE" || t.u === "ERROR")) break;
      if (t.t === "w" && (VERBS.has(t.u) || t.u.startsWith("END-"))) break;
      if (t.t === "p" && (t.v === "," || t.v === ";")) {
        ts.next();
        continue;
      }
      if (t.t !== "w" && t.t !== "n" && t.t !== "s") break;
      const e = parseExpr(ts, this.ctx);
      if (phase === 0) operands.push(e);
      else if (phase === 1) from.push(e);
      else giving.push(e);
    }
    const { onSize, notOnSize } = this.parseErrorClauses();
    ts.acceptWord("END-SUBTRACT");
    ts.acceptSeparators();
    return { k: "subtract", operands, from, giving, onSize, notOnSize, line };
  }

  private parseMultiply(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const a = parseExpr(ts, this.ctx);
    ts.expectWord("BY");
    const b = parseExpr(ts, this.ctx);
    const giving: Expr[] = [];
    if (ts.acceptWord("GIVING")) {
      giving.push(...this.parseExprList());
    }
    const { onSize, notOnSize } = this.parseErrorClauses();
    ts.acceptWord("END-MULTIPLY");
    ts.acceptSeparators();
    return { k: "multiply", a, b, giving, onSize, notOnSize, line };
  }

  private parseDivide(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const a = parseExpr(ts, this.ctx);
    let dir: "into" | "by" = "into";
    if (ts.acceptWord("INTO")) dir = "into";
    else if (ts.acceptWord("BY")) dir = "by";
    const b = parseExpr(ts, this.ctx);
    const giving: Expr[] = [];
    let remainder: Expr | undefined;
    if (ts.acceptWord("GIVING")) {
      giving.push(...this.parseExprList());
    }
    if (ts.acceptWord("REMAINDER")) {
      remainder = parseExpr(ts, this.ctx);
    }
    const { onSize, notOnSize } = this.parseErrorClauses();
    ts.acceptWord("END-DIVIDE");
    ts.acceptSeparators();
    return { k: "divide", a, b, dir, giving, remainder, onSize, notOnSize, line };
  }

  private parseCompute(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const target = parseExpr(ts, this.ctx);
    ts.acceptWord("ROUNDED");
    // '=' or 'EQUAL'
    if (!ts.acceptPunct("=")) {
      ts.acceptWord("EQUAL");
      ts.acceptWord("TO");
    }
    const expr = parseExpr(ts, this.ctx);
    const { onSize, notOnSize } = this.parseErrorClauses();
    ts.acceptWord("END-COMPUTE");
    ts.acceptSeparators();
    return { k: "compute", target, expr, onSize, notOnSize, line };
  }

  private parseIf(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const cond = parseCondition(ts, this.ctx);
    ts.acceptWord("THEN");
    const then = this.parseBlock(["ELSE", "END-IF"]);
    let els: Stmt[] = [];
    if (ts.acceptWord("ELSE")) {
      els = this.parseBlock(["END-IF"]);
    }
    ts.acceptWord("END-IF");
    ts.acceptSeparators();
    return { k: "if", cond, then, els, line };
  }

  private parseEvaluate(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    let subject: Expr | null = null;
    let subjectTrue = false;
    if (ts.isWord("TRUE")) {
      ts.next();
      subjectTrue = true;
    } else if (ts.isWord("FALSE")) {
      ts.next();
      subjectTrue = true;
    } else {
      subject = parseExpr(ts, this.ctx);
    }
    const whens: { conds: Cond[]; body: Stmt[] }[] = [];
    let other: Stmt[] = [];
    while (!ts.atEnd) {
      if (ts.isWord("END-EVALUATE")) {
        ts.next();
        break;
      }
      if (!ts.acceptWord("WHEN")) break;
      if (ts.acceptWord("OTHER")) {
        other = this.parseBlock(["WHEN", "END-EVALUATE"], true);
        continue;
      }
      const conds: Cond[] = [];
      let guard = 0;
      while (!ts.atEnd && guard++ < 50) {
        if (subjectTrue) {
          conds.push(parseCondition(ts, this.ctx));
        } else {
          const value = parseExpr(ts, this.ctx);
          if (ts.acceptWord("THRU") || ts.acceptWord("THROUGH")) {
            const to = parseExpr(ts, this.ctx);
            conds.push({ k: "between", e: subject!, from: value, to });
          } else {
            conds.push({ k: "rel", left: subject!, op: "=", right: value });
          }
        }
        if (!ts.isWord("WHEN")) break;
        ts.next();
      }
      const body = this.parseBlock(["WHEN", "END-EVALUATE"], true);
      whens.push({ conds, body });
    }
    ts.acceptWord("END-EVALUATE");
    ts.acceptSeparators();
    return { k: "evaluate", subject, subjectTrue, whens, other, line };
  }

  private parsePerform(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    let testAfter = false;
    if (ts.acceptWord("WITH")) {
      ts.acceptWord("TEST");
      if (ts.acceptWord("AFTER")) testAfter = true;
      else ts.acceptWord("BEFORE");
    }
    const inlineKeywords = new Set(["WITH", "TEST", "UNTIL", "VARYING", "TIMES", "END-PERFORM"]);
    let target: string | undefined;
    let thru: string | undefined;
    const t = ts.peek();
    const isTarget = t && t.t === "w" && !VERBS.has(t.u) && !CLAUSE_WORDS.has(t.u) && !inlineKeywords.has(t.u);
    if (isTarget) {
      target = ts.next().u;
      if (ts.acceptWord("THRU") || ts.acceptWord("THROUGH")) thru = ts.next().u;
    }
    let times: Expr | undefined;
    let until: Cond | undefined;
    let varying: { varName: string; from: Expr; by: Expr; until: Cond } | undefined;
    if (ts.isWord("VARYING")) {
      ts.next();
      const varName = ts.next().u;
      ts.acceptWord("FROM");
      const from = parseExpr(ts, this.ctx);
      let by: Expr = { k: "lit", lit: { type: "num", value: "1", num: 1 } };
      if (ts.acceptWord("BY")) by = parseExpr(ts, this.ctx);
      ts.acceptWord("UNTIL");
      const u = parseCondition(ts, this.ctx);
      varying = { varName, from, by, until: u };
    } else if (ts.isWord("UNTIL")) {
      ts.next();
      until = parseCondition(ts, this.ctx);
    } else {
      const nt = ts.peek();
      if (nt && (nt.t === "n" || (nt.t === "w" && !VERBS.has(nt.u) && !CLAUSE_WORDS.has(nt.u)))) {
        // PERFORM n TIMES
        times = parseExpr(ts, this.ctx);
        ts.acceptWord("TIMES");
      }
    }
    const inline: Stmt[] = target ? [] : this.parseBlock(["END-PERFORM"]);
    ts.acceptWord("END-PERFORM");
    ts.acceptSeparators();
    return { k: "perform", line, target, thru, times, until, varying, inline, testAfter };
  }

  private parseAccept(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const target = parseExpr(ts, this.ctx);
    let from: string | null = null;
    if (ts.acceptWord("FROM")) {
      from = ts.next().u;
    }
    ts.acceptSeparators();
    return { k: "accept", target, from, line };
  }

  private parseOpen(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const items: { mode: string; files: string[] }[] = [];
    let mode = "INPUT";
    while (!ts.atEnd) {
      const t = ts.peek()!;
      if (t.t === "p" && t.v === ".") break;
      if (t.t === "w" && ["INPUT", "OUTPUT", "I-O", "EXTEND"].includes(t.u)) {
        mode = t.u;
        ts.next();
        continue;
      }
      if (t.t === "w" && (VERBS.has(t.u) || CLAUSE_WORDS.has(t.u))) break;
      if (t.t !== "w") {
        if (t.t === "p" && (t.v === "," || t.v === ";")) ts.next();
        else break;
        continue;
      }
      const name = ts.next().u;
      const existing = items.find((i) => i.mode === mode);
      if (existing) existing.files.push(name);
      else items.push({ mode, files: [name] });
    }
    ts.acceptSeparators();
    return { k: "open", items, line };
  }

  private parseRead(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const file = ts.next().u;
    let next = false;
    if (ts.acceptWord("NEXT")) next = true;
    ts.acceptWord("RECORD");
    let into: Expr | null = null;
    if (ts.acceptWord("INTO")) into = parseExpr(ts, this.ctx);
    let key: Expr | null = null;
    if (ts.acceptWord("KEY")) {
      ts.acceptWord("IS");
      key = parseExpr(ts, this.ctx);
    }
    let atEnd: Stmt[] = [];
    let notAtEnd: Stmt[] = [];
    let invalid: Stmt[] = [];
    let notInvalid: Stmt[] = [];
    while (!ts.atEnd) {
      let negate = false;
      if (ts.isWord("NOT")) {
        ts.next();
        negate = true;
      }
      if (ts.acceptWord("AT")) {
        ts.acceptWord("END");
        const body = this.parseBlock(["NOT", "END-READ"]);
        if (negate) notAtEnd = body;
        else atEnd = body;
        continue;
      }
      if (ts.acceptWord("END")) {
        const body = this.parseBlock(["NOT", "END-READ"]);
        if (negate) notAtEnd = body;
        else atEnd = body;
        continue;
      }
      if (ts.acceptWord("INVALID")) {
        ts.acceptWord("KEY");
        const body = this.parseBlock(["NOT", "END-READ"]);
        if (negate) notInvalid = body;
        else invalid = body;
        continue;
      }
      if (ts.isWord("END-READ")) {
        ts.next();
        break;
      }
      break;
    }
    ts.acceptWord("END-READ");
    ts.acceptSeparators();
    return { k: "read", file, into, next, key, atEnd, notAtEnd, invalid, notInvalid, line };
  }

  private parseWrite(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const record = parseExpr(ts, this.ctx);
    let from: Expr | null = null;
    if (ts.acceptWord("FROM")) from = parseExpr(ts, this.ctx);
    if (ts.acceptWord("BEFORE") || ts.acceptWord("AFTER")) {
      ts.acceptWord("ADVANCING");
      if (ts.isWord("PAGE")) ts.next();
      else {
        parseExpr(ts, this.ctx);
        ts.acceptWord("LINES");
        ts.acceptWord("LINE");
      }
    }
    const { onSize: invalid, notOnSize: notInvalid } = this.parseErrorClauses();
    ts.acceptWord("END-WRITE");
    ts.acceptSeparators();
    return { k: "write", record, from, invalid, notInvalid, line };
  }

  private parseRewrite(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const record = parseExpr(ts, this.ctx);
    const { onSize: invalid, notOnSize: notInvalid } = this.parseErrorClauses();
    ts.acceptWord("END-REWRITE");
    ts.acceptSeparators();
    return { k: "rewrite", record, invalid, notInvalid, line };
  }

  private parseDelete(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    ts.acceptWord("FILE") || ts.acceptWord("RECORD");
    const file = ts.next().u;
    const { onSize: invalid, notOnSize: notInvalid } = this.parseErrorClauses();
    ts.acceptWord("END-DELETE");
    ts.acceptSeparators();
    return { k: "delete", file, invalid, notInvalid, line };
  }

  private parseString(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const sources: { src: Expr; delim: Expr | null; size: boolean }[] = [];
    while (!ts.atEnd && !ts.isWord("INTO")) {
      if (ts.isPunct(".")) break;
      if (ts.isPunct(",")) {
        ts.next();
        continue;
      }
      const src = parseExpr(ts, this.ctx);
      let delim: Expr | null = null;
      let size = false;
      if (ts.acceptWord("DELIMITED")) {
        ts.acceptWord("BY");
        if (ts.acceptWord("SIZE")) size = true;
        else delim = parseExpr(ts, this.ctx);
      }
      sources.push({ src, delim, size });
    }
    ts.expectWord("INTO");
    const dest = parseExpr(ts, this.ctx);
    let pointer: Expr | null = null;
    if (ts.acceptWord("WITH")) {
      ts.acceptWord("POINTER");
      pointer = parseExpr(ts, this.ctx);
    } else if (ts.acceptWord("POINTER")) {
      pointer = parseExpr(ts, this.ctx);
    }
    let onOverflow: Stmt[] = [];
    let notOnOverflow: Stmt[] = [];
    while (!ts.atEnd) {
      let negate = false;
      if (ts.isWord("NOT")) {
        ts.next();
        negate = true;
      }
      if (ts.acceptWord("ON")) {
        ts.acceptWord("OVERFLOW");
        const body = this.parseBlock(["NOT", "END-STRING"]);
        if (negate) notOnOverflow = body;
        else onOverflow = body;
        continue;
      }
      break;
    }
    ts.acceptWord("END-STRING");
    ts.acceptSeparators();
    return { k: "string", sources, dest, pointer, onOverflow, notOnOverflow, line };
  }

  private parseUnstring(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const src = parseExpr(ts, this.ctx);
    const delims: { e: Expr; all: boolean }[] = [];
    if (ts.acceptWord("DELIMITED")) {
      ts.acceptWord("BY");
      while (!ts.atEnd && !ts.isWord("INTO")) {
        const all = ts.acceptWord("ALL");
        const e = parseExpr(ts, this.ctx);
        delims.push({ e, all });
        if (!ts.acceptWord("OR")) break;
        void all;
      }
    }
    ts.expectWord("INTO");
    const dests: { target: Expr; countIn: Expr | null }[] = [];
    while (!ts.atEnd) {
      const t = ts.peek()!;
      if (t.t === "p" && t.v === ".") break;
      if (t.t === "w" && (VERBS.has(t.u) || ["WITH", "POINTER", "TALLYING", "ON", "NOT", "END-UNSTRING", "IN", "COUNT", "DELIMITED", "ALL"].includes(t.u))) break;
      if (t.t === "p" && (t.v === "," || t.v === ";")) {
        ts.next();
        continue;
      }
      if (t.t !== "w" && t.t !== "n" && t.t !== "s") break;
      const target = parseExpr(ts, this.ctx);
      let countIn: Expr | null = null;
      if (ts.acceptWord("COUNT")) {
        ts.acceptWord("IN");
        countIn = parseExpr(ts, this.ctx);
      }
      dests.push({ target, countIn });
    }
    while (!ts.atEnd) {
      if (ts.acceptWord("WITH") || ts.acceptWord("POINTER")) {
        if (ts.isWord("POINTER")) {
          ts.next();
          parseExpr(ts, this.ctx);
        }
        continue;
      }
      if (ts.acceptWord("TALLYING")) {
        ts.acceptWord("IN");
        parseExpr(ts, this.ctx);
        continue;
      }
      break;
    }
    let onOverflow: Stmt[] = [];
    while (!ts.atEnd) {
      let negate = false;
      if (ts.isWord("NOT")) {
        ts.next();
        negate = true;
      }
      if (ts.acceptWord("ON")) {
        ts.acceptWord("OVERFLOW");
        const body = this.parseBlock(["NOT", "END-UNSTRING"]);
        if (negate) notOnOverflowUnused();
        else onOverflow = body;
        continue;
      }
      break;
    }
    ts.acceptWord("END-UNSTRING");
    ts.acceptSeparators();
    return { k: "unstring", src, delims, dests, onOverflow, line };
  }

  private parseInspect(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const target = parseExpr(ts, this.ctx);
    const actions: InspectAction[] = [];
    while (!ts.atEnd) {
      const t = ts.peek()!;
      if (t.t === "p" && t.v === ".") break;
      if (t.t === "w" && VERBS.has(t.u)) break;
      if (ts.acceptWord("TALLYING")) {
        while (!ts.atEnd && !ts.isWord("REPLACING", "CONVERTING") && !ts.isPunct(".")) {
          const counter = parseExpr(ts, this.ctx);
          if (!ts.acceptWord("FOR")) break;
          while (!ts.atEnd && !ts.isWord("REPLACING", "CONVERTING") && !ts.isPunct(".")) {
            const mode = ts.acceptWord("ALL") ? "all" : ts.acceptWord("LEADING") ? "leading" : ts.acceptWord("FIRST") ? "first" : "char";
            ts.acceptWord("CHARACTERS");
            if (mode === "char" && !ts.isWord("BEFORE", "AFTER")) {
              actions.push({ kind: "tally", counter, what: null, mode: "char" });
              break;
            }
            if (ts.isWord("BEFORE") || ts.isWord("AFTER")) break;
            const what = parseExpr(ts, this.ctx);
            actions.push({ kind: "tally", counter, what, mode });
          }
        }
        continue;
      }
      if (ts.acceptWord("REPLACING")) {
        while (!ts.atEnd && !ts.isWord("CONVERTING", "TALLYING") && !ts.isPunct(".")) {
          const mode = ts.acceptWord("ALL") ? "all" : ts.acceptWord("LEADING") ? "leading" : ts.acceptWord("FIRST") ? "first" : "char";
          if (mode === "char" && ts.acceptWord("CHARACTERS")) {
            ts.acceptWord("BY");
            const by = parseExpr(ts, this.ctx);
            actions.push({ kind: "replace", what: null, by, mode: "char" });
            break;
          }
          if (ts.isWord("BEFORE") || ts.isWord("AFTER")) break;
          const what = parseExpr(ts, this.ctx);
          if (!ts.acceptWord("BY")) break;
          const by = parseExpr(ts, this.ctx);
          actions.push({ kind: "replace", what, by, mode });
        }
        continue;
      }
      if (ts.acceptWord("CONVERTING")) {
        const what = parseExpr(ts, this.ctx);
        ts.expectWord("TO");
        const by = parseExpr(ts, this.ctx);
        actions.push({ kind: "convert", what, by, mode: "all" });
        continue;
      }
      break;
    }
    ts.acceptSeparators();
    return { k: "inspect", target, actions, line };
  }

  private parseSearch(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    let all = false;
    if (ts.acceptWord("ALL")) all = true;
    const table = parseExpr(ts, this.ctx);
    let varying: Expr | null = null;
    if (ts.acceptWord("VARYING")) varying = parseExpr(ts, this.ctx);
    let atEnd: Stmt[] = [];
    const whens: { cond: Cond; body: Stmt[] }[] = [];
    while (!ts.atEnd) {
      if (ts.acceptWord("AT")) {
        ts.acceptWord("END");
        atEnd = this.parseBlock(["WHEN", "END-SEARCH"]);
        continue;
      }
      if (ts.isWord("END-SEARCH")) {
        ts.next();
        break;
      }
      if (!ts.acceptWord("WHEN")) break;
      const cond = parseCondition(ts, this.ctx);
      const body = this.parseBlock(["WHEN", "END-SEARCH"], true);
      whens.push({ cond, body });
    }
    ts.acceptWord("END-SEARCH");
    ts.acceptSeparators();
    return { k: "search", table, varying, all, atEnd, whens, line };
  }

  private parseCall(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const program = parseExpr(ts, this.ctx);
    const using: Expr[] = [];
    if (ts.acceptWord("USING")) {
      while (!ts.atEnd) {
        if (ts.isWord("BY")) {
          ts.next();
          ts.acceptWord("REFERENCE");
          ts.acceptWord("CONTENT");
          ts.acceptWord("VALUE");
          continue;
        }
        const t = ts.peek()!;
        if (t.t === "p" && t.v === ".") break;
        if (t.t === "w" && (VERBS.has(t.u) || ["RETURNING", "ON", "NOT", "END-CALL", "GIVING"].includes(t.u))) break;
        if (t.t !== "w" && t.t !== "n" && t.t !== "s") break;
        using.push(parseExpr(ts, this.ctx));
      }
    }
    let returning: Expr | null = null;
    if (ts.acceptWord("RETURNING") || ts.acceptWord("GIVING")) returning = parseExpr(ts, this.ctx);
    let onException: Stmt[] = [];
    while (!ts.atEnd) {
      let negate = false;
      if (ts.isWord("NOT")) {
        ts.next();
        negate = true;
      }
      if (ts.acceptWord("ON")) {
        ts.acceptWord("EXCEPTION");
        ts.acceptWord("OVERFLOW");
        const body = this.parseBlock(["NOT", "END-CALL"]);
        if (negate) notOnOverflowUnused();
        else onException = body;
        continue;
      }
      break;
    }
    ts.acceptWord("END-CALL");
    ts.acceptSeparators();
    return { k: "call", program, using, returning, onException, line };
  }

  private parseExec(line: number): Stmt {
    const ts = this.ts;
    ts.next();
    const toks: string[] = [];
    while (!ts.atEnd) {
      const t = ts.next();
      if (t.t === "w" && t.u === "END-EXEC") break;
      toks.push(t.v);
    }
    ts.acceptSeparators();
    const text = toks.join(" ");
    this.warnings.push(`Line ${line}: EXEC block needs a DB2/CICS precompiler - not executed (${text.slice(0, 40)}...).`);
    return { k: "exec", text, line };
  }
}

function notOnOverflowUnused() {
  /* placeholder to keep parsing symmetrical */
}
