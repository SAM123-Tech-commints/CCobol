@LESSON slug=cobol-arithmetic-operators | title=COBOL Arithmetic Operators | module=Operators | order=8 | summary=ADD, SUBTRACT, MULTIPLY, DIVIDE, COMPUTE, ROUNDED and ON SIZE ERROR explained with a runnable program.

## COBOL Arithmetic Operators:

COBOL supports various arithmetic operations using a different approach than many modern languages, making it unique. Here's an overview:

### 1. Basic Arithmetic Operations:

- **ADD**: Used to add numbers.

    ```
    ADD A TO B GIVING C.

    ```

    Alternatively:

    ```
    ADD A, B GIVING C.

    ```

    It adds the value of `A` to `B` and stores the result in `C`. If `GIVING` is not used, `B` would be replaced by the sum of `A` and `B`.

- **SUBTRACT**: Used to subtract numbers.

    ```
    SUBTRACT A FROM B GIVING C.

    ```

    It subtracts `A` from `B` and stores the result in `C`. If `GIVING` is not used, `B` would be replaced by the result of `B - A`.

- **MULTIPLY**: For multiplication.

    ```
    MULTIPLY A BY B GIVING C.

    ```

    Multiplies `A` and `B` and stores the result in `C`.

- **DIVIDE**: For division.

    ```
    DIVIDE A INTO B GIVING C REMAINDER D.

    ```

    Divides `A` by `B`, the quotient is stored in `C` and the remainder in `D`.

### 2. Compound Arithmetic:

COBOL also allows you to perform arithmetic operations on multiple operands at once. For example:

```
ADD A B C TO D E F.

```

This adds the values of `A`, `B`, and `C` to the corresponding values of `D`, `E`, and `F`, replacing the values of `D`, `E`, and `F` with the results.

### 3. ROUNDED phrase:

The `ROUNDED` phrase rounds off the intermediate or final result to the nearest whole number.

```
DIVIDE A BY B GIVING C ROUNDED.

```

This will round the result in `C` to the nearest whole number.

### 4. COMPUTE Statement:

The `COMPUTE` statement is more versatile and allows more conventional arithmetic expressions:

```
COMPUTE C = A + B * (D - E) / F.

```

The above statement calculates the value of the expression and assigns it to `C`.

### 5. On Size Error:

When working with arithmetic operations, it's possible for an overflow or other size-related errors to occur. COBOL provides the `ON SIZE ERROR` clause to handle such scenarios:

```
MULTIPLY A BY B GIVING C
    ON SIZE ERROR
        DISPLAY 'Error: Overflow occurred'.

```

If the result of the multiplication is too large for the receiving field (`C`), the `ON SIZE ERROR` clause is executed.

### Notes:

- The efficiency of arithmetic operations can sometimes depend on how data is defined in the `DATA DIVISION`, especially when considering computational (binary representation) vs. display formats.
- Always ensure that the variables involved in arithmetic operations are defined with appropriate sizes to prevent overflow or truncation issues.

### Conclusion:

Arithmetic operations in COBOL, while verbose in comparison to some languages, provide a clear and detailed manner to perform calculations, making the logic easily understandable. As with any aspect of COBOL, regular practice and real-world application will help solidify these concepts.

**EXAMPLE**:  Here's a simple COBOL program that demonstrates the basic arithmetic operations:

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ArithmeticOperations.
       AUTHOR. ChatGPT.

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

           DISPLAY "NUM1 = " NUM1.
           DISPLAY "NUM2 = " NUM2.

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

```

Explanation:

1. We declare the program's metadata in the `IDENTIFICATION DIVISION`.
2. In the `DATA DIVISION`, we declare our variables.
3. In the `PROCEDURE DIVISION`, we implement the logic. This program takes two numbers (25 and 5) and performs addition, subtraction, multiplication, and division on them.

Remember, while COBOL syntax may look long-winded, it was designed with the intent to be self-documenting and easy for non-programmers to read.

@LESSON slug=cobol-logical-operators | title=COBOL Logical Operators | module=Operators | order=9 | summary=Comparison operators, AND / OR / NOT, class tests such as IS NUMERIC and IS ALPHABETIC.

### COBOL Logical Operators

In COBOL, logical (or relational) operators are used to compare data items. Based on the results of these comparisons, a program can decide which set of instructions to execute next.

### 1. Basic Logical Operators:

- **EQUAL TO (`=`)**: Tests for equality between two items.

    ```
    IF A = B
        DISPLAY 'A is equal to B'
    END-IF.

    ```

- **GREATER THAN (`>`) and LESS THAN (`<`)**: These operators check if one item is greater than or less than another.

    ```
    IF SALARY > 50000
        DISPLAY 'High Salary'
    ELSE IF SALARY < 20000
        DISPLAY 'Low Salary'
    END-IF.

    ```

- **NOT EQUAL TO (`<>` or `NOT =`)**: Determines if two items are not equal.

    ```
    IF A <> B
        DISPLAY 'A is not equal to B'
    END-IF.

    ```

- **GREATER THAN OR EQUAL TO (`>=`) and LESS THAN OR EQUAL TO (`<=`)**:

    ```
    IF AGE >= 18
        DISPLAY 'Adult'
    END-IF.

    ```

### 2. Combining Conditions:

You can combine multiple conditions using the `AND` and `OR` operators:

- **AND**: All conditions combined using `AND` must be true for the overall condition to be true.

    ```
    IF AGE >= 18 AND GENDER = 'F'
        DISPLAY 'Adult Female'
    END-IF.

    ```

- **OR**: Only one of the conditions combined using `OR` needs to be true for the overall condition to be true.

    ```
    IF AGE < 18 OR GENDER = 'F'
        DISPLAY 'Either a minor or a female'
    END-IF.

    ```

### 3. Negation:

- **NOT**: This is used to negate or reverse a condition.

    ```
    IF NOT (AGE >= 18)
        DISPLAY 'Minor'
    END-IF.

    ```

### 4. Special Operators:

- **IS NUMERIC**: Checks if a data item contains only numeric characters.

    ```
    IF DATA-ITEM IS NUMERIC
        DISPLAY 'Data item contains only numbers'
    END-IF.

    ```

- **IS ALPHABETIC**: Checks if a data item contains only alphabetic characters (A-Z, a-z).

    ```
    IF DATA-ITEM IS ALPHABETIC
        DISPLAY 'Data item contains only letters'
    END-IF.

    ```

### 5. Class Tests:

You can also define custom classes for data in the `DATA DIVISION` and then use them in logical tests:

```
DATA DIVISION.
WORKING-STORAGE SECTION.
01 DATA-ITEM    PIC X(5) VALUE 'A123B'.
01 LETTERS      CLASS A THROUGH Z.
...

PROCEDURE DIVISION.
IF DATA-ITEM (1:1) IS LETTER
    DISPLAY 'The first character is a letter'
END-IF.

```

### Notes:

- Always be cautious of the data types and lengths you're comparing. For example, comparing a numeric stored as a character string to a pure numeric item can yield unexpected results.
- Logical operations often go hand in hand with conditional statements (`IF ... ELSE`).
- In COBOL, unlike some other languages, parentheses `()` are not mandatory but are recommended for clarity, especially when combining multiple conditions.

### Conclusion:

Logical operators in COBOL provide a rich set of tools for making decisions based on data. They are foundational for any business logic and are instrumental in guiding the flow of program execution. Understanding these operators deeply is crucial for anyone looking to master COBOL programming.

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LogicalOperators.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 A                  PIC 9(3) VALUE 100.
       01 B                  PIC 9(3) VALUE 200.
       01 AGE                PIC 9(2) VALUE 21.
       01 GENDER             PIC X     VALUE 'F'.
       01 DATA-ITEM          PIC X(5) VALUE 'A123B'.
       PROCEDURE DIVISION.
           IF A = B
               DISPLAY 'A is equal to B'
           ELSE
               DISPLAY 'A is not equal to B'
           END-IF.

           IF A < B AND B > 150
               DISPLAY 'A is less than B and B is greater than 150'
           END-IF.

           IF AGE >= 18 AND GENDER = 'F'
               DISPLAY 'Adult Female'
           END-IF.

           IF AGE < 18 OR GENDER = 'F'
               DISPLAY 'Either a minor or a female'
           END-IF.

           IF NOT (AGE >= 18)
               DISPLAY 'Minor'
           ELSE
               DISPLAY 'Adult'
           END-IF.

           IF DATA-ITEM IS ALPHABETIC
               DISPLAY 'Data item contains only letters'
           ELSE
               DISPLAY 'DATA-ITEM is not purely alphabetic'
           END-IF.

           IF DATA-ITEM (2:3) IS NUMERIC
               DISPLAY 'Positions 2 to 4 are numeric'
           END-IF.

           STOP RUN.
```

@LESSON slug=cobol-control-structures | title=COBOL Control Structures | module=Control Flow | order=10 | summary=IF / ELSE, EVALUATE, PERFORM variants, GO TO, EXIT and a full demonstration program.

## COBOL Control Structures

### 1. Conditional Structures:

- **IF ... ELSE ... END-IF**:

    The `IF` statement is used to test a condition. If the condition is true, the statements following it are executed. If it's false, the program jumps to the `ELSE` part if present.

    ```
    IF AGE > 18
       DISPLAY 'Adult'
    ELSE
       DISPLAY 'Minor'
    END-IF.

    ```

    Note: The `ELSE` part is optional.

- **EVALUATE ... END-EVALUATE**:

    Equivalent to the `switch` or `case` statement in other languages. It's used for multi-way branching.

    ```
    EVALUATE TRUE
       WHEN AGE <= 12
          DISPLAY 'Child'
       WHEN AGE > 12 AND AGE <= 19
          DISPLAY 'Teenager'
       WHEN OTHER
          DISPLAY 'Adult'
    END-EVALUATE.

    ```

### 2. Iterative Structures:

- **PERFORM ... TIMES**:

    This repeats a set of statements a specified number of times.

    ```
    PERFORM VARYING I FROM 1 BY 1 UNTIL I > 5
       DISPLAY 'Iteration number: ' I
    END-PERFORM.

    ```

- **PERFORM ... UNTIL**:

    This repeats a block of code until a certain condition becomes true.

    ```
    PERFORM VARYING I FROM 1 BY 1 UNTIL I = 5
       DISPLAY 'Iteration number: ' I
    END-PERFORM.

    ```

- **PERFORM ... THRU**:

    This is used to execute a series of paragraphs or sections. It's a way to modularize code, much like calling functions in other languages.

    ```
    PERFORM PARAGRAPH-1 THRU PARAGRAPH-3.

    ```

    Where `PARAGRAPH-1`, `PARAGRAPH-2`, and `PARAGRAPH-3` are defined paragraphs in the `PROCEDURE DIVISION`.

### 3. Transfer of Control:

- **GO TO**:

    Allows for an unconditional jump to a specified paragraph or section. Though it's available, the use of `GO TO` is often discouraged as it can make the flow of the program hard to follow.

    ```
    IF ERROR-FLAG = 'Y'
       GO TO ERROR-HANDLER.

    ```

    Note: Excessive use of `GO TO` can lead to "spaghetti code", which is difficult to understand and maintain.

- **EXIT**:

    Used to leave a paragraph or section. Often used in conjunction with `PERFORM ... THRU`.

    ```
    PARAGRAPH-1.
       ...some code...
       EXIT.

    ```

### 4. Conditional Compilation:

- **COPY** and **REPLACING**:

    These are not strictly control structures, but they're worth mentioning. They allow for the inclusion of source code from other files and can be used to change certain parts of the copied code. This is particularly useful for handling different compilation scenarios or versions of a program.

    ```
    COPY 'SOMEFILE' REPLACING ==placeholder== BY ==actual-value==.

    ```

### Conclusion:

COBOL's control structures provide robust tools for guiding program execution, making decisions based on data, and iterating over sets of operations. While some of these constructs might seem verbose when compared to modern languages, they were designed to be clear and readable. As with all aspects of COBOL, understanding the language's control structures is crucial for writing efficient and maintainable code.

### EXAMPLE:

Here's a COBOL program that demonstrates most of the essential control structures:

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ControlStructuresDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 AGE                        PIC 99 VALUE 0.
       01 REPEAT-COUNTER             PIC 9(3) VALUE 0.
       01 NAME                       PIC X(10) VALUE SPACES.
       01 ERROR-FLAG                 PIC X VALUE 'N'.
       01 NUM                        PIC 9 VALUE 5.

       PROCEDURE DIVISION.
       BEGIN.

           DISPLAY 'COBOL Control Structures Demonstration'.

           MOVE 25 TO AGE.
           MOVE 'John' TO NAME.

           * IF structure
           IF AGE < 18
               DISPLAY 'Hello young ' NAME '!'
           ELSE
               DISPLAY 'Hello Mr./Ms. ' NAME '!'
           END-IF.

           * PERFORM...UNTIL structure
           PERFORM VARYING REPEAT-COUNTER FROM 1 BY 1 UNTIL REPEAT-COUNTER > 3
               DISPLAY 'This is loop iteration number: ' REPEAT-COUNTER
           END-PERFORM.

           * EVALUATE structure
           EVALUATE TRUE
               WHEN AGE < 20
                   DISPLAY NAME ' is a teenager.'
               WHEN AGE BETWEEN 20 AND 60
                   DISPLAY NAME ' is an adult.'
               WHEN OTHER
                   DISPLAY NAME ' is a senior citizen.'
           END-EVALUATE.

           * Using GO TO (Note: excessive use is discouraged)
           MOVE 'Y' TO ERROR-FLAG.
           IF ERROR-FLAG = 'Y'
               GO TO ERROR-HANDLER
           END-IF.

           PERFORM TEST-PARAGRAPH THRU TEST-PARAGRAPH-END.

           DISPLAY 'End of demonstration.'.
           STOP RUN.

       ERROR-HANDLER.
           DISPLAY 'An error has occurred!'.

       TEST-PARAGRAPH.
           DISPLAY 'This is a test paragraph!'.
       TEST-PARAGRAPH-END.
           DISPLAY 'End of test paragraph!'.

```

Explanation:

1. We declare several variables, including `AGE`, `NAME`, and `ERROR-FLAG`.
2. We then use an `IF...ELSE` structure to check `AGE` and display a different greeting based on the value.
3. The `PERFORM...UNTIL` structure is used to run a loop three times, displaying the iteration number.
4. An `EVALUATE` structure checks the age range and provides a suitable message.
5. We have a simple `GO TO` structure that jumps to the error handler when the `ERROR-FLAG` is set to `'Y'`.
6. Finally, we demonstrate the `PERFORM...THRU` structure by executing the `TEST-PARAGRAPH` and its related end paragraph.

This is a basic demonstration, but it gives you a clear idea of how these control structures function in COBOL.

@LESSON slug=cobol-procedures-paragraphs | title=COBOL Procedures and Paragraphs | module=Control Flow | order=11 | summary=Organise the PROCEDURE DIVISION into paragraphs and sections and call them with PERFORM.

## COBOL Procedures and Paragraphs Lecture:

### 1. **Introduction**:

- In COBOL, the `PROCEDURE DIVISION` is where the program's logic resides. Within this division, the code is organized into paragraphs and sections.
- A paragraph is a block of code that performs a specific function, while a section is a collection of related paragraphs.

### 2. **Paragraphs**:

- **Definition**: A paragraph is defined by giving it a name followed by a period and then the associated COBOL statements.

    ```
    READ-DATA.
        ACCEPT STUDENT-NAME.
        ACCEPT STUDENT-AGE.

    ```

- **Invocation**: To call a paragraph, you use its name as a verb in the `PROCEDURE DIVISION`.

    ```
    PERFORM READ-DATA.

    ```

### 3. **Sections**:

- **Definition**: A section is a group of related paragraphs. It is defined by giving it a name followed by the `SECTION` keyword and a period.

    ```
    STUDENT-INPUT SECTION.
    READ-DATA.
        ACCEPT STUDENT-NAME.
        ACCEPT STUDENT-AGE.
    VALIDATE-DATA.
        IF STUDENT-AGE > 100
           DISPLAY 'Error: Invalid age'.

    ```

- **Invocation**: To call a section, you can use the `PERFORM` verb:

    ```
    PERFORM STUDENT-INPUT.

    ```

    This would execute all the paragraphs within the `STUDENT-INPUT` section sequentially.

### 4. **PERFORM Variants**:

- **Inline PERFORM**: Repeats the code within a paragraph or section immediately.

    ```
    PERFORM VALIDATE-DATA 3 TIMES.

    ```

- **PERFORM THRU**: Used to perform a range of paragraphs from a start to an end.

    ```
    PERFORM READ-DATA THRU VALIDATE-DATA.

    ```

### 5. **EXIT**:

- The `EXIT` statement can be used to signify the end of a paragraph or section, especially when it's necessary to clarify the flow or when using `PERFORM...THRU`.

    ```
    READ-DATA.
        ACCEPT STUDENT-NAME.
        ACCEPT STUDENT-AGE.
        EXIT.

    ```

    Note: The `EXIT` statement in COBOL is a no-operation statement, meaning it doesn't perform any actual function other than serving as a place marker or point of reference.

### 6. **Points to Remember**:

- Use meaningful names for paragraphs and sections to enhance code readability.
- Use sections and paragraphs to modularize code and promote reuse.
- Ensure that the logic within a paragraph or section is closely related, ensuring each component has a singular, clear purpose.

### Conclusion:

Procedures in the form of paragraphs and sections are the backbone of COBOL programming, allowing for organized, modular, and maintainable code. Proper utilization of these constructs ensures that the code remains readable and easy to debug, especially in the extensive programs often found in the business and finance sectors.

By designing programs around the principles of modularity and functionality encapsulation, COBOL developers can ensure longevity and ease of maintenance for their applications.

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ParagraphsDemo.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 STUDENT-NAME       PIC X(20).
       01 STUDENT-AGE        PIC 9(3).
       01 I                  PIC 9.
       PROCEDURE DIVISION.
       MAIN-PARAGRAPH.
           PERFORM READ-DATA.
           PERFORM STUDENT-INPUT.
           PERFORM VALIDATE-DATA 2 TIMES.
           PERFORM READ-DATA THRU VALIDATE-DATA.
           STOP RUN.

       READ-DATA.
           MOVE 'Jane' TO STUDENT-NAME.
           MOVE 23 TO STUDENT-AGE.
           DISPLAY 'READ-DATA executed for ' STUDENT-NAME.
           EXIT.

       STUDENT-INPUT SECTION.
       VALIDATE-DATA.
           IF STUDENT-AGE > 100
              DISPLAY 'Error: Invalid age'
           ELSE
              DISPLAY 'Age is valid: ' STUDENT-AGE
           END-IF.
```
