/** 1st-semester school tutorial (lessons by Royette H. Vergara).
 *  Each section keeps the EXACT slide text ("exact") plus a plain-words
 *  explanation ("simple") shown as a hint box. */

export interface SchoolTable {
  headers: string[];
  rows: string[][];
}

export interface SchoolSection {
  heading: string;
  exact: string;
  code?: string;
  table?: SchoolTable;
  note?: string;
  simple: string;
}

export interface SchoolLesson {
  slug: string;
  no: number;
  title: string;
  objectives?: string[];
  sections: SchoolSection[];
}

const L1: SchoolLesson = {
  slug: "school-l1",
  no: 1,
  title: "Lesson 1 - Introduction to COBOL Programming",
  objectives: [
    "Know the history, strengths and weaknesses of COBOL.",
    "Master COBOL terminology (statement, sentence, paragraph, section, division).",
    "Understand the coding sheet, character set, words, variables, literals, constants and level numbers.",
  ],
  sections: [
    {
      heading: "1. History of COBOL",
      exact:
        "- COBOL stands for Common Business Oriented Language.\n- Developed in 1959 by the CODASYL committee.\n- First compilers released in 1960.\n- American National Standard Institute (ANSI) Standards:\n  - 1968 - First standard version\n  - 1974 - Second version for efficiency\n  - 1985 - Enhanced versatility and structure\n  - 2002 - Object-oriented features added\n  - 2014 - Method overloading introduced\n- Still widely used in business, banking, insurance, and government systems.\n- Strengths: simple, portable, maintainable.\n- Weaknesses: wordy, rigid format, not for scientific use.",
      simple:
        "COBOL was designed for business data processing. A committee created it in 1959 and the first compilers came out in 1960. ANSI then released updated standards over time: 1968 was the first, 1974 improved efficiency, 1985 improved structure, 2002 added object-oriented features, and 2014 added method overloading. It is still used by banks, insurers, and governments. It is easy to read and move between systems, but it needs a lot of typing, has a strict layout, and is not meant for scientific computing.",
    },
    {
      heading: "2. COBOL in Today's World",
      exact:
        "- COBOL remains the backbone of mainframe computing.\n- Essential for the global economy - powers most financial systems.\n- Usage Highlights:\n  - ~96% of ATM transactions run on COBOL.\n  - Powers 80% of in-person transactions (banking, insurance, commerce).\n  - Nearly every credit card purchase relies on COBOL mainframe apps.\n  - 71% of Fortune 500 companies depend on COBOL for daily operations.\n  - 60M+ hospital patients receive care through COBOL systems.\n  - 500M+ mobile phones connect directly/indirectly to COBOL apps.\n  - 2K+ containers and 20K+ retirement plans managed by COBOL.\n  - Over 1 billion new lines of COBOL code written each year.",
      simple:
        "Even though COBOL is old, it quietly runs much of the money world: ATMs, card payments, insurance, and big company back-end systems. The slide uses these statistics to show why COBOL skills are still valuable. These figures come from the lesson itself.",
    },
    {
      heading: "3. Advantages",
      exact:
        "- It is easy to read as it has English-like syntax.\n- Relatively easy to develop, use, and maintain.\n- Have many testing, analysis, and debugging tools.\n- Structured high-level and self-documenting programming language.\n- Compatible with the previous versions.\n- Free and Open-source.\n- Process huge volumes of data with ease.\n- Platform independent.\n- Portable across the platforms.",
      simple:
        "COBOL code reads almost like English sentences, so it explains itself. It is structured, has plenty of tools for testing and debugging, keeps working with older versions, can handle very large amounts of data, and can run on different platforms.",
    },
    {
      heading: "4. Disadvantages",
      exact:
        "- Code might look very long because of its structured programming.\n- It requires more compilation time depending on program length and resource availability.\n- Can't use it for scientific calculations.\n- It has a very wordy syntax.\n- It requires more coding lines for specific logic compared with some other known programming languages in the market.\n- The programmer needs to understand machine language because sometimes needs to analyze the dump.",
      simple:
        "The downside is that programs get long and wordy, may take longer to compile, and need more lines than many other languages for the same logic. It is not suited for scientific calculations. Also, when a program crashes, you may have to read a memory dump, which requires some machine-level understanding.",
    },
    {
      heading: "5. COBOL Programming Terminology (1 of 3)",
      exact:
        "Abend - An unexpected or abnormal termination of the program due to some problem in code or data.\n\nSyntax - It is a system-defined standard that should follow while coding the COBOL statements like MOVE, IF, PERFORM, etc.\n\nCharacter String - It is a set of characters used to name something.\n\nStatement - Individual instructions or commands in COBOL, like MOVE, ADD, DISPLAY, etc.\n\nSentence - Groups of COBOL statements ending in a period.\n\nParagraph | Routine - It is a set of statements that are coded together separately from PROCEDURE DIVISION to perform a task. We should PERFORM the paragraph to execute it.\n\nSection - It is a set of paragraph that are coded together separately from PROCEDURE DIVISION. We should PERFORM the section to execute it.\n\nDivision - Major parts used to code the COBOL program, such as the IDENTIFICATION DIVISION, ENVIRONMENT DIVISION, DATA DIVISION, and PROCEDURE DIVISION.",
      simple:
        "Abend: the program stops suddenly because of a problem. Syntax: the rules for how statements must be written. Character string: letters/digits grouped to form a name. Statement: one instruction (MOVE, ADD, DISPLAY). Sentence: one or more statements ended by a period. Paragraph (routine): a named block of statements you run using PERFORM. Section: a group of paragraphs, also run with PERFORM. Division: the four big parts of every COBOL program.",
    },
    {
      heading: "6. COBOL Programming Terminology (2 of 3)",
      exact:
        "Separator - It is character(s) used to separate the strings. Example - Space, comma, etc.\n\nDelimiter - It is used to specify the start or end of the strings. Example - single quote, double quote.\n\nCondition - It is the expression that results TRUE or FALSE. Based on the return value, the program flow gets decided.\n\nVariable | Data Item - A Variable is a data name used to hold the value for processing in the program.\n\nConstant - A constant is a variable that has only one value throughout the execution of the program.\n\nFigurative Constants - These are system-defined keywords with predefined values.\n\nLiteral - It is the value that is assigned to the variable.\n\nScope Terminator - It is a COBOL reserved word that specifies the end of the specific COBOL statements.\n\nArithmetic Expression - It is the coding form of arithmetic calculations and it is a combination two or more variables with arithmetic operators (+, -, *, /). Example - WS-A = WS-B + WS-C.",
      simple:
        "Separator: a space or comma that splits strings apart. Delimiter: a mark (like quotes) that shows where a string starts and ends. Condition: a test whose answer is TRUE or FALSE and decides what the program does next. Variable: a named place that holds a value. Constant: a variable whose value never changes. Figurative constants: built-in words like ZERO and SPACE. Literal: the actual value you assign. Scope terminator: a word like END-IF that closes a statement. Arithmetic expression: a calculation using variables and + - * /.",
    },
    {
      heading: "7. COBOL Programming Terminology (3 of 3)",
      exact:
        "Physical File - It is the actual file that contains the data in the form of records.\n\nLogical File - It is a name used in the program that refers the actual physical file.\n\nArray | Table - It is a set of similar elements arranged in sequential order and can access with their position. It is also called as Table in COBOL.\n\nBinary Search - It is an algorithm used on sorted arrays to search the element quickly. The binary search uses the technique of repeatedly dividing the entire array into two parts until found the element.\n\nCompiler - It is a utility that coverts source code (high-level language) into object code (machine language).\n\nLoad modules - It is an executable component of the program that is generated by the compiler.",
      simple:
        "Physical file: the real file on disk holding the records. Logical file: the name your program uses to point to that real file. Array/table: a list of similar items you reach by position. Binary search: a fast way to find an item in a sorted list by repeatedly splitting the list in half. Compiler: translates your COBOL source code into machine code. Load module: the runnable result the compiler produces.",
    },
    {
      heading: "8. Features of COBOL Language",
      exact:
        "1. Machine independent - can be executed in different types of computer with slight or no modification at all.\n2. Easy to understand\n3. Easy to maintain\n4. COBOL programs are uniquely organized in 4 divisions\n5. Can handle voluminous data using a few statements",
      simple:
        "The language itself is portable between computers, simple to understand and maintain, always organized into four divisions, and able to process large amounts of data with only a few statements.",
    },
    {
      heading: "9. Features of COBOL Program",
      exact: "1. It uses english-like syntax\n2. Unusual length compared with other programming languages\n3. Column sensitive\n4. Spacing sensitive\n5. Uses indentations",
      simple:
        "A COBOL program reads like English, tends to be long, and cares about which column and how much spacing you use. Indentation is used to keep it organized.",
    },
    {
      heading: "10. Overall Structure of COBOL Programs (Elements)",
      exact:
        "[Diagram, top to bottom: COBOL Program -> DIVISION -> Section -> Paragraph -> Sentence -> Statement -> Character Strings]\n\nA. A character is the lowest form in the program structure.\nB. A word is made up of one or more characters.\nC. A clause consists of characters and words, and is used to specify an attribute of an entry. Example: FD clause, PICTURE clause, etc.\nD. A statement is a syntactically valid combination of words and characters written in the PROCEDURE DIVISION of a COBOL program and beginning with a verb.\nE. A sentence is a sequence of one or more statements the last of which is terminated by a period followed by a space.\nF. A paragraph consists of one or more sentences.\nG. A division consists of one or more paragraphs or sections. Every COBOL program consists of four divisions in the following order.",
      simple:
        "Think of a COBOL program as nested boxes. The smallest piece is a character; characters form words; words form clauses (like a PICTURE clause) that describe an entry. In the PROCEDURE DIVISION, a statement starts with a verb; one or more statements ending in a period and a space make a sentence; sentences make a paragraph; paragraphs or sections make a division; and the divisions make the program.",
    },
    {
      heading: "11. Four Divisions of COBOL",
      exact:
        "1. IDENTIFICATION DIVISION - The first division of the COBOL program. This division contains the identification of the program and its author or programmer.\n2. ENVIRONMENT DIVISION - This division describes the types of hardware in which the program is written and executed. It contains the CONFIGURATION SECTION which defines the source and object computer; and the INPUT AND OUTPUT SECTION which defines the files (logical and physical files) to be used in the program.\n3. DATA DIVISION - This division contains the FILE SECTION which declares the logical input and output files to be used in the program and the WORKING STORAGE SECTION which declares all the variables to be used in the program.\n4. PROCEDURE DIVISION - This division contains user defined sections, paragraphs, clauses, and statements. This is where the program logic is developed.",
      simple:
        "Order matters: (1) IDENTIFICATION says who/what the program is. (2) ENVIRONMENT describes the computer and the files used. (3) DATA declares the files (FILE SECTION) and all variables (WORKING-STORAGE SECTION). (4) PROCEDURE holds the actual logic, the steps the program performs.",
    },
    {
      heading: "12. Use of the COBOL Coding Form / What is Coding Sheet",
      exact:
        "COBOL coding sheet specifies from where each statement coding should start and how it differentiates from other statements. Nowadays, COBOL editors are used to code programs. However, the same coding sheet is standard, and developers should follow these guidelines while coding the programs.",
      simple:
        "The coding sheet tells you in which column each kind of line must start. Even though we now type in editors instead of on paper forms, the same column rules still apply.",
    },
    {
      heading: "13. Coding Sheet Split",
      exact:
        "A row is divided into multiple parts:\n- Columns 1-6: Sequence Number Area\n- Column 7: Indicator Area\n- Columns 8-11: Area A\n- Columns 12-72: Area B\n- Columns 73-80: System Generated Number",
      simple:
        "Each line is 80 columns wide: 1-6 sequence numbers, 7 indicator, 8-11 Area A, 12-72 Area B, and 73-80 for system-generated numbers.",
    },
    {
      heading: "14. Columns 1-6 (Sequence Number Area)",
      exact:
        "- The first six columns are reserved for the sequence number.\n- The sequence number automatically increases with every addition of a new line.\n- COBOL compiler does not consider these columns part of the code.\n- Any valid character combination overwrites the sequence number value.\n\nThe sequence number area is divided into two parts:\n- Page Number (1-3 Columns) - Represents the current page number.\n- Line Number (4-6 Columns) - Represents the current line number on the page.",
      simple:
        "Columns 1-6 are only for numbering lines. The editor increases the number as you add lines, and the compiler ignores it. Columns 1-3 hold the page number and columns 4-6 hold the line number on that page.",
    },
    {
      heading: "15. 7th Column (Indicator Area)",
      exact:
        "- (hyphen) Continuation line: Any sentence, entry, clause or phrase that requires more than one line can be continued in Area B of the next line that is neither a comment line or a blank line.\n* Comment line: The comment can be written anywhere in Area A and Area B of that line and can consist of any combination of characters from the character set of the computer.\n/ Forward Slash - used to go to the top of the next page when printing a report.",
      simple:
        "Column 7 is a special flag. A hyphen (-) means this line continues the previous one. An asterisk (*) turns the whole line into a comment that the compiler ignores. A slash (/) makes the printout start a new page.",
    },
    {
      heading: "16. Area A, Area B and Columns 73-80",
      exact:
        "Columns 8 - 11 (Area A):\n- Division headers\n- Section headers\n- Paragraph headers or paragraph names\n- Level indicators or level-numbers (01 and 77)\n- DECLARATIVES and END DECLARATIVES\n- End program, end class, and end method markers\n\n12-72 Columns (Area B):\n- Entries, sentences, statements, and clauses\n- Continuation lines\n\nColumns 73 - 80 System Generated Number:\n- COBOL compiler will exclude this during compilation time",
      simple:
        "Headers (divisions, sections, paragraph names) and the level numbers 01 and 77 start in Area A (columns 8-11). The actual statements, entries, and clauses go in Area B (columns 12-72). Columns 73-80 are for system numbering and are ignored by the compiler.",
    },
    {
      heading: "17. COBOL Characters and Words",
      exact:
        "Character - most basic and indivisible unit of the COBOL Language.\n\nWord - a sequence of characters\n\n2 Types of Words:\n- User-defined Words - Any word that is defined by the developer is called as a user-defined word and is used to store the data. It can be of maximum length is 30 bytes (except for level-numbers). They can be anything from MTHPROG1, STD-GENDER, reflecting the unique aspects of your COBOL program. For Example - MTHPROG1, STD-GENDER, ....\n- Reserved Words - A reserved word is a system-defined word with proper meaning or task assigned in COBOL language. Reserved words can be - keywords, optional words, figurative constants, special character words and special registers. For Example - ACCEPT, SKIP1, ZERO",
      simple:
        "A word is a group of characters. User-defined words are names you invent (up to 30 characters) for your data, like STD-GENDER. Reserved words already have a meaning in COBOL (ACCEPT, ZERO), so you cannot use them as your own names.",
    },
    {
      heading: "18. Variable",
      exact:
        "A Variable is used to store and process the value. It holds a pointer to memory location where actually the value stored. Every variable should be declared in the DATA DIVISION of the COBOL program.\n\nA variable declaration should always contain the data type with its length (except the group variable). A Variable is also called a data item. For Example - WS-A, WS-VAR, WS-TOTAL, WS-INPUT, WS_OUTPUT, etc.",
      simple:
        "A variable is a named spot in memory for a value. You must declare it in the DATA DIVISION with its type and length (group variables are the exception because their size comes from the items inside them). A variable is also called a data item.",
    },
    {
      heading: "19. Literal",
      exact:
        "The literal is the value that is assigned to the variable. The value can be a string or number. Literals are two types:\n\nNon-numeric literals - Non-numeric literals are the strings enclosed by quotation marks(\") or apostrophes('). It can contain all valid character that are allowed by COBOL. For Example - \"HELLO\", \"THIS ISN'T WRONG\", etc.\n\nNumeric literals - A numeric literal is a number that is a combination of a sign (+ or -), and a decimal point. A numeric literal codes directly without quotation marks(\" \") and apostrophes(' '). For Example - 1234, -1234, etc.",
      simple:
        "A literal is a fixed value written directly in the code. Text literals go inside quotes. Numeric literals are written plainly with no quotes and can have a sign and a decimal point.",
    },
    {
      heading: "20. Constant",
      exact:
        "A variable is initialized with a literal. If the variable value doesn't change during the program's execution, the variable is considered as a constant variable, and the value is considered as a constant value.\n\nConstant values are three types:\n- Numeric constants - Numeric variables having one value throughout the program execution. 3.14 is numeric constant. For Example - 01 WS-PI PIC 9(2)V9(2) VALUE 3.14.\n- Alphanumeric | non-numeric constants - Alphanumeric variables with only one value throughout the program execution. HI is the non-numeric constant. For Example - 01 WS-HI PIC X(05) VALUE \"HI\".\n- Figurative Constants - System-defined constants are predefined in the COBOL and used as replacements for standard values like spaces, zeroes, etc. ZEROES is the figurative constant. For Example - 01 WS-VAR PIC 9(5) VALUE ZEROES.",
      simple:
        "If you give a variable a value with VALUE and never change it, it acts as a constant. There are three kinds: numeric (WS-PI = 3.14), alphanumeric (WS-HI = \"HI\"), and figurative (built-in words such as ZEROES).",
    },
    {
      heading: "21. Figurative Constants",
      exact: "",
      table: {
        headers: ["Figurative constant", "Description"],
        rows: [
          ["ZERO, ZEROS, ZEROES", "Represents one or more occurrences of the numeric value 0. ZERO is a single 0 and ZEROS or ZEROES means two or more occurrences of 0s."],
          ["SPACE, SPACES", "Represents one or more occurrences of the space. i.e MOVE SPACES TO X. SPACE is single SPACE, and SPACES means two or more occurrences of space."],
          ["QUOTE, QUOTES", "Represents one or more occurrences of quotation mark (\") or apostrophe (')."],
          ["ALL", "Represents one or more occurrences of the character string or figurative constant. Example: MOVE ALL \"A\" TO HEADER. - Storage field HEADER will be filled with A's"],
        ],
      },
      simple:
        "These are ready-made words that stand for common values. ZERO/ZEROS/ZEROES fill a field with zeros; SPACE/SPACES fill it with blanks; QUOTE/QUOTES stand for quotation marks; and ALL repeats a given string (MOVE ALL \"A\" TO HEADER fills HEADER with A's).",
    },
    {
      heading: "22. Conceptual Structure of Information in Internal Storage (Sample)",
      exact:
        "Sample\n\nCUSTOMER-INFO\n  NAME (FIRST, LAST), STREET (NUMBER, STR-NAME), CITY, ZIPCODE\n\nMARIA | MAKILING | 12 | CHAMPACA | QUEZON CITY | 1118",
      simple:
        "This sample shows one customer record as a table of groups and smaller parts. CUSTOMER-INFO is the whole record, made of NAME (FIRST, LAST), STREET (NUMBER, STR-NAME), CITY, and ZIPCODE. It sets up the next slide, which writes this structure with level numbers.",
    },
    {
      heading: "23. Hierarchical Organization of Data",
      exact: "COBOL represents the hierarchical structure by means of level numbers. Using the conceptual structure above, the equivalent hierarchical organization is:",
      code: "01 CUSTOMER-INFO\n 02 NAME\n  03 FIRST\n  03 LAST\n 02 STREET\n  03 NUMBER\n  03 STR-NAME\n 02 CITY\n 02 ZIPCODE\n\nNote:\n- Allowable level range 01 -49\n- Indentations are preferred but not required\n- Level numbers need not increase by consecutive numbers",
      simple:
        "Level numbers show which item belongs inside which. 01 is the whole record, and bigger numbers (02, 03...) are parts nested inside the one above. Here NAME contains FIRST and LAST. You may use levels 01-49, indentation is just for readability, and the numbers do not have to go 1, 2, 3 in a row (you could jump from 01 to 05).",
    },
    {
      heading: "24. Data Names or Variables - Rules",
      exact:
        "Rules:\n1. A data name can be up to 30 characters in length and can include alphabetic characters, numeric characters and the hyphen.\n2. At least one character must be alphabetic\n3. The only special symbol permitted is the hyphen. The hyphen must always be embedded (i.e. it cannot be the first or the last character of the data name).\n4. Blanks are not allowed.\n5. Do not use reserved words.\n\nExample of VALID data names:\n1. HOURS\n2. ENDING-INVENTORY\n3. SALES-TAX-TOTAL",
      simple:
        "Naming rules: up to 30 characters; letters, digits and hyphens only; at least one letter; the hyphen cannot be first or last; no spaces; and no reserved words. HOURS, ENDING-INVENTORY, and SALES-TAX-TOTAL follow all of these rules.",
    },
  ],
};

const L2: SchoolLesson = {
  slug: "school-l2",
  no: 2,
  title: "Lesson 2 - COBOL Programming (ID & Environment Division, Data Types, PIC, VALUE)",
  objectives: [
    "Know the basic syntax of IDENTIFICATION and ENVIRONMENT DIVISION.",
    "Know the different sections and paragraphs of IDENTIFICATION and ENVIRONMENT DIVISION.",
    "Use the COBOL language in I.T. applications.",
  ],
  sections: [
    {
      heading: "1. Identification Division",
      exact:
        "IDENTIFICATION DIVISION is the first division of COBOL program. The function of this division is to supply information about the program to others who may use it as reference. It describes the program to potential users. It states the name of the program and other optional information such as information regarding author, the date the program was written, security. Etc.\n\nIts purpose is to identify program and its author and to provide other general information about the program, such as the dates the program is written and compiled, any program security, and so forth. They start in column-8 of the COBOL coding sheet. The only required paragraph in this division is the PROGRAM-ID paragraph while the rest is optional.",
      simple:
        "This is the program's ID card. It gives the program name and optional details like author, dates, and security. It starts in column 8. Only PROGRAM-ID is required; everything else is optional.",
    },
    {
      heading: "2. Rules for Interpreting Instruction Formats",
      exact:
        "A. Uppercase words are COBOL reserved words that have special meaning to the compiler.\nB. Lowercase words are use-defined entries. They are within curly braces {}.\nC. Underlined words are required in the paragraph.\nD. If punctuation is specified in the format, it is required.\nE. Brackets [ ] mean the clause or paragraph is optional.\nF. The use of dots or ellipses (...) means that additional entries of the same type may be included if desired.",
      simple:
        "These rules help you read the syntax diagrams. UPPERCASE = reserved words. Lowercase in { } = something you supply. Underlined = required. Punctuation shown must be typed. [ ] = optional. The dots (...) mean you may repeat that kind of entry.",
    },
    {
      heading: "3. Identification Division Syntax",
      exact: "Syntax:",
      code: "IDENTIFICATION DIVISION.\nPROGRAM-ID. Program name\n[AUTHOR. {comment-entry}.....]\n[INSTALLATION. {comment-entry.....}]\n[DATE-WRITTEN. {comment-entry...}]\n[SECURITY. {COMMENT-ENTRY....}]",
      simple:
        "Write IDENTIFICATION DIVISION. then PROGRAM-ID. with your program name (required). AUTHOR, INSTALLATION, DATE-WRITTEN, and SECURITY are in brackets, so each is optional and takes a free-text comment.",
    },
    {
      heading: "4. Environment Division",
      exact:
        "ENVIRONMENT DIVISION is the second division of COBOL program. It describes the \"computing environment\" of the program. The \"computing environment\" refers to the type of computer hardware on which the program is written and run. It is the only machine-dependent division of a COBOL program. It supplies information about the computer equipment to be used in the program. That is, the entries in this division will be dependent in the computer system and the specific devices or hardware used in the program. This division also briefly describes the data files required by the program.",
      simple:
        "This second division describes the computer setup the program runs on. It is the only machine-dependent part of a COBOL program, and it also gives a brief description of the files the program needs.",
    },
    {
      heading: "5. Environment Division Syntax",
      exact: "Syntax:",
      code: "ENVIRONMENT DIVISION.\n[CONFIGURATION SECTION.\n SOURCE-COMPUTER. {computer name}\n OBJECT-COMPUTER {computer name}\n SPECIAL NAMES {computer name}\nINPUT-OUTPUT SECTION.\n FILE-CONTROL.\n  SELECT {filename-1}\n  ASSIGN TO {implementor-name-1}....]",
      simple:
        "This is the full outline of the division: a CONFIGURATION SECTION (source computer, object computer, special names) and an INPUT-OUTPUT SECTION with FILE-CONTROL, where SELECT names a file and ASSIGN TO ties it to a device or file.",
      note: 'The slide spells CONFIGURATION SECTION as "SECTOIN" in this diagram; the correct spelling is SECTION.',
    },
    {
      heading: "6. Configuration Section",
      exact:
        "It supplies the information about the computer on which the COBOL program will be compiled and executed. Configuration section provides documentation information which includes the computer manufacturer, computer number and computer model number. The two sections are coded in column 8. Configuration section has three paragraphs:\n\na. SOURCE-COMPUTER - the computer that will be used for compiling the program.\nb. OBJECT-COMPUTER - the computer that will be used for executing or running the program.\nc. SPECIAL-NAMES - a third paragraph that is optional in the configuration section. This focuses on special used for reading or displaying data.",
      simple:
        "The Configuration Section documents the computer. SOURCE-COMPUTER is the machine that compiles the program, OBJECT-COMPUTER is the machine that runs it, and SPECIAL-NAMES (optional) handles special settings for reading or displaying data. Both sections begin in column 8.",
    },
    {
      heading: "7. Input-Output Section",
      exact:
        "Provides details about input and output devices (terminals, printers, disk drives). Starts with the FILE-CONTROL paragraph, which uses SELECT statements.\n\nSELECT defines a file and assigns it to a device.\n\nUsually includes:\n- Input File -> source data for processing\n- Output File -> report or result file",
      code: "ENVIRONMENT DIVISION.\nINPUT-OUTPUT SECTION.\nFILE-CONTROL.\n SELECT IN-FILE ASSIGN TO DISK\n  ORGANIZATION IS SEQUENTIAL.\n SELECT OUT-FILE ASSIGN TO PRINTER\n  ORGANIZATION IS SEQUENTIAL.",
      simple:
        "This section tells COBOL which files and devices the program uses. Under FILE-CONTROL, each SELECT gives a file a name and assigns it to a device. Normally you have an input file (data to process) and an output file (the report). In the example, IN-FILE goes to DISK and OUT-FILE goes to PRINTER, both read/written in order (SEQUENTIAL).",
    },
    {
      heading: "8. Input-Output Section - Tips",
      exact:
        "TIP:\n- A filename must correspond to the rules of forming user-defined names stated above (i.e. maximum of 30 characters, letters, digits, and hyphen only, no embedded blanks, at least one alphabetic character and not a reserved word.)\n- It is more logical to define the input file first before the output file.\n- Write SELECT statement on two lines for better readability. The best format is as follows:\n  SELECT filename\n  ASSIGN TO device\n- A filename must be specific and meaningful. Avoid acronyms, person's name and aliases. Typically, a filename must be related to the subject of the program. If the program is regarding sales, it can be regarded as SALES-INPUT on input file and SALES-OUTPUT on output file.\n- Assigned filename must be enclosed in double quotes.\n- Ex. SELECT WORKREC ASSIGN TO \"WORKREC.DAT\"",
      simple:
        'File names follow the same naming rules as data names. List the input file before the output file, write SELECT and ASSIGN TO on two lines for readability, and use meaningful names like SALES-INPUT and SALES-OUTPUT instead of acronyms or personal names. The actual file name you assign goes in double quotes, e.g. SELECT WORKREC ASSIGN TO "WORKREC.DAT".',
    },
    {
      heading: "9. COBOL Data Types",
      exact:
        "In describing the data, the following terms should be taken into consideration:\n- Data Name / Variable Name\n- Level Number\n- Picture Clause\n- Value Clause\n\nData names or variables are defined and declared in the DATA DIVISION of a COBOL program. These data names or user-defined names must be prepared so that they can be recognized in the PROCEDURE DIVISION.\n\nLevel Number is used to specify the level of data in a record. They can be elementary or group items.\n- Elementary items cannot be divided further. Level number, Data Name, PICTURE clause and VALUE clause (optional) are used to describe an elementary item.\n- Group items consists of one or more elementary items. Level number, Data Name, and VALUE clause (optional) are used to describe a group item.",
      simple:
        "To describe data you use four things: a name, a level number, a PICTURE clause, and optionally a VALUE clause. Names are declared in the DATA DIVISION so the PROCEDURE DIVISION can use them. An elementary item cannot be split (it has a PIC); a group item is made of elementary items (it has no PIC of its own).",
    },
    {
      heading: "10. Level Numbers",
      exact: "",
      table: {
        headers: ["Level Number", "Description"],
        rows: [
          ["01", "Record description entry"],
          ["02 to 49", "Group and elementary items"],
          ["66", "Rename clause items"],
          ["77", "Items which cannot be sub-divided"],
          ["88", "Condition name entry"],
        ],
      },
      code: "DATA DIVISION.\nWORKING-STORAGE SECTION.\n01 EMPLOYEE-RECORD.\n 02 EMP-ID PIC 9(5).\n 02 EMP-NAME.\n  03 FIRST-NAME PIC A(10).\n  03 LAST-NAME PIC A(15).\n77 TOTAL-EMPLOYEES PIC 9(3).\n88 END-OF-FILE VALUE 'Y'.",
      simple:
        "01 starts a record; 02-49 are the group and elementary items inside it; 66 is for the RENAMES clause; 77 is a stand-alone item that cannot be subdivided; and 88 is a condition name (a yes/no test on a value). In the example, EMPLOYEE-RECORD is a group containing EMP-ID and EMP-NAME, and EMP-NAME is itself a group of FIRST-NAME and LAST-NAME.",
    },
    {
      heading: "11. PIC or PICTURE Clause",
      exact:
        "The PICTURE CLAUSE in COBOL is used to describe the format and characteristics of a data item. It tells the compiler what type of data will be stored and how it will be displayed.\n\nIt defines:\n1. Data type - whether numeric, alphabetic, or alphanumeric\n2. Sign - whether values can be positive/negative\n3. Decimal point position - where the decimal is placed in numeric data\n4. Length - how many characters or digits are allowed\n\nIt starts with the keyword PIC (or PICTURE), followed by a string of symbols (e.g., X, 9, A, V, S) that specify the data pattern.",
      simple:
        "The PIC clause is the data item's blueprint: what kind of data (number, letters, mixed), whether it has a sign, where the decimal point is, and how long it is. You write PIC and then symbols like X, 9, A, V, S.",
    },
    {
      heading: "12. Data Representation Characters",
      exact: "",
      table: {
        headers: ["Character", "Purpose", "Description"],
        rows: [
          ["X", "Any character", "May contain any character including special or unprintable characters"],
          ["9", "Numeric character", "May contain only the characters 0 through 9"],
          ["A", "Alphabetic character", "May contain only the characters A - Z, a - z, and space"],
        ],
      },
      code: "01 NAME PIC A(10).  *> Alphabetic only\n01 ID   PIC 9(5).   *> Numeric only\n01 CODE PIC X(8).   *> Any character",
      simple:
        "A holds letters and spaces only, 9 holds digits only, and X holds anything. The number in parentheses is the length: A(10) is ten letters, 9(5) is five digits, X(8) is eight characters of any kind.",
    },
    {
      heading: "13. Arithmetic Positioning Characters",
      exact: "",
      table: {
        headers: ["Character", "Purpose", "Description"],
        rows: [
          ["S", "Numeric sign", "Does not use any actual storage space, without this character a numeric item would be treated as unsigned"],
          ["V", "Implied decimal point", "Does not use any actual storage space, separates the integer portion of a numeric item from its decimal portion; used to keep track of the decimal point for arithmetic calculations; this character will not print or display; use the actual decimal point character, \".\", for printing"],
          ["P", "Numeric place holder", "Does not use any actual storage space; used to change precision, e.g. 99PPP will hold values in amounts of even 1,000 from zero to 99,000; can also be used to represent positions after the decimal, e.g. PP9 will hold values in amounts in even thousandths, from 0 to .009"],
        ],
      },
      simple:
        "S lets a number be positive or negative. V marks where the decimal point is without taking any space (and it does not print). P is a placeholder for digits you do not store: 99PPP means the value is always a multiple of 1,000, and PP9 means values like 0.001 to 0.009. None of the three use memory.",
    },
    {
      heading: "14. Numeric Editing Characters",
      exact: "",
      table: {
        headers: ["Character", "Purpose", "Description"],
        rows: [
          ["-", "Minus sign", "Used to display a sign in a printed item, the \"-\" character will be showed only if the numeric value is negative, the position will be left blank for positive values"],
          ["+", "Plus sign", "Used to display a sign in a printed item, \"-\" will be shown for negative values, \"+\" will be shown for positive values"],
          [".", "Actual decimal point", "Separates the integer portion from its decimal portion; this character cannot be used in an item involved in a calculation; use the implied decimal point character, \"V\", for calculations"],
          ["Z", "Zero Suppress", "Replaces leading zeros with blanks; has no effect on non-zero positions or zeros not in leading positions"],
          [",", "Comma", "Inserts a comma into the data item in this position; commonly used as a separator in numeric data items"],
          ["$", "Dollar sign", "Inserts a dollar sign into the first position in the data item; commonly used for currency"],
          ["*", "Asterisk", "Replaces leading zeros with asterisks; commonly used in check writing"],
          ["CR", "Credit", "Used at the end of a PICTURE clause, the CR will appear in the position indicated if the item is negative; will be blank for a positive number"],
          ["DB", "Debit", "Used at the end of a PICTURE clause, the DB will appear in the position indicated if the item is negative; will be blank for a positive number"],
          ["/", "Slash", "Inserts a slash into the data item in this position; commonly used as a separator in date fields"],
          ["0", "Zero", "Inserts a zero into the data item in this position; not commonly used"],
        ],
      },
      simple:
        "These symbols change how a number looks when it is displayed or printed. - shows a minus only for negatives; + shows a sign either way; . is the real decimal point (display only, not for math). Z hides leading zeros with blanks; * fills them with asterisks (check printing); , inserts a comma; $ inserts a dollar sign; / inserts a slash (dates); 0 inserts a zero. CR and DB go at the end and appear only when the value is negative.",
    },
    {
      heading: "15. VALUE Clause",
      exact:
        "The VALUE clause is an optional clause which is used to initialize the data items. The values can be numeric literal, alphanumeric literal or figurative constant. It can be used in both the group and elementary items.",
      code: 'Examples:\n1. 01 E-O-F PIC XXX VALUE "NO".\n2. 01 HDG-1.\n    02 FILLER PIC X(10) VALUE SPACES.\n    02 FILLER PIC X(29) VALUE "WELCOME TO COBOL PROGRAMMING!".',
      simple:
        'VALUE sets the starting content of a data item. It can be a number, text, or a figurative constant like SPACES, and it is optional. Example 1 starts E-O-F with "NO". Example 2 builds a heading line: ten blanks, then the text WELCOME TO COBOL PROGRAMMING! FILLER is used for parts you never refer to by name.',
    },
    {
      heading: "16. PIC Clause Table - Value vs. Representation in Storage",
      exact: "How to read the symbols: ^ marks where the implied decimal point (V) sits; _ marks a blank space; the line drawn over the last digits of the negative values marks the negative sign.",
      table: {
        headers: ["PIC (Description)", "Value", "Representation in Storage"],
        rows: [
          ["PIC 9(6)", "12327", "012327"],
          ["PIC 9(4)", "8956", "8956"],
          ["PIC 9(10)", "1563813", "0001563813"],
          ["PIC 99V9", "38.50", "38^5"],
          ["PIC 9(4)V99", "12452.39", "2452^39"],
          ["PIC 999", "550", "550^"],
          ["PIC 99999V99", "23561.00", "23561^00"],
          ["PIC S9(4)V99", "156.29", "0156^29"],
          ["PIC S9(4)V99", "-1251.16", "1251^16 (overline on the last digits)"],
          ["PIC S9(4)V99", "-0.10", "0000^10 (overline on the last digits)"],
          ["PIC XXXXX", "DIODE", "DIODE"],
          ["PIC X(5)", "TUBE", "TUBE_"],
          ["PIC X(20)", "WELCOME TO COBOL", "WELCOME_TO_COBOL____"],
          ["PIC X(4)", "HELLO", "Size error"],
          ["PIC $9(3)V99", "125.13", "$125^13"],
          ["PIC $9(5)V99", "100.0", "$00100^00"],
          ["PIC $$99V99", "12.49", "_$12^49"],
          ["PIC $$$9V99", "150.10", "$150^10"],
          ["PIC $$$$V99", "0.15", "___$^15"],
          ["PIC $9,999.99", "2,350.22", "$2,350.22"],
          ["PIC $9,999.99", "150.31", "$0,150.31"],
          ["PIC $$,$$$.99", "25.40", "___$25.40"],
          ["PIC Z99", "25", "_25"],
          ["PIC Z(3).99", "25", "_25.00"],
          ["PIC Z(3).99", "0.10", "___.10"],
        ],
      },
      simple:
        "9 = a digit: if the value is shorter than the picture it is padded with leading zeros (12327 in PIC 9(6) becomes 012327). V = an invisible decimal point (38.50 in PIC 99V9 keeps only one decimal digit, 38^5). S = sign, marked by the line over the last digits. X = any character, left-aligned and padded with blanks; if the text is longer than the field you get a size error. $ = currency: one $ is fixed in front; several $ (floating) let the sign slide next to the first non-zero digit with blanks before it. Commas and the real decimal point (.) are inserted characters used for display only - a field with a real '.' cannot be used in calculations. Z = zero suppression: leading zeros become blanks.",
    },
  ],
};

const L3: SchoolLesson = {
  slug: "school-l3",
  no: 3,
  title: "Lesson 3 - Condition Statements",
  objectives: [
    "Understand the purpose of condition statements and how they control program flow in COBOL.",
    "Apply relational, logical, and class conditions (NUMERIC, ALPHABETIC) in data validation.",
    "Construct IF-ELSE, nested IF, and EVALUATE statements to handle multiple conditions.",
    "Use conditions effectively in simple COBOL programs involving input checking and decision-making.",
  ],
  sections: [
    {
      heading: "1. Condition Statement",
      exact:
        "A condition statement in COBOL is a command that allows the program to make decisions by checking whether something is true or false. It controls the flow of the program based on a test or comparison.",
      simple: "A condition is a yes/no test. The program runs different code depending on the answer.",
    },
    {
      heading: "2. The IF Statement",
      exact:
        "The IF statement is a kind of condition statement that compares two values. If the result of the comparison is true, a specified statement or set of statements is executed.",
      code: "IF condition\n    Statement(s).\n\nExample:\n IF GRADE > 74.00\n    MOVE \"PASSED\" TO REMARKS.",
      simple: 'If the grade is above 74.00, REMARKS becomes "PASSED". If not, nothing happens.',
    },
    {
      heading: "3. The Two Characteristics of the IF Statement",
      exact:
        "1. It must make a comparison between two values, the result of which must be true or false.\n2. It must contain an action. Whether or not this action is taken is dependent upon the results of the comparison.",
      simple: "An IF needs a test (true or false) and an action that only runs when the test is true.",
    },
    {
      heading: "4. Format of IF-ELSE Statement",
      exact: "",
      code: "IF condition\n    Statement(s)\nELSE\n    { NEXT SENTENCE | Statement(s) }",
      simple: 'ELSE gives the "otherwise" branch. After ELSE you either write statements or use NEXT SENTENCE to skip to the next sentence.',
    },
    {
      heading: "5. Relation Conditions",
      exact:
        "The IF statement is an example of a relation condition. In relation conditions, two operands are compared. The IF statement determines how these operands are \"related to\" one another. The outcome of the comparison will always be either true or false.\n\nThe relational operators are: IS EQUAL TO (=), IS NOT EQUAL TO (NOT =), IS LESS THAN (<), IS NOT LESS THAN (NOT <), IS GREATER THAN (>), IS NOT GREATER THAN (NOT >), IS GREATER THAN OR EQUAL TO (>=), IS LESS THAN OR EQUAL TO (<=).\n\nIt is possible to combine arithmetic operations with relation condition. If a statement contains both arithmetic operations and relation conditions, the arithmetic operations are always performed first.",
      code: "IF datafield-1 { EQUAL TO | NOT EQUAL TO | LESS THAN | NOT LESS THAN\n                 | GREATER THAN | NOT GREATER THAN\n                 | GREATER THAN OR EQUAL TO | LESS THAN OR EQUAL TO } datafield-2",
      simple:
        "Relation conditions compare two values using these 8 operators. You can write them as words or symbols. In something like IF A + B > C, the A + B is computed first, then compared.",
    },
    {
      heading: "6. Sign Condition",
      exact:
        "The sign of the contents of a numeric data field can be tested using sign condition statements. A sign condition test can determine whether the contents of a data field are less than zero, greater than zero, equal to zero, or not equal to zero.",
      code: "IF datafield-1 { NEGATIVE | NON NEGATIVE | POSITIVE | NOT POSITIVE\n                 | ZERO | NOT ZERO }",
      note: 'Slide issue: the note on the slide is not accurate for standard COBOL. POSITIVE means greater than zero (zero is not positive). NOT POSITIVE means zero or negative. NOT NEGATIVE means zero or positive. Copy the slide if your teacher grades by it, but know the correct version for exams and coding.',
      simple:
        "Sign conditions check whether a number is below, above, or at zero, without writing the comparison yourself.",
    },
    {
      heading: "7. Class Condition",
      exact:
        "COBOL can test the class type of a data field to determine whether the contents are numeric or non numeric. The condition is called CLASS condition.\n\nThe numeric test is valuable because it can be used to test the contents of a numeric data field before using its contents in arithmetic calculations. When numeric data fields containing non numeric data values are used in arithmetic calculations, errors are generated. The numeric test prior to using a data field calculations helps avoid such errors.",
      code: "IF datafield-1 { NUMERIC | NON NUMERIC | ALPHABETIC | NOT ALPHABETIC }",
      note: 'Slide issue: the slide writes "NON NUMERIC". In actual COBOL code the usual form is NOT NUMERIC.',
      simple:
        "Use IF field IS NUMERIC to validate input before doing math. This prevents crashes and wrong results when a user types letters into a number field.",
    },
    {
      heading: "8. Condition Name (Level 88)",
      exact:
        "In COBOL, conditions can be defined and names assigned. This is done through the WORKING-STORAGE SECTION of the DATA DIVISION, using level 88. Defined conditions can be referred to by name in the PROCEDURE DIVISION.\n\nEND-OF-FILE is a condition data field in the WORKING-STORAGE SECTION. This data field can be given condition names with number 88, and the condition names can be associated with particular values of END-OF-FILE.",
      code: '05 END-OF-FILE PIC X VALUE "N".\n 88 NO-MORE-DATA VALUE "Y".\n 88 MORE-DATA VALUE "N".\n\nPERFORM PROCESS-DATA\n UNTIL NO-MORE-DATA.\n\nIs equal to the statement below if level 88 is not used:\n\nPERFORM PROCESS-DATA UNTIL END-OF-FILE = "Y".',
      simple:
        'A level 88 gives a readable name to a value. NO-MORE-DATA is just another way of writing END-OF-FILE = "Y". It makes the code easier to read.',
    },
    {
      heading: "9. Logical Operators",
      exact:
        "Compound condition statements evaluate more than one condition. These conditions are joined using logical operators. LOGICAL operators are operators used with logical conditions, or conditions that can always be evaluated as true or false.\n\nOrder of priority in evaluating multiple logical operators in a single COBOL statement:\n1. Logical operators within parentheses (from inner parenthesis to outer parenthesis).\n2. The logical operator NOT.\n3. The logical operator AND.\n4. The logical operator OR.",
      code: "IF condition-1 { AND | OR | NOT } condition-2\n\nExamples:\nIF AGE > 50 OR AGE < 18\n    PERFORM ERROR-RTN.\n\nIF COLLEGE-CODE = \"CCMIT\" AND YR-LEVEL = 3\n AND SEX-CODE = \"M\".\n    ADD 1 TO COUNTER.\n\nIF NOT (EMPLOYEE-RATE IS GREATER THAN 125.00) PERFORM\n COMPUTE-RTN.",
      simple:
        'AND, OR, and NOT combine tests. AND is true only if both conditions are true. OR is true if at least one is true. NOT reverses a condition. The order is parentheses, then NOT, then AND, then OR. In the examples: (1) runs ERROR-RTN if age is over 50 or under 18; (2) adds 1 to COUNTER only if all three are true; (3) runs COMPUTE-RTN when the rate is 125.00 or less.',
    },
    {
      heading: "10. EVALUATE Verb",
      exact: "EVALUATE verb is the SWITCH statement in C programs.",
      code: "EVALUATE {Expression1/Constant/Reference/TRUE/FALSE}\n WHEN Cond-1\n     Statement block-1\n WHEN Cond-2\n     Statement block-2\n WHEN Cond-n\n     Statement block-n\n WHEN OTHER\n     Statement block-OTHER\nEND-EVALUATE.",
      simple: "EVALUATE checks one subject against many cases, like switch in C. WHEN OTHER is the same as default.",
    },
    {
      heading: "11. EVALUATE - Example #1 and its IF-ELSE Equivalent",
      exact: "",
      code: 'EVALUATE TYPE-EMPLOYEE\n WHEN "F" MOVE "FULL TIME" TO EMP-TYPE-PR\n WHEN "P" MOVE "PART TIME" TO EMP-TYPE-PR\n WHEN "C" MOVE "CONSULTANT" TO EMP-TYPE-PR\n WHEN "T" MOVE "TEMPORARY" TO EMP-TYPE-PR\n WHEN OTHER MOVE "INVALID" TO EMP-TYPE-PR.\n\nIF-ELSE EQUIVALENT:\nIF TYPE-EMPLOYEE = "F"\n    MOVE "FULL TIME" TO EMP-TYPE-PR\nELSE\n IF TYPE-EMPLOYEE = "P"\n    MOVE "PART TIME" TO EMP-TYPE-PR\nELSE\n IF TYPE-EMPLOYEE = "C"\n    MOVE "CONSULTANT" TO EMP-TYPE-PR\nELSE\n IF TYPE-EMPLOYEE = "T"\n    MOVE "TEMPORARY" TO EMP-TYPE-PR\nELSE\n    MOVE "INVALID" TO EMP-TYPE-PR.',
      simple: "Both do the same thing, but EVALUATE is much cleaner than a long chain of nested IFs.",
    },
    {
      heading: "12. EVALUATE - Example #2",
      exact: "",
      code: "EVALUATE TRUE\n WHEN ON-HAND = 0\n     PERFORM B-310-NO-INVENTORY\n WHEN ON-HAND > 0 AND < 101\n     PERFORM B-320-INVENTORY-LOW\n WHEN ON-HAND > 101 AND < 501\n     PERFORM B-330-INVENTORY-NORMAL\n WHEN OTHER\n     PERFORM B-340-INVENTORY-HIGH\nEND-EVALUATE.",
      note: "Slide issue: if ON-HAND is exactly 101, it is not < 101 and not > 101, so it falls into WHEN OTHER (HIGH). The normal range should start at >= 101.",
      simple: "EVALUATE TRUE runs the first WHEN whose condition is true.",
    },
    {
      heading: "13. Demo Program: CONDI.COB (Student Grade Evaluator)",
      exact: "From OpenCobolIDE 4.7.6. PERFORM UNTIL CONTINUE-FLAG = \"N\" repeats the whole block until the user answers N. AVERAGE is PIC 999V99: 3 digits, an implied decimal point, and 2 decimals. The first IF sets PASSED or FAILED with 75 as the passing line. The nested IF sets the status by range; order matters because the first true test wins. The OR test shows the warning if any one grade is below 50.",
      code: 'IDENTIFICATION DIVISION.\nPROGRAM-ID. STUDENT-GRADE-EVALUATOR.\nDATA DIVISION.\nWORKING-STORAGE SECTION.\n01 STUD-NAME PIC A(20).\n01 PRELIM PIC 999.\n01 MIDTERM PIC 999.\n01 FINALS PIC 999.\n01 AVERAGE PIC 999V99.\n01 REMARKS PIC A(12).\n01 STATUS-MSG PIC A(30).\n01 CONTINUE-FLAG PIC A(1) VALUE "Y".\nPROCEDURE DIVISION.\nMAIN-PROGRAM.\n PERFORM UNTIL CONTINUE-FLAG = "N"\n  DISPLAY "======================================"\n  DISPLAY "     STUDENT GRADE EVALUATION     "\n  DISPLAY "======================================"\n  DISPLAY "ENTER STUDENT NAME: "\n  ACCEPT STUD-NAME\n  DISPLAY "ENTER PRELIM GRADE: "\n  ACCEPT PRELIM\n  DISPLAY "ENTER MIDTERM GRADE: "\n  ACCEPT MIDTERM\n  DISPLAY "ENTER FINALS GRADE: "\n  ACCEPT FINALS\n  COMPUTE AVERAGE = (PRELIM + MIDTERM + FINALS) / 3\n  IF AVERAGE >= 75\n   MOVE "PASSED" TO REMARKS\n  ELSE\n   MOVE "FAILED" TO REMARKS\n  END-IF\n  IF AVERAGE >= 90\n   MOVE "EXCELLENT" TO STATUS-MSG\n  ELSE\n   IF AVERAGE >= 80\n    MOVE "VERY GOOD" TO STATUS-MSG\n   ELSE\n    IF AVERAGE >= 75\n     MOVE "GOOD JOB" TO STATUS-MSG\n    ELSE\n     MOVE "NEEDS IMPROVEMENT" TO STATUS-MSG\n   END-IF\n  END-IF\n  END-IF\n  IF PRELIM < 50 OR MIDTERM < 50 OR FINALS < 50\n   DISPLAY "WARNING: LOW SCORE DETECTED IN ONE GRADING PERIOD."\n  END-IF\n  DISPLAY " "\n  DISPLAY "============ RESULTS ============="\n  DISPLAY "STUDENT NAME : " STUD-NAME\n  DISPLAY "AVERAGE      : " AVERAGE\n  DISPLAY "REMARKS      : " REMARKS\n  DISPLAY "STATUS       : " STATUS-MSG\n  DISPLAY "=================================="\n  DISPLAY " "\n  DISPLAY "DO YOU WANT TO EVALUATE ANOTHER STUDENT? (Y/N): "\n  ACCEPT CONTINUE-FLAG\n END-PERFORM.\n DISPLAY "PROGRAM ENDED. THANK YOU!"\n STOP RUN.',
      simple:
        'At the end, ACCEPT CONTINUE-FLAG controls whether the loop runs again. Try this exact program in the Compiler tab: cobc -x -free condip.cbl, then ./condi, and type the grades live in the terminal.',
    },
  ],
};

const L4: SchoolLesson = {
  slug: "school-l4",
  no: 4,
  title: "Lesson 4 - COBOL Control Structures (PERFORM)",
  objectives: [
    "Explain the purpose of COBOL control structures and differentiate among the various forms of the PERFORM statement.",
    "Trace and predict the execution flow of unconditional, iterative, and conditional PERFORM statements in sample COBOL programs.",
    "Apply PERFORM, PERFORM TIMES, PERFORM THROUGH, PERFORM UNTIL, and PERFORM VARYING in writing COBOL routines, file-processing loops, and table-handling operations.",
  ],
  sections: [
    {
      heading: "1. COBOL Control Structure",
      exact:
        "COBOL control structure statements provide the mechanisms that allow a program to repeatedly execute a single statement or an entire group of statements based on a stated condition or rule. These structures guide the flow of the program by determining when a particular action should begin, how many times it should be performed, and under what circumstances it should end. Through these control structures, such as PERFORM, PERFORM TIMES, PERFORM UNTIL, PERFORM THROUGH, and PERFORM VARYING, COBOL enables developers to create organized, efficient, and condition driven logic that can handle repetitive tasks, looping processes, file reading operations, and table handling in a clear and structured way.",
      simple:
        "Control structures decide when something starts, how many times it repeats, and when it stops. In COBOL, PERFORM does all of this.",
    },
    {
      heading: "2. The PERFORM Statement",
      exact:
        "It is a statement that transfer program control to specific part of the program. This statement is one of the most powerful and widely used in COBOL statements. On the transferring control to the specified paragraph, the paragraph executes all the statements in that paragraph, and then returns to the statement immediately following the PERFORM statement.",
      simple:
        "PERFORM jumps to a paragraph, runs it, then comes back to the next line after the PERFORM. It works like calling a function.",
    },
    {
      heading: "3. Simple (Unconditional) PERFORM",
      exact: "The format of the simplest unconditional PERFORM statement is:",
      code: "PERFORM statement\n\nExample:\nMAINTAIN-RTN.\n PERFORM BSIT-RTN.\n PERFORM BSCS-RTN\n\nBSIT-RTN.\n MOVE STUDENT-NO TO P-STUDENT-NO.\n MOVE STUDENT-NA TO P-STUDENT-NA.\n\nBSCS-RTN.\n WRITE OUTREC FROM PRT-AREA AFTER 1 LINE.",
      simple:
        "MAINTAIN-RTN calls BSIT-RTN, which does its two MOVEs. Then it calls BSCS-RTN, which writes the record. Each paragraph runs once.",
    },
    {
      heading: "4. PERFORM ... TIMES",
      exact:
        "PERFORM paragraph-name integer TIMES.\n\nThis statement will execute the paragraph several times depending on the integer times specified on the statement.",
      code: "Examples:\nBSIT-RTN.\n PERFROM CCMIT-RTN 5 TIMES\n\nCCMIT-RTN.\n MOVE 'COMPUTER' TO PRT-AREA-COURSE.\n WRITE OUTREC FROM DETAIL AFTER 1 LINE.",
      note: 'Slide issue: the slide spells PERFORM as "PERFROM". The correct spelling is PERFORM.',
      simple: 'CCMIT-RTN runs exactly 5 times, so "COMPUTER" is written 5 times.',
    },
    {
      heading: "5. PERFORM ... THROUGH",
      exact:
        "PERFORM paragraph-name-1 THROUGH paragraph-name-2.\n\nThis statement transfer control to paragraph-name-1, executes all the statements in paragraph-name-1 through paragraph-name-2, and then returns to the statement immediately following the PERFORM statement. If there are two statements in paragraph-name-1 and three statements in paragraph-name-2, the PERFORM statement will execute five statements, once each, before returning to the statement immediately following the PERFORM statement.",
      code: "LEFT VERSION:\nCCMIT-RTN.\n PERFORM BSIT-RTN THROUGH BSCS-RTN.\n...\nBSIT-RTN.\n MOVE STUDEN-NO TO PRT-STUDNO.\n MOVE STUDET-NA TO PRT-STUDNA.\n MOVE COURSE TO PRT-COUR.\n MOVE YEAR TO PRT-YR.\nBSCS-RTN.\n WRITE OUTREC FROM DETAILS.\n ADD 1 TO TOTAL.\n\nRIGHT VERSION:\nCCMIT-RTN.\n PERFORM BSIT-RTN THRU BSIT-RTN-END.\nBSIT-RTN.\n MOVE STUDEN-NO TO PRT-STUDNO.\n MOVE STUDET-NA TO PRT-STUDNA.\n MOVE COURSE TO PRT-COUR.\n MOVE YEAR TO PRT-YR.\n WRITE OUTREC FROM DETAILS.\nBSIT-RTN-END.\n\nTHRU in some old compilers can be used to replace the reserved word THROUGH.",
      note: 'Slide issues: the "some old compilers" remark is not accurate - THRU works in modern COBOL too. The slide also has name typos (STUDEN-NO, STUDET-NA).',
      simple:
        'On the left, PERFORM runs BSIT-RTN and BSCS-RTN together: 4 MOVEs, then WRITE and ADD. On the right, the range ends at an empty "exit" paragraph called BSIT-RTN-END, which is the common style. THRU and THROUGH mean the same thing.',
    },
    {
      heading: "6. File-Processing Loops (PERFORM THRU and UNTIL)",
      exact: "The standard read-loop pattern with an end-of-file switch:",
      code: "MAIN-RTN.\n PERFORM BSCS-RTN THRU BSCS-RTN-END.\n PERFORM BSIT-RTN UNTIL EOFSW=1.\n STOP RUN.\nBSCS-RTN.\n OPEN INPUT INFILE, OUTPUT OUTFILE.\n READ INFILE AT END MOVE 1 TO EOFSW GO TO BSCS-RTN-END.\n PERFORM BSIT-RTN.\nBSCS-RTN-END.\n\nBSIT-RTN.\n MOVE STUDEN-NO TO PRT-STUDNO.\n MOVE STUDEN-NA TO PRT-STUDNA.\n WRITE OUTREC FROM DETAILS AFTER 1.\n READ INFILE AT END MOVE 1 TO EOFSW.\n\nAlso:\nPERFORM BSIT-RTN THROUGH BSIT-RTN-END UNTIL EOFSW = 1.\n BSIT-RTN.\n READ INFILE AT END MOVE 1 TO EOFSW.\n MOVE STUDEN-NO TO PRT-STUDNO.\n MOVE STUDEN-NA TO PRT-STUDNA.\n WRITE OUTREC FROM DETAILS AFTER 1.\n READ INFILE AT END MOVE 1 TO EOFSW.\n BSIT-RTN-END.",
      note: 'The first slide writes "TRHU", a typo for THRU. The slide also writes STUDEN-NO / STUDEN-NA (typos).',
      simple:
        'This is the standard read-loop pattern. Open the files, read one record first (the "priming read"), then loop: process the record and read the next one. When the file ends, EOFSW is set to 1 so UNTIL EOFSW = 1 stops the loop.',
    },
    {
      heading: "7. PERFORM ... UNTIL",
      exact:
        "PERFORM paragraph-name-1 UNTIL condition.\n\nThis statement represents an iteration control structure. It allows a specified paragraph to be executed as many times as needed. When the PERFORM statement is used with a conditional clause, the condition is tested before the specified paragraph is executed. If the condition is true, the paragraph is not executed.",
      simple:
        "The condition is checked first, before each pass. If it is already true at the start, the paragraph never runs. It keeps repeating until the condition becomes true.",
    },
    {
      heading: "8. PERFORM ... VARYING",
      exact:
        "PERFORM paragraph-name VARYING data-field FROM initial value BY increment value UNTIL condition(s).\n\nThis statement is used in TABLE handling. TABLE is a sequence of data values grouped together with a common name. Each data item in the table is referred to as an ELEMENT. The elements in the table are accessed using common table name and a SUBSCRIPT, which references a specific table element. A subscript is a constant or a data field used to access a specific element of a table.",
      code: "(From a partially visible slide)\nDISPLAY-TABLE.\n MOVE STUDENT-NAME (I) TO PRT-NAME.\n WRITE OUTREC FROM PRT-NAME AFTER 1.\nDISPLAY-TABLE-END.",
      simple:
        "VARYING is a counter loop, like a for loop. It starts at an initial value, adds the increment each time, and stops when the UNTIL condition is true. It is mostly used to go through table elements with a subscript, for example STUDENT-NAME (I).",
    },
    {
      heading: "9. Demo Program: PER.cbl (PERFORM-DEMO)",
      exact: "From the screen (the variable is spelled LIMI, not LIMIT):",
      code: 'IDENTIFICATION DIVISION.\nPROGRAM-ID. PERFORM-DEMO.\nDATA DIVISION.\nWORKING-STORAGE SECTION.\n01 COUNTER PIC 9(02) VALUE 1.\n01 TOTAL   PIC 9(03) VALUE 0.\n01 LIMI    PIC 9(02) VALUE 5.\n01 FLAG    PIC 9 VALUE 0.\nPROCEDURE DIVISION.\nMAIN-RTN.\n DISPLAY "=== COBOL PERFORM DEMONSTRATION ===".\n DISPLAY "1) SIMPLE PERFORM".\n PERFORM SIMPLE-RTN.\n DISPLAY "2) PERFORM THRU".\n PERFORM THRU-START THRU THRU-END.\n DISPLAY "3) PERFORM UNTIL FLAG = 1".\n PERFORM UNTIL FLAG = 1\n  PERFORM UNTIL-RTN\n END-PERFORM.\n DISPLAY "4) PERFORM VARYING COUNTER FROM 1 TO 5".\n PERFORM VARYING COUNTER FROM 1 BY 1 UNTIL COUNTER > LIMI\n  DISPLAY "LOOP VARYING COUNTER = " COUNTER\n END-PERFORM.\n DISPLAY "=== END OF PROGRAM ===".\n STOP RUN.\n\nSIMPLE-RTN.\n DISPLAY "SIMPLE PERFORM EXECUTED".\nTHRU-START.\n DISPLAY "PERFORM THRU START".\nTHRU-MIDDLE.\n DISPLAY "PERFORM THRU MIDDLE".\nTHRU-END.\n DISPLAY "PERFORM THRU END".\nUNTIL-RTN.\n DISPLAY "FLAG VALUE = " FLAG.\n ADD 1 TO FLAG.',
      simple:
        "1. Simple PERFORM: runs SIMPLE-RTN once. 2. THRU: runs THRU-START, then THRU-MIDDLE, then THRU-END in order, which is why all three lines print. 3. UNTIL FLAG = 1: FLAG starts at 0, so the loop runs. UNTIL-RTN prints \"FLAG VALUE = 0\" and adds 1, so FLAG becomes 1. The condition is now true and the loop stops, so it prints only once. 4. VARYING: COUNTER starts at 1 and goes up by 1. It stops when COUNTER > LIMI (5), so it prints 01 to 05. COUNTER is PIC 9(02), which is why it shows as 01, 02, and so on.",
    },
    {
      heading: "10. Actual Output of PER.cbl",
      exact: "From the screen:",
      code: "=== COBOL PERFORM DEMONSTRATION ===\n1) SIMPLE PERFORM\nSIMPLE PERFORM EXECUTED\n2) PERFORM THRU\nPERFORM THRU START\nPERFORM THRU MIDDLE\nPERFORM THRU END\n3) PERFORM UNTIL FLAG = 1\nFLAG VALUE = 0\n4) PERFORM VARYING COUNTER FROM 1 TO 5\nLOOP VARYING COUNTER = 01\nLOOP VARYING COUNTER = 02\nLOOP VARYING COUNTER = 03\nLOOP VARYING COUNTER = 04\nLOOP VARYING COUNTER = 05\n=== END OF PROGRAM ===\nProcess finished with exit code 0",
      simple:
        "You can run this exact program in the Compiler tab: cobc -x -free per.cbl then ./PERFORM-DEMO (or your own -o name) and compare the output line by line.",
    },
    {
      heading: "Quick Corrections to Remember",
      exact: "",
      code: "- Sign condition: POSITIVE means greater than zero. NOT POSITIVE means zero or negative.\n- Class condition: real code uses NOT NUMERIC, not \"NON NUMERIC\".\n- EVALUATE Example #2: the value 101 falls through to HIGH.\n- THRU is valid in modern COBOL, not just in old compilers.\n- Slide typos (PERFROM, TRHU, STUDEN-NO, STUDET-NA) are copied as shown. Do not copy them into code.",
      simple: "Copy the slides for school, but code with the corrections above.",
    },
  ],
};

export const schoolLessons: SchoolLesson[] = [L1, L2, L3, L4];

export function getSchoolLesson(slug: string): SchoolLesson | undefined {
  return schoolLessons.find((l) => l.slug === slug);
}

export function getSchoolNeighbours(slug: string): { prev?: SchoolLesson; next?: SchoolLesson } {
  const idx = schoolLessons.findIndex((l) => l.slug === slug);
  if (idx === -1) return {};
  return { prev: schoolLessons[idx - 1], next: schoolLessons[idx + 1] };
}
