"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@/components/icons";

/** Floating "back to top" button that appears after scrolling. */
export default function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title="Back to top"
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-500 dark:bg-[#0e639c] dark:hover:bg-[#1173bb]"
    >
      <ArrowUpIcon width={18} height={18} />
    </button>
  );
}
