import { getDocumentProxy, extractText } from "unpdf";
import { convertTextToMarkdown } from "./ai/convert-text-to-markdown";

export type ParsedFileOutput = {
  content: string;
  fileType: string;
};
export async function parseFile(
  blob: Blob,
  fileType: string
): Promise<ParsedFileOutput> {
  switch (fileType) {
    case "application/pdf": {
      const buff = await blob.arrayBuffer();
      const pdf = await getDocumentProxy(buff);
      const text = await extractText(pdf, { mergePages: true });
      const asMarkdown = await convertTextToMarkdown(text.text);
      return {
        content: asMarkdown.content,
        fileType: "text/markdown",
      };
    }
    case "text/markdown":
    case "text/plain":
    case "text/csv":
    case "application/json": {
      const content = await blob.text();
      return {
        content,
        fileType,
      };
    }
    default: {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }
}
