import { getDB } from "@/lib/database/client";
import { schema } from "@/lib/database/schema";
import { NewMessageParams } from "@/lib/database/schema";
import { eq } from "drizzle-orm";
import { Message } from "@ai-sdk/react";
export async function saveMessage(input: NewMessageParams) {
  const db = await getDB();
  return db
    .insert(schema.messages)
    .values({
      role: input.role as "user" | "assistant" | "tool",
      content: input.content,
      toolInvocations: input.toolInvocations,
      threadId: input.threadId,
    })
    .returning();
}

export async function getMessages(threadId: string) {
  const db = await getDB();
  const messages = await db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.threadId, threadId));
  return messages as unknown as Message[];
}
