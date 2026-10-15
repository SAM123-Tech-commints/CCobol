import * as Y from "yjs";
import { supabase } from "@/lib/supabase";

/** Google-Docs-style collaboration, hosted on Supabase (free tier).
 *  No email accounts: a room is joined with a display name + animal avatar and
 *  is protected by a share key that travels in the share link. Live edits use a
 *  Yjs CRDT streamed over a Supabase Realtime channel; presence shows who is
 *  editing (with their caret); comments and version history are persisted. */

export interface Peer {
  id: string;
  name: string;
  emoji: string;
  color: string;
  self: boolean;
  cursor: number | null;
}

export interface Comment {
  id: string;
  name: string;
  emoji: string;
  color: string;
  body: string;
  created_at: string;
}

export interface Version {
  id: string;
  name: string;
  emoji: string;
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
  setCursor: (pos: number) => void;
  addComment: (body: string) => Promise<void>;
  saveVersion: (label?: string) => Promise<void>;
  restoreVersion: (id: string) => Promise<void>;
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
  key: string;
  initialText: string;
  user: CollabUser;
  onChange: (text: string) => void;
  onPeers: (peers: Peer[]) => void;
  onComments: (comments: Comment[]) => void;
  onComment: (comment: Comment) => void;
  onVersions: (versions: Version[]) => void;
  onSystem: (message: string, kind: "join" | "leave" | "info") => void;
}): Promise<CollabController> {
  if (!supabase) throw new Error("collaboration-not-configured");
  const db = supabase;

  // ---- security: locked rooms require the matching key ---------------------
  try {
    const { data } = await db.from("collab_documents").select("state,key").eq("room", opts.room).maybeSingle();
    if (data?.key && data.key !== opts.key) throw new Error("bad-key");
    if (data?.state) {
      const doc0 = new Y.Doc();
      Y.applyUpdate(doc0, b64ToU8(data.state as string), "remote");
      // (state applied after the doc is created below)
      opts.initialText = ""; // server copy wins
      var preloaded: Uint8Array | null = Y.encodeStateAsUpdate(doc0);
      doc0.destroy();
    } else {
      var preloaded: Uint8Array | null = null;
      // first person creates the room lock
      void db.from("collab_documents").upsert({ room: opts.room, key: opts.key, updated_at: new Date().toISOString() }, { onConflict: "room" });
    }
  } catch (e) {
    if (e instanceof Error && e.message === "bad-key") throw e;
    var preloaded: Uint8Array | null = null;
  }

  const doc = new Y.Doc();
  const ytext = doc.getText("code");
  if (preloaded) Y.applyUpdate(doc, preloaded, "remote");
  if (ytext.length === 0 && opts.initialText) ytext.insert(0, opts.initialText);

  const channel = db.channel(`collab:${opts.room}`, {
    config: { broadcast: { self: false }, presence: { key: opts.user.id } },
  });

  let applyingRemote = false;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let lastSnapshot = u8ToB64(Y.encodeStateAsUpdate(doc));

  const persist = () => {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      try {
        void db
          .from("collab_documents")
          .upsert({ room: opts.room, key: opts.key, state: u8ToB64(Y.encodeStateAsUpdate(doc)), updated_at: new Date().toISOString() }, { onConflict: "room" });
      } catch {
        /* offline */
      }
    }, 1200);
  };

  doc.on("update", (update: Uint8Array, origin: unknown) => {
    if (origin === "remote") return;
    try {
      void channel.send({ type: "broadcast", event: "update", payload: { update: u8ToB64(update) } });
    } catch {
      /* ignore */
    }
    persist();
  });

  channel.on("broadcast", { event: "update" }, (msg: unknown) => {
    const u = (msg as { payload?: { update?: string } }).payload?.update;
    if (u) Y.applyUpdate(doc, b64ToU8(u), "remote");
  });
  channel.on("broadcast", { event: "comment" }, (msg: unknown) => {
    const c = (msg as { payload?: { comment?: Comment } }).payload?.comment;
    if (c) opts.onComment(c);
  });
  channel.on("broadcast", { event: "version" }, (msg: unknown) => {
    const v = (msg as { payload?: { version?: Version } }).payload?.version;
    if (v) opts.onVersions([v]);
  });

  let prevIds = new Set<string>();
  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState() as Record<string, { name?: string; emoji?: string; color?: string; cursor?: number | null }[]>;
    const peers: Peer[] = [];
    Object.entries(state).forEach(([id, entries]) => {
      for (const e of entries ?? []) {
        peers.push({ id, name: e.name ?? "Anonymous", emoji: e.emoji ?? "🐹", color: e.color ?? colorFor(id), self: id === opts.user.id, cursor: typeof e.cursor === "number" ? e.cursor : null });
      }
    });
    // join / leave notifications
    const ids = new Set(peers.map((p) => p.id));
    peers.forEach((p) => {
      if (!p.self && !prevIds.has(p.id)) opts.onSystem(`${p.emoji} ${p.name} joined`, "join");
    });
    prevIds.forEach((id) => {
      if (!ids.has(id) && id !== opts.user.id) opts.onSystem("Someone left", "leave");
    });
    prevIds = ids;
    opts.onPeers(peers);
  });

  channel.subscribe((status: string) => {
    if (status === "SUBSCRIBED") {
      void channel.track({ name: opts.user.name, emoji: opts.user.emoji, color: opts.user.color, cursor: null });
    }
  });

  const observer = () => {
    applyingRemote = true;
    opts.onChange(ytext.toString());
    applyingRemote = false;
  };
  ytext.observe(observer);
  opts.onChange(ytext.toString());

  // initial comments + versions
  try {
    const { data } = await db.from("collab_comments").select("*").eq("room", opts.room).order("created_at").limit(300);
    if (data) opts.onComments(data as Comment[]);
  } catch {}
  try {
    const { data } = await db.from("collab_versions").select("id,name,emoji,created_at").eq("room", opts.room).order("created_at", { ascending: false }).limit(60);
    if (data) opts.onVersions(data as Version[]);
  } catch {}

  // auto-snapshot every 2 minutes when something changed
  const snapshotTimer = setInterval(() => {
    const cur = u8ToB64(Y.encodeStateAsUpdate(doc));
    if (cur !== lastSnapshot) {
      lastSnapshot = cur;
      void pushVersion(cur, "auto");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, 120_000);

  let currentUser = opts.user;

  async function pushVersion(state: string, label: string): Promise<void> {
    const version: Version = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: currentUser.name, emoji: currentUser.emoji, created_at: new Date().toISOString() };
    opts.onVersions([version]);
    try {
      await db.from("collab_versions").insert({ room: opts.room, id: version.id, state, name: version.name, emoji: version.emoji, created_at: version.created_at, label });
    } catch {}
    void channel.send({ type: "broadcast", event: "version", payload: { version } });
  }

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
      void channel.track({ name: user.name, emoji: user.emoji, color: user.color, cursor: null });
    },
    setCursor: (pos: number) => {
      // lightweight presence update (does not spam a full track)
      void channel.track({ name: currentUser.name, emoji: currentUser.emoji, color: currentUser.color, cursor: pos });
    },
    addComment: async (body: string) => {
      const comment: Comment = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: currentUser.name, emoji: currentUser.emoji, color: currentUser.color, body, created_at: new Date().toISOString() };
      opts.onComment(comment);
      try {
        await db.from("collab_comments").insert({ room: opts.room, ...comment });
      } catch {}
      void channel.send({ type: "broadcast", event: "comment", payload: { comment } });
    },
    saveVersion: async (label?: string) => {
      const state = u8ToB64(Y.encodeStateAsUpdate(doc));
      lastSnapshot = state;
      await pushVersion(state, label ?? "manual");
      opts.onSystem("Version saved", "info");
    },
    restoreVersion: async (id: string) => {
      try {
        const { data } = await db.from("collab_versions").select("state").eq("id", id).maybeSingle();
        if (data?.state) {
          Y.applyUpdate(doc, b64ToU8(data.state as string), "local");
          opts.onSystem("Version restored", "info");
        }
      } catch {}
    },
    destroy: () => {
      if (saveTimer) clearTimeout(saveTimer);
      clearInterval(snapshotTimer);
      ytext.unobserve(observer);
      void db.removeChannel(channel);
      doc.destroy();
    },
  };
}
