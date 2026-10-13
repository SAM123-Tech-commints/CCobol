import { explainCobolLocally, type ExplainLine, type ExplainResult } from "@/lib/cobol/explain";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface ExplainBody {
  code?: string;
  focus?: string;
}

export async function POST(request: Request) {
  let body: ExplainBody;
  try {
    body = (await request.json()) as ExplainBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code : "";
  if (!code.trim()) {
    return Response.json({ error: "No COBOL source was supplied." }, { status: 400 });
  }
  if (code.length > 40_000) {
    return Response.json({ error: "Program is too large to explain (40 KB limit)." }, { status: 413 });
  }

  // Always have the built-in analyzer ready as the fallback.
  const local = explainCobolLocally(code);
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json(local);

  try {
    const ai = await explainWithGemini(code, key, body.focus);
    if (ai) return Response.json(ai);
  } catch {
    // fall through to the local analyzer — explaining must never fail
  }
  return Response.json(local);
}

/** Ask Gemini for a beginner-friendly, line-by-line explanation as strict JSON. */
async function explainWithGemini(code: string, key: string, focus?: string): Promise<ExplainResult | null> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = [
    "You are a patient COBOL teacher explaining a GnuCOBOL program to a first-year student.",
    focus ? `Focus especially on: ${focus}.` : "",
    "Explain EVERY meaningful line (skip blank lines and comments). For each line give one or two sentences saying what it does and, where useful, the plain-English logic (e.g. what a condition tests, what a loop does).",
    'Return ONLY minified JSON with this exact shape: {"overview":"...","lines":[{"line":<1-based number>,"explanation":"..."}]}.',
    "Do not wrap the JSON in markdown fences.",
    "",
    "```cobol",
    code,
    "```",
  ]
    .filter(Boolean)
    .join("\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json", maxOutputTokens: 8192 },
    }),
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  let parsed: { overview?: string; lines?: { line?: number; explanation?: string }[] };
  try {
    parsed = JSON.parse(cleaned) as typeof parsed;
  } catch {
    return null;
  }
  if (!parsed || !Array.isArray(parsed.lines)) return null;

  const source = code.replace(/\r\n?/g, "\n").split("\n");
  const lines: ExplainLine[] = parsed.lines
    .map((l) => {
      const line = typeof l.line === "number" ? l.line : typeof l.line === "string" ? parseInt(l.line, 10) : 0;
      if (!line || line < 1 || line > source.length) return null;
      const explanation = typeof l.explanation === "string" ? l.explanation.trim() : "";
      if (!explanation) return null;
      return { line, code: source[line - 1] ?? "", explanation };
    })
    .filter((l): l is ExplainLine => l !== null);

  if (lines.length === 0) return null;
  return {
    source: "gemini",
    overview: typeof parsed.overview === "string" && parsed.overview.trim() ? parsed.overview.trim() : "AI explanation of this program, line by line.",
    lines,
  };
}
