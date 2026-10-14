import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase powers the Google-Docs-style collaboration: Auth (accounts),
 * Realtime (WebSocket channels for live editing + presence) and Postgres
 * (document + comment persistence).
 *
 * It is FREE: create a project at https://supabase.com, copy the project URL
 * and the anon public key into the env vars below. Without them the site
 * works normally and collaboration is simply hidden.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;
export const collabConfigured = Boolean(url && anonKey);
export type { Session };
