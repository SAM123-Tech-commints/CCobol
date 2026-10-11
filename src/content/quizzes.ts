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
  "school-l1": {
    title: "School L1: Intro to COBOL - all terms",
    questions: [
      {
        q: "COBOL stands for:",
        options: ["Common Business Oriented Language", "Computer Basic Oriented Language", "Common Basic Operational Logic", "Central Business Online Language"],
        answer: 0,
        explanation: "COBOL = Common Business Oriented Language, developed in 1959 by the CODASYL committee.",
      },
      {
        q: "The FIRST ANSI standard version of COBOL was released in:",
        options: ["1968", "1974", "1985", "2002"],
        answer: 0,
        explanation: "1968 first standard; 1974 efficiency; 1985 structure; 2002 OO features; 2014 method overloading.",
      },
      {
        q: "Abend means:",
        options: ["An unexpected/abnormal termination of the program", "A type of file", "The end of a paragraph", "A compile error list"],
        answer: 0,
        explanation: "Abend = ABnormal END, caused by a problem in code or data.",
      },
      {
        q: "The system-defined standard to follow while coding MOVE, IF, PERFORM is called:",
        options: ["Syntax", "Abend", "Scope", "Delimiter"],
        answer: 0,
        explanation: "Syntax = the rules for how COBOL statements must be written.",
      },
      {
        q: "A set of characters used to name something is a:",
        options: ["Character string", "Sentence", "Division", "Literal"],
        answer: 0,
        explanation: "A character string is a group of characters forming a name.",
      },
      {
        q: "Individual instructions or commands like MOVE, ADD, DISPLAY are:",
        options: ["Statements", "Sentences", "Sections", "Divisions"],
        answer: 0,
        explanation: "A statement is one instruction; statements ending in a period form a sentence.",
      },
      {
        q: "Groups of COBOL statements ending in a period form a:",
        options: ["Sentence", "Paragraph", "Section", "Clause"],
        answer: 0,
        explanation: "A sentence = one or more statements, the last terminated by a period followed by a space.",
      },
      {
        q: "A named set of statements coded separately, executed with PERFORM, is a:",
        options: ["Paragraph (routine)", "Division", "Literal", "Load module"],
        answer: 0,
        explanation: "You PERFORM a paragraph to execute it.",
      },
      {
        q: "A set of paragraphs coded together and executed with PERFORM is a:",
        options: ["Section", "Sentence", "Statement", "Separator"],
        answer: 0,
        explanation: "Section = a group of paragraphs, also executed with PERFORM.",
      },
      {
        q: "The four major parts used to code a COBOL program are called:",
        options: ["Divisions", "Sections", "Sentences", "Modules"],
        answer: 0,
        explanation: "IDENTIFICATION, ENVIRONMENT, DATA and PROCEDURE DIVISIONs.",
      },
      {
        q: "A space or comma used to split strings apart is a:",
        options: ["Separator", "Delimiter", "Literal", "Scope terminator"],
        answer: 0,
        explanation: "Separator = space, comma, etc.",
      },
      {
        q: "A mark like a quote that shows where a string starts and ends is a:",
        options: ["Delimiter", "Separator", "Constant", "Level number"],
        answer: 0,
        explanation: "Delimiters: single quote, double quote.",
      },
      {
        q: "An expression that results in TRUE or FALSE is a:",
        options: ["Condition", "Literal", "Compiler", "Load module"],
        answer: 0,
        explanation: "Based on the TRUE/FALSE result, the program flow gets decided.",
      },
      {
        q: "A data name used to hold a value for processing is a:",
        options: ["Variable (data item)", "Scope terminator", "Separator", "Load module"],
        answer: 0,
        explanation: "A variable is also called a data item.",
      },
      {
        q: "A variable that has only one value throughout execution is a:",
        options: ["Constant", "Condition", "Delimiter", "Paragraph"],
        answer: 0,
        explanation: "A constant keeps a single value for the whole run.",
      },
      {
        q: "System-defined keywords with predefined values (ZERO, SPACES) are:",
        options: ["Figurative constants", "User-defined words", "Literals", "Load modules"],
        answer: 0,
        explanation: "Figurative constants are built-in words with predefined values.",
      },
      {
        q: "The value that is assigned to a variable is a:",
        options: ["Literal", "Abend", "Syntax", "Section"],
        answer: 0,
        explanation: "A literal is the actual value you assign.",
      },
      {
        q: "A reserved word that marks the end of a specific COBOL statement (e.g. END-IF) is a:",
        options: ["Scope terminator", "Separator", "Delimiter", "Indicator"],
        answer: 0,
        explanation: "Scope terminators close statements explicitly.",
      },
      {
        q: "WS-A = WS-B + WS-C is an example of a(n):",
        options: ["Arithmetic expression", "Sign condition", "Literal", "Character string"],
        answer: 0,
        explanation: "An arithmetic expression combines variables with +, -, *, /.",
      },
      {
        q: "The actual file on disk that contains the records is the:",
        options: ["Physical file", "Logical file", "Load module", "Array"],
        answer: 0,
        explanation: "The logical file is the name in the program that refers to it.",
      },
      {
        q: "A set of similar elements accessed by position, also called a Table, is a(n):",
        options: ["Array", "Compiler", "Division", "Sentence"],
        answer: 0,
        explanation: "In COBOL, arrays are called tables.",
      },
      {
        q: "The fast search that repeatedly divides a sorted array into two parts is:",
        options: ["Binary search", "Sequential lookup", "PERFORM TIMES", "Abend"],
        answer: 0,
        explanation: "Binary search halves the list repeatedly until the element is found.",
      },
      {
        q: "The utility that converts source code into object code is the:",
        options: ["Compiler", "Load module", "Delimiter", "Literal"],
        answer: 0,
        explanation: "The compiler translates high-level COBOL into machine language.",
      },
      {
        q: "The executable component generated by the compiler is a:",
        options: ["Load module", "Literal", "Paragraph", "Separator"],
        answer: 0,
        explanation: "The load module is the runnable result of compilation.",
      },
      {
        q: "Area A of the coding sheet occupies which columns?",
        options: ["8 - 11", "12 - 72", "1 - 6", "73 - 80"],
        answer: 0,
        explanation: "Area A holds division/section/paragraph headers and level numbers 01 and 77.",
      },
      {
        q: "An asterisk (*) in column 7 means the line is a:",
        options: ["Comment line", "Continuation line", "Page break", "Sequence number"],
        answer: 0,
        explanation: "* = comment; - = continuation; / = new page when printing.",
      },
      {
        q: "The maximum length of a user-defined word is:",
        options: ["30 characters", "8 characters", "20 characters", "No limit"],
        answer: 0,
        explanation: "Up to 30 bytes, except level-numbers.",
      },
      {
        q: 'MOVE ALL "A" TO HEADER does what?',
        options: ["Fills HEADER with A's", "Moves one A", "Copies ALL to HEADER", "Invalid syntax"],
        answer: 0,
        explanation: "ALL repeats a character string or figurative constant to fill the whole field.",
      },
    ],
  },
  "school-l2": {
    title: "School L2: Divisions, PIC & VALUE",
    questions: [
      {
        q: "The only REQUIRED paragraph in the IDENTIFICATION DIVISION is:",
        options: ["PROGRAM-ID", "AUTHOR", "DATE-WRITTEN", "SECURITY"],
        answer: 0,
        explanation: "Everything except PROGRAM-ID is optional.",
      },
      {
        q: "The only machine-dependent division of a COBOL program is the:",
        options: ["ENVIRONMENT DIVISION", "DATA DIVISION", "PROCEDURE DIVISION", "IDENTIFICATION DIVISION"],
        answer: 0,
        explanation: "It describes the hardware the program is written and run on.",
      },
      {
        q: "SOURCE-COMPUTER names the computer used to:",
        options: ["Compile the program", "Execute the program", "Print reports", "Store files"],
        answer: 0,
        explanation: "SOURCE-COMPUTER compiles; OBJECT-COMPUTER executes/runs the program.",
      },
      {
        q: "SELECT statements are written in which paragraph?",
        options: ["FILE-CONTROL", "CONFIGURATION", "WORKING-STORAGE", "SPECIAL-NAMES"],
        answer: 0,
        explanation: "The INPUT-OUTPUT SECTION starts with FILE-CONTROL, which uses SELECT ... ASSIGN TO.",
      },
      {
        q: "Level number 77 is used for:",
        options: ["Items which cannot be sub-divided", "Record description entries", "Condition names", "Rename clause items"],
        answer: 0,
        explanation: "01 record; 02-49 group/elementary; 66 RENAMES; 77 stand-alone; 88 condition names.",
      },
      {
        q: "Which PIC character allows ANY character (letters, digits, special)?",
        options: ["X", "9", "A", "V"],
        answer: 0,
        explanation: "X = any character; 9 = digits only; A = letters and space only.",
      },
      {
        q: "The V in PIC 99V9 is:",
        options: ["An implied decimal point that uses no storage", "A real printed decimal point", "A sign", "A placeholder"],
        answer: 0,
        explanation: "V never prints or displays; use the real '.' for display only.",
      },
      {
        q: "12327 stored in PIC 9(6) becomes:",
        options: ["012327", "12327", "1232.7", "Size error"],
        answer: 0,
        explanation: "Shorter numeric values are padded with leading zeros.",
      },
      {
        q: "HELLO moved to PIC X(4) gives:",
        options: ["Size error", "HELL", "HELLO", "HELLO_"],
        answer: 0,
        explanation: "Text longer than an alphanumeric field causes a size error.",
      },
      {
        q: "The Z editing character:",
        options: ["Replaces leading zeros with blanks", "Replaces leading zeros with asterisks", "Inserts a dollar sign", "Inserts a slash"],
        answer: 0,
        explanation: "Z = zero suppression; * = asterisks (check writing); $ = currency; / = date separator.",
      },
      {
        q: "A numeric item with a real '.' in its PIC:",
        options: ["Cannot be used in calculations", "Cannot be displayed", "Uses no storage", "Is always signed"],
        answer: 0,
        explanation: "The real decimal point is for display only; use V for calculations.",
      },
      {
        q: "The VALUE clause is used to:",
        options: ["Initialize a data item", "Declare its type", "Name the file", "End the program"],
        answer: 0,
        explanation: "VALUE initializes with a numeric literal, alphanumeric literal, or figurative constant.",
      },
      {
        q: "Level number 66 is used for:",
        options: ["Rename clause items (RENAMES)", "Condition names", "Record entries", "Stand-alone items"],
        answer: 0,
        explanation: "01 record; 02-49 group/elementary; 66 RENAMES; 77 stand-alone; 88 condition names.",
      },
      {
        q: "The P character in a PIC clause:",
        options: [
          "Is a scaling placeholder that uses no storage (99PPP = multiples of 1,000)",
          "Prints a decimal point",
          "Marks a positive number",
          "Inserts a comma",
        ],
        answer: 0,
        explanation: "P changes precision without storing anything: 99PPP holds 0 to 99,000; PP9 holds thousandths.",
      },
      {
        q: "QUOTE / QUOTES as figurative constants represent:",
        options: ["One or more quotation marks", "Blank spaces", "Zeros", "Any character"],
        answer: 0,
        explanation: "QUOTE/QUOTES = quotation mark (\") or apostrophe ('); SPACE/SPACES = blanks; ZEROES = zeros.",
      },
      {
        q: "01 WS-VAR PIC 9(5) VALUE ZEROES - here ZEROES is a:",
        options: ["Figurative constant", "Numeric literal", "Non-numeric literal", "Reserved file name"],
        answer: 0,
        explanation: "Figurative constants are system-defined words like ZEROES used to initialize fields.",
      },
      {
        q: "FILLER is used for:",
        options: ["Parts of a record you never refer to by name", "The main variable", "Ending the program", "File assignment"],
        answer: 0,
        explanation: "In the VALUE clause example, FILLER builds heading spaces and text that are never referenced.",
      },
    ],
  },
  "school-l3": {
    title: "School L3: Condition Statements",
    questions: [
      {
        q: "A condition statement controls program flow by checking whether something is:",
        options: ["True or false", "Numeric or alphabetic", "Positive or negative", "Fast or slow"],
        answer: 0,
        explanation: "The program runs different code depending on the yes/no answer.",
      },
      {
        q: "The two characteristics of the IF statement are: a comparison and:",
        options: ["An action", "A period", "A paragraph name", "A level number"],
        answer: 0,
        explanation: "It must compare two values (true/false) and contain an action taken only if true.",
      },
      {
        q: "In IF GRADE > 74.00 MOVE \"PASSED\" TO REMARKS - if GRADE is 70:",
        options: ["Nothing happens", "REMARKS becomes PASSED", "Program abends", "REMARKS becomes FAILED"],
        answer: 0,
        explanation: "Without ELSE, a false condition means the statements are simply skipped.",
      },
      {
        q: "In a statement with both arithmetic and a relation condition, which is performed first?",
        options: ["The arithmetic operations", "The comparison", "Whichever is written first", "Random order"],
        answer: 0,
        explanation: "e.g. in IF A + B > C, A + B is computed first, then compared.",
      },
      {
        q: "In standard COBOL, POSITIVE means:",
        options: ["Greater than zero", "Zero or positive", "Not negative", "Any value"],
        answer: 0,
        explanation: "Zero is neither positive nor negative. NOT POSITIVE = zero or negative.",
      },
      {
        q: "Which class condition validates input before arithmetic?",
        options: ["NUMERIC", "ALPHABETIC", "POSITIVE", "ZERO"],
        answer: 0,
        explanation: "IF field IS NUMERIC prevents errors when letters are typed into a number field.",
      },
      {
        q: "Level 88 entries define:",
        options: ["Condition names", "Group items", "File records", "Constants"],
        answer: 0,
        explanation: "A level 88 gives a readable name to a value, e.g. NO-MORE-DATA VALUE \"Y\".",
      },
      {
        q: "PERFORM PROCESS-DATA UNTIL NO-MORE-DATA equals:",
        options: ['PERFORM PROCESS-DATA UNTIL END-OF-FILE = "Y"', "PERFORM NO-MORE-DATA", "PERFORM PROCESS-DATA 5 TIMES", "STOP RUN"],
        answer: 0,
        explanation: "The condition name is just another way of writing the field = value test.",
      },
      {
        q: "Order of priority for logical operators:",
        options: ["Parentheses, NOT, AND, OR", "NOT, AND, OR, parentheses", "AND, OR, NOT, parentheses", "OR, AND, NOT, parentheses"],
        answer: 0,
        explanation: "Parentheses first (inner to outer), then NOT, then AND, then OR.",
      },
      {
        q: "EVALUATE is the equivalent of which statement in C?",
        options: ["switch", "if", "while", "for"],
        answer: 0,
        explanation: "EVALUATE checks one subject against many cases; WHEN OTHER = default.",
      },
      {
        q: "In the CONDI.COB demo, the passing line is an average of:",
        options: ["75", "74", "50", "90"],
        answer: 0,
        explanation: "IF AVERAGE >= 75 moves PASSED, else FAILED. 90+ EXCELLENT, 80+ VERY GOOD, 75+ GOOD JOB.",
      },
      {
        q: "After ELSE, NEXT SENTENCE means:",
        options: ["Skip to the next sentence", "Stop the program", "Repeat the IF", "Go to WHEN OTHER"],
        answer: 0,
        explanation: "The IF-ELSE format allows { NEXT SENTENCE | Statement(s) } after ELSE.",
      },
      {
        q: "EVALUATE TRUE runs:",
        options: ["The first WHEN whose condition is true", "Every WHEN", "Only WHEN OTHER", "The last WHEN"],
        answer: 0,
        explanation: "With EVALUATE TRUE, each WHEN holds a condition; the first true one wins.",
      },
    ],
  },
  "school-l4": {
    title: "School L4: PERFORM",
    questions: [
      {
        q: "After PERFORM executes a paragraph, control returns to:",
        options: ["The statement immediately following the PERFORM", "The top of the program", "The next paragraph", "STOP RUN"],
        answer: 0,
        explanation: "PERFORM works like calling a function: run the paragraph, then come back.",
      },
      {
        q: "PERFORM CCMIT-RTN 5 TIMES runs the paragraph:",
        options: ["Exactly 5 times", "Until a condition is true", "Once", "Forever"],
        answer: 0,
        explanation: "TIMES repeats the paragraph the exact integer number of times.",
      },
      {
        q: "PERFORM A-RTN THROUGH B-RTN executes:",
        options: ["All paragraphs from A-RTN to B-RTN in order", "Only A-RTN", "Only B-RTN", "A-RTN repeatedly"],
        answer: 0,
        explanation: "The whole range runs once each, then control returns after the PERFORM.",
      },
      {
        q: "THRU compared to THROUGH:",
        options: ["Means the same thing", "Is only for old compilers", "Is invalid in modern COBOL", "Runs backwards"],
        answer: 0,
        explanation: "The slide says only old compilers accept THRU, but THRU works in modern COBOL too.",
      },
      {
        q: "In PERFORM ... UNTIL, the condition is tested:",
        options: ["Before each execution", "After each execution", "Only at the end", "Never"],
        answer: 0,
        explanation: "If the condition is already true at the start, the paragraph never runs at all.",
      },
      {
        q: "PERFORM VARYING is used mainly for:",
        options: ["Table handling", "File closing", "Printing headings", "Sign testing"],
        answer: 0,
        explanation: "VARYING data-field FROM initial BY increment UNTIL condition - used with subscripts.",
      },
      {
        q: "In the PER.cbl demo, why did UNTIL-RTN print only once?",
        options: ["FLAG became 1 after the first pass, so the condition was true", "It was performed 1 TIME", "The program stopped", "FLAG was reset to 0"],
        answer: 0,
        explanation: 'It printed "FLAG VALUE = 0", added 1, and then FLAG = 1 made UNTIL true.',
      },
      {
        q: "In the demo, VARYING printed 01 to 05 because:",
        options: ["COUNTER stops when COUNTER > LIMI (5), and PIC 9(02) shows two digits", "It always prints 5", "LIMI was 10", "COUNTER is PIC 9(5)"],
        answer: 0,
        explanation: "COUNTER goes 1..5; at 6 the condition COUNTER > LIMI is true and the loop ends.",
      },
      {
        q: "The priming read in a file loop means:",
        options: ["Reading one record before the loop starts", "Reading the whole file first", "Closing the file", "Writing a record"],
        answer: 0,
        explanation: "Open, read one record, then loop: process and read the next until AT END sets EOFSW = 1.",
      },
      {
        q: "EOFSW in the file-processing examples is:",
        options: ["An end-of-file switch that stops the UNTIL loop", "A file name", "A level 88 only", "A printer code"],
        answer: 0,
        explanation: "READ ... AT END MOVE 1 TO EOFSW, and PERFORM ... UNTIL EOFSW = 1 stops the loop.",
      },
      {
        q: "A subscript is:",
        options: ["A constant or data field used to access a specific element of a table", "A type of PIC clause", "A file organization", "A logical file name"],
        answer: 0,
        explanation: "Elements are accessed with the table name and a subscript, e.g. STUDENT-NAME (I).",
      },
      {
        q: "The five PERFORM forms covered in this lesson are:",
        options: [
          "Simple, TIMES, THROUGH, UNTIL, VARYING",
          "OPEN, READ, WRITE, CLOSE, STOP",
          "IF, ELSE, EVALUATE, WHEN, OTHER",
          "MOVE, ADD, SUBTRACT, MULTIPLY, DIVIDE",
        ],
        answer: 0,
        explanation: "PERFORM, PERFORM TIMES, PERFORM THROUGH, PERFORM UNTIL and PERFORM VARYING are the control structures.",
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
