import { embed, embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { embeddings } from "../db/schema/embeddings";
import { cosineDistance, sql, gt, desc, eq, and } from "drizzle-orm";
import { db } from "@/providers/pglite";
import { SIMILARITY_THRESHOLD, VECTOR_SEARCH_K } from "@/constants";

const embeddingModel = createOpenAI({
  apiKey: "DUMMY_API_KEY",
  baseURL: import.meta.env.VITE_API_URL,
}).embedding("text-embedding-3-small");

/**
 * Generates embeddings for a list of documents.
 * @param documents The documents to generate embeddings for.
 * @returns The embeddings and the content.
 */
export const generateEmbeddings = async (
  documents: string[]
): Promise<{ embeddings: number[]; content: string }[]> => {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: documents,
  });
  return embeddings.map((e, i) => ({ embeddings: e, content: documents[i] }));
};

/**
 * Generates an embedding for a document.
 * @param document The document to generate an embedding for.
 * @returns The embedding and the content.
 */
export const generateEmbedding = async (
  document: string
): Promise<{ embedding: number[]; content: string }> => {
  const { embedding } = await embed({
    model: embeddingModel,
    value: document,
  });
  return { embedding, content: document };
};

/**
 * Finds relevant content based on a user query.
 * @param userQuery The user query.
 * @param threadId The thread ID.
 * @returns The relevant content.
 */
export const findRelevantContent = async (
  userQuery: string,
  threadId: string
) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded.embedding
  )})`;
  const similarGuides = await db
    .select({
      name: embeddings.content,
      similarity,
      embeddingId: embeddings.id,
    })
    .from(embeddings)
    .where(
      and(
        gt(similarity, SIMILARITY_THRESHOLD),
        eq(embeddings.threadId, threadId)
      )
    )
    .orderBy((t) => desc(t.similarity))
    .limit(VECTOR_SEARCH_K);
  return similarGuides;
};
