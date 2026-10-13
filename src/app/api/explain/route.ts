import { explainCobolLocally, type ExplainLine, type ExplainResult } from "@/lib/cobol/explain";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface ExplainBody {
  code?: string;
  focus?: string;
  /** When present, the request is a chat question about the code (not a full explanation). */
  question?: string;
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

  const key = process.env.GEMINI_API_KEY;
  const question = typeof body.question === "string" ? body.question.trim() : "";

  // ---- chat mode: answer a follow-up question about the code ----
  if (question) {
    if (key) {
      try {
        const ai = await askWithGemini(code, question, key);
        if (ai) return Response.json(ai);
      } catch {
        // fall through to the built-in answer
      }
    }
    const local = explainCobolLocally(code);
    return Response.json({
      source: "local" as const,
      answer:
        `I'm the built-in analyzer (no AI key configured), so I can answer broadly.\n\n${local.overview}\n\n` +
        `For free-form questions like "${question}" add GEMINI_API_KEY on Vercel to enable full AI answers.`,
    });
  }

  // ---- explain mode: full line-by-line breakdown ----
  const local = explainCobolLocally(code);
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

  const text = await geminiText(prompt, key, model, "application/json");
  if (!text) return null;
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
    overview:
      typeof parsed.overview === "string" && parsed.overview.trim()
        ? parsed.overview.trim()
        : "AI explanation of this program, line by line.",
    lines,
  };
}

/** Answer a free-form question about the code. */
async function askWithGemini(code: string, question: string, key: string): Promise<{ source: "gemini"; answer: string } | null> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = [
    "You are a friendly COBOL tutor inside an online compiler. Answer the student's question about THEIR program.",
    "Be concise and practical. Refer to line numbers when helpful. Use short code snippets where useful.",
    "If the question is not about COBOL or this program, gently steer back.",
    "",
    "Program:",
    "```cobol",
    code,
    "```",
    "",
    `Question: ${question}`,
  ].join("\n");

  const answer = await geminiText(prompt, key, model, "text/plain");
  if (!answer) return null;
  return { source: "gemini", answer: answer.trim() };
}

/** Shared Gemini call. Returns the concatenated text, or null on any failure. */
async function geminiText(prompt: string, key: string, model: string, mime: string): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, responseMimeType: mime, maxOutputTokens: 8192 },
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
  return text || null;
}
