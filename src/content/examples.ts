export interface Example {
  id: string;
  name: string;
  description: string;
  code: string;
  stdin?: string;
  files?: Record<string, string>;
}

export const examples: Example[] = [
  {
    id: "hello",
    name: "Hello, World!",
    description: "The classic first program",
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. HelloWorld.
       PROCEDURE DIVISION.
           DISPLAY 'Hello, World!'.
           STOP RUN.
`,
  },
  {
    id: "variables",
    name: "Variables & Data Types",
    description: "PIC 9, PIC X, PIC S9(5)V99 and VALUE clauses",
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. Variables.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 EMPLOYEE-NAME             PIC X(30).
       01 EMPLOYEE-ID               PIC 9(5).
       01 EMPLOYEE-SALARY           PIC S9(5)V99.
       01 COMPANY-NAME              PIC X(20) VALUE 'Tech Corp'.
       PROCEDURE DIVISION.
           MOVE 'John Doe' TO EMPLOYEE-NAME.
           MOVE '12345' TO EMPLOYEE-ID.
           MOVE 5000.50 TO EMPLOYEE-SALARY.
           DISPLAY 'Employee Name: ' EMPLOYEE-NAME.
           DISPLAY 'Employee ID: ' EMPLOYEE-ID.
           DISPLAY 'Employee Salary: $' EMPLOYEE-SALARY.
           DISPLAY 'Company: ' COMPANY-NAME.
           STOP RUN.
`,
  },
  {
    id: "arithmetic",
    name: "Arithmetic Operations",
    description: "ADD, SUBTRACT, MULTIPLY, DIVIDE with REMAINDER",
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. ArithmeticOperations.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 NUM1               PIC 9(5) VALUE ZEROS.
       01 NUM2               PIC 9(5) VALUE ZEROS.
       01 RESULT-ADD         PIC 9(5) VALUE ZEROS.
       01 RESULT-SUBTRACT    PIC 9(5) VALUE ZEROS.
       01 RESULT-MULTIPLY    PIC 9(6) VALUE ZEROS.
       01 RESULT-DIVIDE      PIC 9(5) VALUE ZEROS.
       01 REMAINDER          PIC 9(5) VALUE ZEROS.
       PROCEDURE DIVISION.
       A000-MAIN-LOGIC.
           DISPLAY "COBOL Arithmetic Operations".
           MOVE 25 TO NUM1.
           MOVE 5 TO NUM2.
           ADD NUM1 TO NUM2 GIVING RESULT-ADD.
           DISPLAY "Addition Result: " RESULT-ADD.
           SUBTRACT NUM2 FROM NUM1 GIVING RESULT-SUBTRACT.
           DISPLAY "Subtraction Result: " RESULT-SUBTRACT.
           MULTIPLY NUM1 BY NUM2 GIVING RESULT-MULTIPLY.
           DISPLAY "Multiplication Result: " RESULT-MULTIPLY.
           DIVIDE NUM1 BY NUM2 GIVING RESULT-DIVIDE REMAINDER REMAINDER.
           DISPLAY "Division Result: " RESULT-DIVIDE.
           DISPLAY "Remainder: " REMAINDER.
           STOP RUN.
`,
  },
  {
    id: "control",
    name: "Control Structures",
    description: "IF / ELSE, EVALUATE, PERFORM VARYING, GO TO",
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. ControlStructuresDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 AGE                        PIC 99 VALUE 0.
       01 REPEAT-COUNTER             PIC 9(3) VALUE 0.
       01 NAME                       PIC X(10) VALUE SPACES.
       PROCEDURE DIVISION.
       BEGIN.
           DISPLAY 'COBOL Control Structures Demonstration'.
           MOVE 25 TO AGE.
           MOVE 'John' TO NAME.
           IF AGE < 18
               DISPLAY 'Hello young ' NAME '!'
           ELSE
               DISPLAY 'Hello Mr./Ms. ' NAME '!'
           END-IF.
           PERFORM VARYING REPEAT-COUNTER FROM 1 BY 1 UNTIL REPEAT-COUNTER > 3
               DISPLAY 'This is loop iteration number: ' REPEAT-COUNTER
           END-PERFORM.
           EVALUATE TRUE
               WHEN AGE < 20
                   DISPLAY NAME ' is a teenager.'
               WHEN AGE BETWEEN 20 AND 60
                   DISPLAY NAME ' is an adult.'
               WHEN OTHER
                   DISPLAY NAME ' is a senior citizen.'
           END-EVALUATE.
           DISPLAY 'End of demonstration.'.
           STOP RUN.
`,
  },
  {
    id: "arrays",
    name: "Tables (Arrays)",
    description: "OCCURS, subscripts, PERFORM VARYING and SEARCH",
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. ArraysDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 STUDENT-TABLE.
          05 STUDENT-ENTRY   OCCURS 5 TIMES.
             10 STUDENT-NAME   PIC X(20) VALUE SPACES.
             10 STUDENT-AGE    PIC 99 VALUE ZERO.
       01 INDEX-VAL            PIC 9(3) VALUE 0.
       01 STUDENT-COUNT        PIC 99 VALUE 5.
       01 SEARCHED-NAME        PIC X(20) VALUE 'Lucas'.
       PROCEDURE DIVISION.
       BEGIN.
           DISPLAY 'COBOL Arrays (Tables) Demonstration'.
           MOVE 'John' TO STUDENT-NAME(1).
           MOVE 21 TO STUDENT-AGE(1).
           MOVE 'Alice' TO STUDENT-NAME(2).
           MOVE 23 TO STUDENT-AGE(2).
           MOVE 'Lucas' TO STUDENT-NAME(3).
           MOVE 20 TO STUDENT-AGE(3).
           MOVE 'Anna' TO STUDENT-NAME(4).
           MOVE 22 TO STUDENT-AGE(4).
           MOVE 'Bob' TO STUDENT-NAME(5).
           MOVE 24 TO STUDENT-AGE(5).
           DISPLAY 'Student List:'.
           PERFORM VARYING INDEX-VAL FROM 1 BY 1 UNTIL INDEX-VAL > STUDENT-COUNT
               DISPLAY 'Student Name: ' STUDENT-NAME(INDEX-VAL)
                       ', Age: ' STUDENT-AGE(INDEX-VAL)
           END-PERFORM.
           DISPLAY 'Searching for Lucas...'.
           SET INDEX-VAL TO 1.
           SEARCH STUDENT-ENTRY
               AT END DISPLAY 'Lucas not found.'
               WHEN STUDENT-NAME(INDEX-VAL) = SEARCHED-NAME
               DISPLAY 'Lucas found at position: ' INDEX-VAL
           END-SEARCH.
           STOP RUN.
`,
  },
  {
    id: "strings",
    name: "String Handling",
    description: "STRING, UNSTRING, INSPECT and intrinsic functions",
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. StringHandling.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 FIRST-NAME         PIC X(10) VALUE 'John'.
       01 LAST-NAME          PIC X(10) VALUE 'Doe'.
       01 FULL-NAME          PIC X(25) VALUE SPACES.
       01 SPLIT-FIRST        PIC X(10) VALUE SPACES.
       01 SPLIT-LAST         PIC X(10) VALUE SPACES.
       01 MESSAGE            PIC X(25) VALUE 'Hello, COBOL! How are you?'.
       01 TALLY-COUNT        PIC 9(3)  VALUE ZERO.
       PROCEDURE DIVISION.
           STRING FIRST-NAME ' ' LAST-NAME INTO FULL-NAME.
           DISPLAY FULL-NAME.
           UNSTRING FULL-NAME DELIMITED BY ' '
                   INTO SPLIT-FIRST, SPLIT-LAST.
           DISPLAY SPLIT-FIRST '/' SPLIT-LAST.
           INSPECT MESSAGE TALLYING TALLY-COUNT FOR ALL 'O'.
           DISPLAY 'Number of Os: ' TALLY-COUNT.
           INSPECT MESSAGE REPLACING ALL 'O' BY 'A'.
           DISPLAY MESSAGE.
           DISPLAY FUNCTION UPPER-CASE('cobol').
           DISPLAY FUNCTION LENGTH('cobol').
           STOP RUN.
`,
  },
  {
    id: "functions",
    name: "Intrinsic Functions",
    description: "ABS, SQRT, MAX, NUMVAL, CURRENT-DATE and more",
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. IntrinsicDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 ABS-VALUE         PIC 9(3)V99.
       01 ROOT-VALUE        PIC 9(3)V99.
       01 MAX-VALUE         PIC 9(3).
       01 NUM               PIC 9(5)V99.
       PROCEDURE DIVISION.
           COMPUTE ABS-VALUE  = FUNCTION ABS(-5).
           COMPUTE ROOT-VALUE = FUNCTION SQRT(9).
           COMPUTE MAX-VALUE = FUNCTION MAX(5, 10, 15).
           COMPUTE NUM       = FUNCTION NUMVAL('123.45').
           DISPLAY 'ABS(-5)      = ' ABS-VALUE.
           DISPLAY 'SQRT(9)      = ' ROOT-VALUE.
           DISPLAY 'MAX(5,10,15) = ' MAX-VALUE.
           DISPLAY 'NUMVAL       = ' NUM.
           DISPLAY 'CURRENT-DATE = ' FUNCTION CURRENT-DATE.
           STOP RUN.
`,
  },
  {
    id: "accept",
    name: "Input with ACCEPT",
    description: "Pauses and waits - type each answer live in the terminal",
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. AcceptDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-NAME          PIC X(15).
       01 WS-AGE           PIC 9(3).
       PROCEDURE DIVISION.
           DISPLAY 'WHAT IS YOUR NAME?'.
           ACCEPT WS-NAME.
           DISPLAY 'AND YOUR AGE?'.
           ACCEPT WS-AGE.
           DISPLAY 'HELLO ' WS-NAME.
           DISPLAY 'NEXT YEAR YOU WILL BE ' WS-AGE + 1.
           STOP RUN.
`,
  },
  {
    id: "files",
    name: "Read a Sequential File",
    description: "SELECT, FD, OPEN, READ ... AT END, CLOSE",
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. FileHandling.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT EMPLOYEE-FILE ASSIGN TO 'sample.dat'
           ORGANIZATION IS SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD EMPLOYEE-FILE.
       01 EMPLOYEE-RECORD.
           05 EMP-ID            PIC 9(3).
           05 EMP-NAME          PIC X(10).
           05 EMP-SALARY        PIC 9(4).
       WORKING-STORAGE SECTION.
       01 END-OF-FILE          PIC X(1) VALUE 'N'.
       PROCEDURE DIVISION.
       A000-MAIN-LOGIC.
           OPEN INPUT EMPLOYEE-FILE.
           READ EMPLOYEE-FILE
               AT END MOVE 'Y' TO END-OF-FILE
           END-READ.
           PERFORM UNTIL END-OF-FILE = 'Y'
               DISPLAY 'Employee ID: ' EMP-ID
               DISPLAY 'Employee Name: ' EMP-NAME
               DISPLAY 'Employee Salary: $' EMP-SALARY
               DISPLAY '-----------------------------'
               READ EMPLOYEE-FILE
                   AT END MOVE 'Y' TO END-OF-FILE
               END-READ
           END-PERFORM.
           CLOSE EMPLOYEE-FILE.
           STOP RUN.
`,
    files: { "SAMPLE.DAT": "001John      5000\n002Alice     6000\n003Bob       5500\n" },
  },
  {
    id: "writefile",
    name: "Write a Relative File",
    description: "Creates STUDENTS.DAT - see the Files written tab",
    code: `IDENTIFICATION DIVISION.
PROGRAM-ID. RelativeFileExample.
ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
    SELECT STUDENT-FILE ASSIGN TO 'STUDENTS.DAT'
           ORGANIZATION IS RELATIVE
           ACCESS MODE IS RANDOM
           RELATIVE KEY IS STUDENT-ID.
DATA DIVISION.
FILE SECTION.
FD STUDENT-FILE.
01 STUDENT-RECORD.
    05 STUDENT-ID           PIC 9(4).
    05 STUDENT-NAME         PIC X(20).
    05 STUDENT-GRADE        PIC X(1).
PROCEDURE DIVISION.
A000-START.
    OPEN OUTPUT STUDENT-FILE.
    MOVE 1 TO STUDENT-ID.
    MOVE 'John Doe' TO STUDENT-NAME.
    MOVE 'A' TO STUDENT-GRADE.
    WRITE STUDENT-RECORD INVALID KEY DISPLAY 'WRITE ERROR FOR JOHN'.
    MOVE 2 TO STUDENT-ID.
    MOVE 'Jane Smith' TO STUDENT-NAME.
    MOVE 'B' TO STUDENT-GRADE.
    WRITE STUDENT-RECORD INVALID KEY DISPLAY 'WRITE ERROR FOR JANE'.
    CLOSE STUDENT-FILE.
    DISPLAY 'STUDENTS.DAT CREATED - open the Files tab.'.
    STOP RUN.
`,
  },
  {
    id: "call",
    name: "CALL a Subprogram",
    description: "Two programs in one source, linked with USING",
    code: `IDENTIFICATION DIVISION.
PROGRAM-ID. MainProg.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-VAR1  PIC X(10) VALUE 'Hello'.
01 WS-VAR2  PIC 9(5)  VALUE 100.
PROCEDURE DIVISION.
    CALL 'SubProg' USING WS-VAR1 WS-VAR2.
    DISPLAY 'BACK IN MAIN: ' WS-VAR1 ' ' WS-VAR2.
    STOP RUN.
END PROGRAM MainProg.
IDENTIFICATION DIVISION.
PROGRAM-ID. SubProg.
DATA DIVISION.
LINKAGE SECTION.
01 LS-VAR1  PIC X(10).
01 LS-VAR2  PIC 9(5).
PROCEDURE DIVISION USING LS-VAR1 LS-VAR2.
    DISPLAY LS-VAR1.
    DISPLAY LS-VAR2.
    MOVE 'CHANGED' TO LS-VAR1.
    ADD 1 TO LS-VAR2.
    EXIT PROGRAM.
END PROGRAM SubProg.
`,
  },
  {
    id: "evaluate",
    name: "EVALUATE Grades",
    description: "Multi-way branching like switch/case",
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. EvalDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 SCORE                PIC 9(3) VALUE 85.
       PROCEDURE DIVISION.
           EVALUATE TRUE
               WHEN SCORE >= 90
                   DISPLAY 'GRADE A'
               WHEN SCORE >= 75
                   DISPLAY 'GRADE B'
               WHEN SCORE >= 50
                   DISPLAY 'GRADE C'
               WHEN OTHER
                   DISPLAY 'GRADE F'
           END-EVALUATE.
           STOP RUN.
`,
  },
  {
    id: "paragraphs",
    name: "Paragraphs & PERFORM",
    description: "Split logic into paragraphs and call them",
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. ParaDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-NAME              PIC X(10) VALUE 'Ada'.
       PROCEDURE DIVISION.
       MAIN-PARA.
           DISPLAY 'START'.
           PERFORM GREET.
           PERFORM FAREWELL.
           DISPLAY 'END'.
           STOP RUN.
       GREET.
           DISPLAY 'HELLO ' WS-NAME.
       FAREWELL.
           DISPLAY 'GOODBYE ' WS-NAME.
`,
  },
  {
    id: "compute",
    name: "COMPUTE Expressions",
    description: "Formulas with parentheses and functions",
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. ComputeDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 A                    PIC 9(3) VALUE 10.
       01 B                    PIC 9(3) VALUE 4.
       01 C                    PIC 9(5)V99 VALUE 0.
       PROCEDURE DIVISION.
           COMPUTE C = (A + B) * 2 - 5.
           DISPLAY 'C = ' C.
           COMPUTE C = FUNCTION SQRT(16).
           DISPLAY 'SQRT(16) = ' C.
           STOP RUN.
`,
  },
  {
    id: "filewrite",
    name: "Write then Read a File",
    description: "Create NOTES.DAT and read it back",
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. FileDemo.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT NOTES-FILE ASSIGN TO 'NOTES.DAT'
           ORGANIZATION IS SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD NOTES-FILE.
       01 NOTE-RECORD          PIC X(20).
       WORKING-STORAGE SECTION.
       01 END-OF-FILE          PIC X(1) VALUE 'N'.
       PROCEDURE DIVISION.
       MAIN-PARA.
           OPEN OUTPUT NOTES-FILE.
           MOVE 'FIRST LINE' TO NOTE-RECORD.
           WRITE NOTE-RECORD.
           MOVE 'SECOND LINE' TO NOTE-RECORD.
           WRITE NOTE-RECORD.
           CLOSE NOTES-FILE.
           OPEN INPUT NOTES-FILE.
           READ NOTES-FILE
               AT END MOVE 'Y' TO END-OF-FILE
           END-READ.
           PERFORM UNTIL END-OF-FILE = 'Y'
               DISPLAY NOTE-RECORD
               READ NOTES-FILE
                   AT END MOVE 'Y' TO END-OF-FILE
               END-READ
           END-PERFORM.
           CLOSE NOTES-FILE.
           STOP RUN.
`,
  },
];

export function getExample(id: string): Example | undefined {
  return examples.find((e) => e.id === id);
}
