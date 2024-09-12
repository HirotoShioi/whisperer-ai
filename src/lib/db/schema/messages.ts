// select id, role, content, tool_invocations as "toolInvocations", created_at as "createdAt"
// from messages where database_id = $1
// order by created_at asc
import { sql } from "drizzle-orm";
import { text, jsonb, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { z } from "zod";

// create table messages (
//   id text primary key,
//   database_id text not null references databases(id) on delete cascade,
//   created_at timestamptz not null default now(),
//   content text not null,
//   role text not null check (role in ('user', 'assistant', 'tool')),
//   tool_invocations jsonb
// );
export const messages = pgTable("messages", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  role: text("role", {
    enum: ["user", "assistant", "tool", "function", "system", "data"],
  }).notNull(),
  content: text("content").notNull(),
  threadId: varchar("thread_id", { length: 191 }).notNull(),
  toolInvocations: jsonb("tool_invocations"),
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
});

export const insertMessageSchema = createInsertSchema(messages)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
  });

export type NewMessageParams = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
