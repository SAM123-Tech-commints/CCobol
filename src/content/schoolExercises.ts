import type { Challenge } from "@/content/challenges";

/**
 * School-track exercises: practice that follows the four class lessons
 * (school-l1 … school-l4). Kept separate from the general exercises page so
 * each track has its own set. Same shape as `challenges`, so the same
 * runner, auto-checker and "explain" tooling work unchanged.
 */
export const schoolExercises: Challenge[] = [
  {
    id: "school-progid",
    title: "Name your program",
    difficulty: "Starter",
    lessonSlug: "school-l1",
    instructions: "Change PROGRAM-ID so the program is called SCHOOL1, then run it. The output must still print HELLO SCHOOL.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. SCHOOL1.
       PROCEDURE DIVISION.
           DISPLAY 'HELLO SCHOOL'.
           STOP RUN.
`,
    mustContain: ["HELLO SCHOOL"],
    hint: "PROGRAM-ID names the program. Keep it 1-8 characters, letters, digits and hyphens only.",
  },
  {
    id: "school-pic-numeric",
    title: "Numeric field with PIC 9",
    difficulty: "Starter",
    lessonSlug: "school-l2",
    instructions: "Declare STU-NO PIC 9(4) VALUE 2024 and DISPLAY it so the output contains 2024.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. SCHOOL2.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 STU-NO               PIC 9(4) VALUE 2024.
       PROCEDURE DIVISION.
           DISPLAY 'STUDENT NUMBER: ' STU-NO.
           STOP RUN.
`,
    mustContain: ["2024"],
    hint: "PIC 9(4) means four digits. VALUE sets the starting value. This starter already passes - try changing VALUE.",
  },
  {
    id: "school-pic-alpha",
    title: "Alphanumeric field with PIC X",
    difficulty: "Starter",
    lessonSlug: "school-l2",
    instructions: "Declare STU-NAME PIC X(10) VALUE 'ANA' and DISPLAY it so the output contains ANA.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. SCHOOL3.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 STU-NAME             PIC X(10) VALUE 'ANA'.
       PROCEDURE DIVISION.
           DISPLAY 'NAME: ' STU-NAME.
           STOP RUN.
`,
    mustContain: ["ANA"],
    hint: "PIC X(n) holds n characters (letters, digits, symbols). VALUE must be in quotes for text.",
  },
  {
    id: "school-move",
    title: "MOVE a value",
    difficulty: "Easy",
    lessonSlug: "school-l2",
    instructions: "Use MOVE to copy 'BSIT' into COURSE, then DISPLAY COURSE so the output contains BSIT.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. SCHOOL4.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 COURSE               PIC X(6).
       PROCEDURE DIVISION.
           MOVE 'BSIT' TO COURSE.
           DISPLAY 'COURSE: ' COURSE.
           STOP RUN.
`,
    mustContain: ["BSIT"],
    hint: "MOVE value TO field copies left to right. Text literals need quotes.",
  },
  {
    id: "school-if",
    title: "IF / ELSE decision",
    difficulty: "Easy",
    lessonSlug: "school-l3",
    instructions: "Set SCORE PIC 99 VALUE 85. Add an IF so that when SCORE is greater than or equal to 75 the program displays PASSED. Output must contain PASSED.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. SCHOOL5.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 SCORE                PIC 99 VALUE 85.
       PROCEDURE DIVISION.
           IF SCORE >= 75
               DISPLAY 'PASSED'
           ELSE
               DISPLAY 'FAILED'
           END-IF.
           STOP RUN.
`,
    mustContain: ["PASSED"],
    hint: "IF condition ... ELSE ... END-IF. >= means greater than or equal to.",
  },
  {
    id: "school-evaluate",
    title: "EVALUATE a grade",
    difficulty: "Medium",
    lessonSlug: "school-l3",
    instructions: "Set GRADE PIC X VALUE 'A'. Use EVALUATE so that WHEN 'A' displays EXCELLENT. Output must contain EXCELLENT.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. SCHOOL6.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 GRADE                PIC X VALUE 'A'.
       PROCEDURE DIVISION.
           EVALUATE GRADE
               WHEN 'A' DISPLAY 'EXCELLENT'
               WHEN 'B' DISPLAY 'GOOD'
               WHEN OTHER DISPLAY 'TRY AGAIN'
           END-EVALUATE.
           STOP RUN.
`,
    mustContain: ["EXCELLENT"],
    hint: "EVALUATE works like a multiple-choice switch. WHEN OTHER is the default branch.",
  },
  {
    id: "school-perform-until",
    title: "PERFORM UNTIL countdown",
    difficulty: "Medium",
    lessonSlug: "school-l4",
    instructions: "Make the loop display the numbers 5 4 3 2 1 by counting down. Output must contain 5, 4, 3, 2 and 1.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. SCHOOL7.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 CNT                  PIC 9 VALUE 5.
       PROCEDURE DIVISION.
           PERFORM UNTIL CNT = 0
               DISPLAY CNT
               SUBTRACT 1 FROM CNT
           END-PERFORM.
           STOP RUN.
`,
    mustContain: ["5", "4", "3", "2", "1"],
    hint: "PERFORM UNTIL repeats while the condition is FALSE. Subtract 1 each pass so CNT reaches 0.",
  },
  {
    id: "school-perform-varying",
    title: "PERFORM VARYING total",
    difficulty: "Medium",
    lessonSlug: "school-l4",
    instructions: "Add up 1 to 5 using PERFORM VARYING so TOTAL becomes 15. Output must contain 15.",
    starter: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. SCHOOL8.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 I                    PIC 9 VALUE 0.
       01 TOTAL                PIC 9(3) VALUE 0.
       PROCEDURE DIVISION.
           PERFORM VARYING I FROM 1 BY 1 UNTIL I > 5
               ADD I TO TOTAL
           END-PERFORM.
           DISPLAY 'TOTAL: ' TOTAL.
           STOP RUN.
`,
    mustContain: ["15"],
    hint: "PERFORM VARYING sets a counter FROM a start, changes it BY a step, and stops when UNTIL becomes true.",
  },
];
