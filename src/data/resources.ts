import { generateEmbeddings } from "@/lib/ai/embeddings";
import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from "@/lib/db/schema/resources";
import { embeddings as embeddingsTable } from "@/lib/db/schema/embeddings";
import { db } from "@/providers/pglite";
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
  try {
    const { content, threadId, title, fileType } =
      insertResourceSchema.parse(input);
    const chunks = await generateChunks(content);
    const [resource] = await db
      .insert(resources)
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
        await db.insert(embeddingsTable).values({
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
  await db.delete(resources).where(eq(resources.id, id));
  await db.delete(embeddingsTable).where(eq(embeddingsTable.resourceId, id));
}

export const getResources = async (threadId: string) => {
  return db
    .select()
    .from(resources)
    .where(eq(resources.threadId, threadId))
    .orderBy(desc(resources.createdAt));
};
