export const dynamic = "force-dynamic";
export const maxDuration = 20;

interface GradeBody {
  given?: string;
  expected?: string;
}

const norm = (s: string) =>
  s
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .trim()
    .replace(/\s+/g, " ");

/** Lenient answer check: exact (ignoring case/punctuation/spaces), then a short
 *  AI judgement when a Gemini key is configured. Used by the quizzes so typing
 *  "caps lock" differences or a close word still counts. */
export async function POST(request: Request) {
  let body: GradeBody;
  try {
    body = (await request.json()) as GradeBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const given = typeof body.given === "string" ? body.given : "";
  const expected = typeof body.expected === "string" ? body.expected : "";
  const g = norm(given);
  const e = norm(expected);

  if (g && e && (g === e || e.includes(g) || g.includes(e))) {
    return Response.json({ correct: true, source: "local" });
  }
  if (!g || !e) return Response.json({ correct: false, source: "local" });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ correct: false, source: "local" });

  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const prompt = [
      "You grade a single COBOL quiz answer. Be lenient about capitalisation, spacing, spelling and small word-order differences, but reject answers that are a different concept.",
      `Correct answer: "${expected}"`,
      `Student answer: "${given}"`,
      "Reply with ONLY the word YES or NO.",
    ].join("\n");
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0, maxOutputTokens: 8 },
        }),
      },
    );
    if (!res.ok) return Response.json({ correct: false, source: "local" });
    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
    return Response.json({ correct: /^\s*yes/i.test(text), source: "gemini" });
  } catch {
    return Response.json({ correct: false, source: "local" });
  }
}
