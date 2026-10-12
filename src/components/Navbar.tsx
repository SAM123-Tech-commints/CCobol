"use client";

import Link from "next/link";
import { useState } from "react";
import { BookIcon, CodeIcon, GraduationCapIcon, MenuIcon, QuizIcon, TerminalIcon, XIcon } from "@/components/icons";

type NavId = "tutorials" | "school" | "exercises" | "quiz" | "compiler";

const LINKS: { id: NavId; href: string; label: string; Icon: typeof BookIcon }[] = [
  { id: "tutorials", href: "/", label: "Tutorials", Icon: BookIcon },
  { id: "school", href: "/school", label: "School", Icon: GraduationCapIcon },
  { id: "exercises", href: "/exercises", label: "Exercises", Icon: CodeIcon },
  { id: "quiz", href: "/quiz", label: "Quizzes", Icon: QuizIcon },
];

/** OpenCOBOL Studio brand mark (template gradient). */
function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden>
      <defs>
        <linearGradient id="ocb-lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6aa5ff" />
          <stop offset="1" stopColor="#1f5fd6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#ocb-lg)" />
      <path d="M25 13.5a8 8 0 1 0 0 13" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
      <rect x="21" y="18.3" width="9" height="3.4" rx="1.7" fill="#bfe0ff" />
      <circle cx="30.5" cy="10" r="2" fill="#bfe0ff" />
    </svg>
  );
}

/** Template topbar: sticky, blurred, pill links, hamburger below md. */
export default function Navbar({ active }: { active?: NavId }) {
  const [open, setOpen] = useState(false);

  const desktopLink = (id: NavId, href: string, label: string, Icon: typeof BookIcon) => (
    <Link
      key={id}
      href={href}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition ${
        active === id
          ? "border-[#4b8fff]/25 bg-[#4b8fff]/12 text-[#8db8ff]"
          : "border-transparent text-[#8999ad] hover:bg-white/[0.05] hover:text-[#e8eef6]"
      }`}
    >
      <Icon width={15} height={15} />
      {label}
    </Link>
  );

  const mobileLink = (id: NavId, href: string, label: string, Icon: typeof BookIcon) => (
    <Link
      key={id}
      href={href}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
        active === id ? "bg-[#4b8fff]/12 text-[#8db8ff]" : "text-[#9fb1c8] hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      <Icon width={16} height={16} />
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-[#182a44] bg-[#07111f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)} aria-label="OpenCOBOL Studio home">
          <Logo />
          <span className="text-[15px] font-extrabold tracking-tight text-[#f6f9fd]">
            OpenCOBOL<span className="text-[#4b8fff]">Studio</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map(({ id, href, label, Icon }) => desktopLink(id, href, label, Icon))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/compiler"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-bold transition ${
              active === "compiler"
                ? "border border-[#4b8fff]/40 bg-[#4b8fff]/15 text-[#8db8ff]"
                : "bg-[#4b8fff] text-white shadow-[0_6px_18px_rgba(30,99,214,0.35)] hover:bg-[#6aa1ff]"
            }`}
          >
            <TerminalIcon width={14} height={14} />
            <span className="hidden sm:inline">Compiler</span>
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#223650] bg-white/[0.03] text-[#9fb1c8] transition hover:text-white md:hidden"
          >
            {open ? <XIcon width={16} height={16} /> : <MenuIcon width={16} height={16} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-[#182a44] bg-[#0a1626] px-4 py-3 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {LINKS.map(({ id, href, label, Icon }) => mobileLink(id, href, label, Icon))}
            <Link
              href="/compiler"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#4b8fff] px-3 py-2.5 text-sm font-bold text-white"
            >
              <TerminalIcon width={14} height={14} />
              Open the compiler
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
