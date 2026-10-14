import * as Y from "yjs";
import { supabase } from "@/lib/supabase";

/** Google-Docs-style collaboration, hosted on Supabase (free tier):
 *  - Auth gives each user an account (see src/lib/supabase.ts).
 *  - The document is a Yjs CRDT; updates stream over a Supabase Realtime
 *    channel so multiple users edit together, live, without conflicts.
 *  - Presence shows who is in the room; comments are stored + broadcast. */

export interface Peer {
  id: string;
  name: string;
  emoji: string;
  color: string;
  self: boolean;
}

export interface Comment {
  id: string;
  name: string;
  emoji: string;
  color: string;
  body: string;
  created_at: string;
}

export interface CollabUser {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface CollabController {
  setLocalText: (text: string) => void;
  setLocalUser: (user: CollabUser) => void;
  addComment: (body: string) => Promise<void>;
  destroy: () => void;
}

const COLORS = ["#e11d48", "#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];

export function colorFor(seed: string | number): string {
  const n = typeof seed === "number" ? Math.floor(seed) : seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return COLORS[Math.abs(n) % COLORS.length];
}

function u8ToB64(u8: Uint8Array): string {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}

function b64ToU8(b64: string): Uint8Array {
  const s = atob(b64);
  const u8 = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i);
  return u8;
}

/** Minimal single-edit diff between two strings (for local -> Yjs updates). */
function diff(oldStr: string, newStr: string) {
  let start = 0;
  const min = Math.min(oldStr.length, newStr.length);
  while (start < min && oldStr[start] === newStr[start]) start++;
  let endOld = oldStr.length;
  let endNew = newStr.length;
  while (endOld > start && endNew > start && oldStr[endOld - 1] === newStr[endNew - 1]) {
    endOld--;
    endNew--;
  }
  return { start, del: endOld - start, insert: newStr.slice(start, endNew) };
}

export async function startCollab(opts: {
  room: string;
  initialText: string;
  user: CollabUser;
  onChange: (text: string) => void;
  onPeers: (peers: Peer[]) => void;
  onComments: (comments: Comment[]) => void;
  onComment: (comment: Comment) => void;
}): Promise<CollabController> {
  if (!supabase) throw new Error("collaboration-not-configured");
  const db = supabase;

  const doc = new Y.Doc();
  const ytext = doc.getText("code");

  // Load the persisted document state (server copy), then fill an empty doc.
  try {
    const { data } = await db.from("collab_documents").select("state").eq("room", opts.room).maybeSingle();
    if (data?.state) Y.applyUpdate(doc, b64ToU8(data.state as string), "remote");
  } catch {
    /* table missing or not configured - continue with an in-memory session */
  }
  if (ytext.length === 0 && opts.initialText) ytext.insert(0, opts.initialText);

  // --- realtime channel: edits + comments + presence -------------------------
  const channel = db.channel(`collab:${opts.room}`, {
    config: { broadcast: { self: false }, presence: { key: opts.user.id } },
  });

  let applyingRemote = false;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  const persist = () => {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      try {
        const state = u8ToB64(Y.encodeStateAsUpdate(doc));
        void db.from("collab_documents").upsert(
          { room: opts.room, state, updated_at: new Date().toISOString() },
          { onConflict: "room" },
        );
      } catch {
        /* offline / table missing - keep the live session anyway */
      }
    }, 1500);
  };

  // Broadcast local Yjs updates to everyone in the room.
  doc.on("update", (update: Uint8Array, origin: unknown) => {
    if (origin === "remote") return;
    try {
      void channel.send({ type: "broadcast", event: "update", payload: { update: u8ToB64(update) } });
    } catch {
      /* ignore send failures */
    }
    persist();
  });

  channel.on("broadcast", { event: "update" }, (msg: unknown) => {
    const p = (msg as { payload?: { update?: string } }).payload;
    if (!p?.update) return;
    Y.applyUpdate(doc, b64ToU8(p.update), "remote");
  });

  channel.on("broadcast", { event: "comment" }, (msg: unknown) => {
    const p = (msg as { payload?: { comment?: Comment } }).payload;
    if (p?.comment) opts.onComment(p.comment);
  });

  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState() as Record<string, { name?: string; emoji?: string; color?: string }[]>;
    const peers: Peer[] = [];
    Object.entries(state).forEach(([id, entries]) => {
      for (const e of entries ?? []) {
        peers.push({
          id,
          name: e.name ?? "Anonymous",
          emoji: e.emoji ?? "🐹",
          color: e.color ?? colorFor(id),
          self: id === opts.user.id,
        });
      }
    });
    opts.onPeers(peers);
  });

  channel.subscribe((status: string) => {
    if (status === "SUBSCRIBED") {
      void channel.track({ name: opts.user.name, emoji: opts.user.emoji, color: opts.user.color });
    }
  });

  // Push text changes to the editor.
  const observer = () => {
    applyingRemote = true;
    opts.onChange(ytext.toString());
    applyingRemote = false;
  };
  ytext.observe(observer);
  opts.onChange(ytext.toString());

  // Initial comments.
  try {
    const { data } = await db
      .from("collab_comments")
      .select("*")
      .eq("room", opts.room)
      .order("created_at", { ascending: true })
      .limit(200);
    if (data) opts.onComments(data as Comment[]);
  } catch {
    /* table missing - comments just stay local to the session */
  }

  let currentUser = opts.user;

  return {
    setLocalText: (text: string) => {
      if (applyingRemote) return;
      const cur = ytext.toString();
      if (cur === text) return;
      const d = diff(cur, text);
      doc.transact(() => {
        if (d.del > 0) ytext.delete(d.start, d.del);
        if (d.insert) ytext.insert(d.start, d.insert);
      });
    },
    setLocalUser: (user: CollabUser) => {
      currentUser = user;
      void channel.track({ name: user.name, emoji: user.emoji, color: user.color });
    },
    addComment: async (body: string) => {
      const comment: Comment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: currentUser.name,
        emoji: currentUser.emoji,
        color: currentUser.color,
        body,
        created_at: new Date().toISOString(),
      };
      opts.onComment(comment);
      try {
        await db.from("collab_comments").insert({ room: opts.room, ...comment });
      } catch {
        /* keep it session-only if the table is missing */
      }
      void channel.send({ type: "broadcast", event: "comment", payload: { comment } });
    },
    destroy: () => {
      if (saveTimer) clearTimeout(saveTimer);
      ytext.unobserve(observer);
      void db.removeChannel(channel);
      doc.destroy();
    },
  };
}
