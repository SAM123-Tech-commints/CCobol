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
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
