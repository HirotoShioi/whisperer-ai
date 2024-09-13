import { embed, embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { loadFromLocalStorage } from "@/utils/local-storage";
import { embeddings } from "../db/schema/embeddings";
import { cosineDistance, sql, gt, desc, eq, and } from "drizzle-orm";
import { db } from "@/providers/pglite";

export const generateEmbeddings = async (
  documents: string[]
): Promise<{ embeddings: number[]; content: string }[]> => {
  const apiKey = loadFromLocalStorage("openAIAPIKey");
  if (!apiKey) {
    throw new Error("No API key");
  }
  const embeddingModel = createOpenAI({
    apiKey: apiKey,
  }).embedding("text-embedding-3-small");
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: documents,
  });
  return embeddings.map((e, i) => ({ embeddings: e, content: documents[i] }));
};

export const generateEmbedding = async (
  document: string
): Promise<{ embedding: number[]; content: string }> => {
  const apiKey = loadFromLocalStorage("openAIAPIKey");
  if (!apiKey) {
    throw new Error("No API key");
  }
  const embeddingModel = createOpenAI({
    apiKey: apiKey,
  }).embedding("text-embedding-3-small");
  const { embedding } = await embed({
    model: embeddingModel,
    value: document,
  });
  return { embedding, content: document };
};

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
    .where(and(gt(similarity, 0.5), eq(embeddings.threadId, threadId)))
    .orderBy((t) => desc(t.similarity))
    .limit(4);
  return similarGuides;
};
