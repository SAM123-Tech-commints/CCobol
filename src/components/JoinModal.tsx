"use client";

import { useEffect, useState } from "react";
import { colorFor, type CollabUser } from "@/lib/collab";
import { XIcon } from "@/components/icons";

const ANIMALS = ["🦊", "🐼", "🦁", "🐨", "🐯", "🐧", "🦉", "🐸", "🐙", "🐱", "🐶", "🦄", "🐵", "🐰", "🐢", "🐬", "🦋", "🦕"];
const NAMES = ["Fox", "Panda", "Lion", "Koala", "Tiger", "Penguin", "Owl", "Frog", "Octopus", "Cat", "Dog", "Unicorn", "Monkey", "Rabbit", "Turtle", "Dolphin", "Butterfly", "Dino"];

/** Join a live room: pick a name + animal avatar. No email or account needed -
 *  the room is protected by the key in the share link. */
export default function JoinModal({ open, onClose, onJoin, room }: { open: boolean; onClose: () => void; onJoin: (u: CollabUser) => void; room?: string }) {
  const [name, setName] = useState("");
  const [animal, setAnimal] = useState(0);

  useEffect(() => {
    if (!open) return;
    let stored: { name?: string; animal?: number } | null = null;
    try {
      stored = JSON.parse(localStorage.getItem("ocb-collab-id") ?? "null");
    } catch {}
    if (stored?.name) setName(stored.name);
    else {
      const i = Math.floor(Math.random() * ANIMALS.length);
      setAnimal(i);
      setName(NAMES[i]);
    }
    if (typeof stored?.animal === "number") setAnimal(stored.animal);
  }, [open]);

  if (!open) return null;

  const submit = () => {
    const clean = name.trim().slice(0, 20) || NAMES[animal];
    const id = `${Math.random().toString(36).slice(2, 10)}`;
    try {
      localStorage.setItem("ocb-collab-id", JSON.stringify({ name: clean, animal }));
    } catch {}
    onJoin({ id, name: clean, emoji: ANIMALS[animal], color: colorFor(animal + clean) });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-slate-600 bg-[#0b1625] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <p className="font-bold text-white">Join live session</p>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white" aria-label="Close">
            <XIcon width={15} height={15} />
          </button>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-slate-400">
          Just pick a name and an animal - no account, no email. Anyone with the share link (and its key) can edit live
          with you.
          {room ? (
            <>
              {" "}
              Room <span className="font-mono text-slate-300">{room}</span>.
            </>
          ) : null}
        </p>

        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          className="mb-3 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-400"
        />

        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pick your animal</label>
        <div className="mb-4 grid grid-cols-6 gap-1.5">
          {ANIMALS.map((a, i) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setAnimal(i);
                if (NAMES.includes(name) || !name.trim()) setName(NAMES[i]);
              }}
              className={`flex h-9 items-center justify-center rounded-lg border text-lg transition ${
                i === animal ? "border-indigo-400 bg-indigo-500/20" : "border-slate-600 hover:border-indigo-400"
              }`}
              title={NAMES[i]}
            >
              {a}
            </button>
          ))}
        </div>

        <button type="button" onClick={submit} className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:brightness-110">
          {ANIMALS[animal]} Join live editing
        </button>
      </div>
    </div>
  );
}
