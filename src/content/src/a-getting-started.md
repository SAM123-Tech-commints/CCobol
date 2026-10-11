@LESSON slug=cobol-setup-mac | title=Run COBOL on a Mac (GnuCOBOL + VS Code) | module=Getting Started | order=1 | summary=Install Homebrew, GnuCOBOL and VS Code, then compile and run your first COBOL program step by step.

**Running COBOL on a Mac using the GnuCOBOL compiler and Visual Studio Code (VSCode) is a straightforward process. Let's dive in step-by-step:**

### Step 1: Install Homebrew (if not installed)

1. Open Terminal.
2. Enter the following command and follow the on-screen instructions:

```bash
/bin/bash -c "$(curl -fsSL <https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh>)"

```

### Step 2: Install GnuCOBOL

With Homebrew installed, you can easily get GnuCOBOL:

```bash
brew install gnu-cobol

```

Once the installation completes, you can check the installed version:

```bash
cobc --version

```

### Step 3: Install Visual Studio Code

If you haven't already installed VSCode, you can download it from the [official website](https://code.visualstudio.com/).

Alternatively, using Homebrew:

```bash
brew install --cask visual-studio-code

```

### Step 4: Install COBOL Extensions for VSCode

1. Open Visual Studio Code.
2. Go to Extensions (you can use the shortcut `Cmd+Shift+X`).
3. Search for "COBOL" in the marketplace.
4. Install an extension that seems suitable. One of the popular extensions is "COBOL Language Support" by Bitlang.

### Step 5: Write and Compile a COBOL Program

1. In VSCode, create a new file with a `.cob` or `.cbl` extension, say `hello.cob`.
2. Write a simple COBOL program:

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. HelloWorld.
       PROCEDURE DIVISION.
           DISPLAY 'Hello, World!'.
           STOP RUN.

```

1. Save the file.
2. Open Terminal in the directory containing your COBOL file.
3. Compile the COBOL program:

```bash
cobc -x -free hello.cob

```

Here:

- `x` makes the output executable.
- `free` indicates the use of free-format code, allowing for more flexibility in how you write your COBOL. If you're using fixed format, omit this option.
1. Run the compiled program:

```bash
./hello

```

You should see the output `Hello, World!`.

### Step 6: Optional - Configure VSCode for Easier Build & Run

If you're going to be working with COBOL frequently, consider configuring tasks in VSCode to compile and run COBOL with just a shortcut:

1. In VSCode, go to Terminal > Configure Tasks > Create `tasks.json` file from template.
2. Add a custom task for compiling COBOL:

```json
{
    "label": "Compile COBOL",
    "type": "shell",
    "command": "cobc",
    "args": ["-x", "-free", "${file}"],
    "group": {
        "kind": "build",
        "isDefault": true
    }
}

```

1. Save the file.
2. Now you can press `Cmd+Shift+B` in VSCode to compile your COBOL program directly.

### Conclusion

Now you're set up with a smooth COBOL development environment on your Mac! Remember that while writing and compiling might be easy, mastering COBOL requires understanding its unique paradigms and idiosyncrasies. Happy coding!

@LESSON slug=hello-world | title=COBOL Hello World | module=Getting Started | order=2 | summary=Write, compile and run your very first COBOL program online - no installation needed.

Every COBOL course starts here. A COBOL program always starts with the `IDENTIFICATION DIVISION` and a `PROGRAM-ID`, and the statements that do the work live in the `PROCEDURE DIVISION`.

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. HelloWorld.
       PROCEDURE DIVISION.
           DISPLAY 'Hello, World!'.
           STOP RUN.
```

**How to run it:**

1. Press the **Run** button above (the program opens in the online compiler).
2. Or compile it locally with GnuCOBOL: `cobc -x -free hello.cob` and then run `./hello`.

**How it works:**

- `IDENTIFICATION DIVISION.` - names the program.
- `PROGRAM-ID. HelloWorld.` - the program name (8 characters traditionally, but modern compilers accept more).
- `DISPLAY 'Hello, World!'.` - writes text to the console.
- `STOP RUN.` - terminates the program.

Try changing the text between the quotes and run it again.

@LESSON slug=cobol-input | title=COBOL Input (ACCEPT) | module=Getting Started | order=3 | summary=Read keyboard input from the user with the ACCEPT statement.

COBOL reads input from the user (or from the system) with the `ACCEPT` verb. In the online compiler you type the input in the **Input (stdin)** box before running - one line per `ACCEPT`.

```cobol run
       IDENTIFICATION DIVISION.
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
```

Type a name on the first line of the stdin box and a number on the second line (for example `Maria` and `30`), then press Run.

`ACCEPT` can also read system values:

```cobol
ACCEPT WS-DATE FROM DATE.
ACCEPT WS-TIME FROM TIME.
ACCEPT WS-DAY  FROM DAY-OF-WEEK.
```

@LESSON slug=cobol-syntax-overview | title=COBOL Syntax Overview | module=COBOL Basics | order=4 | summary=The four divisions, program identification, data definitions, paragraphs, file operations, conditionals, loops, comments and program termination.

COBOL, which stands for Common Business-Oriented Language, is a high-level programming language primarily used for business, finance, and administrative systems.

### **Basic Structure**:

A COBOL program has a hierarchical structure and is divided into four divisions:

1. **IDENTIFICATION DIVISION**: Contains basic program metadata.
2. **ENVIRONMENT DIVISION**: Specifies the program’s input, output, and other environmental dependencies.
3. **DATA DIVISION**: Defines all data items, records, and files used in the program.
4. **PROCEDURE DIVISION**: Contains the logic and procedures that operate on the data.

### Key Elements:

**1. Program Identification**:

```
IDENTIFICATION DIVISION.
PROGRAM-ID. YourProgramName.
AUTHOR. YourName.

```

**2. Environment Setup**:
- Specifies files and their attributes.

```
ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
    SELECT INPUT-FILE ASSIGN TO 'your-input-file.txt'.
    SELECT OUTPUT-FILE ASSIGN TO 'your-output-file.txt'.

```

**3. Data Definitions**:
- `WORKING-STORAGE SECTION`: For defining temporary storage areas.
- `FILE SECTION`: For defining file records.
- Use of `PIC` (or `PICTURE`): Describes the structure of a data item.

```
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-AGE             PIC 9(2).     -- defines a two-digit number
01 WS-NAME           PIC X(30).    -- defines a 30-character alphanumeric field

```

**4. Procedural Logic**:
- COBOL statements are grouped into paragraphs, which can then be grouped into sections.
- Basic operations: `MOVE`, `DISPLAY`, `ADD`, `SUBTRACT`, `MULTIPLY`, `DIVIDE`, etc.

```
PROCEDURE DIVISION.
A100-BEGIN.
    DISPLAY 'Hello, World!'.
    MOVE 'Jane' TO WS-NAME.
    DISPLAY 'Name is: ' WS-NAME.

```

**5. File Operations**:
- Reading from and writing to files:

```
OPEN INPUT INPUT-FILE.
OPEN OUTPUT OUTPUT-FILE.
READ INPUT-FILE INTO WS-RECORD AT END MOVE 'Y' TO WS-END-OF-FILE.
WRITE WS-OUTPUT-RECORD TO OUTPUT-FILE.
CLOSE INPUT-FILE, OUTPUT-FILE.

```

**6. Conditional Statements**:
- `IF ... ELSE`, `EVALUATE` (similar to `switch` in other languages).

```
IF WS-AGE > 18
    DISPLAY 'Adult'
ELSE
    DISPLAY 'Minor'
END-IF.

```

**7. Loops**:
- `PERFORM` is used for loops.

```
PERFORM VARYING WS-COUNTER FROM 1 BY 1 UNTIL WS-COUNTER > 10
    DISPLAY 'Counter: ' WS-COUNTER
END-PERFORM.

```

**8. Comments**:
- Any line can have a comment that starts in column 7 with an asterisk (`*`).

```
* This is a comment

```

**9. Program Termination**:
- `STOP RUN` or `EXIT PROGRAM` are used to terminate a program.

```
STOP RUN.

```

**10. Calling Other Programs**:
- COBOL supports modular programming. You can `CALL` another program and even pass data to it.

```
CALL 'OTHERPROGRAM' USING WS-DATA-ITEM.

```

### Points to Note:

- COBOL is not case sensitive.
- COBOL syntax requires that certain statements start in specific columns, especially in older versions. This is less stringent in newer versions and depends on the compiler.
- Data definitions in the `DATA DIVISION` don't immediately allocate storage or initialize data. They merely define the format and layout of data.

Here is the same skeleton running for real:

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SyntaxOverview.
       AUTHOR. YourName.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT INPUT-FILE ASSIGN TO 'input.txt'.
           SELECT OUTPUT-FILE ASSIGN TO 'output.txt'.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-AGE             PIC 9(2) VALUE 0.
       01 WS-NAME           PIC X(30) VALUE SPACES.
       01 WS-COUNTER        PIC 9(2) VALUE 0.

       PROCEDURE DIVISION.
       A100-BEGIN.
           DISPLAY 'Hello, World!'.
           MOVE 'Jane' TO WS-NAME.
           MOVE 21 TO WS-AGE.
           DISPLAY 'Name is: ' WS-NAME.

           IF WS-AGE > 18
               DISPLAY 'Adult'
           ELSE
               DISPLAY 'Minor'
           END-IF.

           PERFORM VARYING WS-COUNTER FROM 1 BY 1 UNTIL WS-COUNTER > 3
               DISPLAY 'Counter: ' WS-COUNTER
           END-PERFORM.

           STOP RUN.
```

@LESSON slug=cobol-data-types | title=COBOL Data Types | module=COBOL Basics | order=5 | summary=PICTURE clauses: Alphabetic (A), Numeric (9), Alphanumeric (X), implied decimal (V) and the sign (S).

### 1. Data Types

In COBOL, data types are represented by `PICTURE` or `PIC` clauses. The `PICTURE` clause specifies the exact format of a data item:

- **Alphabetic (A)**: Represents letters (A-Z, a-z).
- **Numeric (9)**: Represents numbers (0-9).
- **Alphanumeric (X)**: Represents numbers, letters, and special characters.
- **Decimal (V)**: Implied decimal point.
- **Sign (S)**: Indicates a signed number.

**Examples**:

```
01 ALPHA-ITEM                PIC A(5).        -- Holds 5 alphabetic characters.
01 NUMERIC-ITEM              PIC 9(3).        -- Holds a 3-digit number (e.g., 123).
01 ALPHANUM-ITEM             PIC X(10).       -- Holds 10 characters, be it letter, number, or special character.
01 DECIMAL-ITEM              PIC 9(3)V9(2).   -- Holds a number with 3 digits before the decimal and 2 after (e.g., 123.45).
01 SIGNED-ITEM               PIC S9(4).       -- Holds a signed 4-digit number (e.g., +1234 or -1234).

```

Try every picture clause in one program:

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. DataTypes.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 ALPHA-ITEM                PIC A(5) VALUE 'ABCDE'.
       01 NUMERIC-ITEM              PIC 9(3) VALUE 123.
       01 ALPHANUM-ITEM             PIC X(10) VALUE 'COBOL-2024'.
       01 DECIMAL-ITEM              PIC 9(3)V9(2) VALUE 123.45.
       01 SIGNED-ITEM               PIC S9(4) VALUE -1234.
       PROCEDURE DIVISION.
           DISPLAY 'ALPHA-ITEM     : ' ALPHA-ITEM.
           DISPLAY 'NUMERIC-ITEM   : ' NUMERIC-ITEM.
           DISPLAY 'ALPHANUM-ITEM  : ' ALPHANUM-ITEM.
           DISPLAY 'DECIMAL-ITEM   : ' DECIMAL-ITEM.
           DISPLAY 'SIGNED-ITEM    : ' SIGNED-ITEM.
           STOP RUN.
```

@LESSON slug=cobol-variables | title=COBOL Variables | module=COBOL Basics | order=6 | summary=Declare data items in the WORKING-STORAGE SECTION, set them with MOVE and display them with DISPLAY.

### 2. Variables

Variables are data items that can hold values. They are declared in the `DATA DIVISION`:

**Examples**:

```
DATA DIVISION.
WORKING-STORAGE SECTION.
01 EMPLOYEE-NAME             PIC X(30).
01 EMPLOYEE-ID               PIC 9(5).
01 EMPLOYEE-SALARY           PIC S9(5)V99.  -- e.g., -1234.56

```

**Setting and Displaying Variables**:

```
PROCEDURE DIVISION.
    MOVE 'John Doe' TO EMPLOYEE-NAME.
    MOVE '12345' TO EMPLOYEE-ID.
    MOVE 5000.50 TO EMPLOYEE-SALARY.

    DISPLAY 'Employee Name: ' EMPLOYEE-NAME.
    DISPLAY 'Employee ID: ' EMPLOYEE-ID.
    DISPLAY 'Employee Salary: $' EMPLOYEE-SALARY.

```

**Output**:

```
Employee Name: John Doe
Employee ID: 12345
Employee Salary: $5000.50

```

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. Variables.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 EMPLOYEE-NAME             PIC X(30).
       01 EMPLOYEE-ID               PIC 9(5).
       01 EMPLOYEE-SALARY           PIC S9(5)V99.
       PROCEDURE DIVISION.
           MOVE 'John Doe' TO EMPLOYEE-NAME.
           MOVE '12345' TO EMPLOYEE-ID.
           MOVE 5000.50 TO EMPLOYEE-SALARY.
           DISPLAY 'Employee Name: ' EMPLOYEE-NAME.
           DISPLAY 'Employee ID: ' EMPLOYEE-ID.
           DISPLAY 'Employee Salary: $' EMPLOYEE-SALARY.
           STOP RUN.
```

@LESSON slug=cobol-constants | title=COBOL Constants | module=COBOL Basics | order=7 | summary=Fixed values defined with the VALUE clause in the WORKING-STORAGE SECTION.

### 3. Constants

Constants in COBOL are values that don't change during the execution of the program. They can be numeric, alphanumeric, or symbolic. Symbolic constants are defined in the `WORKING-STORAGE SECTION` using the `VALUE` clause:

**Examples**:

```
DATA DIVISION.
WORKING-STORAGE SECTION.
01 MAX-EMPLOYEES             PIC 9(3)  VALUE 100.
01 COMPANY-NAME              PIC X(20) VALUE 'Tech Corp'.

```

You can then use these constants in your program, ensuring that the values don't change:

```
PROCEDURE DIVISION.
    DISPLAY 'Maximum number of employees: ' MAX-EMPLOYEES.
    DISPLAY 'Company: ' COMPANY-NAME.

```

**Output**:

```
Maximum number of employees: 100
Company: Tech Corp

```

**Note**: The constants defined with the `VALUE` clause in the `WORKING-STORAGE SECTION` should not be modified during the program's execution. If you try to `MOVE` another value to them, it'll overwrite the constant. While COBOL allows this, it's not best practice. If a data item's value needs to change, it should not be initialized with a `VALUE` clause and considered a variable instead.

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. Constants.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 MAX-EMPLOYEES             PIC 9(3)  VALUE 100.
       01 COMPANY-NAME              PIC X(20) VALUE 'Tech Corp'.
       PROCEDURE DIVISION.
           DISPLAY 'Maximum number of employees: ' MAX-EMPLOYEES.
           DISPLAY 'Company: ' COMPANY-NAME.
           STOP RUN.
```
