/** COBOL cheat sheet (based on the classic Derek Banas COBOL tutorial) —
 *  structure, data, math, conditions, loops, strings, files, tables and OO. */

export interface CheatCode {
  title?: string;
  note?: string;
  code: string;
  runnable?: boolean;
}

export interface CheatSection {
  id: string;
  title: string;
  blocks: (string | CheatCode)[];
}

const hello = `       >>SOURCE FORMAT FREE
*> Compile with:  cobc -x hello.cob   then   ./hello
IDENTIFICATION DIVISION.
*> The name used to call this program
PROGRAM-ID. hello.
AUTHOR. Derek Banas.
DATE-WRITTEN. April 15th 2020.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 UserName PIC X(30) VALUE "You".
PROCEDURE DIVISION.
    DISPLAY "What is your name " WITH NO ADVANCING
    ACCEPT UserName
    DISPLAY "Hello " UserName
    STOP RUN.`;

const dataExample = `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. tutorial2.
DATA DIVISION.
WORKING-STORAGE SECTION.
*> X = any character, first value "Stuff" (max length 10)
01 SampleData PIC X(10) VALUE "Stuff".
*> Only letters and spaces
01 JustLetters PIC AAA VALUE "ABC".
*> 4 digits 0-9
01 JustNums   PIC 9(4) VALUE 1234.
*> Signed number
01 SignedInt  PIC S9(4) VALUE -1234.
*> 4 digits with 2 decimal places
01 PayCheck   PIC 9(4)V99 VALUE ZEROS.

*> A group item: level numbers build a hierarchy (01 highest)
01 Customer.
   02 Ident    PIC 9(3).
   02 CustName PIC X(20).
   02 DateOfBirth.
      03 MOB PIC 99.
      03 DOB PIC 99.
      03 YOB PIC 9(4).

PROCEDURE DIVISION.
    MOVE "More Stuff" TO SampleData
    DISPLAY SampleData
    MOVE "123Bob Smith           12211974" TO Customer
    DISPLAY CustName
    DISPLAY MOB "/" DOB "/" YOB
    STOP RUN.`;

const math = `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. arithmetic.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 Num1 PIC 9 VALUE 5.
01 Num2 PIC 9 VALUE 4.
01 Num3 PIC 9 VALUE 3.
01 Ans  PIC S99V99 VALUE 0.
01 Rem  PIC 9V99.
PROCEDURE DIVISION.
    ADD Num1 TO Num2 GIVING Ans
    SUBTRACT Num1 FROM Num2 GIVING Ans
    MULTIPLY Num1 BY Num2 GIVING Ans
    DIVIDE Num1 INTO Num2 GIVING Ans
    DIVIDE Num2 INTO Num1 GIVING Ans REMAINDER Rem
    ADD Num1, Num2, Num3 GIVING Ans
    COMPUTE Ans = Num1 + Num2
    COMPUTE Ans = Num1 ** 2          *> 5 to the power of 2
    COMPUTE Ans = (3 + 5) * 5        *> parentheses first
    COMPUTE Ans ROUNDED = 3.0 + 2.005
    DISPLAY Ans " Remainder " Rem
    STOP RUN.`;

const conditions = `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. conditions.
ENVIRONMENT DIVISION.
CONFIGURATION SECTION.
SPECIAL-NAMES.
*> A custom data classification
    CLASS PassingScore IS "A" THRU "C", "D".
DATA DIVISION.
WORKING-STORAGE SECTION.
01 Age   PIC 99 VALUE 0.
01 Score PIC X(1) VALUE "B".
01 CanVoteFlag PIC 9 VALUE 0.
   88 CanVote  VALUE 1.
   88 CantVote VALUE 0.
PROCEDURE DIVISION.
    ACCEPT Age
    IF Age > 18 THEN
        DISPLAY "You can vote"
    ELSE
        DISPLAY "You can't vote"
    END-IF
    IF Age > 5 AND Age < 18
        COMPUTE Age = Age - 5
        DISPLAY "Go to grade " Age
    END-IF
    IF Score IS PassingScore
        DISPLAY "You passed"
    END-IF
    IF Score IS NOT NUMERIC
        DISPLAY "Not a number"
    END-IF
    IF Age > 18
        SET CanVote TO TRUE
    ELSE
        SET CantVote TO TRUE
    END-IF
    DISPLAY "Vote flag " CanVoteFlag
    STOP RUN.`;

const evaluate = `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. evaluate-demo.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 TestNumber PIC X.
   88 IsPrime   VALUE "1", "3", "5", "7".
   88 IsOdd     VALUE "1", "3", "5", "7", "9".
   88 IsEven    VALUE "2", "4", "6", "8".
   88 LessThan5 VALUE "1" THRU "4".
   88 ANumber   VALUE "0" THRU "9".
PROCEDURE DIVISION.
    ACCEPT TestNumber
    PERFORM UNTIL NOT ANumber
        EVALUATE TRUE
            WHEN IsPrime   DISPLAY "Prime"
            WHEN IsOdd     DISPLAY "Odd"
            WHEN IsEven    DISPLAY "Even"
            WHEN LessThan5 DISPLAY "Less than 5"
            WHEN OTHER     DISPLAY "Default action"
        END-EVALUATE
        ACCEPT TestNumber
    END-PERFORM
    STOP RUN.`;

const paragraphs = `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. paragraphs.
PROCEDURE DIVISION.
*> Open paragraphs run by "gravity" (fall through),
*> a named block is executed with PERFORM.
SubOne.
    DISPLAY "In Paragraph 1"
    PERFORM SubTwo
    DISPLAY "Returned to Paragraph 1"
    PERFORM 2 TIMES
        DISPLAY "Repeat"
    END-PERFORM
    STOP RUN.

SubThree.
    DISPLAY "In Paragraph 3".

SubTwo.
    DISPLAY "In Paragraph 2"
    PERFORM SubThree
    DISPLAY "Returned to Paragraph 2".`;

const callSub = `       >>SOURCE FORMAT FREE
*> GETSUM.cob  -  compile with:  cobc -m GETSUM.cob
IDENTIFICATION DIVISION.
PROGRAM-ID. GETSUM.
DATA DIVISION.
LINKAGE SECTION.
*> Variables passed in by the calling program (same order)
01 LNum1 PIC 9.
01 LNum2 PIC 9.
01 LSum  PIC 99.
PROCEDURE DIVISION USING LNum1, LNum2, LSum.
    COMPUTE LSum = LNum1 + LNum2.
EXIT PROGRAM.`;

const callMain = `       >>SOURCE FORMAT FREE
*> MAIN.cob  -  compile with:  cobc -x MAIN.cob
IDENTIFICATION DIVISION.
PROGRAM-ID. MAIN.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 Num1 PIC 9 VALUE 5.
01 Num2 PIC 9 VALUE 4.
01 Sum1 PIC 99.
PROCEDURE DIVISION.
    CALL 'GETSUM' USING Num1, Num2, Sum1.
    DISPLAY Num1 " + " Num2 " = " Sum1.
    STOP RUN.`;

const loops = `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. loops.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 Ind PIC 9(1) VALUE 0.
PROCEDURE DIVISION.
WhileLoop.
*> Tests AFTER, so the body runs at least once
    PERFORM OutputData WITH TEST AFTER UNTIL Ind > 5
    GO TO ForLoop.

OutputData.
    DISPLAY Ind
    ADD 1 TO Ind.

ForLoop.
*> Counted loop: FROM 1 BY 1 UNTIL Ind = 5
    PERFORM OutputData2 VARYING Ind FROM 1 BY 1 UNTIL Ind = 5
    STOP RUN.

OutputData2.
    DISPLAY Ind.`;

const editedPics = `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. editedpics.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 StartNum PIC 9(8)V99 VALUE 00001123.55.
01 NoZero   PIC ZZZZZZZ9.99.      *> suppress zeroes
01 NoZPlusC PIC ZZ,ZZZ,ZZ9.99.    *> commas too (use * for check protect)
01 Dollar   PIC $$,$$$,$$9.99.    *> floating $ (also + and -)
01 BDay     PIC 9(8) VALUE 12211974.
01 ADate    PIC 99/99/9999.       *> insert / (also B for space)
PROCEDURE DIVISION.
    MOVE StartNum TO NoZero
    DISPLAY NoZero
    MOVE StartNum TO NoZPlusC
    DISPLAY NoZPlusC
    MOVE StartNum TO Dollar
    DISPLAY Dollar
    MOVE BDay TO ADate
    DISPLAY ADate
    STOP RUN.`;

const rounding = `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. money.
DATA DIVISION.
WORKING-STORAGE SECTION.
*> COBOL uses fixed-point decimal arithmetic (not floating point)
01 Price     PIC 9(4)V99.
01 TaxRate   PIC V999 VALUE .075.
01 FullPrice PIC 9(4)V99.
PROCEDURE DIVISION.
    DISPLAY "Enter the Price : " WITH NO ADVANCING
    ACCEPT Price
    COMPUTE FullPrice ROUNDED = Price + (Price * TaxRate)
    DISPLAY "Price + Tax : " FullPrice
    STOP RUN.`;

const strings = `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. strings.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 SampStr  PIC X(18) VALUE 'eerie beef sneezed'.
01 NumChars PIC 99 VALUE 0.
01 NumEs    PIC 99 VALUE 0.
01 FName PIC X(6)  VALUE 'Martin'.
01 LName PIC X(4)  VALUE 'King'.
01 FLName PIC X(11).
01 SStr1 PIC X(7) VALUE "The egg".
01 SStr2 PIC X(9) VALUE "is #1 and".
01 Dest  PIC X(33) VALUE "is the big chicken".
01 Ptr   PIC 9 VALUE 1.
01 SStr3 PIC X(3).
01 SStr4 PIC X(3).
PROCEDURE DIVISION.
    INSPECT SampStr TALLYING NumChars FOR CHARACTERS
    INSPECT SampStr TALLYING NumEs FOR ALL 'e'
    DISPLAY "Characters " NumChars " e's " NumEs
    DISPLAY FUNCTION UPPER-CASE(SampStr)
    DISPLAY FUNCTION LOWER-CASE(SampStr)

*> Join strings. DELIMITED BY SIZE = whole field, SPACES = up to first space
    STRING FName DELIMITED BY SIZE
           SPACE
           LName DELIMITED BY SIZE
           INTO FLName
    DISPLAY FLName

*> STRING with a pointer and a different delimiter
    STRING SStr1 DELIMITED BY SIZE
           SPACE
           SStr2 DELIMITED BY "#"
           INTO Dest
           WITH POINTER Ptr
           ON OVERFLOW DISPLAY 'Overflowed'
    DISPLAY Dest

*> Replace text inside a string
    INSPECT Dest REPLACING ALL 'egg' BY 'dog'
    DISPLAY Dest

*> Split one string into several
    UNSTRING SStr1 DELIMITED BY SPACE
        INTO SStr3, SStr4
    END-UNSTRING
    DISPLAY SStr4
    STOP RUN.`;

const filesWrite = `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. fileswrite.
ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
    SELECT CustomerFile ASSIGN TO "Customer.dat"
        ORGANIZATION IS LINE SEQUENTIAL
        ACCESS IS SEQUENTIAL.
DATA DIVISION.
FILE SECTION.
*> FD describes the file layout
FD CustomerFile.
01 CustomerData.
   02 IDNum    PIC 9(8).
   02 CustName.
      03 FirstName PIC X(15).
      03 LastName  PIC X(15).
PROCEDURE DIVISION.
*> OUTPUT creates the file (if missing) and writes to it
    OPEN OUTPUT CustomerFile
    MOVE 00001    TO IDNum
    MOVE 'Doug'   TO FirstName
    MOVE 'Thomas' TO LastName
    WRITE CustomerData
    END-WRITE
    CLOSE CustomerFile
    STOP RUN.`;

const filesRead = `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. filesread.
ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
    SELECT CustomerFile ASSIGN TO "Customer.dat"
        ORGANIZATION IS LINE SEQUENTIAL.
DATA DIVISION.
FILE SECTION.
FD CustomerFile.
01 CustomerData.
   02 IDNum    PIC 9(8).
   02 CustName.
      03 FirstName PIC X(15).
      03 LastName  PIC X(15).
WORKING-STORAGE SECTION.
01 WSCustomer.
   02 WSIDNum    PIC 9(5).
   02 WSCustName.
      03 WSFirstName PIC X(15).
      03 WSLastName  PIC X(15).
01 WSEOF PIC A(1).
PROCEDURE DIVISION.
    OPEN INPUT CustomerFile
    PERFORM UNTIL WSEOF = 'Y'
        READ CustomerFile INTO WSCustomer
            AT END     MOVE 'Y' TO WSEOF
            NOT AT END DISPLAY WSCustomer
        END-READ
    END-PERFORM
    CLOSE CustomerFile
    STOP RUN.`;

const tables = `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. tables.
DATA DIVISION.
WORKING-STORAGE SECTION.
*> 1-dimensional table (subscripts start at 1)
01 Table1.
   02 Friend PIC X(15) OCCURS 4 TIMES.
*> multidimensional table
01 CustTable.
   02 CustName OCCURS 5 TIMES.
      03 FName PIC X(15).
      03 LName PIC X(15).
*> indexed table
01 OrderTable.
   02 Product OCCURS 2 TIMES INDEXED BY I.
      03 ProdName PIC X(10).
      03 ProdSize OCCURS 3 TIMES INDEXED BY J.
         04 SizeType PIC A.
PROCEDURE DIVISION.
    MOVE 'Joy'    TO Friend(1)
    MOVE 'Willow' TO Friend(2)
    DISPLAY Friend(1)
    MOVE 'Paul'  TO FName(1)
    MOVE 'Smith' TO LName(1)
    DISPLAY CustTable
    SET I J TO 1
    MOVE 'Blue Shirt' TO Product(I)
    SET J UP BY 1
    MOVE 'M' TO ProdSize(I,J)
    PERFORM GetProduct VARYING I FROM 1 BY 1 UNTIL I > 2
    GO TO LookUp.
GetProduct.
    DISPLAY Product(I).
LookUp.
    SET I TO 1
*> SEARCH scans the table; AT END when nothing matches
    SEARCH Product
        AT END DISPLAY 'Product Not Found'
        WHEN ProdName(I) = 'Red Shirt' DISPLAY 'Red Shirt Found'
    END-SEARCH
    STOP RUN.`;

const redefines = `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. redefines-demo.
DATA DIVISION.
WORKING-STORAGE SECTION.
*> Prefill a table with REDEFINES
01 ProdTable.
   02 ProdData.
      03 FILLER PIC X(8) VALUE "Red  SML".
      03 FILLER PIC X(8) VALUE "Blue SML".
      03 FILLER PIC X(8) VALUE "GreenSML".
   02 FILLER REDEFINES ProdData.
      03 Shirt OCCURS 3 TIMES.
         04 ProdName  PIC X(5).
         04 ProdSizes PIC A OCCURS 3 TIMES.
*> Treat a string as a number with REDEFINES
01 ChangeMe.
   02 TextNum  PIC X(6).
   02 FloatNum REDEFINES TextNum PIC 9(4)V99.
PROCEDURE DIVISION.
    DISPLAY Shirt(1)
    MOVE '123456' TO TextNum
    DISPLAY FloatNum
    STOP RUN.`;

const sortMerge = `       >>SOURCE FORMAT FREE
*> SORT a file by a key
IDENTIFICATION DIVISION.
PROGRAM-ID. sortfile.
ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
    SELECT WorkFile ASSIGN TO 'work.tmp'.
    SELECT OrgFile ASSIGN TO 'student.dat'
        ORGANIZATION IS LINE SEQUENTIAL.
    SELECT SortedFile ASSIGN TO 'student2.dat'
        ORGANIZATION IS LINE SEQUENTIAL.
DATA DIVISION.
FILE SECTION.
FD OrgFile.
01 StudData.
   02 IDNum    PIC 9.
   02 StudName PIC X(10).
SD WorkFile.
01 WStudData.
   02 WIDNum    PIC 9.
   02 WStudName PIC X(10).
FD SortedFile.
01 SStudData.
   02 SIDNum    PIC 9.
   02 SStudName PIC X(10).
PROCEDURE DIVISION.
    SORT WorkFile ON ASCENDING KEY SIDNum
        USING OrgFile
        GIVING SortedFile
    STOP RUN.`;

const oo = `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. oodemo.
*> Object-oriented COBOL uses classes and methods
REPOSITORY.
    CLASS ToDoCls AS "todolist".
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WorkToDo USAGE OBJECT REFERENCE ToDoCls.
01 ToDoToAdd PIC X(20).
   88 EndOfInput VALUE SPACES.
01 DescToAdd PIC X(50).
PROCEDURE DIVISION.
    INVOKE ToDoCls "new" USING BY CONTENT "Work ToDo"
        RETURNING WorkToDo
    PERFORM AddToToDoList WITH TEST AFTER UNTIL EndOfInput
    INVOKE WorkToDo "PrintToDos"
    STOP RUN.

AddToToDoList.
    DISPLAY "Enter To Do : " WITH NO ADVANCING
    ACCEPT ToDoToAdd
    DISPLAY "Enter Description : " WITH NO ADVANCING
    ACCEPT DescToAdd
    INVOKE WorkToDo "AddItemToToDo"
        USING BY CONTENT ToDoToAdd, DescToAdd.`;

export const cheatsheet: CheatSection[] = [
  {
    id: "intro",
    title: "What is COBOL?",
    blocks: [
      "COBOL (Common Business Oriented Language) is the most rigidly structured programming language. It focuses on data-oriented business applications. Over 80% of all financial transactions in the US and the vast majority of US government systems depend on COBOL.",
      "COBOL was created to match natural language: a program is made of divisions, sections, paragraphs, sentences and verbs. A program is structured into program → division → section → paragraph → sentence → statements.",
      {
        title: "Smallest program",
        note: "The first 6 columns are sequence numbers; column 7 is the comment/indicator area. SOURCE FORMAT FREE removes those fixed-format rules. These are the four divisions: IDENTIFICATION, ENVIRONMENT, DATA and PROCEDURE.",
        code: `       >>SOURCE FORMAT FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. hello.
ENVIRONMENT DIVISION.
DATA DIVISION.
PROCEDURE DIVISION.`,
        runnable: false,
      },
      "The IDENTIFICATION DIVISION names the program (the name used to call it), plus optional author/date. ENVIRONMENT DIVISION holds environment information (the computer, devices, country-specific settings). DATA DIVISION describes the data, with sections FILE, WORKING-STORAGE, LINKAGE and REPORT. PROCEDURE DIVISION contains the statements that run.",
      { title: "hello.cob", code: hello, runnable: true },
    ],
  },
  {
    id: "data",
    title: "Data & types",
    blocks: [
      "There are three types of data: Numeric, Alphanumeric and Alphabetic. Declaring a type does not stop you assigning another — the programmer enforces types. Literals are constants: Alphanumeric (in quotes) or Numeric (signed, float or integer). A constant can be defined with `01 PIValue CONSTANT AS 3.14`.",
      {
        title: "Figurative constants (fill every character of a field)",
        code: `ZERO / ZEROES / ZEROS      numeric zero
SPACE / SPACES             a space
HIGH-VALUE / HIGH-VALUES   largest value of the type
LOW-VALUE / LOW-VALUES     smallest value of the type
QUOTE / QUOTES             a quotation mark
ALL "x"                    repeats x through the field`,
        runnable: false,
      },
      "The PICTURE (PIC) clause defines type and size: `X` = any character, `9` = digit, `A` = letter/space, `S` = sign, `V` = implied decimal point. Group items use level numbers (01 highest).",
      { title: "tutorial2 — data types, PICTURE & group items", code: dataExample, runnable: true },
    ],
  },
  {
    id: "math",
    title: "Arithmetic",
    blocks: [
      "Use ADD / SUBTRACT / MULTIPLY / DIVIDE with GIVING (and REMAINDER), or COMPUTE for expressions. `**` is power; parentheses force order; ROUNDED rounds the result.",
      { title: "Arithmetic & COMPUTE", code: math, runnable: true },
    ],
  },
  {
    id: "conditions",
    title: "Conditions (IF, EVALUATE)",
    blocks: [
      "Comparisons: `<` or LESS THAN, `>` or GREATER THAN, `=` or EQUAL TO, `<=` LESS THAN OR EQUAL TO, `>=` GREATER THAN OR EQUAL TO, plus AND / OR / NOT. Class tests: IS NUMERIC, IS ALPHABETIC, IS ALPHABETIC-LOWER / -UPPER. Level-88 condition names give readable names to values.",
      { title: "IF and level-88 conditions", code: conditions, runnable: true },
      "EVALUATE is COBOL's switch: it runs the branch whose WHEN matches, and WHEN OTHER is the default. It is often combined with PERFORM UNTIL for a menu loop.",
      { title: "EVALUATE TRUE with condition names", code: evaluate, runnable: true },
    ],
  },
  {
    id: "paragraphs",
    title: "Paragraphs & PERFORM",
    blocks: [
      "Gravity-driven programming: execution falls through open paragraphs until a condition or GO TO redirects it. Closed paragraphs are run by name (PERFORM). PERFORM also runs inline statements, repeated with TIMES / UNTIL / VARYING.",
      { title: "Paragraphs, PERFORM and PERFORM n TIMES", code: paragraphs, runnable: true },
    ],
  },
  {
    id: "subroutines",
    title: "Subroutines (CALL)",
    blocks: [
      "A subroutine is compiled separately (`cobc -m`) and called from another program. Parameters are declared in the LINKAGE SECTION in the same order they are passed.",
      { title: "GETSUM.cob (the subroutine)", code: callSub, runnable: false },
      { title: "MAIN.cob (the caller)", code: callMain, runnable: false },
    ],
  },
  {
    id: "loops",
    title: "Loops & GO TO",
    blocks: [
      "PERFORM WITH TEST AFTER UNTIL runs the body at least once; PERFORM VARYING acts like a for loop (FROM / BY / UNTIL); GO TO jumps to another paragraph.",
      { title: "PERFORM UNTIL and PERFORM VARYING", code: loops, runnable: true },
    ],
  },
  {
    id: "edited",
    title: "Edited pictures",
    blocks: [
      "Edited PICTURE symbols format output: `Z` suppresses leading zeroes, `,` inserts commas, `$` floats a currency sign, `/` or `B` insert separators, `*` is check protection.",
      { title: "Z, comma, $ and date editing", code: editedPics, runnable: true },
    ],
  },
  {
    id: "fixed",
    title: "Fixed-point math & rounding",
    blocks: [
      "COBOL uses fixed-point decimal arithmetic (no floating-point surprises) and lets you choose rounding.",
      { title: "ROUNDED with a tax rate", code: rounding, runnable: true },
    ],
  },
  {
    id: "strings",
    title: "Strings (INSPECT, STRING, UNSTRING)",
    blocks: [
      "INSPECT TALLYING counts characters, INSPECT REPLACING substitutes text, STRING joins fields (DELIMITED BY SIZE / SPACES / a character, with an optional POINTER and ON OVERFLOW), and UNSTRING splits a field on a delimiter.",
      { title: "String handling", code: strings, runnable: true },
    ],
  },
  {
    id: "files",
    title: "Sequential files",
    blocks: [
      "FILE-CONTROL (SELECT ... ASSIGN TO) connects a COBOL file name to a real file. The FILE SECTION (FD) describes its record layout. OPEN OUTPUT creates/writes, OPEN EXTEND appends, OPEN INPUT reads. A field is one item, a record is a group of fields, a file is many records.",
      { title: "Writing a file (OPEN OUTPUT / WRITE)", code: filesWrite, runnable: true },
      { title: "Reading a file (OPEN INPUT / READ ... AT END)", code: filesRead, runnable: true },
    ],
  },
  {
    id: "tables",
    title: "Tables (OCCURS, SEARCH)",
    blocks: [
      "Tables are COBOL arrays: OCCURS n TIMES declares repeats, subscripts start at 1, INDEXED BY creates indexes you move with SET ... UP BY / DOWN BY. SEARCH scans a table in order; SEARCH ALL does a fast binary search on a sorted key.",
      { title: "Tables, indexes and SEARCH", code: tables, runnable: true },
    ],
  },
  {
    id: "redefines",
    title: "REDEFINES",
    blocks: [
      "REDEFINES overlays different layouts on the same storage: it can prefill a table from a single string, or reinterpret a text field as a number.",
      { title: "Prefill a table and reinterpret text as a number", code: redefines, runnable: true },
    ],
  },
  {
    id: "sort",
    title: "SORT & MERGE",
    blocks: [
      "SORT orders a file on a key (USING an input file, GIVING an output file); MERGE combines two identically structured files.",
      { title: "SORT a file by an ascending key", code: sortMerge, runnable: false },
    ],
  },
  {
    id: "oo",
    title: "Object-oriented COBOL",
    blocks: [
      "O-O COBOL uses classes (declared in the REPOSITORY) and methods invoked with INVOKE.",
      { title: "Object references and INVOKE", code: oo, runnable: false },
    ],
  },
];
