import { useChat as c } from "ai/react";
import { convertToCoreMessages, Message, streamText, tool } from "ai";
import { saveMessage } from "@/data/messages";
import { loadFromLocalStorage } from "@/utils/localStorageUtils";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { findRelevantContent } from "@/lib/ai/embeddings";

export function useChat(threadId: string, initialMessages?: Message[]) {
  return c({
    id: threadId,
    initialMessages,
    api: "/api/chat",
    maxToolRoundtrips: 10,
    keepLastMessageOnError: true,
    fetch: (_input, init) => handleChat(new Request(`/chat/${threadId}`, init)),
    onFinish: async (message) => {
      await saveMessage({
        role: message.role,
        content: message.content,
        toolInvocations: JSON.stringify(message.toolInvocations),
        threadId: threadId!,
      });
    },
    onToolCall({ toolCall }) {
      console.log("Tool call", toolCall);
    },
  });
}

async function handleChat(req: Request) {
  const body = await req.json();
  const threadId = req.url.split("/").pop();
  if (!body || !threadId) {
    return Response.json({ error: "No body" }, { status: 404 });
  }
  const { messages } = body as { messages: any[] };
  const apiKey = loadFromLocalStorage("openAIAPIKey");
  if (!apiKey) {
    return Response.json({ error: "No API key" }, { status: 500 });
  }
  const result = await streamText({
    model: createOpenAI({
      apiKey: apiKey,
    }).chat("gpt-4o-mini"),
    system: systemPrompt,
    messages: convertToCoreMessages(messages),
    tools: {
      getRelavantInformation: getRelavantInformationTool(threadId),
      addResource: addResourceTool(threadId),
    },
  });
  return result.toDataStreamResponse();
}

export const systemPrompt = `You are a helpful assistant that can answer questions and help with tasks. You have access to a knowledge base that you can use to find relevant information. You can also add new resources to the knowledge base. You can use the tools below to help you with your tasks.`;

function getRelavantInformationTool(threadId: string) {
  return tool({
    description:
      "Get information from your knowledge base to answer user's questions. Rewrite it into 5 distinct queries that could be used to search for relevant information. Each query should focus on different aspects or potential interpretations of the original message. No questions, just a query maximizing the chance of finding relevant information.",
    parameters: z.object({
      queries: z
        .string()
        .describe("Search query you use to lookup the knowledge base")
        .array(),
    }),
    execute: async ({ queries }) => {
      console.log(queries);
      const contents = await Promise.all(
        queries.map((query) => findRelevantContent(query, threadId))
      );
      const uniqueContents = contents
        .flat()
        .filter(
          (content, index, self) =>
            index ===
            self.findIndex((t) => t.embeddingId === content.embeddingId)
        );
      return uniqueContents;
    },
  });
}

function addResourceTool(threadId: string) {
  return tool({
    description: "Add a resource to the knowledge base.",
    parameters: z.object({
      title: z.string().describe("The title of the resource."),
      content: z.string().describe("The content of the resource."),
      fileType: z.string().describe("The file type of the resource."),
    }),
    execute: async ({ title, content, fileType }) => {
      console.log(title, content, fileType, threadId);
    },
  });
}
