import Navbar from "@/components/Navbar";
import CodeBlock from "@/components/CodeBlock";
import CobolBot from "@/components/CobolBot";
import ScrollToTop from "@/components/ScrollToTop";
import { TextBody } from "@/components/prose";

export const metadata = {
  title: "COBOL Wiki - learn, run and share COBOL online",
  description:
    "COBOL wiki: what COBOL is, how a program is structured, sample code, taking input with ACCEPT, and declaring variables with the PICTURE clause.",
};

const sample = `IDENTIFICATION DIVISION.
PROGRAM-ID. HELLO.
PROCEDURE DIVISION.
    DISPLAY "Hello, COBOL!".
    STOP RUN.`;

const input = `IDENTIFICATION DIVISION.
PROGRAM-ID. GREET.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 USER-NAME PIC A(30).
PROCEDURE DIVISION.
    DISPLAY "Enter your name: ".
    ACCEPT USER-NAME.
    DISPLAY "Hello, " USER-NAME "!".
    STOP RUN.`;

const vars = `01 AGE        PIC 99.
01 NAME       PIC A(20).
01 SALARY     PIC 9(5)V99.`;

const botContext = [
  "COBOL wiki: about COBOL, program structure (four divisions), sample code, taking input with ACCEPT, and variables declared with PIC clauses.",
  sample,
  input,
  vars,
].join("\n");

export default function WikiPage() {
  return (
    <main className="min-h-screen">
      <Navbar active="wiki" />
      <div className="page">
        <header className="page-head">
          <h1>COBOL Wiki</h1>
          <p className="lead">
            Write, run and share COBOL code online. A reliable playground to practice classic COBOL syntax - great for
            learning, teaching and experimenting with business logic.
          </p>
        </header>

        <section className="cheat-section">
          <h2>About COBOL</h2>
          <TextBody
            text={
              "COBOL (Common Business-Oriented Language) is a high-level programming language developed in the 1950s. " +
              "It is primarily used in business, finance and administrative systems for companies and governments. " +
              "COBOL is known for its English-like syntax and is still widely used in legacy enterprise systems."
            }
          />
        </section>

        <section className="cheat-section">
          <h2>Sample code</h2>
          <TextBody text="The following is a simple COBOL program that prints a greeting:" />
          <CodeBlock code={sample} lang="cobol" runnable title="Hello" />
        </section>

        <section className="cheat-section">
          <h2>Taking input</h2>
          <TextBody
            text={
              "In COBOL, input is typically handled with the ACCEPT keyword. Here is an example that takes user input " +
              "and prints it back:"
            }
          />
          <CodeBlock code={input} lang="cobol" runnable title="Greet" />
        </section>

        <section className="cheat-section">
          <h2>Syntax basics</h2>
          <h3>Program structure</h3>
          <TextBody
            text={
              "COBOL programs are divided into four divisions:\n" +
              "- IDENTIFICATION DIVISION: program metadata\n" +
              "- ENVIRONMENT DIVISION: machine/environment details (optional)\n" +
              "- DATA DIVISION: variable declarations\n" +
              "- PROCEDURE DIVISION: the actual program logic"
            }
          />
          <h3>Variables</h3>
          <TextBody text="Variables are declared in the DATA DIVISION using PIC clauses:" />
          <CodeBlock code={vars} lang="cobol" title="PICTURE clauses" />
        </section>
      </div>
      <CobolBot
        context={botContext}
        title="COBOL Wiki"
        quickPrompts={["What are the four divisions?", "Explain the PIC clause", "How does ACCEPT work?", "Show me a hello world"]}
      />
      <ScrollToTop />
    </main>
  );
}
