import { nanoid } from "@/lib/utils";
import { EMBEDDING_DIMENSIONS, MAX_VARCHAR_LENGTH } from "@/constants";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  vector,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const documents = pgTable("documents", {
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

// Schema for documents - used to validate API requests
export const insertDocumentSchema = createSelectSchema(documents)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Type for documents - used to type API request params and within Components
export type NewDocumentParams = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

const embeddings = pgTable(
  "embeddings",
  {
    id: varchar("id", { length: MAX_VARCHAR_LENGTH })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    documentId: varchar("document_id", {
      length: MAX_VARCHAR_LENGTH,
    }).references(() => documents.id, { onDelete: "cascade" }),
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

const messages = pgTable("messages", {
  id: varchar("id", { length: MAX_VARCHAR_LENGTH })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  role: text("role", {
    enum: ["user", "assistant", "tool", "function", "system", "data"],
  }).notNull(),
  content: text("content").notNull(),
  threadId: varchar("thread_id", { length: MAX_VARCHAR_LENGTH }).notNull(),
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

const threads = pgTable("threads", {
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

export const schema = {
  embeddings,
  messages,
  documents,
  threads,
};
