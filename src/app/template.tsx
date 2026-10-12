import type { ReactNode } from "react";

/** Remounts on every navigation - gives each page a minimal fade-in. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
