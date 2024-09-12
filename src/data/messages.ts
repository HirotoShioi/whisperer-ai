import { NewMessageParams } from "@/lib/db/schema/messages";
import { db } from "@/providers/pglite";
import { messages } from "@/lib/db/schema/messages";
import { eq } from "drizzle-orm";

export async function saveMessage(input: NewMessageParams) {
  return db
    .insert(messages)
    .values({
      role: input.role as "user" | "assistant" | "tool",
      content: input.content,
      toolInvocations: input.toolInvocations,
      threadId: input.threadId,
    })
    .returning();
}

export async function getMessages(threadId: string) {
  return db.select().from(messages).where(eq(messages.threadId, threadId));
}
