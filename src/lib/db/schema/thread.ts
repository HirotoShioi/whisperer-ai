import { sql } from "drizzle-orm";
import { varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { MAX_VARCHAR_LENGTH } from "@/constants";

export const threads = pgTable("threads", {
  id: varchar("id", { length: MAX_VARCHAR_LENGTH })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  title: varchar("title").notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
});

export type Thread = typeof threads.$inferSelect;

export const insertThreadSchema = createSelectSchema(threads).extend({}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NewThreadParams = {
  title: string;
};
