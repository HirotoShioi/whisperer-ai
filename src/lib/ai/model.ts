import { ChatOpenAI, ChatOpenAIFields } from "@langchain/openai";
import { fetchAuthSession } from "aws-amplify/auth";

export async function getModel(options: ChatOpenAIFields) {
  const session = await fetchAuthSession();
  if (!session.tokens?.idToken) {
    throw new Error("No session");
  }
  return new ChatOpenAI(
    {
      ...options,
      maxRetries: 0,
      apiKey: session.tokens.idToken.toString(),
    },
    {
      baseURL: import.meta.env.VITE_API_URL,
    }
  );
}
