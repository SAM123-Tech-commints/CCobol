/**
 * COBOL DATA DIVISION support: PICTURE clauses, record layout (with OCCURS,
 * REDEFINES and 88-level condition names) and ENVIRONMENT DIVISION file control.
 */
import type { Tok, TokenStream } from "./source";

export type PicKind = "numeric" | "alphabetic" | "alnum" | "edited";

export interface PicInfo {
  raw: string;
  kind: PicKind;
  size: number;
  digits: number;
  decimals: number;
  signed: boolean;
}

export interface Lit {
  type: "str" | "num" | "fig";
  value: string;
  num?: number;
  decimals?: number;
}

export interface CondValue {
  from: Lit;
  to?: Lit;
}

export interface Field {
  id: number;
  name: string;
  level: number;
  pic: PicInfo | null;
  usage: string;
  parent: Field | null;
  children: Field[];
  occurs: number | null;
  occursDepends: string | null;
  indexedBy: string[];
  redefines: Field | null;
  value: Lit | null;
  offset: number;
  elemSize: number;
  totalSize: number;
  absOffset: number;
  storage: string[] | null;
  isFiller: boolean;
  cond: CondValue[] | null;
  keys: { dir: "ASCENDING" | "DESCENDING"; name: string }[];
  signSeparate: boolean;
  belongsToFile: string | null;
  /** sign of the VALUE clause literal (negative literals keep their sign) */
  valueSign: number;
}

let fieldIdSeq = 1;

export function newField(level: number, name: string, parent: Field | null): Field {
  return {
    id: fieldIdSeq++,
    name: name.toUpperCase(),
    level,
    pic: null,
    usage: "DISPLAY",
    parent,
    children: [],
    occurs: null,
    occursDepends: null,
    indexedBy: [],
    redefines: null,
    value: null,
    offset: 0,
    elemSize: 0,
    totalSize: 0,
    absOffset: 0,
    storage: null,
    isFiller: name.toUpperCase() === "FILLER",
    cond: null,
    keys: [],
    signSeparate: false,
    belongsToFile: null,
    valueSign: 1,
  };
}

export function expandPicture(raw: string): string {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "(") {
      let num = "";
      let j = i + 1;
      while (j < raw.length && raw[j] !== ")") {
        num += raw[j];
        j++;
      }
      const count = parseInt(num, 10);
      const prev = out[out.length - 1] ?? "";
      const pair = raw.slice(i - 2, i).toUpperCase();
      if (pair === "CR" || pair === "DB") {
        out = out.slice(0, -2);
        for (let k = 0; k < count; k++) out += pair;
      } else {
        for (let k = 1; k < count; k++) out += prev;
      }
      i = j;
      continue;
    }
    out += ch;
  }
  return out;
}

export function parsePicture(raw: string): PicInfo | null {
  const expanded = expandPicture(raw).toUpperCase();
  if (!expanded) return null;
  const chars = expanded.split("");
  const hasV = chars.includes("V");
  const hasP = chars.includes("P");
  const hasNine = chars.includes("9");
  const hasA = chars.includes("A");
  const hasX = chars.includes("X");
  const editSymbols = chars.filter((c) => "ZB0*$+-,./".includes(c) && c !== "");
  const hasEdit = chars.some((c) => "Z$*".includes(c)) || (chars.includes(",") && hasNine) || (chars.includes(".") && hasNine) || chars.includes("+") || chars.includes("-") || expanded.includes("CR") || expanded.includes("DB");

  let kind: PicKind;
  if (hasEdit && (hasNine || hasEdit)) kind = "edited";
  else if (hasX) kind = "alnum";
  else if (hasNine && !hasA) kind = "numeric";
  else if (hasA && !hasNine) kind = "alphabetic";
  else if (hasA && hasNine) kind = "alnum";
  else kind = "alnum";

  const signed = chars[0] === "S";
  let digits = 0;
  let decimals = 0;
  let afterV = false;
  let size = 0;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === "9") {
      digits++;
      if (afterV) decimals++;
      size++;
    } else if (c === "V") {
      afterV = true;
    } else if (c === "P") {
      afterV = true;
    } else if (c === "." && kind === "edited") {
      afterV = true;
      size++;
    } else if (c === "S") {
      // no storage
    } else if (c === "A" || c === "X") {
      size++;
    } else if (c === "Z" || c === "*" || c === "$" || c === "," || c === "." || c === "+" || c === "-" || c === "B" || c === "0") {
      size++;
    } else if ((c === "C" || c === "D" || c === "R" || c === "B") && expanded.slice(i, i + 2).match(/^(CR|DB)$/)) {
      size += 1; // second char of CR/DB adds the other position
    }
  }
  if (kind === "edited") {
    let afterDot = false;
    let editedDigits = 0;
    let editedDecimals = 0;
    for (const c of chars) {
      if (c === ".") {
        afterDot = true;
        continue;
      }
      if ("9Z*$".includes(c)) {
        editedDigits++;
        if (afterDot) editedDecimals++;
      }
    }
    digits = editedDigits;
    decimals = editedDecimals;
  }

  if (kind === "numeric" && digits === 0) kind = "alnum";
  if ((kind === "alphabetic" || kind === "alnum") && size === 0) size = chars.length;
  if (kind === "numeric" && size === 0) size = digits;
  return { raw, kind, size, digits, decimals, signed };
}

export function isNumericField(f: Field): boolean {
  return !!f.pic && (f.pic.kind === "numeric" || f.pic.kind === "edited") && f.children.length === 0;
}

/** Compute offsets / sizes for a record tree. */
export function layout(f: Field): number {
  // 88 (condition names) and 66 (RENAMES) levels occupy no storage.
  const storageChildren = f.children.filter((c) => c.level !== 88 && c.level !== 66);
  if (storageChildren.length === 0) {
    f.elemSize = f.pic ? f.pic.size : 0;
  } else {
    let off = 0;
    for (const child of storageChildren) {
      const size = layout(child);
      if (child.redefines) {
        child.offset = child.redefines.offset;
      } else {
        child.offset = off;
        off += size;
      }
    }
    f.elemSize = off;
  }
  f.totalSize = f.elemSize * (f.occurs ?? 1);
  return f.totalSize;
}

export function assignAbs(root: Field): void {
  const walk = (f: Field, base: number) => {
    f.absOffset = base + f.offset;
    for (const c of f.children) walk(c, f.absOffset);
  };
  walk(root, 0);
}

export interface FileSpec {
  name: string;
  assign: string;
  organization: "SEQUENTIAL" | "LINE SEQUENTIAL" | "INDEXED" | "RELATIVE";
  accessMode: "SEQUENTIAL" | "RANDOM" | "DYNAMIC";
  relativeKey: string | null;
  recordKey: string | null;
  fileStatus: string | null;
  recordField: Field | null;
  isOptional: boolean;
}

export interface ProgramData {
  fields: Field[]; // 01 level records (working storage / local storage)
  linkage: Field[];
  fileSections: Field[]; // 01 level records in FILE SECTION
  files: Map<string, FileSpec>;
  byName: Map<string, Field>;
  conditions: Map<string, Field>;
  indexes: Map<string, Field>;
}

export function parseLiteralTok(t: Tok): Lit | null {
  if (t.t === "s") return { type: "str", value: t.v };
  if (t.t === "n") {
    const decimals = t.v.includes(".") ? t.v.length - t.v.indexOf(".") - 1 : 0;
    return { type: "num", value: t.v, num: parseFloat(t.v), decimals };
  }
  if (t.t === "w") {
    const figs: Record<string, string> = {
      ZERO: "0",
      ZEROS: "0",
      ZEROES: "0",
      SPACE: " ",
      SPACES: " ",
      "HIGH-VALUE": "\u007f",
      "HIGH-VALUES": "\u007f",
      "LOW-VALUE": "\u0000",
      "LOW-VALUES": "\u0000",
      QUOTE: '"',
      QUOTES: '"',
      NULL: "\u0000",
      NULLS: "\u0000",
    };
    if (figs[t.u]) return { type: "fig", value: figs[t.u] };
  }
  return null;
}

function isLevelNumber(text: string): boolean {
  if (!/^[0-9]{1,2}$/.test(text)) return false;
  const n = parseInt(text, 10);
  return (n >= 1 && n <= 49) || n === 66 || n === 77 || n === 88;
}

const LEVELS = new Set([
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39",
  "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "66", "77", "88",
]);

/**
 * Parses ENVIRONMENT + DATA divisions from a token stream (already positioned
 * at the start of ENVIRONMENT DIVISION / DATA DIVISION).
 */
export class DataDivisionParser {
  data: ProgramData = {
    fields: [],
    linkage: [],
    fileSections: [],
    files: new Map(),
    byName: new Map(),
    conditions: new Map(),
    indexes: new Map(),
  };
  private stack: Field[] = [];
  private currentFile: string | null = null;
  private lastField: Field | null = null;
  warnings: string[] = [];

  constructor(private ts: TokenStream) {}

  /** Parse tokens until PROCEDURE DIVISION (or end). */
  parse(stopAtProcedure = true): ProgramData {
    const ts = this.ts;
    while (!ts.atEnd) {
      const t = ts.peek();
      if (!t) break;
      if (t.t === "w" && t.u === "PROCEDURE" ) {
        const n = ts.peek(1);
        if (n && n.t === "w" && n.u === "DIVISION") {
          if (stopAtProcedure) break;
        }
      }
      if (t.t === "w" && t.u === "SELECT") {
        this.parseSelect();
        continue;
      }
      if (t.t === "w" && t.u === "FD") {
        this.parseFd();
        continue;
      }
      if (t.t === "w" && (t.u === "SD")) {
        ts.readUntilPeriod();
        this.currentFile = null;
        continue;
      }
      if (t.t === "n" && isLevelNumber(t.v)) {
        this.parseEntry();
        continue;
      }
      if (t.t === "w" && ["WORKING-STORAGE", "FILE", "LOCAL-STORAGE", "LINKAGE", "SCREEN", "REPORT"].includes(t.u) && ts.peek(1)?.u === "SECTION") {
        ts.next();
        ts.next();
        ts.acceptSeparators();
        this.stack = [];
        this.currentFile = t.u === "FILE" ? this.currentFile : null;
        this.linkage = t.u === "LINKAGE";
        continue;
      }
      // skip anything else (paragraph headers such as FILE-CONTROL, AUTHOR, ...)
      ts.next();
      if (ts.isPunct(".")) ts.acceptSeparators();
    }
    this.finish();
    return this.data;
  }

  private finish() {
    // layout every root
    const roots = [...this.data.fields, ...this.data.fileSections, ...this.data.linkage];
    for (const root of roots) {
      layout(root);
      assignAbs(root);
      const buf = new Array<string>(root.totalSize).fill(" ");
      root.storage = buf;
      this.initValues(root);
    }
  }

  private initValues(root: Field) {
    const storage = root.storage;
    if (!storage) return;
    const walk = (f: Field) => {
      const base = f.absOffset - root.absOffset;
      const occurrences = f.occurs ?? 1;
      for (let occ = 0; occ < occurrences; occ++) {
        const addr = base + occ * f.elemSize;
        if (f.children.length === 0 && f.pic) {
          const size = f.pic.size;
          if (f.value) {
            const text = literalText(f.value, f.pic);
            for (let k = 0; k < size; k++) storage[addr + k] = text[k] ?? (isNumericPic(f.pic) ? "0" : " ");
          } else if (isNumericPic(f.pic)) {
            for (let k = 0; k < size; k++) storage[addr + k] = "0";
          } else if (f.level !== 88) {
            for (let k = 0; k < size; k++) storage[addr + k] = " ";
          }
        }
      }
      for (const c of f.children) walk(c);
    };
    // default-fill groups without VALUE
    walk(root);
    // group items initialised with a VALUE clause
    if (root.value && root.children.length > 0) {
      const text = root.value.value;
      for (let k = 0; k < root.totalSize; k++) storage[k] = text[k] ?? " ";
    }
  }

  private parseSelect() {
    const ts = this.ts;
    ts.next(); // SELECT
    const nameTok = ts.next();
    const spec: FileSpec = {
      name: nameTok.u,
      assign: nameTok.u,
      organization: "SEQUENTIAL",
      accessMode: "SEQUENTIAL",
      relativeKey: null,
      recordKey: null,
      fileStatus: null,
      recordField: null,
      isOptional: false,
    };
    while (!ts.atEnd) {
      const t = ts.peek();
      if (!t) break;
      if (t.t === "p" && t.v === ".") {
        ts.acceptSeparators();
        break;
      }
      if (t.t === "w" && t.u === "ASSIGN") {
        ts.next();
        ts.acceptWord("TO");
        const target = ts.next();
        if (target.t === "s") spec.assign = target.v;
        else spec.assign = target.u;
        continue;
      }
      if (t.t === "w" && t.u === "ORGANIZATION") {
        ts.next();
        ts.acceptWord("IS");
        const org = ts.next().u;
        if (org === "INDEXED") spec.organization = "INDEXED";
        else if (org === "RELATIVE") spec.organization = "RELATIVE";
        else if (org === "LINE" || org === "SEQUENTIAL") {
          spec.organization = ts.isWord("SEQUENTIAL") ? "LINE SEQUENTIAL" : "SEQUENTIAL";
          if (spec.organization === "LINE SEQUENTIAL") ts.next();
        }
        continue;
      }
      if (t.t === "w" && t.u === "ACCESS") {
        ts.next();
        ts.acceptWord("MODE");
        ts.acceptWord("IS");
        const mode = ts.next().u;
        if (mode === "RANDOM") spec.accessMode = "RANDOM";
        else if (mode === "DYNAMIC") spec.accessMode = "DYNAMIC";
        continue;
      }
      if (t.t === "w" && t.u === "RELATIVE") {
        ts.next();
        ts.acceptWord("KEY");
        ts.acceptWord("IS");
        spec.relativeKey = ts.next().u;
        continue;
      }
      if (t.t === "w" && t.u === "RECORD") {
        ts.next();
        ts.acceptWord("KEY");
        ts.acceptWord("IS");
        spec.recordKey = ts.next().u;
        continue;
      }
      if (t.t === "w" && t.u === "FILE") {
        ts.next();
        ts.acceptWord("STATUS");
        ts.acceptWord("IS");
        spec.fileStatus = ts.next().u;
        continue;
      }
      if (t.t === "w" && t.u === "OPTIONAL") {
        ts.next();
        spec.isOptional = true;
        continue;
      }
      ts.next();
    }
    this.data.files.set(spec.name, spec);
  }

  private parseFd() {
    const ts = this.ts;
    ts.next(); // FD
    const name = ts.next().u;
    this.currentFile = name;
    if (!this.data.files.has(name)) {
      // An FD without a SELECT: create a default line-sequential file so that
      // the program still compiles (with a warning) instead of failing hard.
      this.data.files.set(name, {
        name,
        assign: name,
        organization: "SEQUENTIAL",
        accessMode: "SEQUENTIAL",
        relativeKey: null,
        recordKey: null,
        fileStatus: null,
        recordField: null,
        isOptional: true,
      });
    }
    ts.readUntilPeriod();
    this.stack = [];
  }

  private parseEntry() {
    const ts = this.ts;
    const level = parseInt(ts.next().v, 10);
    let name = "FILLER";
    if (ts.isWord("FILLER")) {
      ts.next();
    } else if (ts.peek() && ts.peek()!.t === "w" && !["PIC", "PICTURE", "VALUE", "OCCURS", "REDEFINES", "USAGE", "COMP", "COMP-3", "BINARY", "INDEXED", "SIGN", "JUSTIFIED", "BLANK", "EXTERNAL", "GLOBAL", "TIMES"].includes(ts.peek()!.u)) {
      name = ts.next().u;
    }
    const inFileSection = this.currentFile !== null && this.stack.length === 0;

    if (level === 88) {
      const target = this.lastField;
      const conds: CondValue[] = [];
      while (!ts.atEnd && !ts.isPunct(".")) {
        if (ts.acceptWord("VALUE") || ts.acceptWord("VALUES")) {
          ts.acceptWord("IS");
          ts.acceptWord("ARE");
          continue;
        }
        if (ts.acceptWord("THRU") || ts.acceptWord("THROUGH")) {
          const to = ts.next();
          const lit = parseLiteralTok(to);
          if (lit && conds.length) conds[conds.length - 1].to = lit;
          continue;
        }
        if (ts.isPunct(",")) {
          ts.next();
          continue;
        }
        const lit = parseLiteralTok(ts.peek()!);
        if (lit) {
          ts.next();
          conds.push({ from: lit });
        } else {
          ts.next();
        }
      }
      ts.acceptSeparators();
      if (target) {
        const condField = newField(88, name, target);
        condField.cond = conds;
        target.children.push(condField); // 88 levels hold no storage (see layout())
        this.data.conditions.set(condField.name, target);
        this.data.byName.set(condField.name, target);
        this.lastField = target;
      }
      return;
    }

    // find parent from stack
    while (this.stack.length && this.stack[this.stack.length - 1].level >= level) this.stack.pop();
    const parent = this.stack.length ? this.stack[this.stack.length - 1] : null;
    const field = newField(level, name, parent);
    if (parent) parent.children.push(field);
    else if (inFileSection) {
      this.data.fileSections.push(field);
      field.belongsToFile = this.currentFile;
      const spec = this.currentFile ? this.data.files.get(this.currentFile) : null;
      if (spec) spec.recordField = field;
    } else if (this.isLinkage()) {
      this.data.linkage.push(field);
    } else {
      this.data.fields.push(field);
    }
    this.stack.push(field);
    if (!field.isFiller) this.data.byName.set(field.name, field);

    // clauses
    let done = false;
    while (!ts.atEnd && !done) {
      const t = ts.peek();
      if (!t) break;
      if (t.t === "p" && t.v === ".") {
        ts.acceptSeparators();
        break;
      }
      if (t.t === "w" && (t.u === "PIC" || t.u === "PICTURE")) {
        ts.next();
        ts.acceptWord("IS");
        const picTok = ts.next();
        field.pic = parsePicture(picTok.v);
        continue;
      }
      if (t.t === "w" && t.u === "VALUE" || t.u === "VALUES") {
        ts.next();
        ts.acceptWord("IS");
        ts.acceptWord("ARE");
        let neg = false;
        if (ts.isPunct("-")) {
          ts.next();
          neg = true;
        }
        const litTok = ts.next();
        const lit = parseLiteralTok(litTok);
        if (lit) {
          if (neg && lit.type === "num") {
            lit.num = -(lit.num ?? 0);
            field.valueSign = -1;
          }
          field.value = lit;
        }
        continue;
      }
      if (t.t === "w" && t.u === "OCCURS") {
        ts.next();
        const n = ts.next();
        field.occurs = parseInt(n.v, 10) || 1;
        if (ts.acceptWord("TO")) {
          const max = ts.next();
          field.occurs = parseInt(max.v, 10) || 1;
          if (ts.acceptWord("TIMES")) {
            /* consumed */
          }
          if (ts.acceptWord("DEPENDING")) {
            ts.acceptWord("ON");
            field.occursDepends = ts.next().u;
          }
        } else {
          ts.acceptWord("TIMES");
        }
        continue;
      }
      if (t.t === "w" && t.u === "INDEXED") {
        ts.next();
        ts.acceptWord("BY");
        while (ts.peek() && ts.peek()!.t === "w") {
          const idxName = ts.next().u;
          field.indexedBy.push(idxName);
          const idxField = newField(1, idxName, null);
          idxField.pic = { raw: "9(9)", kind: "numeric", size: 9, digits: 9, decimals: 0, signed: true };
          layout(idxField);
          const buf = new Array<string>(9).fill("0");
          idxField.storage = buf;
          this.data.indexes.set(idxName, idxField);
          if (ts.isPunct(",")) ts.next();
          else break;
        }
        continue;
      }
      if (t.t === "w" && t.u === "ASCENDING" || t.u === "DESCENDING") {
        const dir = t.u as "ASCENDING" | "DESCENDING";
        ts.next();
        ts.acceptWord("KEY");
        ts.acceptWord("IS");
        while (ts.peek() && ts.peek()!.t === "w") {
          field.keys.push({ dir, name: ts.next().u });
          if (ts.isPunct(",")) ts.next();
          else break;
        }
        continue;
      }
      if (t.t === "w" && t.u === "REDEFINES") {
        ts.next();
        const target = ts.next().u;
        const sibling = parent ? parent.children.find((c) => c.name === target) : null;
        if (sibling) field.redefines = sibling;
        continue;
      }
      if (t.t === "w" && t.u === "USAGE") {
        ts.next();
        ts.acceptWord("IS");
        field.usage = ts.next().u;
        continue;
      }
      if (t.t === "w" && ["COMP", "COMP-1", "COMP-2", "COMP-3", "COMP-4", "COMP-5", "COMPUTATIONAL", "BINARY", "PACKED-DECIMAL", "DISPLAY", "POINTER"].includes(t.u)) {
        field.usage = t.u;
        ts.next();
        if (field.usage === "POINTER") {
          field.pic = { raw: "9(9)", kind: "numeric", size: 9, digits: 9, decimals: 0, signed: true };
        }
        continue;
      }
      if (t.t === "w" && t.u === "SIGN") {
        ts.next();
        if (ts.acceptWord("IS")) {
          /* noop */
        }
        if (ts.acceptWord("LEADING") || ts.acceptWord("TRAILING")) {
          /* noop */
        }
        if (ts.acceptWord("SEPARATE")) {
          field.signSeparate = true;
          if (field.pic) field.pic.size += 1;
        }
        continue;
      }
      if (t.t === "w" && (t.u === "JUSTIFIED" || t.u === "JUST")) {
        ts.next();
        ts.acceptWord("RIGHT");
        continue;
      }
      if (t.t === "w" && t.u === "BLANK") {
        ts.next();
        ts.acceptWord("WHEN");
        ts.acceptWord("ZERO");
        continue;
      }
      if (t.t === "w" && t.u === "SYNCHRONIZED") {
        ts.next();
        continue;
      }
      if (t.t === "w" && t.u === "RENAMES") {
        break;
      }
      ts.next();
    }
    this.lastField = field;
  }

  private linkage = false;

  private isLinkage(): boolean {
    return this.linkage;
  }

  setLinkage(v: boolean) {
    this.linkage = v;
  }
}

export function isNumericPic(pic: PicInfo | null): boolean {
  return !!pic && (pic.kind === "numeric" || pic.kind === "edited");
}

export function literalText(lit: Lit, pic: PicInfo | null): string {
  if (lit.type === "fig") {
    if (!pic) return lit.value;
    const fill = lit.value === "0" ? "0" : lit.value;
    return fill.repeat(pic.size);
  }
  if (lit.type === "str") return lit.value.slice(0, pic ? pic.size : lit.value.length).padEnd(pic ? pic.size : lit.value.length, " ");
  // numeric
  if (!pic) return lit.value;
  return formatNumericInto(lit.num ?? parseFloat(lit.value), pic);
}

export function formatNumericInto(n: number, pic: PicInfo): string {
  const neg = n < 0;
  const scaled = Math.round(Math.abs(n) * Math.pow(10, pic.decimals));
  let digits = String(scaled);
  if (digits.length > pic.digits) digits = digits.slice(digits.length - pic.digits);
  while (digits.length < pic.digits) digits = "0" + digits;
  const chars = expandPicture(pic.raw).toUpperCase().split("");
  let out = "";
  let idx = 0;
  let significant = false;
  for (const ch of chars) {
    if (ch === "V" || ch === "S" || ch === "P") continue;
    if (ch === "9") {
      out += digits[idx++] ?? "0";
      significant = true;
      continue;
    }
    if (ch === "Z" || ch === "*" || ch === "$") {
      const digit = digits[idx++] ?? "0";
      if (ch === "$") {
        if (significant || digit !== "0") {
          out += "$";
          significant = true;
        } else {
          out += " ";
        }
      } else if (ch === "*") {
        if (!significant && digit === "0") out += "*";
        else {
          out += digit;
          significant = true;
        }
      } else {
        if (!significant && digit === "0") out += " ";
        else {
          out += digit;
          significant = true;
        }
      }
      continue;
    }
    if (ch === ",") {
      out += significant ? "," : " ";
      continue;
    }
    if (ch === ".") {
      out += ".";
      significant = true;
      continue;
    }
    if (ch === "B") {
      out += " ";
      continue;
    }
    if (ch === "+") {
      out += neg ? "-" : "+";
      continue;
    }
    if (ch === "-") {
      out += neg ? "-" : " ";
      continue;
    }
    out += ch;
  }
  return out.slice(0, pic.size);
}
