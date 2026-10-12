"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchEntry } from "@/content/search";
import { SearchIcon } from "@/components/icons";

/** Score an entry against a multi-word query; -1 means "no match". */
function score(entry: SearchEntry, query: string): number {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return -1;
  const title = entry.title.toLowerCase();
  let total = 0;
  for (const w of words) {
    if (!entry.hay.includes(w)) return -1; // every word must appear
    if (title.startsWith(w)) total += 40;
    else if (title.includes(w)) total += 25;
    total += Math.min(8, entry.hay.split(w).length - 1);
  }
  return total;
}

/** Command-palette search across every lesson, topic, exercise and example. */
export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState<SearchEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const router = useRouter();

  // Load the (large) search index lazily - only when search is first opened.
  useEffect(() => {
    if (!open || index.length) return;
    let cancelled = false;
    void import("@/content/search").then((m) => {
      if (!cancelled) setIndex(m.searchIndex);
    });
    return () => {
      cancelled = true;
    };
  }, [open, index.length]);

  const results = useMemo(() => {
    const query = q.trim();
    if (!query || !index.length) return [];
    return index
      .map((e) => ({ e, s: score(e, query) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 24)
      .map((r) => r.e);
  }, [q, index]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => setActive(0), [q]);

  // Keep the keyboard-highlighted result visible while navigating with ↑/↓.
  useEffect(() => {
    itemRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [active, results]);

  const go = (entry?: SearchEntry) => {
    const target = entry ?? results[active];
    if (!target) return;
    onClose();
    router.push(target.href);
  };

  if (!open) return null;

  return (
    <div className="search-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Search">
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-row">
          <SearchIcon width={16} height={16} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                go();
              }
            }}
            placeholder="Search lessons, topics, subtopics, exercises, examples…"
            spellCheck={false}
            aria-label="Search query"
          />
          <kbd>Esc</kbd>
        </div>

        <div className="search-results">
          {!q ? (
            <p className="search-empty">
              Search everything - try <em>PIC</em>, <em>PERFORM UNTIL</em>, <em>file status</em>, <em>SEARCH ALL</em>,
              <em> figurative constants</em> or <em>cobc</em>.
            </p>
          ) : results.length === 0 ? (
            <p className="search-empty">No matches for “{q}”. Try a shorter or different phrase.</p>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.kind}-${r.href}-${i}`}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                className={i === active ? "search-result active" : "search-result"}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r)}
              >
                <span className={`search-kind k-${r.kind.toLowerCase()}`}>{r.kind}</span>
                <span className="search-text">
                  <strong>{r.title}</strong>
                  {r.snippet ? <small>{r.snippet}</small> : null}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="search-hint">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span className="ml-auto">{results.length} result{results.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}
