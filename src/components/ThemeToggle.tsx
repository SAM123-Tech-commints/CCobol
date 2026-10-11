"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

const KEY = "cobol-theme";

/** Light/Dark toggle (VS Code-style dark theme), persisted in this browser. */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    const isDark = stored ? stored === "dark" : true; // default: dark (VS Code feel)
    setDark(isDark);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(KEY, dark ? "dark" : "light");
  }, [dark, ready]);

  return (
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-label="Toggle theme"
      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
