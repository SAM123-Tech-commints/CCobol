/** Splits a source file into program units and parses each of them. */
import { DataDivisionParser, type ProgramData } from "./data";
import { ProcedureParser, type Procedure } from "./parser";
import { normalizeSource, tokenize, TokenStream } from "./source";

export interface ProgramUnit {
  name: string;
  data: ProgramData;
  procedure: Procedure;
}

export interface ParseResult {
  units: ProgramUnit[];
  errors: string[];
  warnings: string[];
}

export function parseSource(source: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const units: ProgramUnit[] = [];
  const { lines } = normalizeSource(source);
  const toks = tokenize(lines);

  // Split at every IDENTIFICATION DIVISION / ID DIVISION header.
  const starts: number[] = [];
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.t === "w" && (t.u === "IDENTIFICATION" || t.u === "ID") && toks[i + 1]?.t === "w" && toks[i + 1].u === "DIVISION") {
      starts.push(i);
    }
  }
  if (!starts.length) starts.push(0);

  for (let c = 0; c < starts.length; c++) {
    const from = starts[c];
    const to = c + 1 < starts.length ? starts[c + 1] : toks.length;
    // Drop a trailing END PROGRAM name.
    let end = to;
    for (let i = from; i < to; i++) {
      if (toks[i].t === "w" && toks[i].u === "END" && toks[i + 1]?.u === "PROGRAM") {
        end = i;
        break;
      }
    }
    const chunk = toks.slice(from, end);
    if (!chunk.length) continue;
    const unit = parseUnit(chunk, errors, warnings);
    if (unit) units.push(unit);
  }
  return { units, errors, warnings };
}

function parseUnit(chunk: ReturnType<typeof tokenize>, errors: string[], warnings: string[]): ProgramUnit | null {
  // program name
  let name = "MAIN";
  for (let i = 0; i < chunk.length; i++) {
    if (chunk[i].t === "w" && chunk[i].u === "PROGRAM-ID") {
      let j = i + 1;
      if (chunk[j] && chunk[j].t === "p" && chunk[j].v === ".") j++;
      if (chunk[j] && (chunk[j].t === "w" || chunk[j].t === "s")) {
        name = chunk[j].t === "s" ? chunk[j].v.toUpperCase() : chunk[j].u;
      }
      break;
    }
  }

  // locate PROCEDURE DIVISION
  let procIdx = -1;
  for (let i = 0; i < chunk.length; i++) {
    if (chunk[i].t === "w" && chunk[i].u === "PROCEDURE" && chunk[i + 1]?.t === "w" && chunk[i + 1].u === "DIVISION") {
      procIdx = i;
      break;
    }
  }
  const dataEnd = procIdx === -1 ? chunk.length : procIdx;
  const dataStream = new TokenStream(chunk.slice(0, dataEnd));
  const dataParser = new DataDivisionParser(dataStream);
  let data: ProgramData;
  try {
    data = dataParser.parse(procIdx !== -1);
  } catch (e) {
    errors.push(e instanceof Error ? `DATA DIVISION: ${e.message}` : String(e));
    return null;
  }

  if (procIdx === -1) {
    errors.push(`Program ${name}: no PROCEDURE DIVISION found.`);
    return null;
  }

  const procStream = new TokenStream(chunk.slice(procIdx));
  const isConditionName = (n: string) => data.conditions.has(n);
  const procParser = new ProcedureParser(procStream, { isConditionName }, data);
  let procedure: Procedure;
  try {
    procedure = procParser.parse();
  } catch (e) {
    errors.push(e instanceof Error ? `PROCEDURE DIVISION: ${e.message}` : String(e));
    return null;
  }
  warnings.push(...dataParser.warnings, ...procParser.warnings);
  return { name, data, procedure };
}
