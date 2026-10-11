@LESSON slug=cobol-debugging | title=COBOL Debugging Techniques | module=Advanced COBOL | order=18 | summary=Syntax and runtime errors, debugger tools, DISPLAY tracing, test data, dumps and static analysis.

## COBOL Debugging Techniques Lecture:

### 1. **Introduction**:

- Debugging is the process of identifying and fixing errors or abnormalities in a program.
- Given the often large and complex nature of COBOL programs, especially those in legacy systems, robust debugging techniques are crucial.

### 2. **Syntax and Compilation Errors**:

- **Syntax Errors**: These errors are the result of violations in the COBOL language structure. The COBOL compiler can easily catch them.
- **Compilation Errors**: Can arise due to incorrect compiler settings, misconfigurations, or missing files.

    **Solution**: Always carefully read the compiler output and logs to understand and rectify these errors.

### 3. **Runtime Errors**:

These are trickier as they occur while the program is running. Examples include accessing unavailable files, arithmetic overflows, or invalid data operations.

### 4. **COBOL Debugger Tools**:

Modern COBOL environments, like Micro Focus or IBM's COBOL for z/OS, come with integrated debugging tools that allow:

- Setting breakpoints
- Step-by-step execution
- Variable inspections
- Condition-based execution

**Tip**: Familiarize yourself with the debugger tool associated with your COBOL environment.

### 5. **Using DISPLAY**:

A classic, yet effective technique. The `DISPLAY` verb can be used to print variable values, execution steps, or any other information.

```
DISPLAY 'Value of STUDENT-ID: ' STUDENT-ID.

```

While this is a simple technique, overuse can clutter the program, so remember to remove unnecessary `DISPLAY` statements after debugging.

### 6. **Test Data and Test Cases**:

- **Always** have a set of test data and test cases.
- Test for boundary values, null values, and other edge cases.
- Automated testing frameworks, if available in your environment, can be incredibly beneficial.

### 7. **Logs and Dumps**:

- **Logs**: Many COBOL environments provide detailed logs of program executions. These logs can be invaluable in understanding the sequence of operations and failures.
- **Memory Dumps**: In critical failures, the system might produce a memory dump, which is a snapshot of the program's memory at the time of the crash. Analyzing dumps requires more expertise but can provide deep insights into issues.

### 8. **Static Code Analysis**:

Some modern tools can analyze COBOL code without executing it to identify potential issues, bad practices, or areas of improvement.

### 9. **Review and Collaborate**:

Two pairs of eyes are better than one. Code reviews by peers can identify potential bugs or areas of improvement that the original developer might overlook.

### 10. **Documentation**:

Always refer to the available documentation, be it COBOL's official documentation or your system's specific documentation. Many 'bugs' arise due to a lack of understanding of a feature or function.

### Conclusion:

Debugging in COBOL, like in other languages, is a mix of systematic approaches, intuition, and experience. A good COBOL programmer is not just someone who can write code but someone who can efficiently debug and optimize it. Given the critical nature of many COBOL applications, effective debugging is not just a skill—it's a necessity.

This program contains a classic bug - a subscript that runs one row too far. Read the messages the compiler prints after running it:

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. DebugDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 AMOUNTS             PIC 9(4) OCCURS 5 TIMES VALUE ZERO.
       01 I                   PIC 9 VALUE 1.
       01 TOTAL               PIC 9(5) VALUE 0.
       PROCEDURE DIVISION.
           MOVE 100 TO AMOUNTS(1).
           MOVE 250 TO AMOUNTS(2).
           MOVE  75 TO AMOUNTS(3).
           MOVE 900 TO AMOUNTS(4).
           MOVE  33 TO AMOUNTS(5).
           * BUG: the loop should stop at 5, not 6.
           PERFORM VARYING I FROM 1 BY 1 UNTIL I > 6
               ADD AMOUNTS(I) TO TOTAL
               DISPLAY 'Added AMOUNTS(' I ') = ' AMOUNTS(I)
           END-PERFORM.
           DISPLAY 'TOTAL = ' TOTAL.
           STOP RUN.
```

@LESSON slug=cobol-intrinsic-functions | title=COBOL Intrinsic Functions | module=Advanced COBOL | order=19 | summary=Mathematical, string, date/time, statistical and miscellaneous FUNCTIONs such as ABS, SQRT, UPPER-CASE, CURRENT-DATE, MAX and NUMVAL.

## Using Intrinsic Functions Lecture:

COBOL's intrinsic functions provide built-in functionality that simplifies common operations. They're similar to functions in other programming languages and can be used within COBOL statements for various tasks.

### **1. Basics of Intrinsic Functions**:

Intrinsic functions in COBOL return values based on input arguments, and they can be invoked without the need for a separate procedure call. Their results can be used directly within arithmetic or conditional expressions.

### **2. Categories**:

COBOL intrinsic functions are categorized based on their functionality:

- **Mathematical Functions**: Deal with arithmetic operations.
- **String Handling Functions**: Handle string manipulations.
- **Date, Time, and Interval Functions**: For operations related to date and time.
- **Statistical Functions**: Provide statistical calculations.
- **Miscellaneous Functions**: Functions that don't fit neatly into the above categories.

### **3. Key Intrinsic Functions**:

### **Mathematical Functions**:

- **`ABS`**: Returns the absolute value of a numeric argument.

    ```
    COMPUTE ABS_VALUE = FUNCTION ABS(-5)  --> ABS_VALUE becomes 5.

    ```

- **`SQRT`**: Returns the square root of a numeric argument.

    ```
    COMPUTE ROOT_VALUE = FUNCTION SQRT(9)  --> ROOT_VALUE becomes 3.

    ```

### **String Handling Functions**:

- **`UPPER-CASE` and `LOWER-CASE`**: Converts a string to upper or lower case.

    ```
    COMPUTE UC_TEXT = FUNCTION UPPER-CASE('cobol')  --> UC_TEXT becomes 'COBOL'.

    ```

- **`REVERSE`**: Reverses a string.

    ```
    COMPUTE REV_TEXT = FUNCTION REVERSE('cobol')  --> REV_TEXT becomes 'loboc'.

    ```

- **`TRIM`**: Removes trailing spaces.

    ```
    COMPUTE TRIM_TEXT = FUNCTION TRIM('cobol   ')  --> TRIM_TEXT becomes 'cobol'.

    ```

### **Date, Time, and Interval Functions**:

- **`CURRENT-DATE`**: Returns the current system date and time.

    ```
    DISPLAY FUNCTION CURRENT-DATE.

    ```

- **`DATE-OF-INTEGER`**: Converts an integer to a date.

    ```
    COMPUTE MY_DATE = FUNCTION DATE-OF-INTEGER(2000).

    ```

- **`INTEGER-OF-DATE`**: Converts a date to an integer.

    ```
    COMPUTE INT_DATE = FUNCTION INTEGER-OF-DATE(MY_DATE).

    ```

### **Statistical Functions**:

- **`MAX` and `MIN`**: Returns the maximum or minimum value from a list of arguments.

    ```
    COMPUTE MAX_VALUE = FUNCTION MAX(5, 10, 15)  --> MAX_VALUE becomes 15.

    ```

### **Miscellaneous Functions**:

- **`LENGTH`**: Returns the length of a string or table item.

    ```
    COMPUTE STR_LEN = FUNCTION LENGTH('cobol')  --> STR_LEN becomes 5.

    ```

- **`NUMVAL` and `NUMVAL-C`**: Convert alphanumeric strings to numeric values.

    ```
    COMPUTE NUM = FUNCTION NUMVAL('123.45')  --> NUM becomes 123.45.

    ```

### **4. Function Options**:

Some functions provide additional options. For instance, the `TRIM` function can be directed to trim leading spaces instead:

```
COMPUTE TRIM_TEXT = FUNCTION TRIM('   cobol' LEADING)  --> TRIM_TEXT becomes 'cobol'.

```

### **Conclusion**:

Intrinsic functions in COBOL simplify many tasks that would otherwise require additional code to achieve. These functions help in streamlining the code, making it more readable, and reducing the potential for errors. It's beneficial to familiarize oneself with these functions, as they can significantly enhance productivity and code clarity.

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. IntrinsicDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 ABS-VALUE         PIC 9(3)V99.
       01 ROOT-VALUE        PIC 9(3)V99.
       01 UC-TEXT           PIC X(10).
       01 REV-TEXT          PIC X(10).
       01 MAX-VALUE         PIC 9(3).
       01 STR-LEN           PIC 9(3).
       01 NUM               PIC 9(5)V99.
       01 MY-DATE           PIC 9(8).
       PROCEDURE DIVISION.
           COMPUTE ABS-VALUE  = FUNCTION ABS(-5).
           COMPUTE ROOT-VALUE = FUNCTION SQRT(9).
           MOVE FUNCTION UPPER-CASE('cobol') TO UC-TEXT.
           MOVE FUNCTION REVERSE('cobol')    TO REV-TEXT.
           COMPUTE MAX-VALUE = FUNCTION MAX(5, 10, 15).
           COMPUTE STR-LEN   = FUNCTION LENGTH('cobol').
           COMPUTE NUM       = FUNCTION NUMVAL('123.45').
           COMPUTE MY-DATE   = FUNCTION DATE-OF-INTEGER(2000).

           DISPLAY 'ABS(-5)         = ' ABS-VALUE.
           DISPLAY 'SQRT(9)         = ' ROOT-VALUE.
           DISPLAY 'UPPER-CASE      = ' UC-TEXT.
           DISPLAY 'REVERSE         = ' REV-TEXT.
           DISPLAY 'MAX(5,10,15)    = ' MAX-VALUE.
           DISPLAY "LENGTH('cobol') = " STR-LEN.
           DISPLAY "NUMVAL          = " NUM.
           DISPLAY 'DATE-OF-INTEGER = ' MY-DATE.
           DISPLAY 'CURRENT-DATE    = ' FUNCTION CURRENT-DATE.
           STOP RUN.
```

@LESSON slug=cobol-dynamic-memory | title=COBOL Dynamic Memory | module=Advanced COBOL | order=20 | summary=ALLOCATE, FREE, pointer usage items and how to avoid leaks.

## Handling Dynamic Memory Lecture:

Handling dynamic memory is a crucial topic in modern programming. While early versions of COBOL didn't support dynamic memory allocation, modern implementations have incorporated these capabilities, allowing for more flexible and efficient memory usage.

### **1. Basics of Dynamic Memory in COBOL**:

Dynamic memory allocation refers to the process of reserving memory space during runtime. This contrasts with static memory allocation, where the memory size is fixed at compile time. By using dynamic memory, programs can adapt to varying data sizes and only use memory when needed, thus conserving resources.

### **2. The `ALLOCATE` Verb**:

The `ALLOCATE` verb is used to allocate memory during runtime.

**Syntax**:

```
ALLOCATE memory-pointer

```

Where `memory-pointer` is a pointer data type that will reference the allocated memory.

For instance:

```
01 PTR USAGE POINTER.
...
ALLOCATE PTR.

```

To allocate an area of a specific size or type:

```
01 MY-DATA.
   05 DATA-LEN   PIC 9(4) COMP.
   05 DATA-VAL   PIC X(100).
...
ALLOCATE MY-DATA LENGTH OF DATA-VAL
       RETURNING PTR.

```

### **3. The `FREE` Verb**:

To release memory that was dynamically allocated, you use the `FREE` verb.

**Syntax**:

```
FREE memory-pointer

```

Example:

```
FREE PTR.

```

### **4. Working with Allocated Memory**:

Once memory is allocated, you can use the SET verb to associate a data structure with the allocated memory.

```
01 DATA-AREA.
   05 NAME      PIC X(30).
   05 AGE       PIC 9(2).

01 PTR USAGE POINTER.

ALLOCATE DATA-AREA RETURNING PTR.
SET ADDRESS OF DATA-AREA TO PTR.

```

Now, the `DATA-AREA` group item is associated with the dynamically allocated memory, and you can use it as you would with statically allocated memory.

### **5. Error Handling**:

Errors can occur during memory allocation. It's crucial to handle these cases to prevent unexpected behaviors.

```
01 MY-DATA.
   05 DATA-LEN   PIC 9(4) COMP VALUE 100.
   05 DATA-VAL   PIC X(100).
01 PTR USAGE POINTER.

ALLOCATE MY-DATA LENGTH OF DATA-VAL
       RETURNING PTR
       ON SIZE ERROR
          DISPLAY 'Memory allocation failed!'
       NOT ON SIZE ERROR
          DISPLAY 'Memory allocated successfully'.

```

### **6. Tips**:

- Always check for errors when allocating memory.
- Ensure that you release memory using `FREE` once you're done with it to avoid memory leaks.
- Dynamic memory allocation can be useful when dealing with unpredictable data sizes, such as reading files of unknown sizes.
- Avoid excessive fragmentation. Allocating and freeing small amounts of memory repeatedly can cause memory fragmentation.

### **Conclusion**:

Dynamic memory allocation in COBOL provides flexibility and efficiency. The ability to allocate memory based on runtime conditions makes applications more adaptable and can improve performance by conserving resources. However, with great power comes great responsibility. Always ensure you handle errors appropriately and manage memory wisely to prevent memory leaks and other issues.

Note: `ALLOCATE` / `FREE` / `SET ADDRESS OF` are compiler extensions that need a real GnuCOBOL (or Micro Focus) runtime, so the online engine reports them as unsupported statements instead of executing them.

@LESSON slug=cobol-object-oriented | title=Object-Oriented COBOL | module=Advanced COBOL | order=21 | summary=Classes, objects, encapsulation, inheritance, polymorphism and interfaces in OO COBOL.

## Object-Oriented COBOL Lecture:

Object-Oriented COBOL brings the power and flexibility of object-oriented programming (OOP) to the long-standing, traditional world of COBOL. It's an essential topic for anyone wanting to bridge the old with the new in the COBOL environment.

### **1. Basics of Object-Oriented Programming (OOP)**:

Object-Oriented Programming is a paradigm that uses "objects" – which can contain both data (in the form of fields, often known as attributes) and code (in the form of procedures, known as methods) – to design applications and computer programs.

The core concepts of OOP include:

- **Classes**: Templates for creating objects.
- **Objects**: Instances of classes.
- **Encapsulation**: Hiding the internal state and requiring all interaction to be performed through well-defined interfaces.
- **Inheritance**: Creating a new class from an existing class.
- **Polymorphism**: Allowing a single interface to represent different data types.

### **2. Object-Oriented COBOL: Classes and Objects**:

In Object-Oriented COBOL, classes are defined much like a traditional data structure, but with added capabilities:

```
CLASS-ID. Person PUBLIC.
DATA DIVISION.
WORKING-STORAGE SECTION.
01  Name       PIC X(30).
01  Age        PIC 9(3).
PROCEDURE DIVISION.
METHOD-ID. SetName.
ARGUMENTS NameValue PIC X(30).
MOVE NameValue TO Name.
END METHOD SetName.
...
END CLASS Person.

```

To instantiate an object from a class:

```
01 MyPerson OBJECT REFERENCE CLASS Person.
CREATE OBJECT MyPerson.

```

### **3. Encapsulation**:

Encapsulation is naturally handled in COBOL through the usual separation of the `DATA DIVISION` and `PROCEDURE DIVISION`. Data is typically private unless explicitly made public, and methods are used to manipulate that data.

### **4. Inheritance**:

Object-Oriented COBOL supports inheritance, allowing for the creation of subclasses that inherit properties and methods from a parent class:

```
CLASS-ID. Employee INHERITS FROM Person PUBLIC.
DATA DIVISION.
WORKING-STORAGE SECTION.
01  EmployeeNumber  PIC 9(5).
...
END CLASS Employee.

```

In the above, `Employee` is a subclass of `Person` and inherits its data and methods. You can also override methods in the subclass.

### **5. Polymorphism**:

Polymorphism in COBOL allows objects of different classes to be handled as objects of a common superclass:

```
CLASS-ID. Manager INHERITS FROM Employee.
...
END CLASS Manager.

01 AnEmployee OBJECT REFERENCE CLASS Employee.
01 AManager OBJECT REFERENCE CLASS Manager.

CREATE OBJECT AManager.
SET AnEmployee TO AManager.

```

Here, an object of the `Manager` class is treated as an object of the `Employee` class, demonstrating polymorphism.

### **6. Interface**:

Interfaces define a contract that classes can implement. They can contain method signatures but no implementation:

```
INTERFACE-ID. IPrintable.
METHOD-ID. "Print" ABSTRACT.
END METHOD "Print".
END INTERFACE IPrintable.

```

A class that implements the interface must provide an implementation for all its methods:

```
CLASS-ID. Document IMPLEMENTS IPrintable.
...
METHOD-ID. "Print".
...
END METHOD "Print".
...
END CLASS Document.

```

### **7. Tips**:

- While OOP in COBOL provides powerful capabilities, it's essential to use it judiciously. Not all problems are best solved using OOP.
- COBOL's OOP syntax might be verbose compared to languages like Java or C#, but it brings modern paradigms to a historically procedural language.
- Object-oriented design requires a different mindset than procedural programming. It's crucial to understand the concepts deeply to leverage them effectively.

### **Conclusion**:

Object-Oriented COBOL is a testament to COBOL's adaptability and continued evolution. It allows COBOL developers to use modern software design principles, making the language relevant in contemporary application development. Combining the power of OOP with COBOL's established strengths, developers can tackle complex problems in a modular, organized manner.

@LESSON slug=cobol-subprograms | title=COBOL CALL & Subprograms | module=Advanced COBOL | order=22 | summary=The CALL verb, LINKAGE SECTION, PROCEDURE DIVISION USING, RETURNING, static vs dynamic calls.

## Calling External Subprograms Lecture:

The concept of external subprograms (or subroutines) is a powerful way to modularize COBOL applications. By breaking a large program into smaller, more manageable subprograms, you can improve maintainability, promote code reuse, and simplify testing.

### **1. Basics of External Subprograms**:

In COBOL, a subprogram is a self-contained piece of code that can be invoked by a main program or another subprogram. The calling program is often referred to as the "calling program," while the invoked program is the "called program" or "subprogram."

### **2. The `CALL` Verb**:

To invoke an external subprogram, you use the `CALL` verb followed by the program's name or a data item containing the program's name.

**Syntax**:

```
CALL 'subprogram-name' USING parameter-1 parameter-2 ... parameter-n.

```

### **3. The `LINKAGE SECTION`**:

This section of the `DATA DIVISION` is crucial when working with subprograms. The `LINKAGE SECTION` defines data items that a subprogram will receive from or return to the calling program. These data items are passed via the `USING` phrase of the `CALL` statement.

For instance, if you have:

```
LINKAGE SECTION.
01 LS-PARAM-1  PIC X(10).
01 LS-PARAM-2  PIC 9(5).

```

You can access these parameters within the subprogram if they are passed using the `CALL` statement's `USING` phrase.

### **4. Example**:

**Main Program**:

```
IDENTIFICATION DIVISION.
PROGRAM-ID. MainProg.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-VAR1  PIC X(10) VALUE 'Hello'.
01 WS-VAR2  PIC 9(5)  VALUE 100.
...
PROCEDURE DIVISION.
    CALL 'SubProg' USING WS-VAR1 WS-VAR2.
    STOP RUN.

```

**Subprogram**:

```
IDENTIFICATION DIVISION.
PROGRAM-ID. SubProg.
DATA DIVISION.
LINKAGE SECTION.
01 LS-VAR1  PIC X(10).
01 LS-VAR2  PIC 9(5).
...
PROCEDURE DIVISION USING LS-VAR1 LS-VAR2.
    DISPLAY LS-VAR1.
    DISPLAY LS-VAR2.
    EXIT PROGRAM.

```

### **5. Return Values**:

Subprograms can also return values to the calling program. For this, you'd use the `RETURNING` clause.

**Syntax**:

```
CALL 'subprogram-name' USING parameter-1 RETURNING result-parameter.

```

### **6. Dynamic Calls vs. Static Calls**:

- **Static Calls**: The called program is bound to the calling program during the compile time. This means the called program becomes part of the load module or executable.
- **Dynamic Calls**: The called program is not bound to the calling program during compile time. Instead, it's loaded at runtime. This allows for more flexibility, as you can replace or modify the called program without recompiling the calling program.

### **7. Tips**:

- Always ensure that the parameters in the `CALL` statement and the `LINKAGE SECTION` of the subprogram match in order, number, and data type.
- Dynamic calls can be more flexible, but they might introduce slight overheads because of the runtime binding.

### **Conclusion**:

Calling external subprograms allows for modularized COBOL applications, facilitating better code organization, maintenance, and reusability. By understanding the `CALL` verb, the `LINKAGE SECTION`, and the nuances between static and dynamic calls, you can create efficient and organized COBOL applications.

Here is the same example as one runnable source file - `END PROGRAM` separates the two programs, exactly like compiling them together with `cobc -x main.cob sub.cob`:

```cobol run
IDENTIFICATION DIVISION.
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
```

@LESSON slug=cobol-databases | title=COBOL and Databases (Embedded SQL) | module=Advanced COBOL | order=23 | summary=EXEC SQL blocks, host variables, cursors, SQLCODE and middleware such as CICS and IMS.

## Using Databases with COBOL Lecture:

Interacting with databases is one of the critical tasks many COBOL applications are designed for. COBOL's ability to process large volumes of data efficiently makes it a natural choice for database interactions.

### **1. Overview:**

When COBOL was first developed, databases as we know them today didn't exist. COBOL programs primarily processed flat files. As the technology landscape evolved, databases emerged, and COBOL had to evolve to interact with them.

### **2. Embedded SQL in COBOL**:

This is the most common method by which COBOL programs interact with relational databases. SQL statements are directly embedded in the COBOL program and are processed by a precompiler before the COBOL compiler sees the code. This precompiler transforms SQL into COBOL code.

Here's a basic structure:

```
EXEC SQL
   SQL command
END-EXEC.

```

### **2.1 Connecting to a Database:**

Before any SQL operations, you need to connect to a database:

```
EXEC SQL
   CONNECT TO :database-name
END-EXEC.

```

### **2.2 Fetching Data:**

```
WORKING-STORAGE SECTION.
01  EMPLOYEE-NAME        PIC X(30).
01  EMPLOYEE-ID          PIC 9(5).

...

EXEC SQL
   SELECT EMP_NAME, EMP_ID INTO :EMPLOYEE-NAME, :EMPLOYEE-ID
   FROM EMPLOYEES
   WHERE EMP_ID = '12345'
END-EXEC.

```

The colon (`:`) before a variable name indicates a host variable – a variable from the COBOL program being used in the SQL statement.

### **2.3 Inserting Data:**

```
EXEC SQL
   INSERT INTO EMPLOYEES (EMP_NAME, EMP_ID)
   VALUES (:EMPLOYEE-NAME, :EMPLOYEE-ID)
END-EXEC.

```

### **3. Cursors:**

When you need to retrieve multiple rows, you use a cursor. It's like an iterator in modern programming languages:

```
EXEC SQL
   DECLARE CURSOR_EMP CURSOR FOR
   SELECT EMP_NAME, EMP_ID
   FROM EMPLOYEES
END-EXEC.

EXEC SQL
   OPEN CURSOR_EMP
END-EXEC.

PERFORM UNTIL SQLCODE NOT = 0
   EXEC SQL
      FETCH CURSOR_EMP INTO :EMPLOYEE-NAME, :EMPLOYEE-ID
   END-EXEC

   DISPLAY EMPLOYEE-NAME, EMPLOYEE-ID
END-PERFORM.

EXEC SQL
   CLOSE CURSOR_EMP
END-EXEC.

```

### **4. Handling SQL Errors:**

Every SQL statement sets a special variable called `SQLCODE`. A value of 0 means the SQL operation was successful. A negative value indicates an error.

```
IF SQLCODE NOT = 0
   DISPLAY "Error encountered: ", SQLCODE
END-IF.

```

### **5. Middleware and COBOL**:

Apart from embedded SQL, COBOL can interact with databases using middleware solutions like CICS (Customer Information Control System) or IMS (Information Management System). These systems allow COBOL to interact with databases without embedding SQL directly.

### **6. Tips**:

- Always check `SQLCODE` after each SQL operation to ensure data integrity.
- Regularly COMMIT your operations to save changes and maintain database lock sanity.
- Use prepared statements if executing the same SQL command multiple times to optimize performance.
- When dealing with large datasets, be wary of resource consumption, and try to optimize SQL statements to fetch only the necessary data.

### **Conclusion**:

Database interactions are a cornerstone of many COBOL applications. Whether through embedded SQL or middleware solutions, COBOL's powerful data processing capabilities combined with database systems can handle vast amounts of information efficiently. As always, while the syntax and methodology might be unique, the underlying principles of data integrity, optimization, and error handling remain universal.

Note: `EXEC SQL ... END-EXEC` needs a DB2 (or similar) precompiler, so this online engine skips those blocks and tells you about it. Everything else in the program still runs.

@LESSON slug=cobol-error-handling-performance | title=COBOL Error Handling & Performance | module=Advanced COBOL | order=24 | summary=I/O, arithmetic and data errors, FILE STATUS, declaratives, and performance tuning tips.

## **Error Handling and Exception Management + Performance Tuning lecture:**

### **Error Handling and Exception Management**

In COBOL, error handling and exception management ensure that your program can cope with unexpected situations gracefully. Proper error handling can mean the difference between a minor inconvenience and a significant system failure.

### **1. Typical Errors:**

- **I/O Errors**: Occur during file operations, like reading from or writing to a file.
- **Arithmetic Errors**: Such as division by zero.
- **Data Errors**: Like invalid data format or type mismatches.

### **2. COBOL's Approach:**

COBOL uses a combination of `FILE STATUS` and declaratives (`USE AFTER ERROR` or `USE FOR DEBUGGING`) to handle errors.

### **Example:**

```
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ErrorHandler.
       DATA DIVISION.
       FILE SECTION.
       FD  SAMPLE-FILE.
       01  SAMPLE-RECORD       PIC X(50).
       WORKING-STORAGE SECTION.
       01  FILE-STATUS         PIC 99.

       PROCEDURE DIVISION.
       OPEN INPUT SAMPLE-FILE
           INVALID KEY
           DISPLAY "ERROR OPENING FILE. STATUS: " FILE-STATUS
           STOP RUN.

       READ SAMPLE-FILE
           AT END DISPLAY "END OF FILE REACHED"
           NOT AT END DISPLAY SAMPLE-RECORD
           INVALID KEY
           DISPLAY "ERROR READING FILE. STATUS: " FILE-STATUS
           STOP RUN.
       CLOSE SAMPLE-FILE.
       STOP RUN.

```

In the above code, file operations are paired with `INVALID KEY` clauses to detect errors. If an error occurs, the relevant message is displayed using the `DISPLAY` verb.

### **Performance Tuning**

Efficient and performant COBOL programs are crucial, especially when dealing with extensive data processing tasks typical in enterprise environments.

### **1. Common Performance Pitfalls:**

- **Inefficient Loops**: Nested loops, especially with file I/O, can be resource-intensive.
- **Unoptimized File Access**: Sequential access when direct or indexed access is possible can slow down operations.
- **Excessive I/O**: Too many individual reads/writes as opposed to block operations.

### **2. Tips and Techniques**:

- **Use Indexed Files for Frequent Access**: Indexed files provide faster access compared to sequential files.
- **Minimize I/O Operations**: Whenever possible, read/write data in blocks rather than one record at a time.
- **Optimize Arithmetic Operations**: Avoid computationally intensive operations inside tight loops.

### **Example:**

Consider a program that processes transactions on an account. If every transaction is processed by reading the account details from a file, updating it, and then writing it back, it's inefficient. Instead, it's better to read the account details once, process all transactions in memory, and then write back the updated account details.

```
       IDENTIFICATION DIVISION.
       PROGRAM-ID. PerfTuning.
       DATA DIVISION.
       FILE SECTION.
       FD  ACCOUNT-FILE.
       01  ACCOUNT-RECORD     PIC X(100).
       WORKING-STORAGE SECTION.
       01  TOTAL-TRANSACTIONS  PIC 9(5)  VALUE 0.
       01  TRANSACTION-VALUE   PIC 9(7)V99.

       PROCEDURE DIVISION.
       OPEN INPUT ACCOUNT-FILE.
       READ ACCOUNT-FILE INTO ACCOUNT-RECORD
           AT END DISPLAY "ALL ACCOUNTS PROCESSED".

       PERFORM VARYING TRANSACTION-VALUE FROM 1 BY 1 UNTIL TRANSACTION-VALUE > 1000
           ADD TRANSACTION-VALUE TO TOTAL-TRANSACTIONS
       END-PERFORM.

       CLOSE ACCOUNT-FILE.
       STOP RUN.

```

In this oversimplified example, rather than updating the `ACCOUNT-FILE` with every transaction, we accumulate the total and can update the file once at the end.

### **Conclusion**:

Both error handling and performance tuning are vital aspects of COBOL programming. Proper error management ensures resilience and user trust, while performance tuning ensures optimal resource usage and speed. Both aspects, when done right, ensure a smooth and efficient system.

A runnable version of the ON SIZE ERROR idea:

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SizeErrorDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 A                  PIC 9(3) VALUE 900.
       01 B                  PIC 9(3) VALUE 900.
       01 C                  PIC 9(3) VALUE 0.
       01 D                  PIC 9(3) VALUE 0.
       PROCEDURE DIVISION.
           MULTIPLY A BY B GIVING C
               ON SIZE ERROR
                   DISPLAY 'Error: Overflow occurred'
               NOT ON SIZE ERROR
                   DISPLAY 'Multiplication stored: ' C
           END-MULTIPLY.

           DIVIDE A BY D GIVING C
               ON SIZE ERROR
                   DISPLAY 'Error: Division by zero'
           END-DIVIDE.
           STOP RUN.
```

@LESSON slug=cobol-library-system | title=COBOL Project: Library Management System | module=Advanced COBOL | order=25 | summary=A comprehensive example that combines file handling, 88 level conditions, PERFORM and intrinsic functions.

## EXAMPLE:

A comprehensive COBOL program that encapsulates many of the topics.

The program will manage a basic library system where:

- Users can borrow and return books.
- Users and books have unique IDs.
- The system logs all borrow and return actions.

Please note: This is a basic implementation meant for illustrative purposes.

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LibraryManagement.
       DATA DIVISION.
       FILE SECTION.

       FD  USER-FILE.
       01  USER-RECORD.
           05 USER-ID         PIC 9(5).
           05 USER-NAME       PIC X(20).

       FD  BOOK-FILE.
       01  BOOK-RECORD.
           05 BOOK-ID         PIC 9(5).
           05 BOOK-TITLE      PIC X(30).
           05 BOOK-AUTHOR     PIC X(20).

       FD  LOG-FILE.
       01  LOG-RECORD.
           05 LOG-USER-ID     PIC 9(5).
           05 LOG-BOOK-ID     PIC 9(5).
           05 LOG-ACTION      PIC X(10) VALUE SPACES.
           05 LOG-DATE        PIC 9(8).

       WORKING-STORAGE SECTION.
       01  WS-DATE             PIC 9(8).
       01  WS-ACTION-CODE      PIC 9 VALUE 0.
           88 BORROW           VALUE 1.
           88 RETURN           VALUE 2.

       PROCEDURE DIVISION.

       100-MAIN.
           DISPLAY "WELCOME TO LIBRARY MANAGEMENT SYSTEM".
           DISPLAY "1. BORROW BOOK".
           DISPLAY "2. RETURN BOOK".
           ACCEPT WS-ACTION-CODE.
           PERFORM 200-ACTION-PROCESS THRU 200-ACTION-EXIT.
           DISPLAY "THANK YOU FOR USING THE SYSTEM".
           STOP RUN.

       200-ACTION-PROCESS.
           DISPLAY "ENTER USER ID:".
           ACCEPT USER-ID FROM CONSOLE.
           DISPLAY "ENTER BOOK ID:".
           ACCEPT BOOK-ID FROM CONSOLE.
           PERFORM 300-VALIDATE-USER.
           PERFORM 400-VALIDATE-BOOK.
           MOVE FUNCTION CURRENT-DATE(1:8) TO WS-DATE.

           IF BORROW
               MOVE 'BORROW' TO LOG-ACTION
           ELSE IF RETURN
               MOVE 'RETURN' TO LOG-ACTION
           END-IF.

           WRITE LOG-RECORD.

       200-ACTION-EXIT.
           EXIT.

       300-VALIDATE-USER.
           READ USER-FILE KEY IS USER-ID
               INVALID KEY
               DISPLAY "INVALID USER!".
           NOT INVALID KEY
               DISPLAY "HELLO ", USER-NAME.
           END-READ.

       400-VALIDATE-BOOK.
           READ BOOK-FILE KEY IS BOOK-ID
               INVALID KEY
               DISPLAY "BOOK NOT FOUND!".
           NOT INVALID KEY
               DISPLAY "YOU SELECTED: ", BOOK-TITLE, " BY ", BOOK-AUTHOR.
           END-READ.

```

Here's a rundown of the features:

- **Files Used**:
    - **USER-FILE** holds information about users.
    - **BOOK-FILE** has details about books.
    - **LOG-FILE** captures borrow and return actions.
- **Error Handling**: The program validates user and book IDs. If an invalid ID is entered, it shows a relevant message.
- **COBOL Concepts**: This program integrates:
    - File Handling: Reading from and writing to files.
    - Conditional Logic: Using `IF` and `88` level conditions.
    - Procedural Logic: Making use of `PERFORM` to call paragraphs.
    - Data Manipulation: Moving values, using functions like `CURRENT-DATE`.

It's important to understand that in a real-world scenario, the program would be far more complex, encompassing more features, validations, and conditions. This example is designed to provide a foundational understanding.

To make the lookups work, the files have to be described with `SELECT` entries and an index, and opened. Here is the same system wired up for real:

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LibraryOnline.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT USER-FILE ASSIGN TO 'USERS.DAT'
               ORGANIZATION IS INDEXED
               RECORD KEY IS USER-ID
               FILE STATUS IS WS-USER-STATUS.
           SELECT BOOK-FILE ASSIGN TO 'BOOKS.DAT'
               ORGANIZATION IS INDEXED
               RECORD KEY IS BOOK-ID
               FILE STATUS IS WS-BOOK-STATUS.
       DATA DIVISION.
       FILE SECTION.
       FD  USER-FILE.
       01  USER-RECORD.
           05 USER-ID         PIC 9(5).
           05 USER-NAME       PIC X(20).
       FD  BOOK-FILE.
       01  BOOK-RECORD.
           05 BOOK-ID         PIC 9(5).
           05 BOOK-TITLE      PIC X(30).
           05 BOOK-AUTHOR     PIC X(20).
       WORKING-STORAGE SECTION.
       01  WS-USER-STATUS     PIC XX VALUE '00'.
       01  WS-BOOK-STATUS     PIC XX VALUE '00'.
       01  WS-DATE            PIC 9(8).
       01  WS-ACTION-CODE     PIC 9 VALUE 0.
           88 BORROW          VALUE 1.
           88 RETURN-BOOK     VALUE 2.
       PROCEDURE DIVISION.
       100-MAIN.
           OPEN I-O USER-FILE.
           IF WS-USER-STATUS NOT = '00'
               DISPLAY 'USERS.DAT MISSING - CREATING IT'
           END-IF.
           MOVE 1 TO USER-ID.
           MOVE 'Maria Santos' TO USER-NAME.
           READ USER-FILE KEY IS USER-ID
               INVALID KEY
                   WRITE USER-RECORD
                   DISPLAY 'USER 1 CREATED'
               NOT INVALID KEY
                   DISPLAY 'USER 1 ALREADY EXISTS'
           END-READ.

           MOVE 101 TO BOOK-ID.
           MOVE 'COBOL FOR BUSINESS' TO BOOK-TITLE.
           MOVE 'Murach' TO BOOK-AUTHOR.
           READ BOOK-FILE KEY IS BOOK-ID
               INVALID KEY
                   WRITE BOOK-RECORD
                   DISPLAY 'BOOK 101 CREATED'
               NOT INVALID KEY
                   DISPLAY 'BOOK 101 ALREADY EXISTS'
           END-READ.

           MOVE FUNCTION CURRENT-DATE(1:8) TO WS-DATE.
           MOVE 'BORROW' TO BOOK-TITLE.
           DISPLAY 'USER 1 BORROWED BOOK 101 ON ' WS-DATE.
           CLOSE USER-FILE.
           CLOSE BOOK-FILE.
           STOP RUN.
```
