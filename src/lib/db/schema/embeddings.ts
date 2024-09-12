import { nanoid } from "@/lib/utils";
import {
  index,
  pgTable,
  text,
  timestamp,
  varchar,
  vector,
} from "drizzle-orm/pg-core";
import { resources } from "./resources";
import { sql } from "drizzle-orm";

export const embeddings = pgTable(
  "embeddings",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    resourceId: varchar("resource_id", { length: 191 }).references(
      () => resources.id,
      { onDelete: "cascade" }
    ),
    threadId: varchar("thread_id", { length: 191 }).notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => ({
    embeddingIndex: index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);

export type Embedding = typeof embeddings.$inferSelect;
