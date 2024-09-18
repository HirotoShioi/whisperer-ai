import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { MAXIMUM_TEXT_LENGTH_FOR_MARKDOWN_CONVERSION } from "@/constants";
import { getModel } from "./model";

const schema = z.object({
  content: z.string().describe("The text to convert to markdown"),
  title: z.string().describe("The title of the markdown file"),
});

export type ConvertTextToMarkdownOutput = z.infer<typeof schema>;

/**
 * Converts text to markdown.
 * If the text is too long, it returns the text as the content and "Document.md" as the title.
 * @param text The text to convert to markdown.
 * @returns The markdown content.
 */
export async function convertTextToMarkdown(
  text: string
): Promise<ConvertTextToMarkdownOutput> {
  if (text.length > MAXIMUM_TEXT_LENGTH_FOR_MARKDOWN_CONVERSION) {
    return {
      content: text,
      title: "Document.md",
    };
  }
  const model = await getModel({
    model: "gpt-4o-mini",
    temperature: 0,
  });

  const withStructuredOutput = model.withStructuredOutput(schema);

  const template = PromptTemplate.fromTemplate(
    `Please convert the following text into readable Markdown format, using appropriate headings, lists, emphasis, and other formatting. If a table is more suitable than a list, please use a table.
    Output the converted text only and nothing else.

    *** START OF TEXT ***
    {text}
    *** END OF TEXT ***`
  );
  const chain = template.pipe(withStructuredOutput);
  return chain.invoke({ text });
}
