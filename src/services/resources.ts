import { generateEmbeddings } from "@/lib/ai/embeddings";
import { insertResourceSchema, NewResourceParams } from "@/lib/database/schema";
import { schema } from "@/lib/database/schema";
import { getDB } from "@/lib/database/client";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { desc, eq } from "drizzle-orm";

async function generateChunks(input: string): Promise<string[]> {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await textSplitter.createDocuments([input]);
  return chunks.map((chunk) => chunk.pageContent);
}

export const createResource = async (input: NewResourceParams) => {
  const db = await getDB();
  try {
    const { content, threadId, title, fileType } =
      insertResourceSchema.parse(input);
    const chunks = await generateChunks(content);
    const [resource] = await db
      .insert(schema.resources)
      .values({
        content: content,
        threadId: threadId,
        title: title,
        fileType: fileType,
      })
      .returning();
    const embeddings = await generateEmbeddings(chunks);
    await Promise.all(
      embeddings.map(async ({ embeddings, content }) => {
        await db.insert(schema.embeddings).values({
          resourceId: resource.id,
          content: content,
          threadId: threadId,
          embedding: embeddings,
        });
      })
    );

    return "Resource successfully created.";
  } catch (e) {
    if (e instanceof Error)
      return e.message.length > 0 ? e.message : "Error, please try again.";
  }
};

export async function deleteResourceById(id: string) {
  const db = await getDB();
  await db.delete(schema.resources).where(eq(schema.resources.id, id));
  await db
    .delete(schema.embeddings)
    .where(eq(schema.embeddings.resourceId, id));
}

export const getResources = async (threadId: string) => {
  const db = await getDB();
  return db
    .select()
    .from(schema.resources)
    .where(eq(schema.resources.threadId, threadId))
    .orderBy(desc(schema.resources.createdAt));
};
