import Navbar from "@/components/Navbar";
import Workbench from "@/components/Workbench";
import { examples } from "@/content/examples";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { snippets } from "@/db/schema";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Online COBOL Compiler - write, run and share COBOL programs",
  description:
    "A free online COBOL compiler (GnuCOBOL compatible). Write COBOL in the browser, run it instantly, feed it stdin and data files, and share your programs.",
};

interface CompilerPageProps {
  searchParams: Promise<{ code?: string; example?: string; share?: string; role?: string }>;
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
    <div className="app-shell">
      <Navbar active="compiler" />
      <main className="compiler-page" id="compiler">
        <section className="intro">
          <div>
            <p className="eyebrow">
              <span />
              BROWSER-BASED COBOL IDE
            </p>
            <h1>Build something timeless.</h1>
            <p className="intro-copy">
              Write, compile and run COBOL in a modern workspace - the four divisions, PIC clauses, tables, files and
              intrinsic functions, with GnuCOBOL-style <span className="font-mono">cobc</span> commands and live
              terminal input. No setup, no legacy environment.
            </p>
          </div>
          <div className="intro-meta">
            <div>
              <strong>GnuCOBOL</strong>
              <span>Compiler runtime</span>
            </div>
            <div>
              <strong>COBOL 85</strong>
              <span>Language standard</span>
            </div>
          </div>
        </section>

        <Workbench
          examples={examples.map((e) => ({ id: e.id, name: e.name, description: e.description, code: e.code, stdin: e.stdin, files: e.files }))}
          initialCode={code}
          initialStdin={stdin}
          initialFiles={files}
          initialTitle={title}
          shareRole={params.role}
        />

        <section className="trust-row" aria-label="Platform highlights">
          <p>
            <span>01</span>
            <strong>Compile instantly</strong>
            <small>Production-grade GnuCOBOL workflow in your browser.</small>
          </p>
          <p>
            <span>02</span>
            <strong>Type live input</strong>
            <small>ACCEPT pauses and waits - just like VS Code.</small>
          </p>
          <p>
            <span>03</span>
            <strong>Keep your flow</strong>
            <small>A focused workspace without local setup.</small>
          </p>
        </section>
      </main>
      <footer className="site-footer">
        <span>© 2025 OpenCOBOL Studio · Learn the language that runs the world.</span>
      </footer>
    </div>
  );
}
