import { db } from "@/db";
import { runs } from "@/db/schema";
import { run as runCobol } from "@/lib/cobol/runtime";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface RunBody {
  code?: string;
  stdin?: string;
  files?: Record<string, string>;
  shareId?: string;
}

export async function POST(request: Request) {
  let body: RunBody;
  try {
    body = (await request.json()) as RunBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code : "";
  if (!code.trim()) {
    return Response.json({ error: "No COBOL source was supplied." }, { status: 400 });
  }
  if (code.length > 200_000) {
    return Response.json({ error: "Program is too large (200 KB limit)." }, { status: 413 });
  }
  // COBOL-only compiler: reject anything that is not COBOL source.
  if (!isCobolSource(code)) {
    return Response.json(
      {
        output: "",
        fileOutput: {},
        errors: [
          "Only COBOL is supported here. Your program must contain an IDENTIFICATION DIVISION and a PROCEDURE DIVISION (GnuCOBOL-compatible COBOL only).",
        ],
        warnings: [],
        runMs: 0,
      },
      { status: 200 },
    );
  }

  const files: Record<string, string> = {};
  if (body.files && typeof body.files === "object") {
    for (const [name, content] of Object.entries(body.files)) {
      if (typeof name === "string" && typeof content === "string" && name.length < 80 && content.length < 200_000) {
        files[name] = content;
      }
    }
  }

  const result = runCobol(code, {
    stdin: typeof body.stdin === "string" ? body.stdin.slice(0, 100_000) : "",
    files,
  });

  try {
    await db.insert(runs).values({
      shareId: body.shareId ?? null,
      ok: result.errors.length === 0,
      outputBytes: result.output.length,
      runMs: result.runMs,
    });
  } catch {
    // logging must never break a run (also: no DATABASE_URL on Vercel)
  }

  return Response.json(result);
}

function isCobolSource(code: string): boolean {
  const upper = code.toUpperCase();
  return upper.includes("IDENTIFICATION DIVISION") || upper.includes("PROCEDURE DIVISION");
}
