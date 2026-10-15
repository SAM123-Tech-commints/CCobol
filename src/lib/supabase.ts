import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase powers the Google-Docs-style collaboration: Realtime (WebSocket
 * channels for live editing + presence) and Postgres (document, comment and
 * version persistence). No user accounts are required — rooms are protected by
 * a share key.
 *
 * FREE: create a project at https://supabase.com, then put the project URL and
 * the publishable (anon) key in the env vars below. Without them the site works
 * normally and collaboration is simply not configured.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;
export const collabConfigured = Boolean(url && anonKey);
