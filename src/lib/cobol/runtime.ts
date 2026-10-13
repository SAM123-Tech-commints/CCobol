/** COBOL interpreter runtime: executes the parsed statement tree. */
import type { Cond, Expr } from "./expr";
import type { Field, FileSpec, Lit, PicInfo } from "./data";
import { expandPicture, isNumericPic, literalText } from "./data";
import type { InspectAction, Paragraph, Procedure, Stmt } from "./parser";
import { parseSource, type ProgramUnit } from "./units";

export interface RunOptions {
  stdin?: string;
  files?: Record<string, string>;
  maxSteps?: number;
  maxOutput?: number;
}

export interface RunResult {
  output: string;
  fileOutput: Record<string, string>;
  errors: string[];
  warnings: string[];
  runMs: number;
  /** Output length when the program first ran out of stdin (the interactive pause point). */
  inputStarvedAt: number | null;
  /** Output offset of every ACCEPT that consumed a line of stdin (echo anchors for the terminal). */
  acceptPoints: number[];
}

export class CobolError extends Error {
  line: number;
  constructor(message: string, line = 0) {
    super(message);
    this.line = line;
  }
}

class StopRun extends Error {}
class ExitProgram extends Error {}
class GoToSignal extends Error {
  constructor(public target: string) {
    super(target);
  }
}

export interface Val {
  text: string;
  numeric: boolean;
  num: number;
}

const MAX_STEPS_DEFAULT = 120_000;

export function run(source: string, options: RunOptions = {}): RunResult {
  const started = Date.now();
  const parseResult = parseSource(source);
  const interp = new Interp(parseResult.units, options);
  let output = "";
  const errors = [...parseResult.errors];
  if (parseResult.units.length === 0) {
    errors.push("No PROCEDURE DIVISION was found in the source.");
  }
  if (errors.length === 0) {
    try {
      interp.execute();
    } catch (e) {
      if (e instanceof StopRun || e instanceof ExitProgram) {
        // normal termination
      } else if (e instanceof CobolError) {
        errors.push(e.line ? `line ${e.line}: ${e.message}` : e.message);
      } else if (e instanceof RangeError) {
        errors.push("Runtime error: stack overflow / out of range (check your PERFORM loops).");
      } else {
        errors.push(e instanceof Error ? `Runtime error: ${e.message}` : String(e));
      }
    }
  }
  output = interp.takeOutput();
  for (const w of parseResult.warnings) interp.warnings.push(w);
  if (interp.truncated) interp.warnings.push("Output was truncated at 64 KB.");
  if (interp.stepLimitHit) interp.warnings.push("Execution stopped: statement limit reached (possible infinite loop).");
  return {
    output,
    fileOutput: interp.fileOutput(),
    errors,
    warnings: [...new Set(interp.warnings)],
    runMs: Date.now() - started,
    inputStarvedAt: interp.inputStarvedAt,
    acceptPoints: interp.acceptPoints,
  };
}

interface OpenFile {
  spec: FileSpec;
  mode: string;
  records: string[];
  pos: number;
  map: Map<string, string>;
  changed: boolean;
}

class Frame {
  aliases = new Map<number, { storage: string[]; addr: number }>();
  constructor(public unit: ProgramUnit) {}
}

class Interp {
  out: string[] = [];
  outLen = 0;
  truncated = false;
  warnings: string[] = [];
  stepLimitHit = false;
  private steps = 0;
  private maxSteps: number;
  private maxOutput: number;
  private stdinLines: string[];
  private stdinPos = 0;
  /** Output length when stdin first ran out (null = never). */
  inputStarvedAt: number | null = null;
  /** Output offset at every ACCEPT that consumed a stdin line (for terminal echo merging). */
  acceptPoints: number[] = [];
  private fs = new Map<string, string[]>();
  private openFiles = new Map<string, OpenFile>();
  private signs = new Map<string, number>();
  private dirtyFiles = new Set<string>();
  private stack: Frame[] = [];
  private unit!: ProgramUnit;
  private procedure!: Procedure;

  constructor(private units: ProgramUnit[], private options: RunOptions) {
    this.maxSteps = options.maxSteps ?? MAX_STEPS_DEFAULT;
    this.maxOutput = options.maxOutput ?? 32768;
    // Empty stdin = no lines at all. Previously "" split into [""], which let
    // the first ACCEPT silently succeed with spaces instead of pausing.
    const stdin = (options.stdin ?? "").replace(/\r\n?/g, "\n");
    this.stdinLines = stdin === "" ? [] : stdin.split("\n").map((l) => l.replace(/\r$/, "")).filter((l, i, arr) => i < arr.length - 1 || l.length > 0);
    for (const [name, content] of Object.entries(options.files ?? {})) {
      this.fs.set(name.toUpperCase(), content.replace(/\r\n?/g, "\n").split("\n").filter((l, i, arr) => i < arr.length - 1 || l.length > 0));
    }
  }

  takeOutput(): string {
    return this.out.join("");
  }

  fileOutput(): Record<string, string> {
    const result: Record<string, string> = {};
    const emit = (name: string, lines: string[]) => {
      const trimmed = lines.map((r) => r.replace(/ +$/, ""));
      result[name] = trimmed.join("\n") + (trimmed.length ? "\n" : "");
    };
    for (const [name, of] of this.openFiles.entries()) {
      if (!of.changed) continue;
      this.dirtyFiles.add((of.spec.assign || name).toUpperCase());
      emit(of.spec.assign || name, of.records);
    }
    for (const name of this.dirtyFiles) {
      if (result[name] !== undefined) continue;
      const lines = this.fs.get(name);
      if (lines) emit(name, lines);
    }
    return result;
  }

  execute(): void {
    const unit = this.units[0];
    this.runUnit(unit, []);
  }

  private runUnit(unit: ProgramUnit, args: { storage: string[]; addr: number; field: Field }[]) {
    const prevUnit = this.unit;
    const prevProc = this.procedure;
    this.unit = unit;
    this.procedure = unit.procedure;
    const frame = new Frame(unit);
    // bind LINKAGE SECTION items to caller storage
    unit.data.linkage.forEach((linkRoot, i) => {
      const arg = args[i];
      if (arg) frame.aliases.set(linkRoot.id, { storage: arg.storage, addr: arg.addr });
      else {
        const buf = new Array<string>(linkRoot.totalSize).fill(" ");
        linkRoot.storage = buf;
        frame.aliases.set(linkRoot.id, { storage: buf, addr: 0 });
      }
    });
    this.stack.push(frame);
    try {
      this.runParagraphs();
    } catch (e) {
      if (e instanceof ExitProgram || e instanceof StopRun) {
        if (e instanceof StopRun && this.stack.length > 1) throw e;
        return;
      }
      throw e;
    } finally {
      this.stack.pop();
      this.unit = prevUnit;
      this.procedure = prevProc;
    }
  }

  private runParagraphs() {
    const paragraphs = this.procedure.paragraphs;
    let i = 0;
    while (i < paragraphs.length) {
      try {
        this.execBlock(paragraphs[i].statements);
        i++;
      } catch (e) {
        if (e instanceof GoToSignal) {
          const idx = this.procedure.index.get(e.target);
          if (idx === undefined) throw new CobolError(`GO TO references unknown paragraph '${e.target}'.`);
          i = idx;
          continue;
        }
        throw e;
      }
    }
  }

  private performRange(from: string, thru?: string) {
    const start = this.procedure.index.get(from);
    if (start === undefined) throw new CobolError(`PERFORM references unknown paragraph '${from}'.`);
    const end = thru ? this.procedure.index.get(thru) ?? start : start;
    if (thru && !this.procedure.index.has(thru)) {
      this.warnings.push(`PERFORM THRU references unknown paragraph '${thru}'.`);
    }
    let i = start;
    let guard = 0;
    while (i <= end && guard++ < this.maxSteps) {
      try {
        this.execBlock(this.procedure.paragraphs[i].statements);
        i++;
      } catch (e) {
        if (e instanceof GoToSignal) {
          const idx = this.procedure.index.get(e.target);
          if (idx === undefined) throw new CobolError(`GO TO references unknown paragraph '${e.target}'.`);
          if (idx < start || idx > end) break;
          i = idx;
          continue;
        }
        throw e;
      }
    }
  }

  private execBlock(stmts: Stmt[]) {
    for (const st of stmts) this.execStmt(st);
  }

  private tick() {
    if (++this.steps > this.maxSteps) {
      this.stepLimitHit = true;
      throw new StopRun();
    }
  }

  // ---------------------------------------------------------------- statements

  execStmt(st: Stmt): void {
    this.tick();
    switch (st.k) {
      case "display": {
        let text = "";
        for (const item of st.items) text += this.displayText(item);
        if (st.noAdvancing) this.write(text);
        else this.write(text + "\n");
        return;
      }
      case "move": {
        if (st.corresponding) {
          this.moveCorresponding(st.src, st.dsts[0]);
          return;
        }
        const val = this.value(st.src);
        for (const dst of st.dsts) this.assign(dst, val);
        return;
      }
      case "initialize": {
        for (const item of st.items) {
          const loc = this.resolveLoc(item);
          if (loc.field.pic && isNumericPic(loc.field.pic)) {
            this.writeRaw(loc, "0".repeat(loc.len));
          } else {
            this.writeRaw(loc, " ".repeat(loc.len));
          }
        }
        return;
      }
      case "set": {
        if (st.direction === "true") {
          for (const t of st.targets) {
            const condField = this.unit.data.conditions.get((t as { name: string }).name);
            if (condField && condField.children.length) {
              const cond = condField.children[0].cond;
              if (cond && cond.length) {
                const lit = cond[0].from;
                this.assign(t, this.litToVal(lit));
              }
            }
          }
          return;
        }
        if (st.direction === "address") {
          this.warnings.push("Line " + st.line + ": SET ADDRESS OF (dynamic memory) is not available in this engine.");
          return;
        }
        if (st.direction === "switch") {
          this.warnings.push("Line " + st.line + ": SET ... ON/OFF (switches) is not available in this engine.");
          return;
        }
        if (!st.value) return;
        const amount = this.num(st.value);
        for (const t of st.targets) {
          const current = this.num(t);
          const next = st.direction === "up" ? current + amount : st.direction === "down" ? current - amount : amount;
          this.assign(t, { text: String(next), numeric: true, num: next });
        }
        return;
      }
      case "add": {
        const sum = st.operands.reduce((acc, e) => acc + this.num(e), 0);
        if (st.giving.length) {
          const base = st.tos.reduce((acc, e) => acc + this.num(e), 0);
          for (const g of st.giving) this.assign(g, { text: "", numeric: true, num: base + sum }, st.onSize.length > 0);
        } else {
          for (const t of st.tos) {
            const val = this.num(t);
            this.assign(t, { text: "", numeric: true, num: val + sum }, st.onSize.length > 0);
          }
        }
        this.maybeSizeError(st);
        return;
      }
      case "subtract": {
        const sum = st.operands.reduce((acc, e) => acc + this.num(e), 0);
        if (st.giving.length) {
          for (const t of st.from) {
            const base = this.num(t);
            for (const g of st.giving) this.assign(g, { text: "", numeric: true, num: base - sum }, st.onSize.length > 0);
          }
        } else {
          for (const t of st.from) {
            const val = this.num(t);
            this.assign(t, { text: "", numeric: true, num: val - sum }, st.onSize.length > 0);
          }
        }
        this.maybeSizeError(st);
        return;
      }
      case "multiply": {
        const a = this.num(st.a);
        const b = this.num(st.b);
        const result = a * b;
        if (st.giving.length) {
          for (const g of st.giving) this.assign(g, { text: "", numeric: true, num: result }, st.onSize.length > 0);
        } else {
          this.assign(st.b, { text: "", numeric: true, num: result }, st.onSize.length > 0);
        }
        this.maybeSizeError(st);
        return;
      }
      case "divide": {
        const a = this.num(st.a);
        const b = this.num(st.b);
        const numerator = st.dir === "into" ? b : a;
        const divisor = st.dir === "into" ? a : b;
        if (divisor === 0) {
          this.warnings.push(`Line ${st.line}: division by zero.`);
          if (st.onSize.length) this.execBlock(st.onSize);
          else this.execBlock(st.notOnSize);
          return;
        }
        const quotient = Math.trunc(numerator / divisor);
        const remainder = numerator - quotient * divisor;
        if (st.giving.length) {
          for (const g of st.giving) this.assign(g, { text: "", numeric: true, num: quotient }, st.onSize.length > 0);
        } else {
          this.assign(st.b, { text: "", numeric: true, num: quotient }, st.onSize.length > 0);
        }
        if (st.remainder) this.assign(st.remainder, { text: "", numeric: true, num: remainder });
        this.maybeSizeError(st);
        return;
      }
      case "compute": {
        const val = this.num(st.expr);
        this.assign(st.target, { text: "", numeric: true, num: val }, st.onSize.length > 0);
        this.maybeSizeError(st);
        return;
      }
      case "if": {
        if (this.evalCond(st.cond)) this.execBlock(st.then);
        else this.execBlock(st.els);
        return;
      }
      case "evaluate": {
        for (const when of st.whens) {
          for (const c of when.conds) {
            if (this.evalCond(c)) {
              this.execBlock(when.body);
              return;
            }
          }
        }
        this.execBlock(st.other);
        return;
      }
      case "perform": {
        this.execPerform(st);
        return;
      }
      case "goto":
        throw new GoToSignal(st.target);
      case "stopRun":
        throw new StopRun();
      case "exitProgram":
        throw new ExitProgram();
      case "goback":
        if (this.stack.length > 1) throw new ExitProgram();
        throw new StopRun();
      case "exit":
      case "continue":
      case "nop":
        return;
      case "accept": {
        if (st.from === "DATE" || st.from === "DAY" || st.from === "TIME" || st.from === "DAY-OF-WEEK") {
          const now = new Date();
          const pad = (n: number, w = 2) => String(n).padStart(w, "0");
          let text: string;
          if (st.from === "TIME") text = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${pad(Math.floor(now.getMilliseconds() / 10))}`;
          else if (st.from === "DAY") text = `${now.getFullYear()}${pad(Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000))}`;
          else if (st.from === "DAY-OF-WEEK") text = String(now.getDay() === 0 ? 7 : now.getDay());
          else text = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
          this.assign(st.target, { text, numeric: true, num: parseFloat(text) });
          return;
        }
        const line = this.stdinPos < this.stdinLines.length ? this.stdinLines[this.stdinPos++] : null;
        if (line === null) {
          if (this.inputStarvedAt === null) this.inputStarvedAt = this.out.join("").length;
          this.warnings.push(`Line ${st.line}: ACCEPT read past the end of the standard input (spaces used).`);
          this.assign(st.target, { text: " ", numeric: false, num: 0 });
        } else {
          this.acceptPoints.push(this.out.join("").length);
          this.validateAccept(this.resolveLoc(st.target), line, st.line);
          this.assign(st.target, { text: line, numeric: false, num: parseFloat(line.trim()) || 0 });
        }
        return;
      }
      case "open": {
        for (const item of st.items) {
          for (const fileName of item.files) this.openFile(fileName, item.mode, st.line);
        }
        return;
      }
      case "close": {
        for (const name of st.files) {
          const of = this.openFiles.get(name);
          if (!of) {
            this.warnings.push(`Line ${st.line}: CLOSE on '${name}' which is not open.`);
            continue;
          }
          const physical = (of.spec.assign || name).toUpperCase();
          if (of.changed) this.dirtyFiles.add(physical);
          this.fs.set(physical, of.records.slice());
          this.openFiles.delete(name);
        }
        return;
      }
      case "read":
        this.execRead(st);
        return;
      case "write":
        this.execWrite(st);
        return;
      case "rewrite":
        this.execRewrite(st);
        return;
      case "delete":
        this.execDelete(st);
        return;
      case "string":
        this.execStringStmt(st);
        return;
      case "unstring":
        this.execUnstring(st);
        return;
      case "inspect":
        this.execInspect(st);
        return;
      case "search":
        this.execSearch(st);
        return;
      case "call":
        this.execCall(st);
        return;
      case "exec":
        return;
      case "unsupported":
        return;
    }
  }

  private maybeSizeError(st: Stmt) {
    if (st.k === "compute" || st.k === "add" || st.k === "subtract" || st.k === "multiply" || st.k === "divide") {
      if (st.onSize.length && this.sizeError) {
        this.execBlock(st.onSize);
        this.sizeError = false;
      } else if (st.notOnSize.length && !this.sizeError) {
        this.execBlock(st.notOnSize);
      }
    }
    this.sizeError = false;
  }

  private sizeError = false;

  private execPerform(st: Extract<Stmt, { k: "perform" }>) {
    const runOnce = () => {
      if (st.target) this.performRange(st.target, st.thru);
      else this.execBlock(st.inline);
    };
    if (st.varying) {
      this.assignByName(st.varying.varName, this.num(st.varying.from));
      let guard = 0;
      const limit = Math.min(this.maxSteps, 1_000_000);
      while (guard++ < limit) {
        if (!st.testAfter && this.evalCond(st.varying.until)) break;
        runOnce();
        if (st.testAfter && this.evalCond(st.varying.until)) break;
        this.assignByName(st.varying.varName, this.numByName(st.varying.varName) + this.num(st.varying.by));
      }
      return;
    }
    if (st.until) {
      let guard = 0;
      const limit = Math.min(this.maxSteps, 1_000_000);
      while (guard++ < limit) {
        if (!st.testAfter && this.evalCond(st.until)) break;
        runOnce();
        if (st.testAfter && this.evalCond(st.until)) break;
      }
      return;
    }
    if (st.times) {
      const n = Math.max(0, Math.floor(this.num(st.times)));
      for (let i = 0; i < n && i < 1_000_000; i++) runOnce();
      return;
    }
    runOnce();
  }

  private execRead(st: Extract<Stmt, { k: "read" }>) {
    const of = this.requireFile(st.file, st.line);
    if (!of) return;
    const spec = of.spec;
    const recordField = spec.recordField;
    const keyExpr = st.key ?? (spec.accessMode !== "SEQUENTIAL" ? null : null);
    if ((spec.organization === "INDEXED" && (spec.accessMode !== "SEQUENTIAL" || keyExpr)) || (keyExpr && spec.organization === "SEQUENTIAL")) {
      const keyField = spec.recordKey ? this.unit.data.byName.get(spec.recordKey) : null;
      const keyLoc = keyExpr ? this.resolveLoc(keyExpr) : keyField ? this.locateField(keyField, []) : null;
      if (!keyLoc) throw new CobolError(`READ on '${st.file}' needs a KEY (RECORD KEY IS missing).`, st.line);
      const key = this.raw(keyLoc);
      let rec = of.map.get(key);
      if (rec === undefined && !spec.recordKey) {
        // FD without a SELECT: locate the record by matching the key at the
        // start of the record (keys normally lead the record layout).
        const wanted = key.trim();
        rec = of.records.find((r) => r.slice(0, wanted.length).trim() === wanted);
        if (rec !== undefined) of.map.set(key, rec);
      }
      if (rec === undefined) {
        this.setFileStatus(spec, "23");
        if (st.invalid.length) this.execBlock(st.invalid);
        else if (st.notInvalid.length === 0) this.warnings.push(`Line ${st.line}: INVALID KEY '${key.trim()}' on ${st.file}.`);
        return;
      }
      this.loadRecord(of, rec, st.into);
      this.setFileStatus(spec, "00");
      if (st.notInvalid.length) this.execBlock(st.notInvalid);
      return;
    }
    if (spec.organization === "RELATIVE" && spec.accessMode !== "SEQUENTIAL") {
      const keyField = spec.relativeKey ? this.unit.data.byName.get(spec.relativeKey) : null;
      if (!keyField) throw new CobolError(`READ on '${st.file}' needs RELATIVE KEY IS.`, st.line);
      const idx = this.locateField(keyField, []);
      const rel = Math.floor(this.numFromRaw(idx.field, this.raw(idx)));
      const rec = of.map.get(String(rel));
      if (rec === undefined) {
        this.setFileStatus(spec, "23");
        if (st.invalid.length) this.execBlock(st.invalid);
        else this.warnings.push(`Line ${st.line}: no record ${rel} in ${st.file}.`);
        return;
      }
      this.loadRecord(of, rec, st.into);
      this.setFileStatus(spec, "00");
      if (st.notInvalid.length) this.execBlock(st.notInvalid);
      return;
    }
    if (of.pos >= of.records.length) {
      this.setFileStatus(spec, "10");
      if (st.atEnd.length) this.execBlock(st.atEnd);
      else if (st.notAtEnd.length === 0) this.warnings.push(`Line ${st.line}: end of file reached on ${st.file}.`);
      return;
    }
    const rec = of.records[of.pos++];
    this.loadRecord(of, rec, st.into);
    this.setFileStatus(spec, "00");
    if (st.notAtEnd.length) this.execBlock(st.notAtEnd);
  }

  private loadRecord(of: OpenFile, rec: string, into: Expr | null) {
    const recordField = of.spec.recordField;
    if (recordField && recordField.storage) {
      const size = recordField.totalSize;
      const text = (rec + " ".repeat(size)).slice(0, size);
      for (let i = 0; i < size; i++) recordField.storage[i] = text[i] ?? " ";
    }
    if (into) this.assign(into, { text: rec, numeric: false, num: 0 });
  }

  private currentRecordText(of: OpenFile): string {
    const recordField = of.spec.recordField;
    if (recordField && recordField.storage) return recordField.storage.join("");
    return "";
  }

  private keyText(of: OpenFile, fieldName: string | null): string {
    if (!fieldName) return "";
    const f = this.unit.data.byName.get(fieldName);
    if (!f || !of.spec.recordField || !of.spec.recordField.storage) return "";
    const rel = f.absOffset - of.spec.recordField.absOffset;
    return of.spec.recordField.storage.slice(rel, rel + (f.pic?.size ?? f.elemSize)).join("").trim();
  }

  private execWrite(st: Extract<Stmt, { k: "write" }>) {
    const of = this.requireFileFromRecord(st.record, st.line);
    if (!of) return;
    const spec = of.spec;
    let text: string;
    if (st.from) {
      text = this.displayText(st.from);
    } else {
      text = this.displayText(st.record);
    }
    const recordField = spec.recordField;
    const size = recordField ? recordField.totalSize : Math.max(1, text.length);
    const rec = (text + " ".repeat(size)).slice(0, size);
    if (spec.organization === "INDEXED") {
      const keyField = spec.recordKey ? this.unit.data.byName.get(spec.recordKey) : null;
      const key = keyField ? this.keyText(of, spec.recordKey) : String(of.records.length + 1);
      if (of.map.has(key)) {
        this.setFileStatus(spec, "22");
        if (st.invalid.length) this.execBlock(st.invalid);
        else this.warnings.push(`Line ${st.line}: duplicate key '${key}' writing ${spec.name}.`);
        return;
      }
      of.map.set(key, rec);
      of.records.push(rec);
      of.changed = true;
      this.setFileStatus(spec, "00");
      if (st.notInvalid.length) this.execBlock(st.notInvalid);
      return;
    }
    if (spec.organization === "RELATIVE") {
      const keyField = spec.relativeKey ? this.unit.data.byName.get(spec.relativeKey) : null;
      if (!keyField) throw new CobolError(`WRITE on '${spec.name}' needs RELATIVE KEY IS.`, st.line);
      const rel = this.keyText(of, spec.relativeKey);
      if (of.map.has(rel)) {
        this.setFileStatus(spec, "22");
        if (st.invalid.length) this.execBlock(st.invalid);
        else this.warnings.push(`Line ${st.line}: record ${rel} already exists in ${spec.name}.`);
        return;
      }
      of.map.set(rel, rec);
      of.records.push(rec);
      of.changed = true;
      this.setFileStatus(spec, "00");
      if (st.notInvalid.length) this.execBlock(st.notInvalid);
      return;
    }
    of.records.push(rec);
    of.changed = true;
    this.setFileStatus(spec, "00");
    if (st.notInvalid.length) this.execBlock(st.notInvalid);
  }

  private execRewrite(st: Extract<Stmt, { k: "rewrite" }>) {
    const of = this.requireFileFromRecord(st.record, st.line);
    if (!of) return;
    if (of.records.length > 5_000) {
      this.warnings.push("Output file record limit (5000) reached.");
      throw new StopRun();
    }
    if (of.records.length === 0) {
      if (st.invalid.length) this.execBlock(st.invalid);
      return;
    }
    const text = this.displayText(st.record);
    const size = of.spec.recordField ? of.spec.recordField.totalSize : text.length;
    const rec = (text + " ".repeat(size)).slice(0, size);
    const idx = of.pos > 0 ? of.pos - 1 : 0;
    const old = of.records[idx];
    of.records[idx] = rec;
    of.changed = true;
    if (of.spec.organization === "INDEXED") {
      const oldKey = of.map.get(old) ? this.keyFromMap(of, old) : null;
      if (oldKey) of.map.delete(oldKey);
      of.map.set(this.keyText(of, of.spec.recordKey), rec);
    }
    if (of.spec.organization === "RELATIVE") {
      const rel = this.keyText(of, of.spec.relativeKey);
      of.map.set(rel, rec);
    }
    this.setFileStatus(of.spec, "00");
    if (st.notInvalid.length) this.execBlock(st.notInvalid);
  }

  private keyFromMap(of: OpenFile, rec: string): string | null {
    for (const [k, v] of of.map.entries()) if (v === rec) return k;
    return null;
  }

  private execDelete(st: Extract<Stmt, { k: "delete" }>) {
    const of = this.requireFile(st.file, st.line);
    if (!of) return;
    if (of.spec.organization === "INDEXED") {
      const key = this.keyText(of, of.spec.recordKey);
      const rec = of.map.get(key);
      if (rec === undefined) {
        this.setFileStatus(of.spec, "23");
        if (st.invalid.length) this.execBlock(st.invalid);
        return;
      }
      of.map.delete(key);
      of.records = of.records.filter((r) => r !== rec);
      of.changed = true;
      return;
    }
    if (of.records.length) {
      of.records.pop();
      of.changed = true;
    }
  }

  private execStringStmt(st: Extract<Stmt, { k: "string" }>) {
    const destLoc = this.resolveLoc(st.dest);
    const size = destLoc.len;
    const buffer = new Array<string>(size).fill(" ");
    let pos = 0;
    if (st.pointer) pos = Math.max(0, Math.floor(this.num(st.pointer)) - 1);
    let overflow = false;
    for (const src of st.sources) {
      let text = this.displayText(src.src);
      if (src.delim) {
        const d = this.displayText(src.delim);
        const cut = text.indexOf(d);
        if (cut >= 0) text = text.slice(0, cut);
      } else if (!src.size) {
        // Data items keep their padding in real COBOL; trimming the trailing
        // spaces of data names makes STRING behave like the tutorial examples.
        if (src.src.k === "ref") text = text.replace(/ +$/, "");
      }
      for (const ch of text) {
        if (pos >= size) {
          overflow = true;
          break;
        }
        buffer[pos++] = ch;
      }
      if (overflow) break;
    }
    this.writeRaw(destLoc, buffer.join(""));
    if (st.pointer) this.assign(st.pointer, { text: String(pos + 1), numeric: true, num: pos + 1 });
    if (overflow) {
      if (st.onOverflow.length) this.execBlock(st.onOverflow);
      else this.warnings.push(`Line ${st.line}: STRING overflow.`);
    } else if (st.notOnOverflow.length) this.execBlock(st.notOnOverflow);
  }

  private execUnstring(st: Extract<Stmt, { k: "unstring" }>) {
    const source = this.displayText(st.src);
    const delims = st.delims.map((d) => this.displayText(d.e));
    let rest = source;
    for (const dest of st.dests) {
      let piece = rest;
      let used = 0;
      if (delims.length) {
        let best = -1;
        let bestLen = 0;
        for (const d of delims) {
          const idx = rest.indexOf(d);
          if (idx >= 0 && (best === -1 || idx < best)) {
            best = idx;
            bestLen = d.length;
          }
        }
        if (best >= 0) {
          piece = rest.slice(0, best);
          used = best + bestLen;
        } else {
          used = rest.length;
        }
      } else {
        used = rest.length;
      }
      this.assign(dest.target, { text: piece, numeric: false, num: 0 });
      if (dest.countIn) this.assign(dest.countIn, { text: String(piece.length), numeric: true, num: piece.length });
      rest = rest.slice(used);
    }
  }

  private execInspect(st: Extract<Stmt, { k: "inspect" }>) {
    const loc = this.resolveLoc(st.target);
    let text = this.raw(loc);
    for (const action of st.actions) {
      if (action.kind === "tally") {
        const counter = action.counter!;
        let count = 0;
        if (action.mode === "char") {
          count = text.replace(/ /g, "").length;
        } else {
          const what = this.displayText(action.what!);
          let from = 0;
          while (from <= text.length - what.length) {
            if (text.slice(from, from + what.length) === what) {
              count++;
              if (action.mode === "first" || action.mode === "leading") from += what.length;
              else from += 1;
              if (action.mode === "first") break;
            } else if (action.mode === "leading") {
              break;
            } else {
              from += 1;
            }
          }
        }
        this.assign(counter, { text: String(count), numeric: true, num: count });
      } else if (action.kind === "replace") {
        if (action.mode === "char") {
          const by = this.displayText(action.by!);
          text = by.repeat(Math.max(0, Math.floor(text.length / by.length))).slice(0, text.length);
        } else {
          const what = this.displayText(action.what!);
          const by = this.displayText(action.by!);
          if (what.length >= by.length) {
            let from = 0;
            let out = "";
            while (from < text.length) {
              if (text.slice(from, from + what.length) === what) {
                out += by;
                from += what.length;
              } else {
                out += text[from];
                from++;
              }
            }
            text = out;
          } else {
            this.warnings.push(`Line ${st.line}: INSPECT REPLACING with a longer replacement is not supported.`);
          }
        }
      } else if (action.kind === "convert") {
        const from = this.displayText(action.what!);
        const to = this.displayText(action.by!);
        text = text
          .split("")
          .map((ch) => {
            const i = from.indexOf(ch);
            return i >= 0 && i < to.length ? to[i] : ch;
          })
          .join("");
      }
    }
    this.writeRaw(loc, text);
  }

  private execSearch(st: Extract<Stmt, { k: "search" }>) {
    const tableRef = st.table;
    if (tableRef.k !== "ref") {
      this.warnings.push(`Line ${st.line}: SEARCH needs a table name.`);
      return;
    }
    const field = this.findField(tableRef.name);
    if (!field) throw new CobolError(`'${tableRef.name}' is not defined.`, st.line);
    // Build the chain of OCCURS levels (outermost first)
    const chain: Field[] = [];
    let node: Field | null = field;
    while (node) {
      if (node.occurs) chain.unshift(node);
      node = node.parent;
    }
    if (!chain.length) {
      this.warnings.push(`Line ${st.line}: '${tableRef.name}' is not a table (no OCCURS clause).`);
      return;
    }
    const candidates: string[] = [];
    if (st.varying && st.varying.k === "ref") candidates.push(st.varying.name);
    for (const sub of tableRef.subs) if (sub.k === "ref") candidates.push(sub.name);
    for (const idx of field.indexedBy) candidates.push(idx);
    // An index used as a subscript inside one of the WHEN conditions.
    for (const when of st.whens) {
      const collect = (e: Expr) => {
        if (e.k === "ref") {
          for (const sub of e.subs) if (sub.k === "ref") candidates.push(sub.name);
        } else if (e.k === "bin") {
          collect(e.l);
          collect(e.r);
        } else if (e.k === "neg") {
          collect(e.e);
        } else if (e.k === "func") {
          for (const a of e.args) collect(a);
        }
      };
      const walkCond = (c: Cond) => {
        if (c.k === "and" || c.k === "or") {
          walkCond(c.l);
          walkCond(c.r);
        } else if (c.k === "not") {
          walkCond(c.e);
        } else if (c.k === "rel") {
          collect(c.left);
          collect(c.right);
        } else if (c.k === "between") {
          collect(c.e);
          collect(c.from);
          collect(c.to);
        } else if (c.k === "class") {
          collect(c.e);
        }
      };
      walkCond(when.cond);
    }
    const idxFieldName = candidates.find((n) => !!this.findField(n)) ?? null;
    if (!idxFieldName) {
      this.warnings.push(`Line ${st.line}: SEARCH needs an index (INDEXED BY or VARYING).`);
      return;
    }
    const tableField = chain[chain.length - 1];
    const maxOcc = tableField.occurs ?? 1;
    let i = Math.floor(this.numByName(idxFieldName));
    if (i < 1) i = 1;
    while (i <= maxOcc) {
      this.assignByName(idxFieldName, i);
      let matched = false;
      for (const when of st.whens) {
        let ok = false;
        try {
          ok = this.evalCond(when.cond);
        } catch {
          ok = false;
        }
        if (ok) {
          this.execBlock(when.body);
          matched = true;
          break;
        }
      }
      if (matched) return;
      i++;
    }
    this.assignByName(idxFieldName, i);
    if (st.atEnd.length) this.execBlock(st.atEnd);
    else this.warnings.push(`Line ${st.line}: SEARCH reached the end of the table without a match.`);
  }

  private execCall(st: Extract<Stmt, { k: "call" }>) {
    const name = this.displayText(st.program).trim();
    const target = this.units.find((u) => u.name === name.toUpperCase());
    if (!target) {
      this.warnings.push(`Line ${st.line}: subprogram '${name}' was not found in this compile unit (CALL ignored).`);
      if (st.onException.length) this.execBlock(st.onException);
      return;
    }
    const args = st.using.map((u) => {
      const loc = this.resolveLoc(u);
      return { storage: loc.storage, addr: loc.addr, field: loc.field };
    });
    this.runUnit(target, args);
  }

  private moveCorresponding(src: Expr, dst: Expr) {
    const srcLoc = this.resolveLoc(src);
    const dstLoc = this.resolveLoc(dst);
    const map = new Map<string, Field>();
    const collect = (f: Field) => {
      for (const c of f.children) {
        if (c.children.length === 0 && c.name !== "FILLER") map.set(c.name, c);
        collect(c);
      }
    };
    collect(srcLoc.field);
    const apply = (f: Field) => {
      for (const c of f.children) {
        const match = map.get(c.name);
        if (match && c.children.length === 0) {
          const text = this.raw(this.locateField(match, []));
          this.writeRaw(this.locateField(c, []), text.slice(0, c.pic?.size ?? c.elemSize).padEnd(c.pic?.size ?? c.elemSize, " "));
        }
        apply(c);
      }
    };
    if (dstLoc.field) apply(dstLoc.field);
  }

  // ------------------------------------------------------------------- files

  private requireFile(name: string, line: number): OpenFile | null {
    const of = this.openFiles.get(name);
    if (of) return of;
    // COBOL requires OPEN before READ; opening automatically keeps the
    // tutorial examples running while still telling the learner what happened.
    this.warnings.push(
      `Line ${line}: file '${name}' was not opened - the engine opened it as INPUT so the READ could continue. Add OPEN INPUT in your program.`,
    );
    this.openFile(name, "INPUT", line);
    return this.openFiles.get(name) ?? null;
  }

  private requireFileFromRecord(record: Expr, line: number): OpenFile | null {
    if (record.k !== "ref") return null;
    const field = this.findField(record.name);
    if (!field) return null;
    let root: Field = field;
    while (root.parent) root = root.parent;
    for (const [name, of] of this.openFiles.entries()) {
      if (of.spec.recordField === root) return of;
    }
    let owner: string | null = null;
    for (const [name, spec] of this.unit.data.files.entries()) {
      if (spec.recordField === root) owner = name;
    }
    if (owner) {
      this.warnings.push(
        `Line ${line}: file '${owner}' was not opened - the engine opened it as OUTPUT so the WRITE could continue. Add OPEN OUTPUT in your program.`,
      );
      this.openFile(owner, "OUTPUT", line);
      return this.openFiles.get(owner) ?? null;
    }
    this.warnings.push(`Line ${line}: record '${record.name}' does not belong to an open file.`);
    return null;
  }

  private openFile(name: string, mode: string, line: number) {
    let spec = this.unit.data.files.get(name);
    if (!spec) {
      this.warnings.push(
        `Line ${line}: '${name}' has no SELECT/FD entry - treated as an empty line-sequential file. Add a SELECT in the ENVIRONMENT DIVISION and an FD in the FILE SECTION to use real files.`,
      );
      spec = {
        name,
        assign: name,
        organization: "SEQUENTIAL",
        accessMode: "SEQUENTIAL",
        relativeKey: null,
        recordKey: null,
        fileStatus: null,
        recordField: null,
        isOptional: true,
      };
    }
    const fileName = (spec.assign || name).toUpperCase();
    if (mode === "OUTPUT") {
      const of: OpenFile = { spec, mode, records: [], pos: 0, map: new Map(), changed: true };
      this.openFiles.set(name, of);
      return;
    }
    let lines = this.fs.get(fileName);
    if (!lines) {
      if (mode === "I-O" || mode === "EXTEND") lines = [];
      else {
        this.warnings.push(`Line ${line}: file '${spec.assign}' was not supplied to the compiler - treated as empty.`);
        lines = [];
        this.fs.set(fileName, lines);
      }
    }
    const of: OpenFile = { spec, mode, records: lines.slice(), pos: 0, map: new Map(), changed: mode !== "INPUT" };
    if (spec.organization === "INDEXED" || spec.organization === "RELATIVE") {
      const keyName = spec.organization === "INDEXED" ? spec.recordKey : spec.relativeKey;
      const keyField = keyName ? this.unit.data.byName.get(keyName) : null;
      lines.forEach((rec, i) => {
        let key = String(i + 1);
        if (keyField && spec.recordField && spec.recordField.storage) {
          const rel = keyField.absOffset - spec.recordField.absOffset;
          const size = keyField.pic?.size ?? keyField.elemSize;
          key = (rec + " ".repeat(size)).slice(rel, rel + size).trim();
        }
        of.map.set(key, rec);
      });
    }
    this.openFiles.set(name, of);
  }

  private setFileStatus(spec: FileSpec, code: string) {
    if (!spec.fileStatus) return;
    const f = this.unit.data.byName.get(spec.fileStatus);
    if (!f) return;
    const loc = this.locateField(f, []);
    this.writeRaw(loc, code.slice(0, loc.len).padEnd(loc.len, " "));
  }

  // ------------------------------------------------------------------- values

  private write(text: string) {
    if (this.outLen >= this.maxOutput) {
      this.truncated = true;
      return;
    }
    this.out.push(text);
    this.outLen += text.length;
    if (this.outLen >= this.maxOutput) this.truncated = true;
  }

  private findField(name: string): Field | null {
    const direct = this.unit.data.byName.get(name) ?? this.unit.data.indexes.get(name);
    if (direct) return direct;
    // unqualified name inside a group (e.g. STUDENT-NAME inside STUDENT-TABLE)
    for (const root of this.unit.data.fields) {
      const found = this.searchTree(root, name);
      if (found) return found;
    }
    for (const root of this.unit.data.fileSections) {
      const found = this.searchTree(root, name);
      if (found) return found;
    }
    return null;
  }

  private searchTree(f: Field, name: string): Field | null {
    if (f.name === name) return f;
    for (const c of f.children) {
      const found = this.searchTree(c, name);
      if (found) return found;
    }
    return null;
  }

  private litToVal(lit: Lit): Val {
    if (lit.type === "num") return { text: lit.value, numeric: true, num: lit.num ?? parseFloat(lit.value) };
    if (lit.type === "fig") {
      if (lit.value === "0") return { text: "0", numeric: true, num: 0 };
      return { text: lit.value, numeric: false, num: 0 };
    }
    return { text: lit.value, numeric: false, num: parseFloat(lit.value) || 0 };
  }

  value(e: Expr): Val {
    switch (e.k) {
      case "lit":
        return this.litToVal(e.lit);
      case "all": {
        const base = e.lit.value;
        return { text: base.repeat(40), numeric: false, num: 0 };
      }
      case "ref": {
        const loc = this.resolveLoc(e);
        return this.readLoc(loc);
      }
      case "func":
        return this.callFunction(e);
      case "bin": {
        const n = this.num(e);
        return { text: String(n), numeric: true, num: n };
      }
      case "neg": {
        const n = -this.num(e.e);
        return { text: String(n), numeric: true, num: n };
      }
    }
  }

  private readLoc(loc: Loc): Val {
    const raw = this.raw(loc);
    const pic = loc.field.pic;
    if (pic && isNumericPic(pic) && !loc.refmod) {
      const text = this.formatNumericDisplay(raw, pic);
      return { text, numeric: true, num: this.numFromRaw(loc.field, raw) * this.signOf(loc) };
    }
    return { text: raw, numeric: false, num: parseFloat(raw.trim()) || 0 };
  }

  private formatNumericDisplay(raw: string, pic: PicInfo): string {
    if (pic.kind === "edited") return raw;
    if (pic.decimals > 0) {
      const intPart = raw.slice(0, raw.length - pic.decimals) || "0";
      const decPart = raw.slice(raw.length - pic.decimals);
      return `${intPart}.${decPart}`;
    }
    return raw;
  }

  private signOf(loc: Loc): number {
    const key = `${loc.field.id}:${loc.addr}`;
    return this.signs.get(key) ?? loc.field.valueSign ?? 1;
  }

  private num(e: Expr): number {
    switch (e.k) {
      case "lit": {
        if (e.lit.type === "num") return e.lit.num ?? parseFloat(e.lit.value);
        if (e.lit.type === "fig") return 0;
        return parseFloat(e.lit.value.trim()) || 0;
      }
      case "ref": {
        const loc = this.resolveLoc(e);
        const raw = this.raw(loc);
        return this.numFromRaw(loc.field, raw) * this.signOf(loc);
      }
      case "func":
        return this.callFunction(e).num;
      case "bin": {
        const l = this.num(e.l);
        const r = this.num(e.r);
        switch (e.op) {
          case "+":
            return l + r;
          case "-":
            return l - r;
          case "*":
            return l * r;
          case "/":
            return r === 0 ? 0 : l / r;
          case "**":
            return Math.pow(l, r);
        }
      }
      case "neg":
        return -this.num(e.e);
      case "all":
        return 0;
    }
  }

  private numFromRaw(field: Field, raw: string): number {
    const pic = field.pic;
    if (!pic || !isNumericPic(pic)) {
      const t = raw.trim();
      return parseFloat(t) || 0;
    }
    const digits = raw.replace(/[^0-9]/g, "");
    if (!digits) return 0;
    const value = parseInt(digits, 10) / Math.pow(10, pic.decimals);
    return value;
  }

  private numByName(name: string): number {
    const field = this.findField(name);
    if (!field) throw new CobolError(`'${name}' is not defined.`);
    const loc = this.locateField(field, []);
    return this.numFromRaw(field, this.raw(loc)) * this.signOf(loc);
  }

  private assignByName(name: string, value: number) {
    const field = this.findField(name);
    if (!field) throw new CobolError(`'${name}' is not defined.`);
    const ref: Expr = { k: "ref", name, subs: [], line: 0 };
    this.assign(ref, { text: String(value), numeric: true, num: value });
  }

  displayText(e: Expr): string {
    if (e.k === "lit") {
      if (e.lit.type === "fig") return e.lit.value;
      return e.lit.value;
    }
    if (e.k === "all") return e.lit.value;
    if (e.k === "bin" || e.k === "neg") {
      const n = this.num(e);
      return String(n);
    }
    if (e.k === "func") {
      const v = this.callFunction(e);
      return v.text;
    }
    const loc = this.resolveLoc(e);
    const v = this.readLoc(loc);
    if (v.numeric) {
      const sign = this.signOf(loc);
      const text = sign < 0 ? "-" + v.text : v.text;
      return text;
    }
    return v.text;
  }

  // ---------------------------------------------------------------- locations

  private locateField(field: Field, subs: number[]): Loc {
    return this.resolveFieldLoc(field, subs, null);
  }

  private resolveLoc(e: Expr): Loc {
    if (e.k !== "ref") throw new CobolError("Only data names can be assigned to.", e.k === "func" ? e.line : 0);
    const field = this.findField(e.name);
    if (!field) throw new CobolError(`'${e.name}' is not defined.`, e.line);
    const subs = e.subs.map((s) => Math.floor(this.num(s)));
    const loc = this.resolveFieldLoc(field, subs, e.refmod ?? null);
    return loc;
  }

  private resolveFieldLoc(field: Field, subs: number[], refmod: { start: Expr; len: Expr } | null): Loc {
    let root: Field = field;
    while (root.parent) root = root.parent;
    const frame = this.stack[this.stack.length - 1];
    const alias = frame?.aliases.get(root.id);
    let storage: string[] | null = null;
    let base = 0;
    if (alias) {
      storage = alias.storage;
      base = alias.addr;
    } else if (root.storage) {
      storage = root.storage;
      base = 0;
    }
    if (!storage) throw new CobolError(`Storage for '${field.name}' is not available (LINKAGE item without a matching CALL argument).`);
    let addr = base + (field.absOffset - root.absOffset);
    const chain: Field[] = [];
    let node: Field | null = field;
    while (node) {
      if (node.occurs) chain.unshift(node);
      node = node.parent;
    }
    for (let i = 0; i < chain.length; i++) {
      const occ = chain[i];
      const idx = subs[i] ?? 1;
      const max = occ.occursDepends ? this.numByName(occ.occursDepends) : occ.occurs ?? 1;
      if (idx < 1 || idx > max) {
        throw new CobolError(`Subscript ${idx} for '${occ.name}' is out of range (1 to ${max}). COBOL does no bounds checking - GnuCOBOL would read garbage memory here.`);
      }
      addr += (idx - 1) * occ.elemSize;
    }
    let len = field.children.length ? field.elemSize : field.pic?.size ?? 0;
    let isRefmod = false;
    if (refmod) {
      const start = Math.floor(this.num(refmod.start));
      const length = Math.floor(this.num(refmod.len));
      addr = addr + start - 1;
      len = length;
      isRefmod = true;
    }
    return { field, storage, addr, len, refmod: isRefmod };
  }

  private raw(loc: Loc): string {
    const chars = loc.storage.slice(loc.addr, loc.addr + loc.len);
    while (chars.length < loc.len) chars.push(" ");
    return chars.join("");
  }

  private writeRaw(loc: Loc, text: string) {
    const padded = (text + " ".repeat(loc.len)).slice(0, loc.len);
    for (let i = 0; i < loc.len; i++) loc.storage[loc.addr + i] = padded[i] ?? " ";
  }

  /** ACCEPT input validation: gentle warnings when typed data does not fit the target field.
   *  Blank input is always legal (spaces / zero); alphanumeric targets accept anything. */
  private validateAccept(loc: Loc, line: string, lineNo: number) {
    const trimmed = line.trim();
    if (trimmed === "") return;
    const pic = loc.field.pic;
    if (!pic || !isNumericPic(pic) || loc.refmod) return;
    const n = parseFloat(trimmed);
    if (!isFinite(n) || isNaN(n)) {
      this.warnings.push(
        `Line ${lineNo}: ACCEPT '${trimmed.slice(0, 20)}' is not a valid number for ${loc.field.name} (PIC ${pic.raw}) - 0 used.`,
      );
      return;
    }
    const scaled = Math.round(Math.abs(n) * Math.pow(10, pic.decimals));
    if (scaled >= Math.pow(10, pic.digits)) {
      this.warnings.push(
        `Line ${lineNo}: ACCEPT value ${trimmed.slice(0, 20)} is too large for ${loc.field.name} (PIC ${pic.raw}) - extra digits truncated.`,
      );
    }
  }

  private assign(target: Expr, val: Val, checkSize = false) {
    const loc = this.resolveLoc(target);
    const field = loc.field;
    const pic = field.pic;
    if (loc.refmod || !pic || !isNumericPic(pic) || field.children.length > 0) {
      // alphanumeric move (groups included)
      if (field.children.length > 0 && val.numeric) {
        this.writeRaw(loc, val.text);
        return;
      }
      let text = val.text;
      if (val.numeric && pic && isNumericPic(pic)) text = val.text;
      this.writeRaw(loc, text);
      return;
    }
    // numeric move
    let n = val.numeric ? val.num : parseFloat(val.text.trim());
    if (!isFinite(n) || isNaN(n)) n = 0;
    const digits = pic.digits;
    const decimals = pic.decimals;
    let scaled = Math.round(Math.abs(n) * Math.pow(10, decimals));
    let digitsText = String(scaled);
    if (digitsText.length > digits) {
      digitsText = digitsText.slice(digitsText.length - digits);
      if (checkSize) this.sizeError = true;
    }
    while (digitsText.length < digits) digitsText = "0" + digitsText;
    this.writeRaw(loc, digitsText);
    const key = `${field.id}:${loc.addr}`;
    if (n < 0 && pic.signed) this.signs.set(key, -1);
    else this.signs.set(key, 1);
    if (checkSize && Math.abs(n) >= Math.pow(10, digits - decimals)) this.sizeError = true;
  }

  // -------------------------------------------------------------- conditions

  evalCond(c: Cond): boolean {
    switch (c.k) {
      case "bool":
        return c.value;
      case "and":
        return this.evalCond(c.l) && this.evalCond(c.r);
      case "or":
        return this.evalCond(c.l) || this.evalCond(c.r);
      case "not":
        return !this.evalCond(c.e);
      case "condname": {
        const field = this.unit.data.conditions.get(c.name);
        if (!field) throw new CobolError(`Condition name '${c.name}' is not defined.`);
        const loc = this.locateField(field, []);
        const raw = this.raw(loc);
        const numeric = !!field.pic && isNumericPic(field.pic);
        const currentNum = numeric ? this.numFromRaw(field, raw) * this.signOf(loc) : 0;
        const currentText = raw.trim();
        const condField = this.unit.data.conditions.get(c.name);
        const conds = condField?.children.flatMap((ch) => ch.cond ?? []) ?? [];
        for (const cv of conds) {
          if (numeric) {
            const from = cv.from.num ?? parseFloat(cv.from.value);
            if (cv.to) {
              const to = cv.to.num ?? parseFloat(cv.to.value);
              if (currentNum >= from && currentNum <= to) return true;
            } else if (currentNum === from) return true;
          } else {
            const from = cv.from.value.trim();
            if (cv.to) {
              const to = cv.to.value.trim();
              if (currentText >= from && currentText <= to) return true;
            } else if (currentText === from) return true;
          }
        }
        return false;
      }
      case "class": {
        const text = this.displayText(c.e).trim();
        let result: boolean;
        switch (c.test) {
          case "NUMERIC":
            result = /^[0-9]+$/.test(text);
            break;
          case "ALPHABETIC":
            result = /^[A-Za-z ]*$/.test(text);
            break;
          case "ALPHABETIC-UPPER":
            result = /^[A-Z ]*$/.test(text);
            break;
          case "ALPHABETIC-LOWER":
            result = /^[a-z ]*$/.test(text);
            break;
          case "POSITIVE": {
            const n = this.num(c.e);
            result = n > 0;
            break;
          }
          case "NEGATIVE": {
            const n = this.num(c.e);
            result = n < 0;
            break;
          }
          case "ZERO":
          case "ZEROS":
          case "ZEROES":
            result = this.num(c.e) === 0;
            break;
          case "SPACE":
          case "SPACES":
            result = text.trim().length === 0;
            break;
          default:
            result = false;
        }
        return c.neg ? !result : result;
      }
      case "between": {
        const v = this.num(c.e);
        const from = this.num(c.from);
        const to = this.num(c.to);
        const result = v >= from && v <= to;
        return c.neg ? !result : result;
      }
      case "rel": {
        const left = this.value(c.left);
        const right = this.value(c.right);
        let cmp: number;
        if (left.numeric && right.numeric) {
          cmp = left.num === right.num ? 0 : left.num < right.num ? -1 : 1;
        } else {
          const a = left.text;
          const b = right.text;
          const len = Math.max(a.length, b.length);
          const pa = a.padEnd(len, " ");
          const pb = b.padEnd(len, " ");
          cmp = pa === pb ? 0 : pa < pb ? -1 : 1;
        }
        switch (c.op) {
          case "=":
            return cmp === 0;
          case "<>":
            return cmp !== 0;
          case "<":
            return cmp < 0;
          case ">":
            return cmp > 0;
          case "<=":
            return cmp <= 0;
          case ">=":
            return cmp >= 0;
        }
      }
    }
  }

  // --------------------------------------------------------------- functions

  private callFunction(e: Extract<Expr, { k: "func" }>): Val {
    const args = e.args.map((a) => {
      const v = this.value(a);
      // Support bare keywords such as FUNCTION TRIM(x LEADING)
      if (a.k === "ref" && !this.findField(a.name) && ["LEADING", "TRAILING", "BOTH"].includes(a.name)) {
        return { text: a.name, numeric: false, num: 0 };
      }
      return v;
    });
    const str = (i: number) => (args[i]?.text ?? "").replace(/ +$/, "");
    const n = (i: number) => (args[i] ? args[i].num || this.numFromText(args[i].text) : 0);
    let text = "";
    let numeric = false;
    let num = 0;
    switch (e.name) {
      case "LENGTH":
        text = String(args[0]?.text.length ?? 0);
        num = parseFloat(text);
        numeric = true;
        break;
      case "UPPER-CASE":
        text = str(0).toUpperCase();
        break;
      case "LOWER-CASE":
        text = str(0).toLowerCase();
        break;
      case "REVERSE":
        text = str(0).split("").reverse().join("");
        break;
      case "TRIM": {
        const mode = (args[1]?.text ?? "BOTH").toUpperCase();
        const base = str(0);
        text = mode === "LEADING" ? base.replace(/^ +/, "") : mode === "TRAILING" ? base.replace(/ +$/, "") : base.trim();
        break;
      }
      case "SUBSTITUTE": {
        // FUNCTION SUBSTITUTE(str, from, to[, from, to, ...])
        let s = str(0);
        for (let i = 1; i + 1 < args.length; i += 2) {
          s = s.split(str(i)).join(str(i + 1));
        }
        text = s;
        break;
      }
      case "CONCAT":
        text = args.map((a) => a.text).join("");
        break;
      case "CHAR": {
        text = String.fromCharCode(Math.floor(n(0)));
        break;
      }
      case "ORD": {
        text = String(str(0).charCodeAt(0));
        numeric = true;
        num = str(0).charCodeAt(0);
        break;
      }
      case "ABS":
        num = Math.abs(n(0));
        numeric = true;
        text = String(num);
        break;
      case "SQRT":
        num = Math.sqrt(n(0));
        numeric = true;
        text = String(num);
        break;
      case "INTEGER":
      case "INTEGER-PART":
        num = Math.trunc(n(0));
        numeric = true;
        text = String(num);
        break;
      case "MOD":
        num = n(0) % n(1);
        numeric = true;
        text = String(num);
        break;
      case "REM":
        num = n(0) - n(1) * Math.trunc(n(0) / n(1));
        numeric = true;
        text = String(num);
        break;
      case "MAX":
      case "ORD-MAX":
        num = Math.max(...args.map((a) => a.num || this.numFromText(a.text)));
        numeric = true;
        text = String(num);
        break;
      case "MIN":
      case "ORD-MIN":
        num = Math.min(...args.map((a) => a.num || this.numFromText(a.text)));
        numeric = true;
        text = String(num);
        break;
      case "SUM":
        num = args.reduce((acc, a) => acc + (a.num || this.numFromText(a.text)), 0);
        numeric = true;
        text = String(num);
        break;
      case "MEAN":
        num = args.length ? args.reduce((acc, a) => acc + (a.num || this.numFromText(a.text)), 0) / args.length : 0;
        numeric = true;
        text = String(num);
        break;
      case "MEDIAN": {
        const nums = args.map((a) => a.num || this.numFromText(a.text)).sort((a, b) => a - b);
        num = nums.length ? nums[Math.floor(nums.length / 2)] : 0;
        numeric = true;
        text = String(num);
        break;
      }
      case "NUMVAL":
      case "NUMVAL-C": {
        const cleaned = str(0).replace(/,/g, "").replace(/ /g, "");
        num = parseFloat(cleaned) || 0;
        numeric = true;
        text = String(num);
        break;
      }
      case "FACTORIAL":
        num = Array.from({ length: Math.floor(n(0)) }, (_, i) => i + 1).reduce((a, b) => a * b, 1);
        numeric = true;
        text = String(num);
        break;
      case "EXP":
        num = Math.exp(n(0));
        numeric = true;
        text = String(num);
        break;
      case "LOG":
        num = Math.log(n(0));
        numeric = true;
        text = String(num);
        break;
      case "LOG10":
        num = Math.log10(n(0));
        numeric = true;
        text = String(num);
        break;
      case "SIN":
      case "COS":
      case "TAN":
        num = e.name === "SIN" ? Math.sin(n(0)) : e.name === "COS" ? Math.cos(n(0)) : Math.tan(n(0));
        numeric = true;
        text = String(num);
        break;
      case "RANDOM":
        num = args.length ? this.seededRandom(n(0)) : Math.random();
        numeric = true;
        text = String(num);
        break;
      case "CURRENT-DATE": {
        const now = new Date();
        const pad = (v: number, w = 2) => String(v).padStart(w, "0");
        text = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${pad(Math.floor(now.getMilliseconds() / 10))}+0000`;
        break;
      }
      case "WHEN-COMPILED":
        text = this.compileStamp();
        break;
      case "DATE-OF-INTEGER": {
        const base = Date.UTC(1600, 11, 31);
        const d = new Date(base + Math.floor(n(0)) * 86400000);
        const pad = (v: number) => String(v).padStart(2, "0");
        text = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
        numeric = true;
        num = parseFloat(text);
        break;
      }
      case "INTEGER-OF-DATE": {
        const t = String(Math.floor(n(0)));
        const y = parseInt(t.slice(0, 4), 10);
        const m = parseInt(t.slice(4, 6), 10);
        const d = parseInt(t.slice(6, 8), 10);
        num = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1600, 11, 31)) / 86400000);
        numeric = true;
        text = String(num);
        break;
      }
      case "DAY-OF-INTEGER": {
        const base = Date.UTC(1600, 11, 31);
        const d = new Date(base + Math.floor(n(0)) * 86400000);
        const start = Date.UTC(d.getUTCFullYear(), 0, 1);
        const day = Math.round((d.getTime() - start) / 86400000) + 1;
        text = `${d.getUTCFullYear()}${String(day).padStart(3, "0")}`;
        numeric = true;
        num = parseFloat(text);
        break;
      }
      case "ABSOLUTE-VALUE":
        num = Math.abs(n(0));
        numeric = true;
        text = String(num);
        break;
      case "CURRENCY-SYMBOL":
        text = "$";
        break;
      case "MONETARY-DECIMAL-POINT":
        text = ".";
        break;
      case "MONETARY-THOUSANDS-SEPARATOR":
        text = ",";
        break;
      case "BYTE-LENGTH":
      case "LENGTH-AN":
        num = utf8Length(args[0]?.text ?? "");
        numeric = true;
        text = String(num);
        break;
      case "NUMVAL-F": {
        const v = parseFloat((args[0]?.text ?? "").replace(/,/g, "").trim());
        num = isFinite(v) ? v : 0;
        numeric = true;
        text = String(num);
        break;
      }
      case "TEST-NUMVAL":
        num = numericErrorPosition(args[0]?.text ?? "", false, false);
        numeric = true;
        text = String(num);
        break;
      case "TEST-NUMVAL-C":
        num = numericErrorPosition(args[0]?.text ?? "", true, true);
        numeric = true;
        text = String(num);
        break;
      case "TEST-NUMVAL-F":
        num = floatErrorPosition(args[0]?.text ?? "");
        numeric = true;
        text = String(num);
        break;
      case "FORMATTED-CURRENT-DATE": {
        const d = new Date();
        const p = (v: number) => String(v).padStart(2, "0");
        text = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}+00:00`;
        break;
      }
      case "FORMATTED-DATE":
        text = formatDayInt(n(0), str(1));
        break;
      case "FORMATTED-TIME":
        text = formatTimeInt(n(0), str(1));
        break;
      case "FORMATTED-DATETIME":
        text = formatTimeInt(n(1), formatDayInt(n(0), str(2)));
        break;
      case "INTEGER-OF-FORMATTED-DATE":
        num = parseFormattedDate(str(0), str(1));
        numeric = true;
        text = String(num);
        break;
      case "TEST-FORMATTED-DATETIME":
        num = parseFormattedDate(str(0), str(1)) !== 0 ? 0 : 1;
        numeric = true;
        text = String(num);
        break;
      case "HIGHEST-ALGEBRAIC":
      case "LOWEST-ALGEBRAIC": {
        const arg = e.args[0];
        const pic = arg && arg.k === "ref" ? this.resolveLoc(arg).field.pic : null;
        if (pic && isNumericPic(pic)) {
          const max = Math.pow(10, pic.digits - pic.decimals) - Math.pow(10, -pic.decimals);
          const v = e.name === "LOWEST-ALGEBRAIC" ? (pic.signed ? -max : 0) : max;
          num = v;
          text = v.toFixed(pic.decimals);
        } else {
          num = 0;
          text = "0";
        }
        numeric = true;
        break;
      }
      case "LOCALE-COMPARE": {
        const a = str(0);
        const b = str(1);
        num = a < b ? -1 : a > b ? 1 : 0;
        numeric = true;
        text = String(num);
        break;
      }
      case "MODULE-ID":
        text = this.unit.name || "PROGRAM";
        break;
      case "MODULE-CALLER-ID":
        text = this.stack.length > 1 ? this.stack[this.stack.length - 2].unit.name : "";
        break;
      case "MODULE-SOURCE":
      case "MODULE-PATH":
        text = `${this.unit.name || "PROGRAM"}.cbl`;
        break;
      case "MODULE-DATE": {
        const d = new Date();
        const p = (v: number) => String(v).padStart(2, "0");
        text = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
        break;
      }
      case "MODULE-TIME": {
        const d = new Date();
        const p = (v: number) => String(v).padStart(2, "0");
        text = `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
        break;
      }
      case "MODULE-FORMATTED-DATE": {
        const d = new Date();
        const p = (v: number) => String(v).padStart(2, "0");
        text = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
        break;
      }
      default:
        this.warnings.push(`Line ${e.line}: intrinsic function ${e.name} is not implemented - zero returned.`);
        num = 0;
        numeric = true;
        text = "0";
    }
    if (e.refmod) {
      const start = Math.floor(this.num(e.refmod.start));
      const len = Math.floor(this.num(e.refmod.len));
      text = text.slice(start - 1, start - 1 + len);
    }
    if (numeric && !text) text = String(num);
    return { text, numeric, num: numeric ? num : parseFloat(text) || 0 };
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  }

  private compileStamp(): string {
    const now = new Date();
    const pad = (v: number) => String(v).padStart(2, "0");
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}+0000`;
  }

  private numFromText(text: string): number {
    const cleaned = text.replace(/,/g, "").trim();
    return parseFloat(cleaned) || 0;
  }
}

/** UTF-8 byte length of a string (for BYTE-LENGTH / LENGTH-AN). */
function utf8Length(s: string): number {
  let bytes = 0;
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    bytes += cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
  }
  return bytes;
}

/** FUNCTION TEST-NUMVAL*: 0 when valid, otherwise the 1-based position of the offending character. */
function numericErrorPosition(s: string, allowCommas: boolean, allowCurrency: boolean): number {
  const t = s.trim();
  if (t === "") return 1;
  let digit = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (ch >= "0" && ch <= "9") {
      digit = true;
      continue;
    }
    if ((ch === "+" || ch === "-") && i === 0) continue;
    if (ch === "." || ch === " ") continue;
    if (allowCommas && ch === ",") continue;
    if (allowCurrency && (ch === "$" || ch === "£" || ch === "€")) continue;
    return i + 1;
  }
  return digit ? 0 : 1;
}

function floatErrorPosition(s: string): number {
  const t = s.trim();
  if (t === "") return 1;
  return /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(t) ? 0 : 1;
}

/** FUNCTION FORMATTED-DATE: render an integer day number using YYYY/YY/DDD/MM/DD tokens. */
function formatDayInt(dayInt: number, fmt: string): string {
  const base = Date.UTC(1600, 11, 31);
  const d = new Date(base + Math.floor(dayInt) * 86400000);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const doy = Math.round((d.getTime() - Date.UTC(y, 0, 1)) / 86400000) + 1;
  const p2 = (v: number) => String(v).padStart(2, "0");
  const p3 = (v: number) => String(v).padStart(3, "0");
  return fmt
    .replace(/YYYY/g, String(y))
    .replace(/YY/g, p2(y % 100))
    .replace(/DDD/g, p3(doy))
    .replace(/MM/g, p2(m))
    .replace(/DD/g, p2(day));
}

/** FUNCTION FORMATTED-TIME: render seconds-since-midnight using hh/mm/ss tokens. */
function formatTimeInt(seconds: number, fmt: string): string {
  const s = ((Math.floor(seconds) % 86400) + 86400) % 86400;
  const p2 = (v: number) => String(v).padStart(2, "0");
  return fmt
    .replace(/hh/gi, p2(Math.floor(s / 3600)))
    .replace(/mm/gi, p2(Math.floor((s % 3600) / 60)))
    .replace(/ss/gi, p2(s % 60));
}

/** FUNCTION INTEGER-OF-FORMATTED-DATE: parse a formatted date back to an integer day number. */
function parseFormattedDate(s: string, fmt: string): number {
  const order: string[] = [];
  const pattern = fmt.replace(/YYYY|YY|DDD|MM|DD/g, (t) => {
    order.push(t);
    return "(\\d+)";
  });
  let m: RegExpMatchArray | null = null;
  try {
    m = s.trim().match(new RegExp("^" + pattern + "$"));
  } catch {
    return 0;
  }
  if (!m) return 0;
  const matched: RegExpMatchArray = m;
  let y = 0;
  let mo = 1;
  let day = 1;
  let doy = 0;
  order.forEach((tok, i) => {
    const v = parseInt(matched[i + 1], 10);
    if (tok === "YYYY") y = v;
    else if (tok === "YY") y = 2000 + v;
    else if (tok === "MM") mo = v;
    else if (tok === "DD") day = v;
    else if (tok === "DDD") doy = v;
  });
  const base = Date.UTC(1600, 11, 31);
  if (doy > 0) return Math.round((Date.UTC(y, 0, 1) + (doy - 1) * 86400000 - base) / 86400000);
  return Math.round((Date.UTC(y, mo - 1, day) - base) / 86400000);
}

interface Loc {
  field: Field;
  storage: string[];
  addr: number;
  len: number;
  refmod: boolean;
}

export type { Paragraph, InspectAction, ProgramUnit };
void expandPicture;
void literalText;
