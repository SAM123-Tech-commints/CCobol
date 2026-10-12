"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

const KEY = "ocb-theme";

/** Light/dark theme toggle. Dark (template) is the default; saved per browser. */
export default function ThemeToggle() {
  const [dark, setDark] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(localStorage.getItem(KEY) !== "light");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem(KEY, dark ? "dark" : "light");
  }, [dark, ready]);

  return (
    <button
      type="button"
      className="icon-button"
      onClick={() => setDark((d) => !d)}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-label="Toggle colour theme"
    >
      {dark ? <SunIcon width={16} height={16} /> : <MoonIcon width={16} height={16} />}
    </button>
  );
}
