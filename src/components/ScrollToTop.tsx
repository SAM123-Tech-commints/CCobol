"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@/components/icons";

/** Floating "back to top" button that appears after scrolling. */
export default function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    onScroll();
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
      className="fixed bottom-6 right-6 z-[70] flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-indigo-500 dark:bg-[#4b8fff] dark:hover:bg-[#6aa1ff]"
    >
      <ArrowUpIcon width={18} height={18} />
    </button>
  );
}
