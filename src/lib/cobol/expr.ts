/** Expression and condition parsing (shared by all statement parsers). */
import type { Lit } from "./data";
import { parseLiteralTok } from "./data";
import type { TokenStream } from "./source";

export interface RefMod {
  start: Expr;
  len: Expr;
}

export type Expr =
  | { k: "lit"; lit: Lit }
  | { k: "ref"; name: string; subs: Expr[]; refmod?: RefMod; line: number }
  | { k: "func"; name: string; args: Expr[]; refmod?: RefMod; line: number }
  | { k: "bin"; op: "+" | "-" | "*" | "/" | "**"; l: Expr; r: Expr }
  | { k: "neg"; e: Expr }
  | { k: "all"; lit: Lit };

export type RelOp = "=" | "<>" | "<" | ">" | "<=" | ">=";

export type Cond =
  | { k: "rel"; left: Expr; op: RelOp; right: Expr; neg?: boolean }
  | { k: "between"; e: Expr; from: Expr; to: Expr; neg?: boolean }
  | { k: "and"; l: Cond; r: Cond }
  | { k: "or"; l: Cond; r: Cond }
  | { k: "not"; e: Cond }
  | { k: "class"; e: Expr; test: string; neg?: boolean }
  | { k: "condname"; name: string }
  | { k: "bool"; value: boolean };

export interface ParseCtx {
  isConditionName: (name: string) => boolean;
}

const FIGURATIVES = new Set([
  "ZERO", "ZEROS", "ZEROES", "SPACE", "SPACES", "HIGH-VALUE", "HIGH-VALUES", "LOW-VALUE", "LOW-VALUES", "QUOTE", "QUOTES", "NULL", "NULLS",
]);

const CLASS_TESTS = new Set([
  "NUMERIC", "ALPHABETIC", "ALPHABETIC-LOWER", "ALPHABETIC-UPPER", "POSITIVE", "NEGATIVE", "ZERO", "ZEROS", "ZEROES", "SPACE", "SPACES",
]);

function parseParenContentKind(ts: TokenStream, openIndex: number): "refmod" | "args" {
  let depth = 0;
  for (let i = openIndex; i < ts.toks.length; i++) {
    const t = ts.toks[i];
    if (t.t === "p" && t.v === "(") depth++;
    else if (t.t === "p" && t.v === ")") {
      depth--;
      if (depth === 0) break;
    } else if (depth === 1 && t.t === "p" && t.v === ":") return "refmod";
    else if (depth === 1 && t.t === "p" && t.v === ",") return "args";
  }
  return "args";
}

export function parseExpr(ts: TokenStream, ctx: ParseCtx): Expr {
  let left = parseTerm(ts, ctx);
  while (ts.isPunct("+") || ts.isPunct("-")) {
    const op = ts.next().v as "+" | "-";
    const right = parseTerm(ts, ctx);
    left = { k: "bin", op, l: left, r: right };
  }
  return left;
}

function parseTerm(ts: TokenStream, ctx: ParseCtx): Expr {
  let left = parsePow(ts, ctx);
  while (ts.isPunct("*") || ts.isPunct("/")) {
    const op = ts.next().v as "*" | "/";
    const right = parsePow(ts, ctx);
    left = { k: "bin", op, l: left, r: right };
  }
  return left;
}

function parsePow(ts: TokenStream, ctx: ParseCtx): Expr {
  const base = parseUnary(ts, ctx);
  if (ts.isPunct("**")) {
    ts.next();
    const exp = parseUnary(ts, ctx);
    return { k: "bin", op: "**", l: base, r: exp };
  }
  return base;
}

function parseUnary(ts: TokenStream, ctx: ParseCtx): Expr {
  if (ts.isPunct("-")) {
    ts.next();
    return { k: "neg", e: parseUnary(ts, ctx) };
  }
  if (ts.isPunct("+")) {
    ts.next();
    return parseUnary(ts, ctx);
  }
  return parsePrimary(ts, ctx);
}

function parsePrimary(ts: TokenStream, ctx: ParseCtx): Expr {
  const t = ts.peek();
  if (!t) throw new Error("Unexpected end of expression");
  if (t.t === "n" || t.t === "s") {
    ts.next();
    return { k: "lit", lit: parseLiteralTok(t)! };
  }
  if (t.t === "w" && t.u === "FUNCTION") {
    ts.next();
    const name = ts.next().u;
    const args: Expr[] = [];
    let refmod: RefMod | undefined;
    if (ts.isPunct("(")) {
      const open = ts.pos;
      const kind = parseParenContentKind(ts, open);
      if (kind === "refmod") {
        refmod = parseRefMod(ts, ctx);
      } else {
        ts.next();
        while (!ts.atEnd && !ts.isPunct(")")) {
          args.push(parseExpr(ts, ctx));
          if (ts.isPunct(",") || ts.isPunct(";")) ts.next();
        }
        ts.acceptPunct(")");
        if (ts.isPunct("(") && parseParenContentKind(ts, ts.pos) === "refmod") {
          refmod = parseRefMod(ts, ctx);
        }
      }
    }
    return { k: "func", name, args, refmod, line: t.line };
  }
  if (t.t === "w" && t.u === "ALL") {
    ts.next();
    const lit = ts.next();
    const parsed = parseLiteralTok(lit);
    if (parsed) return { k: "all", lit: parsed };
    return { k: "ref", name: lit.u, subs: [], line: t.line };
  }
  if (t.t === "w" && FIGURATIVES.has(t.u)) {
    ts.next();
    return { k: "lit", lit: { type: "fig", value: t.u === "ZERO" || t.u === "ZEROS" || t.u === "ZEROES" ? "0" : t.u.startsWith("SPACE") ? " " : t.u.startsWith("QUOTE") ? '"' : "\u0000" } };
  }
  if (t.t === "p" && t.v === "(") {
    ts.next();
    const e = parseExpr(ts, ctx);
    ts.acceptPunct(")");
    return e;
  }
  if (t.t === "w") {
    ts.next();
    const name = t.u;
    let subs: Expr[] = [];
    let refmod: RefMod | undefined;
    if (ts.isPunct("(")) {
      const kind = parseParenContentKind(ts, ts.pos);
      if (kind === "refmod") {
        refmod = parseRefMod(ts, ctx);
      } else {
        ts.next();
        while (!ts.atEnd && !ts.isPunct(")")) {
          subs.push(parseExpr(ts, ctx));
          if (ts.isPunct(",") || ts.isPunct(";")) ts.next();
        }
        ts.acceptPunct(")");
        if (ts.isPunct("(") && parseParenContentKind(ts, ts.pos) === "refmod") {
          refmod = parseRefMod(ts, ctx);
        }
      }
    }
    void ctx;
    return { k: "ref", name, subs, refmod, line: t.line };
  }
  throw new Error(`Unexpected token '${t.v}' in expression on line ${t.line}`);
}

function parseRefMod(ts: TokenStream, ctx: ParseCtx): RefMod {
  ts.acceptPunct("(");
  const start = parseExpr(ts, ctx);
  ts.acceptPunct(":");
  const len = parseExpr(ts, ctx);
  ts.acceptPunct(")");
  return { start, len };
}

export function isRelOpStart(ts: TokenStream): boolean {
  const t = ts.peek();
  if (!t) return false;
  if (t.t === "p" && ["=", "<>", "<", ">", "<=", ">="].includes(t.v)) return true;
  if (t.t === "w" && ["EQUAL", "GREATER", "LESS", "NOT", "IS", "CONTAINS", "MATCHES"].includes(t.u)) return true;
  return false;
}

export function parseCondition(ts: TokenStream, ctx: ParseCtx): Cond {
  let left = parseAnd(ts, ctx);
  while (ts.isWord("OR")) {
    ts.next();
    const right = parseAnd(ts, ctx);
    left = { k: "or", l: left, r: right };
  }
  return left;
}

function parseAnd(ts: TokenStream, ctx: ParseCtx): Cond {
  let left = parseNot(ts, ctx);
  while (ts.isWord("AND")) {
    ts.next();
    const right = parseNot(ts, ctx);
    left = { k: "and", l: left, r: right };
  }
  return left;
}

function parseNot(ts: TokenStream, ctx: ParseCtx): Cond {
  if (ts.isWord("NOT")) {
    // 'NOT' can negate a condition or appear inside a relational phrase
    const save = ts.pos;
    ts.next();
    if (isRelOpStart(ts) || ts.isWord("NUMERIC", "ALPHABETIC", "ALPHABETIC-LOWER", "ALPHABETIC-UPPER", "POSITIVE", "NEGATIVE", "ZERO", "ZEROS", "ZEROES", "SPACE", "SPACES")) {
      ts.pos = save;
      const cond = parseRelation(ts, ctx);
      return cond;
    }
    return { k: "not", e: parseNot(ts, ctx) };
  }
  return parseRelation(ts, ctx);
}

function parenIsCondition(ts: TokenStream): boolean {
  const t = ts.peek();
  if (!t || !(t.t === "p" && t.v === "(")) return false;
  let depth = 0;
  for (let i = ts.pos; i < ts.toks.length; i++) {
    const tok = ts.toks[i];
    if (tok.t === "p" && tok.v === "(") depth++;
    else if (tok.t === "p" && tok.v === ")") {
      depth--;
      if (depth === 0) {
        // A single identifier inside parens is a subscripted expression
        for (let j = ts.pos + 1; j < i; j++) {
          const inner = ts.toks[j];
          if (inner.t === "w" && ["AND", "OR", "NOT", "IS", "EQUAL", "GREATER", "LESS", ...CLASS_TESTS].includes(inner.u)) return true;
          if (inner.t === "p" && ["=", "<>", "<", ">", "<=", ">="].includes(inner.v)) return true;
        }
        return false;
      }
    }
  }
  return false;
}

function parseRelation(ts: TokenStream, ctx: ParseCtx): Cond {
  if (ts.isWord("TRUE")) {
    ts.next();
    return { k: "bool", value: true };
  }
  if (ts.isWord("FALSE")) {
    ts.next();
    return { k: "bool", value: false };
  }
  if (parenIsCondition(ts)) {
    ts.next();
    const inner = parseCondition(ts, ctx);
    ts.acceptPunct(")");
    return inner;
  }
  const left = parseExpr(ts, ctx);
  let neg = false;
  if (ts.isWord("IS")) ts.next();
  if (ts.isWord("NOT")) {
    ts.next();
    neg = true;
  }
  const t = ts.peek();
  if (t && t.t === "w" && CLASS_TESTS.has(t.u)) {
    ts.next();
    return { k: "class", e: left, test: t.u, neg };
  }
  if (t && t.t === "w" && t.u === "BETWEEN") {
    ts.next();
    const from = parseExpr(ts, ctx);
    ts.acceptWord("AND");
    const to = parseExpr(ts, ctx);
    return { k: "between", e: left, from, to, neg };
  }
  let op: RelOp | null = null;
  if (t && t.t === "p") {
    if (["=", "<>", "<", ">", "<=", ">="].includes(t.v)) {
      op = t.v as RelOp;
      ts.next();
    }
  } else if (t && t.t === "w") {
    if (t.u === "EQUAL") {
      ts.next();
      ts.acceptWord("TO");
      op = "=";
    } else if (t.u === "GREATER") {
      ts.next();
      ts.acceptWord("THAN");
      if (ts.acceptWord("OR")) {
        ts.acceptWord("EQUAL");
        ts.acceptWord("TO");
        op = ">=";
      } else {
        ts.acceptWord("TO");
        op = ">";
      }
    } else if (t.u === "LESS") {
      ts.next();
      ts.acceptWord("THAN");
      if (ts.acceptWord("OR")) {
        ts.acceptWord("EQUAL");
        ts.acceptWord("TO");
        op = "<=";
      } else {
        ts.acceptWord("TO");
        op = "<";
      }
    }
  }
  if (op) {
    const right = parseExpr(ts, ctx);
    return { k: "rel", left, op: neg ? negate(op) : op, right };
  }
  if (left.k === "ref" && ctx.isConditionName(left.name)) {
    return { k: "condname", name: left.name };
  }
  // No relational operator: treat as a truthiness test of the value.
  return { k: "rel", left, op: "<>", right: { k: "lit", lit: { type: "fig", value: " " } } };
}

function negate(op: RelOp): RelOp {
  switch (op) {
    case "=":
      return "<>";
    case "<>":
      return "=";
    case "<":
      return ">=";
    case ">":
      return "<=";
    case "<=":
      return ">";
    case ">=":
      return "<";
  }
}
