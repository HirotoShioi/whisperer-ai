import { getDocumentProxy, extractText } from "unpdf";

export async function parseFile(blob: Blob, fileType: string) {
  switch (fileType) {
    case "application/pdf": {
      const buff = await blob.arrayBuffer();
      const pdf = await getDocumentProxy(buff);
      const text = await extractText(pdf, { mergePages: true });
      return text.text;
    }
    case "text/markdown":
    case "text/plain":
    case "text/csv":
    case "application/json": {
      const content = await blob.text();
      return content;
    }
    default: {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }
}
