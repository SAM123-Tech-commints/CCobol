"use client";

import { useEffect, type ReactNode } from "react";

/** Remounts on every navigation - gives each page a minimal fade-in and makes
 *  sure a new page (e.g. the next lesson/next topic) always opens at the TOP. */
export default function Template({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Keep in-page anchor links (e.g. #section) working; otherwise jump to top.
    if (window.location.hash) return;
    const toTop = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    };
    toTop();
    const frame = requestAnimationFrame(toTop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <div className="page-enter">{children}</div>;
}
