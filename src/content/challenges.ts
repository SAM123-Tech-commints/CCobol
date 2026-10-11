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
    id: "syllabus-subtract",
    title: "SUBTRACT two numbers",
    difficulty: "Easy",
    lessonSlug: "cobol-arithmetic-operators",
    instructions: "Use SUBTRACT ... FROM ... GIVING so the output contains the difference of 50 and 18.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. SubtractDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-A                 PIC 9(3) VALUE 50.
       01 WS-B                 PIC 9(3) VALUE 18.
       01 WS-DIFF              PIC 9(3) VALUE 0.
       PROCEDURE DIVISION.
           SUBTRACT WS-B FROM WS-A GIVING WS-DIFF.
           DISPLAY 'DIFFERENCE = ' WS-DIFF.
           STOP RUN.
`,
    mustContain: ["32"],
    hint: "SUBTRACT WS-B FROM WS-A GIVING WS-DIFF stores 50 - 18 = 32.",
  },
  {
    id: "syllabus-multiply",
    title: "MULTIPLY two numbers",
    difficulty: "Easy",
    lessonSlug: "cobol-arithmetic-operators",
    instructions: "Use MULTIPLY ... GIVING so the output contains the product of 7 and 6.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. MultiplyDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-A                 PIC 9(3) VALUE 7.
       01 WS-B                 PIC 9(3) VALUE 6.
       01 WS-PRODUCT           PIC 9(5) VALUE 0.
       PROCEDURE DIVISION.
           MULTIPLY WS-A BY WS-B GIVING WS-PRODUCT.
           DISPLAY 'PRODUCT = ' WS-PRODUCT.
           STOP RUN.
`,
    mustContain: ["42"],
    hint: "MULTIPLY WS-A BY WS-B GIVING WS-PRODUCT stores 7 x 6 = 42.",
  },
  {
    id: "syllabus-divide",
    title: "DIVIDE with REMAINDER",
    difficulty: "Easy",
    lessonSlug: "cobol-arithmetic-operators",
    instructions: "Divide 17 by 5 so the output shows the quotient and the remainder.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. DivideDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-A                 PIC 9(3) VALUE 17.
       01 WS-B                 PIC 9(3) VALUE 5.
       01 WS-QUOT              PIC 9(3) VALUE 0.
       01 WS-REM               PIC 9(3) VALUE 0.
       PROCEDURE DIVISION.
           DIVIDE WS-A BY WS-B GIVING WS-QUOT REMAINDER WS-REM.
           DISPLAY 'QUOTIENT  = ' WS-QUOT.
           DISPLAY 'REMAINDER = ' WS-REM.
           STOP RUN.
`,
    mustContain: ["3", "2"],
    hint: "17 / 5 gives quotient 3 remainder 2. Both show in the output (003 and 002).",
  },
  {
    id: "syllabus-compute",
    title: "COMPUTE a formula",
    difficulty: "Easy",
    lessonSlug: "cobol-arithmetic-operators",
    instructions: "Use COMPUTE to evaluate (10 + 4) * 2 - 5 so the output contains the result.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. ComputeDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-A                 PIC 9(3) VALUE 10.
       01 WS-B                 PIC 9(3) VALUE 4.
       01 WS-ANSWER            PIC 9(4) VALUE 0.
       PROCEDURE DIVISION.
           COMPUTE WS-ANSWER = (WS-A + WS-B) * 2 - 5.
           DISPLAY 'ANSWER = ' WS-ANSWER.
           STOP RUN.
`,
    mustContain: ["23"],
    hint: "(10 + 4) * 2 - 5 = 23. COMPUTE evaluates the whole expression, parentheses first.",
  },
  {
    id: "syllabus-move-numeric",
    title: "MOVE a numeric value",
    difficulty: "Easy",
    lessonSlug: "cobol-variables",
    instructions: "MOVE 42 into a PIC 9(4) field and DISPLAY it - watch the leading zero padding.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. MoveNum.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-NUM               PIC 9(4) VALUE 0.
       PROCEDURE DIVISION.
           MOVE 42 TO WS-NUM.
           DISPLAY 'VALUE = ' WS-NUM.
           STOP RUN.
`,
    mustContain: ["42"],
    hint: "A numeric MOVE pads on the left: 42 in PIC 9(4) shows as 0042.",
  },
  {
    id: "syllabus-move-alnum",
    title: "MOVE an alphanumeric value",
    difficulty: "Easy",
    lessonSlug: "cobol-variables",
    instructions: "MOVE the text COBOL into a PIC X(10) field and DISPLAY it.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. MoveAlnum.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-LANG              PIC X(10) VALUE SPACES.
       PROCEDURE DIVISION.
           MOVE 'COBOL' TO WS-LANG.
           DISPLAY 'LANGUAGE = ' WS-LANG.
           STOP RUN.
`,
    mustContain: ["COBOL"],
    hint: "An alphanumeric MOVE is left-aligned and padded with blanks on the right.",
  },
  {
    id: "syllabus-class-test",
    title: "IF ... IS NUMERIC (class test)",
    difficulty: "Medium",
    lessonSlug: "cobol-logical-operators",
    instructions: "Validate input with a class condition so the output contains VALID.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. ClassTest.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-NUM               PIC 9(3) VALUE 123.
       PROCEDURE DIVISION.
           IF WS-NUM IS NUMERIC
               DISPLAY 'VALID NUMBER'
           ELSE
               DISPLAY 'NOT NUMERIC'
           END-IF.
           STOP RUN.
`,
    mustContain: ["VALID"],
    hint: "IF field IS NUMERIC tests the class of the contents before you use it in arithmetic.",
  },
  {
    id: "syllabus-sign-test",
    title: "IF ... IS POSITIVE (sign test)",
    difficulty: "Medium",
    lessonSlug: "cobol-logical-operators",
    instructions: "The balance is -50. Use a sign condition so the output contains DEBIT.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. SignTest.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-BAL               PIC S9(4) VALUE -50.
       PROCEDURE DIVISION.
           IF WS-BAL IS POSITIVE
               DISPLAY 'CREDIT'
           ELSE
               DISPLAY 'DEBIT'
           END-IF.
           STOP RUN.
`,
    mustContain: ["DEBIT"],
    hint: "IS POSITIVE means greater than zero, so -50 takes the ELSE branch.",
  },
  {
    id: "syllabus-compound-test",
    title: "Compound condition with AND",
    difficulty: "Medium",
    lessonSlug: "cobol-logical-operators",
    instructions: "Use AND to join two conditions so a 15-year-old shows TEENAGER.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. CompoundTest.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-AGE               PIC 9(2) VALUE 15.
       PROCEDURE DIVISION.
           IF WS-AGE >= 13 AND WS-AGE <= 19
               DISPLAY 'TEENAGER'
           ELSE
               DISPLAY 'NOT A TEENAGER'
           END-IF.
           STOP RUN.
`,
    mustContain: ["TEENAGER"],
    hint: "AND is true only when both conditions are true.",
  },
  {
    id: "syllabus-nested-if",
    title: "Nested IF grade evaluator",
    difficulty: "Medium",
    lessonSlug: "cobol-control-structures",
    instructions: "Average is 88. Use nested IFs (school style) so the output contains VERY GOOD.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. NestedGrade.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-AVERAGE           PIC 9(3) VALUE 88.
       PROCEDURE DIVISION.
           IF WS-AVERAGE >= 90
               DISPLAY 'EXCELLENT'
           ELSE
               IF WS-AVERAGE >= 80
                   DISPLAY 'VERY GOOD'
               ELSE
                   IF WS-AVERAGE >= 75
                       DISPLAY 'GOOD JOB'
                   ELSE
                       DISPLAY 'NEEDS IMPROVEMENT'
                   END-IF
               END-IF
           END-IF.
           STOP RUN.
`,
    mustContain: ["VERY GOOD"],
    hint: "The first true test wins: 88 is not >= 90, but it is >= 80.",
  },
  {
    id: "syllabus-perform-until",
    title: "PERFORM ... UNTIL loop",
    difficulty: "Medium",
    lessonSlug: "cobol-control-structures",
    instructions: "Loop from 1 to 3 with PERFORM UNTIL so the output contains 1, 2 and 3.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. UntilDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-I                 PIC 99 VALUE 1.
       PROCEDURE DIVISION.
           PERFORM UNTIL WS-I > 3
               DISPLAY 'COUNT = ' WS-I
               ADD 1 TO WS-I
           END-PERFORM.
           STOP RUN.
`,
    mustContain: ["01", "02", "03"],
    hint: "The UNTIL condition is tested before each pass; WS-I is PIC 99 so it shows 01, 02, 03.",
  },
  {
    id: "syllabus-goto",
    title: "GO TO a paragraph",
    difficulty: "Medium",
    lessonSlug: "cobol-control-structures",
    instructions: "Jump over the middle paragraph with GO TO so the output shows START then DONE.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. GotoDemo.
       PROCEDURE DIVISION.
       MAIN-PARA.
           DISPLAY 'START'.
           GO TO END-PARA.
           DISPLAY 'SKIPPED'.
       END-PARA.
           DISPLAY 'DONE'.
           STOP RUN.
`,
    mustContain: ["START", "DONE"],
    hint: "GO TO jumps straight to the named paragraph; the line after it never runs here.",
  },
  {
    id: "syllabus-occurs-sum",
    title: "Sum a table with PERFORM VARYING",
    difficulty: "Medium",
    lessonSlug: "cobol-arrays",
    instructions: "Total the 5 table elements (10+20+30+40+50) so the output contains 150.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. TableSum.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-TABLE.
          05 WS-ITEM           PIC 9(3) OCCURS 5 TIMES.
       01 WS-I                 PIC 9 VALUE 1.
       01 WS-TOTAL             PIC 9(4) VALUE 0.
       PROCEDURE DIVISION.
           MOVE 10 TO WS-ITEM(1).
           MOVE 20 TO WS-ITEM(2).
           MOVE 30 TO WS-ITEM(3).
           MOVE 40 TO WS-ITEM(4).
           MOVE 50 TO WS-ITEM(5).
           PERFORM VARYING WS-I FROM 1 BY 1 UNTIL WS-I > 5
               ADD WS-ITEM(WS-I) TO WS-TOTAL
           END-PERFORM.
           DISPLAY 'TOTAL = ' WS-TOTAL.
           STOP RUN.
`,
    mustContain: ["150"],
    hint: "PERFORM VARYING walks the subscript 1 to 5, adding each element: 10+20+30+40+50 = 150.",
  },
  {
    id: "syllabus-two-level-table",
    title: "Two-level (2D) table",
    difficulty: "Medium",
    lessonSlug: "cobol-multidimensional-arrays",
    instructions: "Build a 2 x 3 sales table and display the element at row 2, column 3.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. TwoLevelTable.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 SALES-TABLE.
          05 SALES-ROW         OCCURS 2 TIMES.
             10 SALES-VALUE    PIC 99 OCCURS 3 TIMES.
       PROCEDURE DIVISION.
           MOVE 1 TO SALES-VALUE(1, 1).
           MOVE 2 TO SALES-VALUE(1, 2).
           MOVE 3 TO SALES-VALUE(1, 3).
           MOVE 4 TO SALES-VALUE(2, 1).
           MOVE 5 TO SALES-VALUE(2, 2).
           MOVE 6 TO SALES-VALUE(2, 3).
           DISPLAY 'SALES(2,3) = ' SALES-VALUE(2, 3).
           STOP RUN.
`,
    mustContain: ["06"],
    hint: "Two subscripts address a 2D element: SALES-VALUE(2, 3) is the 6. PIC 99 shows 06.",
  },
  {
    id: "syllabus-accept-display",
    title: "ACCEPT and DISPLAY (interactive)",
    difficulty: "Easy",
    lessonSlug: "cobol-input",
    instructions: "Read a name with ACCEPT and greet them. Stdin is pre-filled with SAM.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. GreetMe.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-NAME              PIC X(15).
       PROCEDURE DIVISION.
           DISPLAY 'ENTER YOUR NAME:'.
           ACCEPT WS-NAME.
           DISPLAY 'HELLO ' WS-NAME.
           STOP RUN.
`,
    stdin: "SAM\n",
    mustContain: ["HELLO", "SAM"],
    hint: "ACCEPT reads one line from stdin; the input box already contains SAM.",
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
