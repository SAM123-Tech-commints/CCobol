import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "COBOL CodeLab - Free Online COBOL Tutorial & Compiler",
    template: "%s",
  },
  description:
    "A complete step-by-step COBOL tutorial with a free online COBOL compiler: syntax, data types, variables, arithmetic and logical operators, control structures, tables, string handling, file handling, debugging, mainframe concepts and more.",
  keywords: [
    "COBOL", "COBOL tutorial", "learn COBOL", "online COBOL compiler", "GnuCOBOL", "COBOL cheat sheet",
    "COBOL examples", "mainframe", "JCL", "VSAM", "COBOL file handling",
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('ocb-theme');if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();",
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
