import { getDB } from "@/lib/database/client";
import { schema } from "@/lib/database/schema";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const newThreadId = () => {
  return nanoid();
};

export const createThread = async (
  newThreadId: string,
  title: string = "New Conversation"
) => {
  const db = await getDB();
  const [thread] = await db
    .insert(schema.threads)
    .values({ id: newThreadId, title: title })
    .returning();
  return thread;
};

export const renameThread = async (id: string, title: string) => {
  const db = await getDB();
  const [thread] = await db
    .update(schema.threads)
    .set({ title })
    .where(eq(schema.threads.id, id))
    .returning();
  return thread;
};

export const getThreadById = async (id: string) => {
  const db = await getDB();
  const result = await db
    .select()
    .from(schema.threads)
    .where(eq(schema.threads.id, id));
  if (result.length === 0) {
    return null;
  }
  return result[0];
};

export const getThreads = async () => {
  const db = await getDB();
  return db
    .select()
    .from(schema.threads)
    .orderBy(desc(schema.threads.createdAt));
};

// deleteすると関連するmessages, resourcesも削除される
export const deleteThread = async (id: string) => {
  const db = await getDB();
  return db.delete(schema.threads).where(eq(schema.threads.id, id));
};
