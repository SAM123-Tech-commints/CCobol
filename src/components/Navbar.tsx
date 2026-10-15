"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import SearchDialog from "@/components/SearchDialog";
import { BookIcon, CodeIcon, GraduationCapIcon, LayersIcon, MenuIcon, QuizIcon, SearchIcon, TerminalIcon, XIcon } from "@/components/icons";

type NavId = "tutorials" | "school" | "exercises" | "quiz" | "cheatsheet" | "compiler";

const LINKS: { id: NavId; href: string; label: string; Icon: typeof BookIcon }[] = [
  { id: "tutorials", href: "/", label: "Tutorials", Icon: BookIcon },
  { id: "school", href: "/school", label: "School", Icon: GraduationCapIcon },
  { id: "exercises", href: "/exercises", label: "Exercises", Icon: CodeIcon },
  { id: "quiz", href: "/quiz", label: "Quizzes", Icon: QuizIcon },
  { id: "cheatsheet", href: "/cheatsheet", label: "Cheat Sheet", Icon: LayersIcon },
];

/** COBOL CodeLab manga-fox brand mark (ported from the Figma design). */
function MangaFox({ size = 34 }: { size?: number }) {
  return (
    <svg className="manga-fox" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path className="fox-tile" d="M5 3h38v42H5z" />
      <path className="fox-ear" d="m11 19 2-12 10 8M37 19 35 7 25 15" />
      <path className="fox-face" d="M11 19c1 15 7 21 13 24 6-3 12-9 13-24l-13-6-13 6Z" />
      <path className="fox-mask" d="m14 22 8 1-5 5M34 22l-8 1 5 5M20 33h8l-4 4-4-4Z" />
      <path className="fox-code" d="m9 34-4 3 4 3M39 34l4 3-4 3" />
    </svg>
  );
}

/** Template topbar: sticky glass, pill nav, blue CTA, search, theme toggle, mobile menu. */
export default function Navbar({ active }: { active?: NavId }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);

  // Ctrl/Cmd+K opens search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="topbar">
      <Link href="/" className="brand" onClick={() => setOpen(false)} aria-label="COBOL CodeLab home">
        <MangaFox />
        <span className="brand-text">
          COBOL <b>CodeLab</b>
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
        <button type="button" className="icon-button" onClick={() => setSearch(true)} aria-label="Search (Ctrl+K)" title="Search (Ctrl+K)">
          <SearchIcon width={16} height={16} />
        </button>
        <Link href="/compiler" className={active === "compiler" ? "cta active" : "cta"}>
          <TerminalIcon width={14} height={14} />
          <span className="cta-label">Compiler</span>
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
      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </header>
  );
}
