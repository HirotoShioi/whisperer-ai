import { ChatOpenAI } from "@langchain/openai";
import { loadFromLocalStorage } from "@/utils/local-storage";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

const schema = z.object({
  content: z.string().describe("The text to convert to markdown"),
  title: z.string().describe("The title of the markdown file"),
});

export type MarkdownOutput = z.infer<typeof schema>;
export async function convertTextToMarkdown(
  text: string
): Promise<MarkdownOutput> {
  const apiKey = loadFromLocalStorage("openAIAPIKey");
  if (!apiKey) {
    throw new Error("OpenAI API key not found");
  }
  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: apiKey,
    temperature: 0,
  }).withStructuredOutput(schema);

  const template = PromptTemplate.fromTemplate(
    `Please convert the following text into readable Markdown format, using appropriate headings, lists, emphasis, and other formatting. If a table is more appropriate than a list, please use a table.
    Output the converted text only and nothing else.

    *** START OF TEXT ***
    {text}
    *** END OF TEXT ***`
  );
  const chain = template.pipe(model);
  return chain.invoke({ text });
}
