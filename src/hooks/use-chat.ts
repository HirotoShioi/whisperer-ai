import { useChat as c } from "ai/react";
import { convertToCoreMessages, Message, streamText, tool } from "ai";
import { saveMessage } from "@/services/messages";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { findRelevantContent } from "@/lib/ai/embeddings";
import { BASE_CHAT_MODEL } from "@/constants";

export function useChat(threadId: string, initialMessages?: Message[]) {
  const chat = c({
    id: threadId,
    initialMessages,
    api: "/api/chat",
    maxToolRoundtrips: 3,
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
  return {
    ...chat,
    append: async (message: Message) => {
      await saveMessage({
        threadId: threadId,
        role: message.role,
        content: message.content,
        toolInvocations: JSON.stringify(message.toolInvocations),
      });
      chat.append(message);
    },
  };
}

async function handleChat(req: Request) {
  const body = await req.json();
  const threadId = req.url.split("/").pop();
  if (!body || !threadId) {
    return Response.json({ error: "No body" }, { status: 404 });
  }
  const { messages } = body as { messages: any[] };
  const model = createOpenAI({
    apiKey: "DUMMY_API_KEY",
    baseURL: import.meta.env.VITE_API_URL,
  }).chat(BASE_CHAT_MODEL);
  const result = await streamText({
    model: model,
    system: `You are a helpful assistant that can answer questions and help with tasks. You have access to a knowledge base that you can use to find relevant information. You can use the tools below to help you with your tasks.
      First, introduce yourself as a helpful assistant.
      Then, answer the user's question.
    `,
    messages: convertToCoreMessages(messages),
    tools: {
      getRelavantInformation: getRelavantInformationTool(threadId),
      saveDocument: saveDocumentTool(threadId),
    },
  });
  return result.toDataStreamResponse();
}

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

function saveDocumentTool(threadId: string) {
  return tool({
    description: "Add a document to the knowledge base.",
    parameters: z.object({
      title: z.string().describe("The title of the document."),
      content: z.string().describe("The content of the document."),
      fileType: z.string().describe("The file type of the document."),
    }),
    execute: async ({ title, content, fileType }) => {
      console.log(title, content, fileType, threadId);
    },
  });
}

export type ToolNames = "getRelavantInformation" | "saveDocument";
