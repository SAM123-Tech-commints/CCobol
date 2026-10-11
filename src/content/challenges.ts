export interface Challenge {
  id: string;
  title: string;
  difficulty: "Starter" | "Easy" | "Medium";
  /** lesson this practices (for "back to lesson" links) */
  lessonSlug: string;
  instructions: string;
  starter: string;
  stdin?: string;
  /** substrings that must appear in program output to pass */
  mustContain: string[];
  hint: string;
}

/**
 * Programming-Hub-style coding exercises: bite-size tasks with
 * starter code, runnable in the built-in COBOL-only compiler,
 * auto-checked against expected output.
 */
export const challenges: Challenge[] = [
  {
    id: "hello-you",
    title: "Display your name",
    difficulty: "Starter",
    lessonSlug: "hello-world",
    instructions: "Change the program so it displays HELLO, COBOL! (exactly, in capitals).",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. HelloYou.
       PROCEDURE DIVISION.
           DISPLAY 'Hello, World!'.
           STOP RUN.
`,
    mustContain: ["HELLO, COBOL!"],
    hint: "Edit the text between the quotes in the DISPLAY statement.",
  },
  {
    id: "variables-pay",
    title: "Declare and display a salary",
    difficulty: "Easy",
    lessonSlug: "cobol-variables",
    instructions: "Create a numeric variable PAY PIC 9(4) VALUE 2500 and DISPLAY it so the output contains 2500.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. PayDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 PAY                  PIC 9(4) VALUE 2500.
       PROCEDURE DIVISION.
           DISPLAY 'PAY=' PAY.
           STOP RUN.
`,
    mustContain: ["2500"],
    hint: "This starter already passes - press Run, then try changing the VALUE and re-running.",
  },
  {
    id: "add-two",
    title: "ADD two numbers",
    difficulty: "Easy",
    lessonSlug: "cobol-arithmetic-operators",
    instructions: "ADD 17 and 25 with GIVING so the output contains 42.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. AddDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 A                    PIC 9(3) VALUE 17.
       01 B                    PIC 9(3) VALUE 25.
       01 TOTAL                PIC 9(3) VALUE 0.
       PROCEDURE DIVISION.
           ADD A TO B GIVING TOTAL.
           DISPLAY TOTAL.
           STOP RUN.
`,
    mustContain: ["42"],
    hint: "ADD A TO B GIVING TOTAL stores A+B in TOTAL, then DISPLAY it.",
  },
  {
    id: "if-else-grade",
    title: "IF / ELSE grade check",
    difficulty: "Easy",
    lessonSlug: "cobol-control-structures",
    instructions: "SCORE is 85. Use IF/ELSE so the program displays PASS (it must not display FAIL).",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. GradeDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 SCORE                PIC 9(3) VALUE 85.
       PROCEDURE DIVISION.
           IF SCORE >= 50
               DISPLAY 'PASS'
           ELSE
               DISPLAY 'FAIL'
           END-IF.
           STOP RUN.
`,
    mustContain: ["PASS"],
    hint: "The starter passes - try changing SCORE to 20 and see it print FAIL, then change it back.",
  },
  {
    id: "perform-loop",
    title: "PERFORM loop 1 to 5",
    difficulty: "Medium",
    lessonSlug: "cobol-control-structures",
    instructions: "Write a PERFORM VARYING loop that DISPLAYs the numbers 1 2 3 4 5 (each on its own line).",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. LoopDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 I                    PIC 9(2) VALUE 0.
       PROCEDURE DIVISION.
           PERFORM VARYING I FROM 1 BY 1 UNTIL I > 5
               DISPLAY I
           END-PERFORM.
           STOP RUN.
`,
    mustContain: ["1", "2", "3", "4", "5"],
    hint: "PERFORM VARYING I FROM 1 BY 1 UNTIL I > 5 ... END-PERFORM loops five times.",
  },
  {
    id: "evaluate-day",
    title: "EVALUATE the day",
    difficulty: "Medium",
    lessonSlug: "cobol-control-structures",
    instructions: "DAY-NUM is 6. Use EVALUATE so the output contains WEEKEND.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. DayDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 DAY-NUM              PIC 9 VALUE 6.
       PROCEDURE DIVISION.
           EVALUATE DAY-NUM
               WHEN 6 DISPLAY 'WEEKEND'
               WHEN 7 DISPLAY 'WEEKEND'
               WHEN OTHER DISPLAY 'WEEKDAY'
           END-EVALUATE.
           STOP RUN.
`,
    mustContain: ["WEEKEND"],
    hint: "EVALUATE picks the first matching WHEN branch.",
  },
  {
    id: "occurs-table",
    title: "Fill an OCCURS table",
    difficulty: "Medium",
    lessonSlug: "cobol-arrays",
    instructions: "Store 'Ada' in MONTH-NAME(1) and DISPLAY it so the output contains Ada.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. TableDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 MONTH-NAMES.
          05 MONTH-NAME        PIC X(10) OCCURS 12 TIMES.
       PROCEDURE DIVISION.
           MOVE 'Ada' TO MONTH-NAME(1).
           DISPLAY MONTH-NAME(1).
           STOP RUN.
`,
    mustContain: ["Ada"],
    hint: "Subscripts use parentheses: MONTH-NAME(1).",
  },
  {
    id: "string-join",
    title: "STRING two names",
    difficulty: "Medium",
    lessonSlug: "cobol-string-handling",
    instructions: "Use STRING to join 'Ada' and 'Lovelace' with a space so the output contains Ada Lovelace.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. JoinDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 FULL-NAME            PIC X(25) VALUE SPACES.
       PROCEDURE DIVISION.
           STRING 'Ada' ' ' 'Lovelace' INTO FULL-NAME.
           DISPLAY FULL-NAME.
           STOP RUN.
`,
    mustContain: ["Ada Lovelace"],
    hint: "STRING 'Ada' ' ' 'Lovelace' INTO FULL-NAME joins the three pieces.",
  },
];

export function challengeById(id: string): Challenge | undefined {
  return challenges.find((c) => c.id === id);
}
