"use client";

import { useEffect, useState } from "react";
import { supabase, type Session } from "@/lib/supabase";
import { BotIcon, XIcon } from "@/components/icons";

/** Google-Docs-style accounts for collaboration: sign in (or create a free
 *  account) with email + password. Supabase hosts the auth for free. */
export default function AuthModal({ open, onClose, onSignedIn }: { open: boolean; onClose: () => void; onSignedIn: (s: Session) => void }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Collaboration is not configured yet - add your free Supabase keys (see .env.example).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const mail = email.trim();
      const pass = password;
      if (mode === "up") {
        const { data, error: err } = await supabase.auth.signUp({
          email: mail,
          password: pass,
          options: { data: { display_name: name.trim() || mail.split("@")[0] } },
        });
        if (err) throw err;
        if (data.session) {
          onSignedIn(data.session);
          onClose();
        } else {
          setError("Account created! Check your email to confirm, or disable email confirmation in Supabase Auth settings.");
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email: mail, password: pass });
        if (err) throw err;
        if (data.session) {
          onSignedIn(data.session);
          onClose();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-600 bg-[#0b1625] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-2 font-bold text-white">
            <span className="text-violet-300">
              <BotIcon width={18} height={18} />
            </span>
            Sign in to collaborate
          </p>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white" aria-label="Close">
            <XIcon width={15} height={15} />
          </button>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-slate-400">
          A free account is needed to edit with others in real time - just like Google Docs. Your animal avatar is
          created automatically.
        </p>
        <form onSubmit={submit} className="space-y-3">
          {mode === "up" ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name (e.g. Sam)"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400"
            />
          ) : null}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400"
          />
          {error ? <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-300">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "up" ? "Create free account" : "Sign in"}
          </button>
        </form>
        <p className="mt-3 text-center text-[11px] text-slate-500">
          {mode === "up" ? "Already have an account?" : "New here?"}{" "}
          <button type="button" className="font-semibold text-indigo-300 hover:text-indigo-200" onClick={() => setMode(mode === "up" ? "in" : "up")}>
            {mode === "up" ? "Sign in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}
