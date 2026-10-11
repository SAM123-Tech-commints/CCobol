import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { snippets } from "@/db/schema";

export const dynamic = "force-dynamic";

function makeShareId(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shareId = url.searchParams.get("shareId");
  try {
    if (shareId) {
      const rows = await db.select().from(snippets).where(eq(snippets.shareId, shareId)).limit(1);
      if (!rows.length) return Response.json({ error: "Program not found" }, { status: 404 });
      return Response.json({ program: rows[0] });
    }
    const rows = await db.select().from(snippets).orderBy(desc(snippets.id)).limit(12);
    return Response.json({ programs: rows });
  } catch {
    // No database configured (e.g. plain Vercel deploy) - sharing is disabled.
    return Response.json({ programs: [], sharingDisabled: true });
  }
}

export async function POST(request: Request) {
  let body: { title?: string; code?: string; stdin?: string; files?: Record<string, string> };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const code = (body.code ?? "").trim();
  if (!code) return Response.json({ error: "Nothing to save." }, { status: 400 });
  if (!isCobolSource(code)) {
    return Response.json({ error: "Only COBOL programs can be saved here." }, { status: 400 });
  }
  const title = (body.title ?? "").trim().slice(0, 140) || "Untitled COBOL program";
  const shareId = makeShareId();
  try {
    const rows = await db
      .insert(snippets)
      .values({
        shareId,
        title,
        code: code.slice(0, 200_000),
        stdin: (body.stdin ?? "").slice(0, 100_000),
        files: body.files ?? {},
      })
      .returning();
    return Response.json({ program: rows[0] }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Sharing needs a database. Set DATABASE_URL on Vercel (or run locally with Postgres) to enable share links." },
      { status: 503 },
    );
  }
}

function isCobolSource(code: string): boolean {
  const upper = code.toUpperCase();
  return upper.includes("IDENTIFICATION DIVISION") || upper.includes("PROCEDURE DIVISION");
}
