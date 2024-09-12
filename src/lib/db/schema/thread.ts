import { sql } from "drizzle-orm";
import { varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const threads = pgTable("threads", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
});

export type Thread = typeof threads.$inferSelect;
