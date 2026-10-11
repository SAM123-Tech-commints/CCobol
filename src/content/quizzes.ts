export interface QuizQuestion {
  q: string;
  options: string[];
  /** index of the correct option */
  answer: number;
  explanation: string;
}

/**
 * SoloLearn-style quizzes: short, one concept per question,
 * instant feedback. Keyed by lesson slug.
 */
export const quizzes: Record<string, { title: string; questions: QuizQuestion[] }> = {
  "hello-world": {
    title: "Hello World quiz",
    questions: [
      {
        q: "Which division names the program?",
        options: ["IDENTIFICATION DIVISION", "PROCEDURE DIVISION", "DATA DIVISION", "ENVIRONMENT DIVISION"],
        answer: 0,
        explanation: "IDENTIFICATION DIVISION holds the PROGRAM-ID that names your program.",
      },
      {
        q: "Which statement writes text to the console?",
        options: ["MOVE", "DISPLAY", "ACCEPT", "STOP"],
        answer: 1,
        explanation: "DISPLAY writes to the console; ACCEPT reads from it.",
      },
      {
        q: "How does a COBOL program normally end?",
        options: ["END PROGRAM.", "STOP RUN.", "EXIT NOW.", "FINISH."],
        answer: 1,
        explanation: "STOP RUN. terminates execution.",
      },
    ],
  },
  "cobol-data-types": {
    title: "PIC clauses quiz",
    questions: [
      {
        q: "What does PIC 9(3) hold?",
        options: ["3 letters", "A 3-digit number", "3 decimal places", "Any 3 characters"],
        answer: 1,
        explanation: "9 means a numeric digit, so 9(3) is a 3-digit number.",
      },
      {
        q: "What does V mean in PIC 9(3)V9(2)?",
        options: ["Version", "Implied decimal point", "Variable length", "Verified numeric"],
        answer: 1,
        explanation: "V is an implied decimal point - 3 digits before it, 2 after.",
      },
      {
        q: "Which clause holds letters AND digits?",
        options: ["PIC A(5)", "PIC 9(5)", "PIC X(5)", "PIC S9(5)"],
        answer: 2,
        explanation: "X is alphanumeric: letters, digits and special characters.",
      },
      {
        q: "What does S add in PIC S9(4)?",
        options: ["A sign (+/-)", "A space", "A string", "A subscript"],
        answer: 0,
        explanation: "S marks the number as signed, e.g. -1234.",
      },
    ],
  },
  "cobol-variables": {
    title: "Variables quiz",
    questions: [
      {
        q: "Where are variables declared?",
        options: ["PROCEDURE DIVISION", "WORKING-STORAGE SECTION", "IDENTIFICATION DIVISION", "Anywhere"],
        answer: 1,
        explanation: "Data items live in the DATA DIVISION, usually WORKING-STORAGE SECTION.",
      },
      {
        q: "Which statement copies a value into a variable?",
        options: ["DISPLAY ... TO", "MOVE ... TO", "COPY ... TO", "SET ... TO only"],
        answer: 1,
        explanation: "MOVE 'John Doe' TO EMPLOYEE-NAME copies the value.",
      },
    ],
  },
  "cobol-arithmetic-operators": {
    title: "Arithmetic quiz",
    questions: [
      {
        q: "ADD A TO B GIVING C puts the result in…",
        options: ["A", "B", "C", "A and B"],
        answer: 2,
        explanation: "GIVING names the receiving field; without it B would be overwritten.",
      },
      {
        q: "Which statement handles conventional expressions like A + B * C?",
        options: ["ADD", "COMPUTE", "MULTIPLY", "EVALUATE"],
        answer: 1,
        explanation: "COMPUTE C = A + B * C evaluates a full arithmetic expression.",
      },
      {
        q: "DIVIDE A BY B GIVING C REMAINDER D stores the leftover in…",
        options: ["A", "B", "C", "D"],
        answer: 3,
        explanation: "The quotient goes to C, the remainder to D.",
      },
    ],
  },
  "cobol-logical-operators": {
    title: "Conditions quiz",
    questions: [
      {
        q: "Which test checks a field holds only digits?",
        options: ["IS NUMERIC", "IS ALPHABETIC", "IS EMPTY", "IS ZERO always"],
        answer: 0,
        explanation: "IF DATA-ITEM IS NUMERIC is the class test for digits.",
      },
      {
        q: "IF AGE >= 18 AND GENDER = 'F' is true when…",
        options: ["Either part is true", "Both parts are true", "Neither is true", "Only the first is true"],
        answer: 1,
        explanation: "AND needs every combined condition to be true; OR needs just one.",
      },
    ],
  },
  "cobol-control-structures": {
    title: "Control flow quiz",
    questions: [
      {
        q: "COBOL's version of switch/case is…",
        options: ["IF", "EVALUATE", "PERFORM", "SEARCH"],
        answer: 1,
        explanation: "EVALUATE TRUE / WHEN ... gives multi-way branching.",
      },
      {
        q: "PERFORM VARYING I FROM 1 BY 1 UNTIL I > 5 runs…",
        options: ["Once", "5 times", "Forever", "Zero times"],
        answer: 1,
        explanation: "I takes 1..5, so the loop body runs 5 times.",
      },
      {
        q: "Why is GO TO discouraged?",
        options: ["It is slow", "It makes program flow hard to follow", "It is forbidden", "It deletes data"],
        answer: 1,
        explanation: "Unconditional jumps tangle control flow; PERFORM is preferred.",
      },
    ],
  },
  "cobol-arrays": {
    title: "Tables quiz",
    questions: [
      {
        q: "How do you declare a 10-entry table?",
        options: ["OCCURS 10 TIMES", "TABLE 10", "ARRAY(10)", "REPEAT 10"],
        answer: 0,
        explanation: "05 STUDENT-ENTRY OCCURS 10 TIMES makes 10 occurrences.",
      },
      {
        q: "How do you read the 3rd student name?",
        options: ["STUDENT-NAME(3)", "STUDENT-NAME[3]", "STUDENT-NAME.3", "STUDENT-NAME<3>"],
        answer: 0,
        explanation: "Subscripts use parentheses: FIELD(index).",
      },
      {
        q: "SEARCH scans a table like…",
        options: ["Binary search", "Linear search, one by one", "Random access", "Sorting"],
        answer: 1,
        explanation: "SEARCH is linear; SEARCH ALL needs a sorted table (binary).",
      },
    ],
  },
  "cobol-string-handling": {
    title: "Strings quiz",
    questions: [
      {
        q: "Which verb joins fields into one?",
        options: ["UNSTRING", "STRING", "INSPECT", "COMBINE"],
        answer: 1,
        explanation: "STRING FIRST-NAME ' ' LAST-NAME INTO FULL-NAME joins them.",
      },
      {
        q: "INSPECT ... TALLYING counts…",
        options: ["Words", "Occurrences of a character", "Lines", "Files"],
        answer: 1,
        explanation: "TALLYING counts how often a character appears.",
      },
      {
        q: "FUNCTION UPPER-CASE('cobol') returns…",
        options: ["cobol", "COBOL", "Cobol", "5"],
        answer: 1,
        explanation: "UPPER-CASE converts to all capitals.",
      },
    ],
  },
  "cobol-file-handling": {
    title: "File handling quiz",
    questions: [
      {
        q: "Which order is correct for a sequential file?",
        options: ["READ, OPEN, CLOSE", "OPEN, READ, CLOSE", "CLOSE, OPEN, READ", "OPEN, CLOSE, READ"],
        answer: 1,
        explanation: "OPEN INPUT, then READ until AT END, then CLOSE.",
      },
      {
        q: "AT END on a READ means…",
        options: ["An error occurred", "No more records", "File is locked", "Disk is full"],
        answer: 1,
        explanation: "AT END fires when the file is exhausted - set your end-of-file flag there.",
      },
      {
        q: "FD entries belong to which division?",
        options: ["IDENTIFICATION", "FILE SECTION of DATA DIVISION", "PROCEDURE", "ENVIRONMENT only"],
        answer: 1,
        explanation: "FD record layouts live in the FILE SECTION.",
      },
    ],
  },
  "cobol-input": {
    title: "ACCEPT quiz",
    questions: [
      {
        q: "ACCEPT WS-NAME reads from…",
        options: ["A file", "The console / stdin box", "Another program", "The database"],
        answer: 1,
        explanation: "ACCEPT reads one line of keyboard (stdin) input per statement.",
      },
      {
        q: "With two ACCEPT statements, the stdin box needs…",
        options: ["One line", "Two lines", "No input", "A file"],
        answer: 1,
        explanation: "One line per ACCEPT, in order.",
      },
    ],
  },
};

export const genericQuiz: QuizQuestion[] = [
  {
    q: "A COBOL program is divided into…",
    options: ["2 divisions", "4 divisions", "6 divisions", "8 divisions"],
    answer: 1,
    explanation: "IDENTIFICATION, ENVIRONMENT, DATA and PROCEDURE divisions.",
  },
  {
    q: "Executable statements live in the…",
    options: ["DATA DIVISION", "PROCEDURE DIVISION", "IDENTIFICATION DIVISION", "FILE SECTION"],
    answer: 1,
    explanation: "PROCEDURE DIVISION holds the program logic.",
  },
  {
    q: "DISPLAY 'Hi'. does what?",
    options: ["Reads input", "Writes output", "Declares data", "Opens a file"],
    answer: 1,
    explanation: "DISPLAY writes text to the console.",
  },
];

export function quizFor(slug: string): { title: string; questions: QuizQuestion[] } {
  return quizzes[slug] ?? { title: "COBOL quick quiz", questions: genericQuiz };
}
