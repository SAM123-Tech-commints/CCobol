"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { BookIcon, CodeIcon, GraduationCapIcon, MenuIcon, QuizIcon, TerminalIcon, XIcon } from "@/components/icons";

type NavId = "tutorials" | "school" | "exercises" | "quiz" | "compiler";

const LINKS: { id: NavId; href: string; label: string; Icon: typeof BookIcon }[] = [
  { id: "tutorials", href: "/", label: "Tutorials", Icon: BookIcon },
  { id: "school", href: "/school", label: "School", Icon: GraduationCapIcon },
  { id: "exercises", href: "/exercises", label: "Exercises", Icon: CodeIcon },
  { id: "quiz", href: "/quiz", label: "Quizzes", Icon: QuizIcon },
];

/** Template brand mark (gradient C). */
function Logo() {
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6aa5ff" />
          <stop offset="1" stopColor="#1f5fd6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#lg)" />
      <path d="M25 13.5a8 8 0 1 0 0 13" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
      <rect x="21" y="18.3" width="9" height="3.4" rx="1.7" fill="#bfe0ff" />
      <circle cx="30.5" cy="10" r="2" fill="#bfe0ff" />
    </svg>
  );
}

/** Template topbar: sticky glass, pill nav, blue CTA, theme toggle, mobile menu. */
export default function Navbar({ active }: { active?: NavId }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="topbar">
      <Link href="/" className="brand" onClick={() => setOpen(false)} aria-label="OpenCOBOL Studio home">
        <Logo />
        <span className="brand-text">
          OpenCOBOL<b>Studio</b>
        </span>
      </Link>

      <nav className={open ? "main-nav nav-open" : "main-nav"}>
        {LINKS.map(({ id, href, label, Icon }) => (
          <Link key={id} href={href} className={active === id ? "active" : ""} onClick={() => setOpen(false)}>
            <Icon width={16} height={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <Link href="/compiler" className={active === "compiler" ? "cta active" : "cta"}>
          <TerminalIcon width={14} height={14} />
          Compiler
        </Link>
        <ThemeToggle />
        <button
          type="button"
          className="icon-button menu-button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <XIcon width={16} height={16} /> : <MenuIcon width={16} height={16} />}
        </button>
      </div>
      <span className="route-progress" aria-hidden />
    </header>
  );
}
