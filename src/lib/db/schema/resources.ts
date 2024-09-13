import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { MAX_VARCHAR_LENGTH } from "@/constants";
import { nanoid } from "@/lib/utils";

export const resources = pgTable("resources", {
  id: varchar("id", { length: MAX_VARCHAR_LENGTH })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  fileType: varchar("file_type").notNull(),
  threadId: varchar("thread_id", { length: MAX_VARCHAR_LENGTH }).notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for resources - used to validate API requests
export const insertResourceSchema = createSelectSchema(resources)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Type for resources - used to type API request params and within Components
export type NewResourceParams = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;
