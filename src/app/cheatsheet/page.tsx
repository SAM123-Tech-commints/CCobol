import Navbar from "@/components/Navbar";
import CodeBlock from "@/components/CodeBlock";
import ScrollToTop from "@/components/ScrollToTop";
import CobolBot from "@/components/CobolBot";
import { TextBody } from "@/components/prose";
import { cheatsheet } from "@/content/cheatsheet";

export const metadata = {
  title: "COBOL Cheat Sheet - syntax, data, files, tables & OO",
  description:
    "A one-page COBOL cheat sheet: the four divisions, PICTURE and data types, arithmetic, conditions, PERFORM, subroutines, strings, files, tables, REDEFINES, SORT and object-oriented COBOL.",
};

/** The whole sheet as plain text, so COBOL BOT can answer questions about it. */
const botContext = cheatsheet
  .map((s) =>
    [s.title, ...s.blocks.map((b) => (typeof b === "string" ? b : `${b.title ?? ""}\n${b.code}`))].join("\n"),
  )
  .join("\n\n")
  .slice(0, 39_000);

export default function CheatSheetPage() {
  return (
    <main className="min-h-screen">
      <Navbar active="cheatsheet" />
      <div className="page">
        <header className="page-head">
          <h1>COBOL Cheat Sheet</h1>
          <p className="lead">
            A fast reference for everything in the course - divisions, data and PICTURE, arithmetic, conditions,
            PERFORM, subroutines, strings, files, tables and object-oriented COBOL. Every runnable block opens in the
            online compiler.
          </p>
          <nav className="cheat-toc" aria-label="Cheat sheet sections">
            {cheatsheet.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {s.title}
              </a>
            ))}
          </nav>
        </header>

        {cheatsheet.map((section) => (
          <section key={section.id} id={section.id} className="cheat-section scroll-mt-20">
            <h2>{section.title}</h2>
            {section.blocks.map((block, i) =>
              typeof block === "string" ? (
                <TextBody key={i} text={block} />
              ) : (
                <div key={i}>
                  {block.note ? <p className="cheat-note">{block.note}</p> : null}
                  <CodeBlock code={block.code} lang="cobol" runnable={block.runnable} title={block.title ?? section.title} />
                </div>
              ),
            )}
          </section>
        ))}
      </div>
      <CobolBot
        context={botContext}
        title="COBOL Cheat Sheet"
        quickPrompts={[
          "Explain the PICTURE clauses",
          "How do sequential file statements work?",
          "PERFORM UNTIL vs PERFORM VARYING?",
          "Give me an example of STRING and UNSTRING",
        ]}
      />
      <ScrollToTop />
    </main>
  );
}
