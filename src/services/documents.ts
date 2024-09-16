import { generateEmbeddings } from "@/lib/ai/embeddings";
import { insertDocumentSchema, NewDocumentParams } from "@/lib/database/schema";
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

export const saveDocument = async (input: NewDocumentParams) => {
  const db = await getDB();
  try {
    const { content, threadId, title, fileType } =
      insertDocumentSchema.parse(input);
    const chunks = await generateChunks(content);
    const [document] = await db
      .insert(schema.documents)
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
          documentId: document.id,
          content: content,
          threadId: threadId,
          embedding: embeddings,
        });
      })
    );

    return "Document successfully created.";
  } catch (e) {
    if (e instanceof Error)
      return e.message.length > 0 ? e.message : "Error, please try again.";
  }
};

export async function deleteDocumentById(id: string) {
  const db = await getDB();
  await db.delete(schema.documents).where(eq(schema.documents.id, id));
  await db
    .delete(schema.embeddings)
    .where(eq(schema.embeddings.documentId, id));
}

export const getDocumentsById = async (threadId: string) => {
  const db = await getDB();
  return db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.threadId, threadId))
    .orderBy(desc(schema.documents.createdAt));
};
