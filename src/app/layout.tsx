import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Learn COBOL Programming - Free Online COBOL Tutorial & Compiler",
    template: "%s",
  },
  description:
    "A complete step-by-step COBOL tutorial with a free online COBOL compiler: syntax, data types, variables, arithmetic and logical operators, control structures, tables, string handling, file handling, debugging, mainframe concepts and more.",
  keywords: [
    "COBOL", "COBOL tutorial", "learn COBOL", "online COBOL compiler", "GnuCOBOL", "COBOL cheat sheet",
    "COBOL examples", "mainframe", "JCL", "VSAM", "COBOL file handling",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Apply the saved theme before paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('cobol-theme');if(t!=='light'){document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();",
          }}
        />
      </head>
      <body className="bg-white text-slate-900 antialiased dark:bg-[#1e1e1e] dark:text-[#d4d4d4]">{children}</body>
    </html>
  );
}
