import { db } from "@/providers/pglite";
import { threads } from "@/lib/db/schema/thread";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const newThreadId = () => {
  return nanoid();
};
export const createThread = async (
  newThreadId: string,
  title: string = "New Conversation"
) => {
  const [thread] = await db
    .insert(threads)
    .values({ id: newThreadId, title: title })
    .returning();
  return thread;
};

export const renameThread = async (id: string, title: string) => {
  const [thread] = await db
    .update(threads)
    .set({ title })
    .where(eq(threads.id, id))
    .returning();
  return thread;
};

export const getThreadById = async (id: string) => {
  const [thread] = await db.select().from(threads).where(eq(threads.id, id));
  return thread;
};

export const getThreads = async () => {
  return db.select().from(threads).orderBy(desc(threads.createdAt));
};

export const doesThreadExist = async (id: string) => {
  const thread = await getThreadById(id);
  return !!thread;
};
// deleteすると関連するmessages, resourcesも削除される
export const deleteThread = async (id: string) => {
  return db.delete(threads).where(eq(threads.id, id));
};
