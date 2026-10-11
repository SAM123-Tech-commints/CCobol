@LESSON slug=cobol-arrays | title=COBOL Tables (Arrays) | module=Data Structures | order=12 | summary=Define tables with OCCURS, access elements with subscripts, use OCCURS DEPENDING ON, multi-dimensional tables, SEARCH and SEARCH ALL.

## COBOL Tables (Arrays) Lecture:

### 1. **Introduction to Tables**:

- A table in COBOL is a collection of data items, usually of the same type, that can be accessed by an index.
- Tables allow for systematic organization and retrieval of a set of related data items.

### 2. **Defining Tables**:

- In the `DATA DIVISION`, tables are defined in the `WORKING-STORAGE SECTION` or `LOCAL-STORAGE SECTION`.
- Each table consists of a table name and a series of entries.

    ```
    01 STUDENT-TABLE.
       05 STUDENT-ENTRY   OCCURS 10 TIMES.
          10 STUDENT-NAME   PIC X(20).
          10 STUDENT-AGE    PIC 99.

    ```

    Here, `STUDENT-TABLE` contains 10 occurrences of `STUDENT-ENTRY`.

### 3. **Accessing Table Elements**:

- Individual elements of a table are accessed using their index, referred to as the table's "subscript".

    ```
    MOVE 'John' TO STUDENT-NAME(1).
    MOVE 23 TO STUDENT-AGE(1).

    ```

- COBOL does not provide bounds checking, meaning that accessing `STUDENT-NAME(11)` when your table size is 10 would not result in an error but might lead to unpredictable results.

### 4. **Variable-Length Tables (OCCURS DEPENDING ON)**:

- COBOL tables can be variable in length, using the `OCCURS...DEPENDING ON` clause.

    ```
    01 NUMBER-OF-STUDENTS   PIC 9(3) VALUE 0.
    01 STUDENT-TABLE.
       05 STUDENT-ENTRY   OCCURS 1 TO 100 TIMES DEPENDING ON NUMBER-OF-STUDENTS.
          10 STUDENT-NAME   PIC X(20).
          10 STUDENT-AGE    PIC 99.

    ```

    Here, the number of occurrences in `STUDENT-TABLE` will vary depending on the value in `NUMBER-OF-STUDENTS`.

### 5. **Multi-dimensional Tables**:

- COBOL supports multi-dimensional tables.

    ```
    01 GRADEBOOK-TABLE.
       05 STUDENT-ROW   OCCURS 10 TIMES.
          10 GRADE-ENTRY   OCCURS 5 TIMES.
              15 GRADE-VALUE   PIC 99.

    ```

    To assign a grade to the second student's third grade entry:

    ```
    MOVE 85 TO GRADE-VALUE(2,3).

    ```

### 6. **SEARCH & SEARCH ALL**:

- **SEARCH**: Used to search an element in a table linearly.

    ```
    SEARCH STUDENT-ENTRY
       AT END DISPLAY 'Student not found.'
       WHEN STUDENT-NAME(CURRENT) = 'Alice'
       DISPLAY 'Found Alice at position ' CURRENT '.'

    ```

    `CURRENT` is an implicit index used in `SEARCH`.

- **SEARCH ALL**: Used for binary search on a table (the table should be sorted).

    ```
    SEARCH ALL STUDENT-ENTRY
       AT END DISPLAY 'Student not found.'
       WHEN STUDENT-NAME(CURRENT) = 'Alice'
       DISPLAY 'Found Alice.'

    ```

### 7. **Points to Remember**:

- Always initialize tables before use.
- While COBOL does not have array bounds checking, some compilers provide extensions or options for this.
- For large tables, consider using files for storage and retrieval.

### Conclusion:

Tables in COBOL are essential when dealing with a collection of similar data items. Proper understanding and use of tables ensure efficient data handling, especially in business applications where vast amounts of structured data are the norm. Whether it's storing grades in a gradebook, items in an inventory, or transactions in a ledger, COBOL's table handling capabilities are up to the task.

### EXAMPLE:

Below is a COBOL program that demonstrates the key concepts of arrays (tables) in COBOL:

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ArraysDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 STUDENT-TABLE.
          05 STUDENT-ENTRY   OCCURS 5 TIMES.
             10 STUDENT-NAME   PIC X(20) VALUE SPACES.
             10 STUDENT-AGE    PIC 99 VALUE ZERO.
       01 INDEX-VAL            PIC 9(3) VALUE 0.
       01 STUDENT-COUNT       PIC 99 VALUE 5.
       01 SEARCHED-NAME       PIC X(20) VALUE 'Lucas'.

       PROCEDURE DIVISION.
       BEGIN.

           DISPLAY 'COBOL Arrays (Tables) Demonstration'.

           * Populate the array (table)
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

           * Display the table contents using a loop
           DISPLAY 'Student List:'.
           PERFORM VARYING INDEX-VAL FROM 1 BY 1 UNTIL INDEX-VAL > STUDENT-COUNT
               DISPLAY 'Student Name: ' STUDENT-NAME(INDEX-VAL) ', Age: ' STUDENT-AGE(INDEX-VAL)
           END-PERFORM.

           * Searching for a student named 'Lucas' in the table using SEARCH
           DISPLAY 'Searching for Lucas...'.
           SET INDEX-VAL TO 1.
           SEARCH STUDENT-ENTRY
               AT END DISPLAY 'Lucas not found.'
               WHEN STUDENT-NAME(INDEX-VAL) = SEARCHED-NAME
               DISPLAY 'Lucas found at position: ' INDEX-VAL
           END-SEARCH.

           STOP RUN.

```

Explanation:

1. **Table Definition**: `STUDENT-TABLE` is our table (array) consisting of `STUDENT-ENTRY` that occurs 5 times. Each entry has a `STUDENT-NAME` and `STUDENT-AGE`.
2. **Populating the Table**: We manually populate the table with student names and ages. In real-world scenarios, this data could be read from a file or another source.
3. **Displaying Table Contents**: We use a `PERFORM...VARYING` loop to iterate over the table and display its contents.
4. **Searching the Table**: We demonstrate the `SEARCH` verb to find a student named 'Lucas' in the table.

This program gives a basic introduction to tables in COBOL, including defining, populating, displaying, and searching tables.

@LESSON slug=cobol-multidimensional-arrays | title=COBOL Multi-dimensional Arrays | module=Data Structures | order=13 | summary=Two-dimensional tables, SEARCH, SEARCH ALL and the VARYING clause.

## Tables and Multi-dimensional Array Lecture

Tables (arrays) in COBOL are a crucial part of the language, especially when dealing with batch processing of large datasets, which is common in many business applications. Let's delve into this topic.

### **1. Tables (Arrays) in COBOL**:

In COBOL, we use the term 'table' to refer to what many modern languages call an 'array'. A table allows you to define a series of items that all have the same data type.

**Example of a Simple Table**:

```
DATA DIVISION.
WORKING-STORAGE SECTION.
01 MONTH-NAMES.
   05 MONTH-NAME    PIC X(10) OCCURS 12 TIMES.

```

### **2. Initializing and Accessing Table Elements**:

You can set values for each item and access them using their index.

```
MOVE 'January'   TO MONTH-NAME(1).
MOVE 'February'  TO MONTH-NAME(2).
... and so on ...

DISPLAY MONTH-NAME(3).

```

### **3. Multi-dimensional Arrays**:

COBOL supports multi-dimensional tables.

**Example of a Two-dimensional Table**:

```
01 SALES-TABLE.
   05 MONTHLY-SALES   OCCURS 12 TIMES.
      10 DAILY-SALES  PIC 9(5) OCCURS 31 TIMES.

```

You can access elements with:

```
DISPLAY DAILY-SALES(5, 10).

```

This would display the sales on the 10th day of May.

### **4. SEARCH**:

The `SEARCH` verb is used to search an element in a one-dimensional table. It's similar to a linear search, where elements are searched one by one.

**Example**:

```
01 NUM-TABLE.
   05 NUMS       PIC 9 OCCURS 10 TIMES VALUE 1 2 3 4 5 6 7 8 9 10.
01 IDX           PIC 9 VALUE 1.
01 NUM-TO-FIND   PIC 9 VALUE 6.

PROCEDURE DIVISION.
SEARCH NUM-TABLE
   AT END DISPLAY 'Number not found'
   WHEN NUMS(IDX) = NUM-TO-FIND
      DISPLAY 'Number found at position: ' IDX
END-SEARCH.

```

### **5. SEARCH ALL**:

The `SEARCH ALL` verb is used for binary searching in a sorted table. For this to work, the table should be in ascending or descending order.

**Example**:

```
01 SORTED-TABLE.
   05 SORTED-NUMS   PIC 9(5) OCCURS 10 TIMES
       ASCENDING KEY IS SORTED-NUMS
       VALUE 10 20 30 40 50 60 70 80 90 100.
01 NUM-TO-FIND   PIC 9(5) VALUE 60.

PROCEDURE DIVISION.
SEARCH ALL SORTED-TABLE
   AT END DISPLAY 'Number not found'
   WHEN SORTED-NUMS = NUM-TO-FIND
      DISPLAY 'Number found'
END-SEARCH.

```

**Note**: Always ensure your table is sorted before using `SEARCH ALL`.

### **6. VARYING clause with SEARCH**:

This allows you to iterate over a table's elements.

```
SEARCH NUM-TABLE VARYING IDX
   AT END DISPLAY 'Number not found'
   WHEN NUMS(IDX) = NUM-TO-FIND
      DISPLAY 'Number found at position: ' IDX
END-SEARCH.

```

### **Conclusion**:

Tables in COBOL, combined with verbs like `SEARCH` and `SEARCH ALL`, allow for efficient storage and retrieval of data, especially in business applications where one might need to process large datasets. Understanding how to use these constructs effectively will enhance your capabilities as a COBOL developer.

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. MultiDimensional.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 SALES-TABLE.
          05 MONTHLY-SALES   OCCURS 3 TIMES.
             10 DAILY-SALES  PIC 9(5) OCCURS 4 TIMES VALUE ZERO.
       01 MONTH-IDX          PIC 9 VALUE 1.
       01 DAY-IDX            PIC 9 VALUE 1.
       PROCEDURE DIVISION.
           MOVE 1200 TO DAILY-SALES(2, 3).
           MOVE 950  TO DAILY-SALES(1, 1).
           MOVE 4400 TO DAILY-SALES(3, 4).
           DISPLAY 'Sales on the 10th day of May (month 2, day 3): '
                   DAILY-SALES(2, 3).
           PERFORM VARYING MONTH-IDX FROM 1 BY 1 UNTIL MONTH-IDX > 3
               PERFORM VARYING DAY-IDX FROM 1 BY 1 UNTIL DAY-IDX > 4
                   DISPLAY 'MONTH ' MONTH-IDX ' DAY ' DAY-IDX ' SALES '
                           DAILY-SALES(MONTH-IDX, DAY-IDX)
               END-PERFORM
           END-PERFORM.
           STOP RUN.
```

@LESSON slug=cobol-string-handling | title=COBOL String Handling | module=Data Structures | order=14 | summary=STRING, UNSTRING and INSPECT plus the LENGTH, UPPER-CASE, LOWER-CASE and TRIM intrinsic functions.

## String Handling Lecture

String manipulation is essential in many COBOL programs, given the language's deep roots in business applications where textual data processing is frequent. COBOL offers several built-in features and verbs to handle strings efficiently.

### **1. STRING:**

The `STRING` verb is used to concatenate two or more data items or literals.

**Syntax**:

```
STRING source-1 [DELIMITED BY delimiter-1]
       source-2 [DELIMITED BY delimiter-2] ...
       INTO destination-string
       [WITH POINTER integer-pointer]
       [ON OVERFLOW imperative-statement-1]
       [NOT ON OVERFLOW imperative-statement-2]
       END-STRING.

```

**Example**:

```
DATA DIVISION.
WORKING-STORAGE SECTION.
01 FIRST-NAME         PIC X(10) VALUE 'John'.
01 LAST-NAME          PIC X(10) VALUE 'Doe'.
01 FULL-NAME          PIC X(25) VALUE SPACES.

PROCEDURE DIVISION.
STRING FIRST-NAME ' ' LAST-NAME INTO FULL-NAME.
DISPLAY FULL-NAME.
STOP RUN.

```

**Outcome**: `John Doe`

### **2. UNSTRING:**

The `UNSTRING` verb is used to split a string into multiple substrings based on specified delimiters.

**Syntax**:

```
UNSTRING source-string
        DELIMITED BY delimiter-1 [OR delimiter-2 ...]
        INTO destination-1 [COUNT IN integer-pointer-1]
             destination-2 [COUNT IN integer-pointer-2] ...
        [WITH POINTER integer-pointer]
        [ON OVERFLOW imperative-statement-1]
        [NOT ON OVERFLOW imperative-statement-2]
        END-UNSTRING.

```

**Example**:

```
DATA DIVISION.
WORKING-STORAGE SECTION.
01 FULL-NAME          PIC X(25) VALUE 'John, Doe'.
01 FIRST-NAME         PIC X(10) VALUE SPACES.
01 LAST-NAME          PIC X(10) VALUE SPACES.

PROCEDURE DIVISION.
UNSTRING FULL-NAME DELIMITED BY ','
        INTO FIRST-NAME, LAST-NAME.
DISPLAY FIRST-NAME LAST-NAME.
STOP RUN.

```

**Outcome**: `John Doe`

### **3. INSPECT:**

The `INSPECT` verb is used to count, replace, or convert characters in a string.

- **TALLYING**: Count occurrences of a character or substring.
- **REPLACING**: Replace occurrences of a character or substring.
- **CONVERTING**: Convert one set of characters to another.

**Example**:

```
DATA DIVISION.
WORKING-STORAGE SECTION.
01 MESSAGE            PIC X(25) VALUE 'Hello, COBOL! How are you?'.
01 TALLY-COUNT        PIC 9(3)  VALUE ZERO.

PROCEDURE DIVISION.
INSPECT MESSAGE TALLYING TALLY-COUNT FOR ALL 'O'.
DISPLAY 'Number of Os: ' TALLY-COUNT.

INSPECT MESSAGE REPLACING ALL 'O' BY 'A'.
DISPLAY MESSAGE.

STOP RUN.

```

**Outcome**:

```
Number of Os: 5
Hella, CABAL! Haw are yau?

```

### **Other String Functions**:

- **FUNCTION LENGTH (string)**: Returns the length of the string.
- **FUNCTION UPPER-CASE (string)**: Converts string to uppercase.
- **FUNCTION LOWER-CASE (string)**: Converts string to lowercase.

These functions and verbs make COBOL quite capable of handling and processing strings for various applications.

```cobol run
       IDENTIFICATION DIVISION.
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
           DISPLAY FUNCTION LOWER-CASE('COBOL').
           DISPLAY FUNCTION LENGTH('cobol').
           STOP RUN.
```

@LESSON slug=cobol-file-handling | title=COBOL File Handling | module=Files & Reports | order=15 | summary=SELECT, FD, OPEN, READ, WRITE, REWRITE, DELETE, AT END, INVALID KEY and FILE STATUS.

## COBOL File Handling Lecture:

### 1. **Introduction**:

COBOL has built-in support for handling various types of files, including Sequential, Indexed, and Relative files. These files serve as a medium to store, retrieve, and update data.

### 2. **File Description**:

Before using a file, you must describe its structure in the `FILE SECTION` of the `DATA DIVISION`.

Example:

```
FILE SECTION.
FD  STUDENT-FILE.
01  STUDENT-RECORD.
    05 STUDENT-ID    PIC 9(5).
    05 STUDENT-NAME  PIC X(30).

```

Here:

- `FD` describes the file, named `STUDENT-FILE`.
- The record structure of the file is `STUDENT-RECORD`, which has two fields, `STUDENT-ID` and `STUDENT-NAME`.

### 3. **File Control**:

In the `FILE-CONTROL` paragraph of the `ENVIRONMENT DIVISION`, you'll specify the actual physical location of the file.

```
FILE-CONTROL.
SELECT STUDENT-FILE ASSIGN TO "STUDENT.DAT".

```

### 4. **File Operations**:

COBOL offers various verbs for file operations:

- **OPEN**: Opens a file for processing.

    ```
    OPEN INPUT STUDENT-FILE.

    ```

- **CLOSE**: Closes a file post-processing.

    ```
    CLOSE STUDENT-FILE.

    ```

- **READ**: Reads a record from a file.

    ```
    READ STUDENT-FILE INTO STUDENT-RECORD.

    ```

- **WRITE**: Writes a record to a file.

    ```
    WRITE STUDENT-RECORD.

    ```

- **REWRITE**: Modifies an existing record.

    ```
    REWRITE STUDENT-RECORD.

    ```

- **DELETE**: Removes a record from the file.

    ```
    DELETE STUDENT-RECORD.

    ```

### 5. **File Types**:

- **Sequential Files**: Data is stored in a sequence. To access a particular record, you'd need to traverse from the beginning.
- **Indexed Files**: These have an index to quickly locate records. COBOL uses the `ISAM` (Indexed Sequential Access Method) system for this.
- **Relative Files**: Records are accessed based on their relative position, allowing for direct access.

### 6. **Error Handling**:

During file operations, errors might occur. COBOL provides `AT END`, `INVALID KEY`, and `FILE STATUS` to handle such situations.

```
READ STUDENT-FILE INTO STUDENT-RECORD
  AT END DISPLAY 'End of File Reached'
  NOT AT END DISPLAY 'Record Retrieved Successfully'
END-READ.

```

### 7. **File Status**:

To check the status of file operations, COBOL provides a `FILE STATUS` clause.

```
FD STUDENT-FILE.
   FILE STATUS IS WS-FILE-STATUS.

WORKING-STORAGE SECTION.
01 WS-FILE-STATUS PIC XX.

```

After every file operation, you can check the value of `WS-FILE-STATUS`. For example, '00' means successful operation, while '10' signifies an end-of-file condition.

### Conclusion:

File handling in COBOL is vital due to the nature of business applications. It allows for systematic storage, retrieval, and update operations. By leveraging the file handling capabilities in COBOL, developers can create efficient and robust data processing systems.

To master file handling, you should practice with real-world scenarios, simulating business processes, and handling various data volumes and structures.

### EXAMPLES:

Here's a simple example of reading from a sequential file:

**1. Create a sample data file (`sample.dat`) with the following contents:**

```
001John          5000
002Alice         6000
003Bob           5500

```

Each line represents an employee record with the following format:

- First 3 characters: Employee ID
- Next 10 characters: Employee Name
- Last 4 characters: Employee Salary

**2. Use the following COBOL program to read and display the data:**

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. FileHandling.
       AUTHOR. ChatGPT.

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

```

This program:

1. Defines the file EMPLOYEE-FILE that it will read from.
2. Defines the structure of the records in the file.
3. Reads and displays each record until it reaches the end of the file.

@LESSON slug=cobol-relative-files | title=COBOL Relative Files & Multiple Files | module=Files & Reports | order=16 | summary=Relative organisation with RELATIVE KEY, writing records and merging two files into a third one.

## 1. Relative Files

Relative files allow records to be accessed either sequentially or directly based on a relative record number. Each record has a unique relative record number that starts from 1. This number increases by 1 for each subsequent record.

**Example**:

Let's write a program to create a relative file and write some records into it:

```cobol run
IDENTIFICATION DIVISION.
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

WORKING-STORAGE SECTION.
01 WS-END-OF-FILE             PIC X(1)   VALUE 'N'.
01 WS-RESPONSE-CODE           PIC 99     VALUE ZERO.

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

    STOP RUN.

```

Run the program and then look at the **Files written** tab in the compiler - you will see `STUDENTS.DAT` with both records.

## 2. Writing to Files

Writing to files in COBOL is done using the `WRITE` statement. You've already seen it in action in the relative file example above.

**Example**:

The below snippet writes a record to an OUTPUT file:

```
WRITE RECORD-NAME INVALID KEY DISPLAY 'WRITE ERROR'.

```

In the `INVALID KEY` clause, if there's an issue (for instance, writing a duplicate key in indexed files), the specified procedure or statements will be executed.

## 3. Handling Multiple Files Simultaneously

COBOL allows operations on multiple files simultaneously. This is useful, for example, when you have to merge two sorted files.

**Example**:

Let's consider we have two files: `FILEA` and `FILEB`, both containing sorted student names. We want to merge them into a third file, `FILEC`.

```cobol run
IDENTIFICATION DIVISION.
PROGRAM-ID. MultiFileHandling.

ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
    SELECT FILEA ASSIGN TO 'FILEA.DAT'.
    SELECT FILEB ASSIGN TO 'FILEB.DAT'.
    SELECT FILEC ASSIGN TO 'FILEC.DAT'.

DATA DIVISION.
FILE SECTION.
FD FILEA.
01 REC-A                      PIC X(20).
FD FILEB.
01 REC-B                      PIC X(20).
FD FILEC.
01 REC-C                      PIC X(20).

WORKING-STORAGE SECTION.
01 END-OF-FILEA               PIC X(1) VALUE 'N'.
01 END-OF-FILEB               PIC X(1) VALUE 'N'.

PROCEDURE DIVISION.
A000-START.

    OPEN INPUT FILEA, FILEB.
    OPEN OUTPUT FILEC.

    READ FILEA
        AT END MOVE 'Y' TO END-OF-FILEA
    END-READ.
    READ FILEB
        AT END MOVE 'Y' TO END-OF-FILEB
    END-READ.

    PERFORM UNTIL END-OF-FILEA = 'Y' AND END-OF-FILEB = 'Y'
        IF REC-A <= REC-B OR END-OF-FILEB = 'Y'
            WRITE REC-C FROM REC-A
            READ FILEA
                AT END MOVE 'Y' TO END-OF-FILEA
            END-READ
        ELSE
            WRITE REC-C FROM REC-B
            READ FILEB
                AT END MOVE 'Y' TO END-OF-FILEB
            END-READ
        END-IF
    END-PERFORM.

    CLOSE FILEA, FILEB, FILEC.
    STOP RUN.

```

This program:

- Opens `FILEA` and `FILEB` for reading and `FILEC` for writing.
- Reads records from `FILEA` and `FILEB` and writes the lower value record to `FILEC`.
- Continues until both `FILEA` and `FILEB` have been fully read.
- Outputs a merged sorted file as `FILEC`.

**Note**: These examples are simplified for clarity. In a real-world application, you would likely need to add more error handling and additional logic. This classic merge only works while both files still have records - once one file is exhausted the comparison keeps using its last record, so a production program adds extra tests for the end-of-file flags.

@LESSON slug=cobol-report-generation | title=COBOL Report Generation | module=Files & Reports | order=17 | summary=The Report Writer: RD entries, report groups, the GENERATE verb and control breaks.

## Report Generation Lecture:

Generating reports is a fundamental task in many COBOL applications, especially given the language's historical importance in business and finance operations. COBOL's **Report Writer** is a tool to automate many of the tasks associated with report generation.

### **1. Components of Report Writer**:

The main components of the Report Writer are:

- **Report Section**: This is where the report layouts are defined.
- **RD (Report Description) entry**: Defines characteristics for the report.
- **FD (File Description) entry**: Describes the input data file.
- **Report Writer Control System (RWCS)**: Interacts with the Data Division and the Procedure Division to produce reports.

### **2. Report Description (RD) Entry**:

The RD entry describes the report's general characteristics, like its layout, control breaks, footing lines, and so on.

**Example**:

```
RD REPORT-1
   PAGE LIMITS 60
   HEADING 1
   FOOTING 2
   FIRST DETAIL 3
   LAST DETAIL 58
   CONTROL IS STUDENT-LEVEL.

```

### **3. Report groups**:

Report groups are used to define the layout of the report. They can be of type **DETAILED**, **CONTROL**, **HEADING**, or **FOOTING**.

**Example**:

```
01 TYPE-1-HEADING.
   03 LINE   1.
   03 COL    1 VALUE 'Student Report'.

01 STUDENT-LINE.
   03 LINE   +1.
   03 COL    1  PIC X(20)    SOURCE STUDENT-NAME.
   03 COL   22  PIC 9(3)     SOURCE STUDENT-SCORE.

01 TYPE-1-FOOTING.
   03 LINE   +1.
   03 COL    1  VALUE 'End of Report'.

```

### **4. Generate Report**:

After defining the RD entry and the report groups, you can generate the report using the `GENERATE` verb.

**Example**:

```
PROCEDURE DIVISION.
...
   OPEN INPUT STUDENT-FILE
   OPEN OUTPUT REPORT-1

   READ STUDENT-FILE
      AT END SET END-OF-FILE TO TRUE
   END-READ

   PERFORM UNTIL END-OF-FILE
      GENERATE STUDENT-LINE
      READ STUDENT-FILE
         AT END SET END-OF-FILE TO TRUE
      END-READ
   END-PERFORM

   CLOSE STUDENT-FILE, REPORT-1.

```

### **5. Control Breaks**:

You can use control breaks to change the output format when a control field's value changes. Control fields are specified in the RD entry using the `CONTROL IS` clause.

In the example above, if `STUDENT-LEVEL` changes, you can use the `SUPPRESS` or `PRINT` statements to manage report line output.

**Example**:

```
IF STUDENT-LEVEL NOT = LAST-STUDENT-LEVEL
   SUPPRESS PRINTING OF STUDENT-LINE
   GENERATE TYPE-1-FOOTING
   GENERATE TYPE-1-HEADING
END-IF

```

### **Conclusion**:

COBOL's Report Writer provides a structured and high-level approach to report generation. By defining the report layout and characteristics in the `DATA DIVISION` and using verbs like `GENERATE`, `SUPPRESS`, and `PRINT` in the `PROCEDURE DIVISION`, you can automate and customize the generation of detailed business reports.

It's also worth noting that, while Report Writer is powerful and integral to COBOL, there are other tools and technologies available in modern contexts for more intricate reporting needs, which might be used in tandem with COBOL in contemporary environments.

Because the Report Writer is not available in every compiler, most modern GnuCOBOL programs build reports with plain `DISPLAY` and `WRITE` statements. Here is a report program that runs everywhere:

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SimpleReport.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 STUDENT-TABLE.
          05 STUDENT-ENTRY OCCURS 4 TIMES.
             10 STUDENT-NAME   PIC X(12).
             10 STUDENT-SCORE  PIC 9(3).
       01 I                   PIC 9 VALUE 1.
       01 TOTAL               PIC 9(4) VALUE 0.
       01 AVERAGE             PIC 9(3)V99 VALUE 0.
       PROCEDURE DIVISION.
           MOVE 'Alice' TO STUDENT-NAME(1). MOVE  88 TO STUDENT-SCORE(1).
           MOVE 'Bob'   TO STUDENT-NAME(2). MOVE  72 TO STUDENT-SCORE(2).
           MOVE 'Carol' TO STUDENT-NAME(3). MOVE  95 TO STUDENT-SCORE(3).
           MOVE 'David' TO STUDENT-NAME(4). MOVE  61 TO STUDENT-SCORE(4).

           DISPLAY '        STUDENT REPORT'.
           DISPLAY '-------------------------------'.
           DISPLAY 'NAME          SCORE'.
           DISPLAY '-------------------------------'.
           PERFORM VARYING I FROM 1 BY 1 UNTIL I > 4
               DISPLAY STUDENT-NAME(I) '      ' STUDENT-SCORE(I)
               ADD STUDENT-SCORE(I) TO TOTAL
           END-PERFORM.
           DISPLAY '-------------------------------'.
           COMPUTE AVERAGE ROUNDED = TOTAL / 4.
           DISPLAY 'TOTAL:   ' TOTAL.
           DISPLAY 'AVERAGE: ' AVERAGE.
           DISPLAY '        End of Report'.
           STOP RUN.
```
