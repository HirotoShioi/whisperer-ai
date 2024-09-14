import { ChatOpenAI, ChatOpenAIFields } from "@langchain/openai";

export function getModel(options: ChatOpenAIFields) {
  return new ChatOpenAI(
    {
      ...options,
      apiKey: "DUMMY_API_KEY",
    },
    {
      baseURL: import.meta.env.VITE_API_URL,
    }
  );
}
