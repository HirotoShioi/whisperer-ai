import { embed, embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { schema } from "@/lib/database/schema";
import { cosineDistance, sql, gt, desc, eq, and } from "drizzle-orm";
import { SIMILARITY_THRESHOLD, VECTOR_SEARCH_K } from "@/constants";
import { getDB } from "../database/client";
import { fetchAuthSession } from "aws-amplify/auth";

async function getEmbeddingModel() {
  const session = await fetchAuthSession();
  if (!session.tokens?.idToken) {
    throw new Error("No session");
  }
  return createOpenAI({
    apiKey: session.tokens.idToken.toString(),
    baseURL: import.meta.env.VITE_API_URL,
  }).embedding("text-embedding-3-small");
}

/**
 * Generates embeddings for a list of documents.
 * @param documents The documents to generate embeddings for.
 * @returns The embeddings and the content.
 */
export const generateEmbeddings = async (
  documents: string[]
): Promise<{ embeddings: number[]; content: string }[]> => {
  const { embeddings } = await embedMany({
    model: await getEmbeddingModel(),
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
    model: await getEmbeddingModel(),
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
  const db = await getDB();
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    schema.embeddings.embedding,
    userQueryEmbedded.embedding
  )})`;
  const similarGuides = await db
    .select({
      name: schema.embeddings.content,
      similarity,
      embeddingId: schema.embeddings.id,
    })
    .from(schema.embeddings)
    .where(
      and(
        gt(similarity, SIMILARITY_THRESHOLD),
        eq(schema.embeddings.threadId, threadId)
      )
    )
    .orderBy((t) => desc(t.similarity))
    .limit(VECTOR_SEARCH_K);
  return similarGuides;
};
