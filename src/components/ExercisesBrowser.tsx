"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CodeBlock from "@/components/CodeBlock";
import { challenges } from "@/content/challenges";

function compilerLink(code: string) {
  // No stdin is carried over: the terminal waits for the student to type input
  // live, one line at a time, exactly like a real COBOL compiler.
  const payload = { code, stdin: "", files: {}, title: "COBOL exercise" };
  return `/compiler?code=${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))))}`;
}

function levelClass(d: string) {
  return d === "Medium" ? "intermediate" : "beginner";
}

interface CheckState {
  status: "idle" | "checking" | "pass" | "fail" | "error";
  message: string;
}

/** Exercises page — template layout, reference solutions always visible + auto-checking. */
export default function ExercisesBrowser() {
  const [filter, setFilter] = useState("All");
  const [checks, setChecks] = useState<Record<string, CheckState>>({});

  const difficulties = useMemo(() => ["All", "Starter", "Easy", "Medium"], []);
  const shown = challenges.filter((c) => filter === "All" || c.difficulty === filter);

  const check = async (id: string) => {
    const challenge = challenges.find((c) => c.id === id);
    if (!challenge) return;
    setChecks((p) => ({ ...p, [id]: { status: "checking", message: "Running your COBOL program…" } }));
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: challenge.starter, stdin: challenge.stdin ?? "" }),
      });
      const data = (await res.json()) as { output?: string; errors?: string[]; error?: string };
      if (data.error) {
        setChecks((p) => ({ ...p, [id]: { status: "error", message: data.error as string } }));
        return;
      }
      if ((data.errors ?? []).length) {
        setChecks((p) => ({ ...p, [id]: { status: "fail", message: `Compiler says: ${(data.errors ?? []).join("; ")}` } }));
        return;
      }
      const output = data.output ?? "";
      const missing = challenge.mustContain.filter((needle) => !output.includes(needle));
      if (missing.length === 0) {
        setChecks((p) => ({
          ...p,
          [id]: { status: "pass", message: `Passed! Output contains ${challenge.mustContain.map((s) => `"${s}"`).join(", ")} · +30 XP` },
        }));
      } else {
        setChecks((p) => ({
          ...p,
          [id]: {
            status: "fail",
            message: `Not yet — output is missing ${missing.map((s) => `"${s}"`).join(", ")}. Check the hint and try again.`,
          },
        }));
      }
    } catch {
      setChecks((p) => ({ ...p, [id]: { status: "error", message: "Could not run the program. Try again." } }));
    }
  };

  return (
    <main className="page">
      <header className="page-head">
        <h1>COBOL Exercises</h1>
        <p className="lead">
          Practice with real problems. Try each one yourself, reveal the reference solution, then run it in the online
          compiler.
        </p>
        <div className="row chips">
          {difficulties.map((d) => (
            <button key={d} type="button" className={filter === d ? "chip on" : "chip"} onClick={() => setFilter(d)}>
              {d}
            </button>
          ))}
        </div>
      </header>

      <div className="grid two">
        {shown.map((c, i) => {
          const state = checks[c.id];
          return (
            <div key={c.id} id={c.id} className="card exercise scroll-mt-24">
              <div className="row between">
                <span className="tag">#{String(i + 1).padStart(2, "0")}</span>
                <span className={`level ${levelClass(c.difficulty)}`}>{c.difficulty}</span>
              </div>
              <h3>{c.title}</h3>
              <p>{c.instructions}</p>

              <CodeBlock code={c.starter} lang="cobol" runnable stdin={c.stdin} title={c.title} />

              {state ? (
                <div className={`answer-note ${state.status === "pass" ? "correct" : "incorrect"}`}>
                  <strong>
                    {state.status === "checking" ? "Checking…" : state.status === "pass" ? "Correct" : "Not quite"}
                  </strong>
                  <p>{state.message}</p>
                </div>
              ) : null}

              <details>
                <summary className="more">Hint</summary>
                <p className="muted">{c.hint}</p>
              </details>

              <div className="row">
                <button
                  type="button"
                  className="btn primary sm"
                  onClick={() => check(c.id)}
                  disabled={state?.status === "checking"}
                >
                  {state?.status === "checking" ? "Checking…" : "Check my code"}
                </button>
                <Link className="btn ghost sm" href={compilerLink(c.starter)}>
                  Open compiler
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
