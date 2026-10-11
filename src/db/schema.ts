import { boolean, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/** Saved / shared COBOL programs. */
export const snippets = pgTable("snippets", {
  id: serial("id").primaryKey(),
  shareId: varchar("share_id", { length: 16 }).notNull().unique(),
  title: varchar("title", { length: 140 }).notNull(),
  code: text("code").notNull(),
  stdin: text("stdin").notNull().default(""),
  files: jsonb("files").$type<Record<string, string>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Simple run log so the site can show compiler activity. */
export const runs = pgTable("runs", {
  id: serial("id").primaryKey(),
  shareId: varchar("share_id", { length: 16 }),
  ok: boolean("ok").notNull().default(true),
  outputBytes: integer("output_bytes").notNull().default(0),
  runMs: integer("run_ms").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Snippet = typeof snippets.$inferSelect;
export type NewSnippet = typeof snippets.$inferInsert;
