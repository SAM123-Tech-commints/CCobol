/** Tiny COBOL syntax highlighter used by the lesson code blocks and the editor. */

const KEYWORDS = new Set([
  "IDENTIFICATION", "ID", "DIVISION", "PROGRAM-ID", "AUTHOR", "INSTALLATION", "DATE-WRITTEN", "SECURITY",
  "ENVIRONMENT", "CONFIGURATION", "SOURCE-COMPUTER", "OBJECT-COMPUTER", "SPECIAL-NAMES", "INPUT-OUTPUT",
  "FILE-CONTROL", "SELECT", "ASSIGN", "ORGANIZATION", "ACCESS", "MODE", "RECORD", "KEY", "FILE", "STATUS",
  "RELATIVE", "SEQUENTIAL", "INDEXED", "LINE", "OPTIONAL", "I-O", "DATA", "WORKING-STORAGE", "LOCAL-STORAGE",
  "LINKAGE", "SCREEN", "REPORT", "SECTION", "FD", "PIC", "PICTURE", "VALUE", "VALUES", "OCCURS", "TIMES",
  "REDEFINES", "RENAMES", "USAGE", "COMP", "COMP-1", "COMP-2", "COMP-3", "COMP-4", "COMP-5", "COMPUTATIONAL",
  "BINARY", "PACKED-DECIMAL", "DISPLAY", "POINTER", "SIGN", "LEADING", "TRAILING", "SEPARATE", "JUSTIFIED",
  "JUST", "RIGHT", "BLANK", "WHEN", "ZERO", "ZEROS", "ZEROES", "SPACE", "SPACES", "HIGH-VALUE", "HIGH-VALUES",
  "LOW-VALUE", "LOW-VALUES", "QUOTE", "QUOTES", "NULL", "NULLS", "ALL", "PROCEDURE", "DECLARATIVES", "END",
  "PROGRAM", "ACCEPT", "DISPLAY", "MOVE", "CORRESPONDING", "CORR", "TO", "FROM", "ADD", "SUBTRACT", "MULTIPLY",
  "DIVIDE", "GIVING", "REMAINDER", "ROUNDED", "COMPUTE", "INTO", "BY", "IF", "ELSE", "THEN", "EVALUATE",
  "WHEN", "OTHER", "PERFORM", "VARYING", "UNTIL", "THRU", "THROUGH", "GO", "BACK", "STOP", "RUN", "EXIT",
  "CONTINUE", "GOBACK", "OPEN", "CLOSE", "READ", "WRITE", "REWRITE", "DELETE", "START", "NEXT", "PREVIOUS",
  "INVALID", "AT", "NOT", "ON", "SIZE", "ERROR", "OVERFLOW", "EXCEPTION", "STRING", "UNSTRING", "DELIMITED",
  "POINTER", "TALLYING", "COUNT", "REPLACING", "CONVERTING", "INSPECT", "SEARCH", "SET", "CALL", "USING",
  "RETURNING", "CANCEL", "INITIALIZE", "FUNCTION", "COPY", "REPLACING", "EXEC", "SQL", "END-EXEC", "END-IF",
  "END-EVALUATE", "END-PERFORM", "END-READ", "END-WRITE", "END-REWRITE", "END-DELETE", "END-STRING",
  "END-UNSTRING", "END-SEARCH", "END-CALL", "END-ADD", "END-SUBTRACT", "END-MULTIPLY", "END-DIVIDE",
  "END-COMPUTE", "AND", "OR", "GREATER", "LESS", "EQUAL", "THAN", "IS", "ARE", "NUMERIC", "ALPHABETIC",
  "ALPHABETIC-UPPER", "ALPHABETIC-LOWER", "POSITIVE", "NEGATIVE", "TRUE", "FALSE", "BETWEEN", "IN",
  "WITH", "TEST", "BEFORE", "AFTER", "FILLER", "INDEXED", "ASCENDING", "DESCENDING", "DEPENDING", "ADDRESS",
  "LENGTH", "OF", "FOR", "CONSOLE", "DATE", "TIME", "DAY", "DAY-OF-WEEK", "MOD", "ABS", "SQRT", "UPPER-CASE",
  "LOWER-CASE", "REVERSE", "TRIM", "CURRENT-DATE", "MAX", "MIN", "NUMVAL", "NUMVAL-C", "TYPE", "CLASS-ID",
  "METHOD-ID", "OBJECT", "CREATE", "INTERFACE-ID", "INHERITS", "IMPLEMENTS", "ALLOCATE", "FREE", "RETURNING",
  "GOBACK", "SORT", "MERGE", "RELEASE", "RETURN", "GENERATE", "SUPPRESS", "INITIATE", "TERMINATE", "EXHIBIT",
  "ABSOLUTE-VALUE", "CURRENCY-SYMBOL", "MONETARY-DECIMAL-POINT", "MONETARY-THOUSANDS-SEPARATOR", "BYTE-LENGTH",
  "LENGTH-AN", "NUMVAL-F", "TEST-NUMVAL", "TEST-NUMVAL-C", "TEST-NUMVAL-F", "FORMATTED-DATE", "FORMATTED-TIME",
  "FORMATTED-DATETIME", "FORMATTED-CURRENT-DATE", "INTEGER-OF-FORMATTED-DATE", "TEST-FORMATTED-DATETIME",
  "HIGHEST-ALGEBRAIC", "LOWEST-ALGEBRAIC", "LOCALE-COMPARE", "MODULE-ID", "MODULE-CALLER-ID", "MODULE-DATE",
  "MODULE-TIME", "MODULE-FORMATTED-DATE", "MODULE-PATH", "MODULE-SOURCE", "SUBSTITUTE", "CONCAT", "FACTORIAL",
]);

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Sorted COBOL keyword list for editor autocomplete. */
export const cobolKeywords: string[] = Array.from(KEYWORDS).sort();

function isLevelNumber(token: string): boolean {
  return /^\d{1,2}$/.test(token);
}

function isNumber(token: string): boolean {
  return /^\d+(\.\d+)?$/.test(token);
}

function highlightFragment(text: string): string {
  const parts = text.split(/([A-Za-z0-9][A-Za-z0-9-]*)/g);
  let out = "";
  for (const part of parts) {
    if (!part) continue;
    if (/^[A-Za-z0-9]/.test(part)) {
      const upper = part.toUpperCase();
      if (KEYWORDS.has(upper)) out += `<span class="t-kw">${escapeHtml(part)}</span>`;
      else if (isLevelNumber(part)) out += `<span class="t-lvl">${escapeHtml(part)}</span>`;
      else if (isNumber(part)) out += `<span class="t-num">${escapeHtml(part)}</span>`;
      else out += escapeHtml(part);
    } else {
      out += escapeHtml(part);
    }
  }
  return out;
}

export function highlightCobol(code: string): string {
  const lines = code.replace(/\r\n?/g, "\n").split("\n");
  return lines
    .map((line) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith("*") || trimmed.startsWith("*>") || trimmed.startsWith("/")) {
        return `<span class="t-cm">${escapeHtml(line)}</span>`;
      }
      if (!line) return "";
      const chunks = line.split(/('(?:[^']|'')*'|"(?:[^"]|"")*")/g);
      return chunks
        .map((chunk, i) => {
          if (!chunk) return "";
          if (i % 2 === 1) return `<span class="t-str">${escapeHtml(chunk)}</span>`;
          return highlightFragment(chunk);
        })
        .join("");
    })
    .join("\n");
}
