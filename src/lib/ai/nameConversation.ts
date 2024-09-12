import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { loadFromLocalStorage } from "@/utils/localStorageUtils";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function nameConversation(message: string): Promise<string> {
  const apiKey = loadFromLocalStorage("openAIAPIKey");
  if (!apiKey) {
    throw new Error("OpenAI API key not found");
  }
  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: apiKey,
    temperature: 0.5,
  });
  const messages = [
    new SystemMessage("You are a helpful assistant."),
    new HumanMessage(message),
    new HumanMessage(
      "Gives the conversation a short and concise name. Parentesis are not needed."
    ),
  ];
  const chain = model.pipe(new StringOutputParser());
  return chain.invoke(messages);
}
