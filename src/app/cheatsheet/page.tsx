import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import CobolBot from "@/components/CobolBot";
import CheatSheetReference from "@/components/CheatSheetReference";

export const metadata = {
  title: "COBOL Cheat Sheet - complete language reference",
  description:
    "A fast COBOL reference: divisions, PICTURE clauses, arithmetic, conditions, PERFORM, strings, tables, REDEFINES, SORT and object-oriented COBOL - each with runnable examples.",
};

const botContext =
  "COBOL cheat sheet covering: what COBOL is and its four divisions, data types and PICTURE clauses, arithmetic, conditions (IF/EVALUATE), paragraphs and PERFORM, loops and GO TO, edited pictures, strings (INSPECT/STRING/UNSTRING), tables (OCCURS/SEARCH), REDEFINES, SORT/MERGE and object-oriented COBOL.";

export default function CheatSheetPage() {
  return (
    <main className="min-h-screen">
      <Navbar active="cheatsheet" />
      <div className="page cheat-page">
        <CheatSheetReference />
      </div>
      <CobolBot
        context={botContext}
        title="COBOL Cheat Sheet"
        quickPrompts={["Explain PICTURE clauses", "How does PERFORM work?", "STRING vs UNSTRING?", "Show a tables example"]}
      />
      <ScrollToTop />
    </main>
  );
}
