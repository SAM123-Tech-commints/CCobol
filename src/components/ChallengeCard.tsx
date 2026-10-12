"use client";

import Link from "next/link";
import { useState } from "react";
import type { Challenge } from "@/content/challenges";
import { markChallengeDone } from "@/lib/progress";

function compilerLink(code: string, stdin = ""): string {
  const payload = { code, stdin, files: {}, title: "COBOL challenge" };
  return `/compiler?code=${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))))}`;
}

interface CheckState {
  status: "idle" | "checking" | "pass" | "fail" | "error";
  message: string;
}

/**
 * Programming-Hub-style exercise card: instructions + hint,
 * one-click open in the COBOL-only compiler, and an auto-checker
 * that RUNS the starter (or your edited code) via /api/run.
 */
export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const [code, setCode] = useState(challenge.starter);
  const [check, setCheck] = useState<CheckState>({ status: "idle", message: "" });

  const runCheck = async () => {
    setCheck({ status: "checking", message: "Running your COBOL program…" });
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, stdin: challenge.stdin ?? "" }),
      });
      const data = (await res.json()) as { output?: string; errors?: string[]; error?: string };
      if (data.error) {
        setCheck({ status: "error", message: data.error });
        return;
      }
      if ((data.errors ?? []).length) {
        setCheck({ status: "fail", message: `Compiler says: ${(data.errors ?? []).join("; ")}` });
        return;
      }
      const output = data.output ?? "";
      const missing = challenge.mustContain.filter((needle) => !output.includes(needle));
      if (missing.length === 0) {
        markChallengeDone(challenge.id);
        setCheck({ status: "pass", message: `Passed! Output contains ${challenge.mustContain.map((s) => `"${s}"`).join(", ")} · +30 XP` });
      } else {
        setCheck({ status: "fail", message: `Not yet - output is missing ${missing.map((s) => `"${s}"`).join(", ")}. Check the hint and try again.` });
      }
    } catch {
      setCheck({ status: "error", message: "Could not run the program. Try again." });
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">{challenge.difficulty}</span>
        <span className="text-slate-400">COBOL exercise</span>
      </div>
      <h3 className="mt-2 text-base font-bold text-slate-900">{challenge.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{challenge.instructions}</p>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        className="mt-3 h-36 w-full resize-y rounded-xl border border-slate-700 bg-[#091524] p-3 font-mono text-[12px] leading-relaxed text-slate-200 outline-none focus:border-emerald-400"
      />
      <details className="mt-2 text-sm text-slate-500">
        <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800">Show hint</summary>
        <p className="mt-1">{challenge.hint}</p>
      </details>
      {check.status !== "idle" ? (
        <p
          className={`mt-2 rounded-xl px-3 py-2 text-sm ${
            check.status === "pass"
              ? "bg-emerald-50 text-emerald-800"
              : check.status === "checking"
                ? "bg-slate-100 text-slate-600"
                : "bg-amber-50 text-amber-800"
          }`}
        >
          {check.message}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={runCheck}
          disabled={check.status === "checking"}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {check.status === "checking" ? "Checking…" : "Check my code"}
        </button>
        <Link
          href={compilerLink(code, challenge.stdin ?? "")}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-700"
        >
          Open in compiler
        </Link>
      </div>
    </div>
  );
}
