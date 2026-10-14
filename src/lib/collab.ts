/** Real-time collaboration via Yjs + y-webrtc: peer-to-peer over public
 *  signalling servers — free, no backend to host, no account needed. Peers sync
 *  the shared document directly; presence (who is in the room) comes from Yjs
 *  awareness. */

export interface Peer {
  id: number;
  name: string;
  color: string;
  self: boolean;
}

export interface CollabController {
  setLocalText: (text: string) => void;
  setLocalUser: (user: { name: string; color: string }) => void;
  destroy: () => void;
}

const COLORS = ["#e11d48", "#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];

export function colorFor(id: number): string {
  return COLORS[Math.abs(id) % COLORS.length];
}

/** Minimal single-edit diff between two strings. */
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
  user: { name: string; color: string };
  onChange: (text: string) => void;
  onPeers: (peers: Peer[]) => void;
}): Promise<CollabController> {
  const Y = await import("yjs");
  const { WebrtcProvider } = await import("y-webrtc");

  const doc = new Y.Doc();
  const ytext = doc.getText("code");
  const provider = new WebrtcProvider(`cobol-studio-${opts.room}`, doc, {
    signaling: ["wss://signaling.yjs.dev", "wss://y-webrtc-eu.fly.dev"],
  });

  if (ytext.length === 0 && opts.initialText) ytext.insert(0, opts.initialText);

  let applyingRemote = false;
  const observer = () => {
    applyingRemote = true;
    opts.onChange(ytext.toString());
    applyingRemote = false;
  };
  ytext.observe(observer);

  const awareness = provider.awareness;
  awareness.setLocalStateField("user", opts.user);
  const updatePeers = () => {
    const peers: Peer[] = [];
    awareness.getStates().forEach((state, clientId) => {
      const u = state.user as { name?: string; color?: string } | undefined;
      if (u) {
        peers.push({
          id: clientId,
          name: u.name ?? "Anonymous",
          color: u.color ?? colorFor(clientId),
          self: clientId === awareness.clientID,
        });
      }
    });
    opts.onPeers(peers);
  };
  awareness.on("change", updatePeers);
  updatePeers();

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
    setLocalUser: (user) => awareness.setLocalStateField("user", user),
    destroy: () => {
      ytext.unobserve(observer);
      awareness.off("change", updatePeers);
      provider.destroy();
      doc.destroy();
    },
  };
}
