@LESSON slug=cobol-modern-environments | title=COBOL in Modern Environments | module=Mainframe & Modern COBOL | order=26 | summary=Integration with Java/.NET, web services, databases, modern IDEs and version control.

## COBOL in Modern Environments Lecture:

COBOL, despite its age, is still widely used in various industries, especially in sectors like banking, insurance, and other major transactional systems. Even in the modern era, where technologies change rapidly, COBOL remains a steady and reliable tool. However, the ways we interact with COBOL have evolved.

### **COBOL in Modern Environments**

### **1. Integration with Modern Languages:**

Modern applications often require integration between COBOL and newer languages like Java, C#, and Python. Middleware tools, such as Micro Focus Enterprise Server or IBM's CICS, can be used to facilitate this.

For example, Java can call COBOL code by employing JNI (Java Native Interface). Similarly, in the .NET ecosystem, COBOL can be compiled to the Intermediate Language, enabling COBOL routines to be called from languages like C#.

### **2. Web Services and COBOL:**

COBOL isn't limited to mainframes; it can also be used in web environments. With tools such as the Micro Focus Visual COBOL, you can create COBOL RESTful web services. This allows COBOL programs to be accessed over the web, making COBOL-backed services accessible to any system or platform that can make HTTP requests.

### **3. COBOL and Databases:**

Modern COBOL applications often interact with relational databases, like Oracle or SQL Server. This is done through Embedded SQL, where SQL queries are written directly in COBOL programs, or via middleware products.

### **4. COBOL and .NET:**

Micro Focus Visual COBOL for Visual Studio offers the ability to write COBOL programs that integrate seamlessly with the .NET framework. Here's a basic example:

```
       IDENTIFICATION DIVISION.
       PROGRAM-ID. HelloDotNet.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WELCOME-MESSAGE   PIC X(30) VALUE 'Hello from COBOL in .NET!'.

       PROCEDURE DIVISION.
           DISPLAY WELCOME-MESSAGE
           .
       STOP RUN.

```

This can be compiled and run in a .NET environment, and you can also reference other .NET libraries and use them in your COBOL code, making it easier to integrate with other .NET applications or services.

### **5. Modern Development Environments:**

Developers aren't limited to old terminals or outdated IDEs. Modern COBOL IDEs, like those provided by Micro Focus or IBM, offer features like code highlighting, auto-completion, and debuggers, much like any modern programming environment.

### **6. Version Control and COBOL:**

COBOL codebases can be and are often managed under version control systems like Git. This allows for modern CI/CD practices to be applied, ensuring efficient code lifecycle management.

### **Conclusion**:

While COBOL originated in a different era of computing, it has shown an impressive ability to adapt and stay relevant. Modern tools and methodologies allow COBOL to integrate seamlessly with contemporary systems, making it an enduring and indispensable asset in the IT landscape. Whether you're looking at web services, integrated databases, or integration with modern platforms like .NET, COBOL continues to serve its purpose reliably.

The HelloDotNet example runs in any COBOL compiler, including this one:

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. HelloDotNet.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WELCOME-MESSAGE   PIC X(30) VALUE 'Hello from COBOL in .NET!'.

       PROCEDURE DIVISION.
           DISPLAY WELCOME-MESSAGE
           .
       STOP RUN.
```

@LESSON slug=cobol-migration-modernization | title=COBOL Migration & Modernization | module=Mainframe & Modern COBOL | order=27 | summary=Why, what and how to migrate: platform moves, version upgrades, language conversion and database migration.

## Migration and Modernization Lecture:

Migration and modernization of legacy COBOL systems is a significant undertaking for many enterprises. The key goal is to preserve the core business logic while moving to more modern platforms, or even updating the way that business logic is implemented. Let's dive into this:

### **Migration and Modernization of COBOL Systems**

### **1. Reasons for Migration/Modernization:**

- **Technology Obsolescence**: Hardware and software on which COBOL systems run might become obsolete.
- **Cost Savings**: New platforms can offer cost efficiencies compared to mainframe operations.
- **Improved Agility**: Modern systems can be more adaptable to changing business requirements.
- **Integration with Modern Systems**: It might be easier to integrate with modern technologies post migration.

### **2. Types of Migration/Modernization:**

- **Platform Migration**: Moving COBOL applications from mainframes to distributed platforms (like UNIX, Linux, or Windows).
- **COBOL Version Upgrade**: Migrating from older versions of COBOL to newer ones.
- **Language Conversion**: Translating COBOL code into another high-level language, like Java or C#.
- **Database Migration**: Moving from legacy databases like IMS or VSAM to RDBMS like Oracle or SQL Server.

### **3. Considerations During Migration:**

- **Data Integrity**: Ensure that data is migrated accurately.
- **Business Logic**: Ensure that the business logic in the COBOL program remains intact after migration.
- **Performance**: The migrated system should ideally perform at par, if not better than, the legacy system.
- **User Experience**: If there are any UI components, they should be as usable as, or better than, the original.

### **4. Techniques and Tools:**

Several tools exist in the market to assist with COBOL migrations. For example:

- **Micro Focus Enterprise Developer**: Aids in migrating mainframe COBOL to distributed COBOL.
- **IBM Migration Toolkit**: Helps in transitioning from one database system to another.

### **Example: Migrating to a Newer Version of COBOL**

For simplicity, let’s consider a hypothetical COBOL program that we want to migrate from an old version of COBOL to a modern version.

```
       IDENTIFICATION DIVISION.
       PROGRAM-ID. OldVersionProg.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 OLD-VAR                PIC X(10) VALUE 'OLDVERSION'.
       PROCEDURE DIVISION.
       DISPLAY-MSG.
           DISPLAY OLD-VAR
           .
       STOP RUN.

```

Assuming newer versions of COBOL support more modern features or have different reserved words, this program might need changes during migration. A possible "modern" version might look like this:

```
       IDENTIFICATION DIVISION.
       PROGRAM-ID. NewVersionProg.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 NEW-VAR                PIC X(15) VALUE 'NEW VERSION V2'.
       PROCEDURE DIVISION.
       DISPLAY-MSG.
           DISPLAY NEW-VAR
           .
       STOP RUN.

```

This is an oversimplified example. In reality, migrations might involve addressing deprecated functions, changing file handling techniques, or adapting to new standards.

### **Conclusion**:

Migration and modernization are essential to keep legacy COBOL systems relevant and efficient in today's fast-evolving technological landscape. It's imperative to have a well-planned strategy, use the right set of tools, and ensure that the core business logic remains unchanged during this process.

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. NewVersionProg.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 NEW-VAR                PIC X(15) VALUE 'NEW VERSION V2'.
       PROCEDURE DIVISION.
       DISPLAY-MSG.
           DISPLAY NEW-VAR
           .
       STOP RUN.
```

@LESSON slug=cobol-mainframe-concepts | title=Mainframe Concepts for COBOL | module=Mainframe & Modern COBOL | order=28 | summary=LPARs, z/OS, JCL, VSAM, TSO/ISPF, CICS, DB2, DASD, RACF and the cloud era.

## Mainframe

COBOL development, especially in its earlier days, was primarily done on mainframes. Thus, many COBOL developers often had to (and still have to) familiarize themselves with mainframe concepts. Here's a guide on the essential mainframe concepts:

### 1. **Mainframe Basics**:

- **Mainframe**: It's a high-performance computer used for large-scale processing. It supports numerous simultaneous tasks and handles vast volumes of data.
- **Big Iron**: A colloquial term for mainframes.
- **Batch Processing**: Refers to executing a series of non-interactive tasks (or jobs). These jobs are processed without manual intervention, often scheduled during off-peak hours.

### 2. **Mainframe Architecture**:

- **Central Processor Complex (CPC)**: Contains the main processor and memory.
- **Logical Partition (LPAR)**: A subset of a mainframe's resources, defined and managed as a logical unit. Allows multiple systems to run on a single machine.
- **Channel**: A connection between the mainframe and its peripherals (like storage). It handles I/O operations.

### 3. **Operating Systems**:

- **z/OS**: The primary OS for mainframes. Designed for enterprise applications.
- **z/VSE**: Another OS, suitable for smaller mainframes.
- **z/TPF**: Used mainly for real-time transaction processing.
- **z/VM**: Allows running multiple instances of z/OS, z/VSE, or Linux on a single mainframe.

### 4. **Job Control Language (JCL)**:

- Mainframe batch processing often requires a script, written in JCL, to specify steps for the job.
- Essential JCL statements:
    - **JOB**: Indicates the start of a job.
    - **EXEC**: Specifies a program or procedure to execute.
    - **DD**: Defines input and output sources.

### 5. **VSAM (Virtual Storage Access Method)**:

- It's a method for organizing, storing, and accessing data in mainframe datasets.
- Types:
    - **KSDS (Key Sequenced Data Set)**: Records are stored/accessed using a unique key.
    - **ESDS (Entry Sequenced Data Set)**: Records are appended sequentially.
    - **RRDS (Relative Record Data Set)**: Records are identified by their relative position.

### 6. **TSO/E (Time Sharing Option/Extensions)**:

- An interactive text-based interface to the mainframe.
- Allows users to issue commands, edit data, and submit JCL.

### 7. **ISPF (Interactive System Productivity Facility)**:

- Provides a graphical interface to manage mainframe datasets, submit JCL jobs, and more.

### 8. **CICS (Customer Information Control System)**:

- A transaction server that runs on mainframes. It manages online transaction processing.

### 9. **DB2**:

- A relational database system for mainframes. COBOL programs often interface with DB2 for CRUD (Create, Read, Update, Delete) operations.

### 10. **Mainframe Storage**:

- **DASD (Direct Access Storage Device)**: The primary storage medium for mainframes, like a hard drive in PCs.

### 11. **Mainframe Security**:

- **RACF (Resource Access Control Facility)**: Provides security features like user authentication and access control.

### 12. **SDLC on Mainframe**:

- Development often involves coding, compiling, and testing on the mainframe environment. Tools like **Endevor** help manage the software lifecycle on mainframes.

### 13. **Middleware**:

- Mainframes often interface with other platforms. Middleware like **MQSeries** allows for message-driven processing between different systems.

### 14. **Modern Mainframes**:

- Many legacy mainframes are being replaced or integrated with newer technologies. Understanding concepts like **WebSphere** (for integrating mainframe applications with web technologies) is essential.

### 15. **Mainframe in the Cloud Era**:

- With the advent of cloud computing, many companies are exploring hybrid models, combining the power of mainframes with the flexibility of cloud. Understanding how mainframes can be integrated into such environments is crucial.

Remember, while mainframes might seem old-fashioned in the era of cloud computing, they remain foundational in many industries. Their reliability, processing power, and extensive history mean they'll likely continue to be significant for some time. As a COBOL developer, understanding these mainframe concepts will enhance your ability to develop, debug, and optimize COBOL programs in mainframe environments.

This is what the JCL for a compile-and-go job looks like:

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. BatchJob.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-TOTAL            PIC 9(7)V99 VALUE 0.
       01 WS-RATE             PIC 9(3)V99 VALUE 12.50.
       01 WS-HOURS            PIC 9(3) VALUE 40.
       01 WS-EMPLOYEE         PIC X(15) VALUE 'A. SANTOS'.
       PROCEDURE DIVISION.
           DISPLAY 'PAYROLL BATCH JOB STARTING'.
           COMPUTE WS-TOTAL = WS-RATE * WS-HOURS.
           DISPLAY 'EMPLOYEE : ' WS-EMPLOYEE.
           DISPLAY 'GROSS PAY: ' WS-TOTAL.
           DISPLAY 'PAYROLL BATCH JOB COMPLETE'.
           STOP RUN.
```

@LESSON slug=cobol-github-vscode | title=GitHub & VS Code for Mainframe Development | module=Mainframe & Modern COBOL | order=29 | summary=Zowe Explorer, Git workflows and how modern DevOps meets mainframe COBOL.

## GitHub and Visual Studio Code for mainframe development

Certainly! GitHub and Visual Studio Code (VSCode) have transformed the way many developers work, even in mainframe environments. Integrating these modern tools with mainframe development offers a bridge between traditional development practices and contemporary DevOps culture. Here's how to use GitHub and Visual Studio Code for mainframe development:

### 1. **Understanding the Need**:

Many enterprises are striving to bring their mainframe operations into the fold of their DevOps initiatives. The aim is to speed up development cycles, improve code quality, and foster collaboration. GitHub offers version control, while VSCode provides a powerful and extensible IDE - both can play roles in modern mainframe development.

### 2. **Setting up Visual Studio Code**:

1. **Download and Install**:
    - Download VSCode from the official website.
    - Install the application.
2. **Extensions**:
    - VSCode's true power lies in its extensions. For mainframe development, you'd be interested in the "Zowe Explorer" extension. This connects VSCode to mainframe datasets, USS files, and jobs.
    - Install the Zowe Explorer from the Extensions pane.

### 3. **Setting up GitHub**:

1. **Create a Repository**:
    - If you don’t have a GitHub account, sign up.
    - Create a new repository for your COBOL projects.
2. **Clone the Repository**:
    - In your local environment, clone the repository using the command `git clone [repository_url]`.

### 4. **Integrate VSCode with GitHub**:

1. **Initialize Git**:
    - Open the cloned directory with VSCode.
    - Initialize a Git repository if not done already using the command `git init`.
2. **Commit and Push**:
    - After making changes to your COBOL code in VSCode, stage and commit those changes.
    - Push your changes to the GitHub repository using `git push`.

### 5. **Mainframe Integration with Zowe Explorer**:

1. **Configure Zowe Profile**:
    - Zowe is an open-source framework for mainframe integration. The Zowe Explorer extension in VSCode will allow you to interact with the mainframe datasets directly.
    - You need to create a Zowe CLI profile. This profile contains details about the mainframe connection.
2. **Access Mainframe Data**:
    - Once the profile is set up, you can access datasets, USS files, and jobs right from VSCode. You can also edit datasets and submit JCLs.
3. **Download and Upload Code**:
    - With the Zowe Explorer, you can download mainframe datasets, edit them in VSCode, and then upload the changes back to the mainframe.

### 6. **Workflow Example**:

1. **Edit Code in VSCode**:
    - Edit a COBOL program in VSCode.
2. **Commit Changes**:
    - Stage and commit the changes using Git commands within VSCode.
3. **Push to GitHub**:
    - Push the committed changes to your GitHub repository.
4. **Upload to Mainframe**:
    - Using Zowe Explorer, upload the edited COBOL program back to the mainframe dataset.
5. **Test on Mainframe**:
    - If necessary, you can then run the program on the mainframe, either through VSCode (with Zowe) or using your mainframe's native tools.

### 7. **Considerations and Best Practices**:

1. **Keep Sensitive Data Out of GitHub**:
    - Never store sensitive data, like mainframe credentials, in your GitHub repository. Use environment variables or config files that are in your .gitignore.
2. **Commit Frequently**:
    - Regular, smaller commits are better than occasional, larger ones. They're easier to manage, review, and rollback if necessary.
3. **Collaboration**:
    - Utilize features like pull requests for code reviews. This can foster collaboration and improve code quality.
4. **Backup**:
    - While GitHub is a form of backup, always ensure you have separate backups of your mainframe code and data.

Remember, while GitHub and VSCode offer modern tools for development, mainframes often have critical, legacy applications. Any changes should be made judiciously, with thorough testing before deployment.

A small program to practise the edit - commit - run loop with:

```cobol run
       IDENTIFICATION DIVISION.
       PROGRAM-ID. GitPractice.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-VERSION          PIC 9(2) VALUE 1.
       01 WS-COMMIT-MSG       PIC X(28) VALUE 'Initial COBOL commit'.
       PROCEDURE DIVISION.
           DISPLAY 'REPOSITORY VERSION ' WS-VERSION.
           DISPLAY 'LAST COMMIT: ' WS-COMMIT-MSG.
           ADD 1 TO WS-VERSION.
           MOVE 'Add feature: greeting' TO WS-COMMIT-MSG.
           DISPLAY 'NEXT VERSION ' WS-VERSION.
           DISPLAY 'NEXT COMMIT: ' WS-COMMIT-MSG.
           STOP RUN.
```
