import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

/**
 * Database is OPTIONAL so the site builds and runs on Vercel without
 * Postgres. When DATABASE_URL is missing (local preview / Vercel without
 * storage), `db` is a stub that throws only when actually used - every
 * caller already handles that with try/catch and falls back gracefully
 * (no recent-programs list, share links disabled, run logging skipped).
 */
const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function createDb() {
  if (!databaseUrl) {
    // Stub: throws on any use, caught by callers.
    return new Proxy(
      {},
      {
        get() {
          return () => {
            throw new Error("DATABASE_URL is not configured");
          };
        },
      },
    ) as unknown as ReturnType<typeof drizzle>;
  }
  const pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  return drizzle(pool);
}

export const pool = databaseUrl
  ? (globalForDb.__arenaNextJsPostgresqlPool ?? null)
  : null;

export const db = createDb();

/** True when a real Postgres connection is configured. */
export const hasDatabase = Boolean(databaseUrl);
