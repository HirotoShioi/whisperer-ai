import { nanoid } from "@/lib/utils";
import { EMBEDDING_DIMENSIONS, MAX_VARCHAR_LENGTH } from "@/constants";
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
    id: varchar("id", { length: MAX_VARCHAR_LENGTH })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    resourceId: varchar("resource_id", {
      length: MAX_VARCHAR_LENGTH,
    }).references(() => resources.id, { onDelete: "cascade" }),
    threadId: varchar("thread_id", { length: MAX_VARCHAR_LENGTH }).notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", {
      dimensions: EMBEDDING_DIMENSIONS,
    }).notNull(),
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
