import Navbar from "@/components/Navbar";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { snippets } from "@/db/schema";
import { examples } from "@/content/examples";
import Workbench from "@/components/Workbench";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Online COBOL Compiler - write, run and share COBOL programs",
  description:
    "A free online COBOL compiler (GnuCOBOL compatible). Write COBOL in the browser, run it instantly, feed it stdin and data files, and share your programs.",
};

interface CompilerPageProps {
  searchParams: Promise<{ code?: string; example?: string; share?: string }>;
}

function decodePayload(raw: string): { code: string; stdin: string; files: Record<string, string>; title: string } | null {
  try {
    const json = decodeURIComponent(escape(atob(raw)));
    const parsed = JSON.parse(json) as { code?: string; stdin?: string; files?: Record<string, string>; title?: string };
    return {
      code: parsed.code ?? "",
      stdin: parsed.stdin ?? "",
      files: parsed.files ?? {},
      title: parsed.title ?? "COBOL program",
    };
  } catch {
    return null;
  }
}

export default async function CompilerPage({ searchParams }: CompilerPageProps) {
  const params = await searchParams;
  let code = "";
  let stdin = "";
  let files: Record<string, string> = {};
  let title = "Hello, World!";

  if (params.example) {
    const example = examples.find((e) => e.id === params.example);
    if (example) {
      code = example.code;
      stdin = example.stdin ?? "";
      files = example.files ?? {};
      title = example.name;
    }
  }

  if (params.share) {
    try {
      const rows = await db.select().from(snippets).where(eq(snippets.shareId, params.share)).limit(1);
      if (rows.length) {
        code = rows[0].code;
        stdin = rows[0].stdin;
        files = rows[0].files ?? {};
        title = rows[0].title;
      }
    } catch {
      // ignore and fall through to the default program
    }
  }

  if (params.code) {
    const payload = decodePayload(params.code);
    if (payload) {
      code = payload.code;
      stdin = payload.stdin;
      files = payload.files;
      title = payload.title;
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <Navbar active="compiler" />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Online COBOL Compiler</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              A VS Code-style <strong>COBOL-only</strong> terminal in your browser - no installation, no sign-up.
              Type <code className="rounded bg-slate-200 px-1 font-mono text-[12px]">cobc -x -free prog.cbl</code> to
              compile (real syntax errors, GnuCOBOL-style), then <code className="rounded bg-slate-200 px-1 font-mono text-[12px]">./prog</code> to
              run and type live input when <code className="rounded bg-slate-200 px-1 font-mono text-[12px]">ACCEPT</code> asks.
              Manage <strong>.cbl + data files</strong> in the explorer: rename, upload, download. Other languages are
              rejected - GnuCOBOL-compatible COBOL and nothing else.
            </p>
          </div>
        </div>
        <Workbench
          examples={examples.map((e) => ({ id: e.id, name: e.name, description: e.description, code: e.code, stdin: e.stdin, files: e.files }))}
          initialCode={code}
          initialStdin={stdin}
          initialFiles={files}
          initialTitle={title}
        />
      </section>
    </main>
  );
}
