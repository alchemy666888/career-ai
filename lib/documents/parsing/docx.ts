import { normalizeExtractedText } from "./validation";

export async function parseDocxText(bytes: Uint8Array): Promise<string> {
  const raw = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (!raw.includes("word/document.xml") && !raw.includes("<w:document")) throw new Error("Malformed DOCX résumé");
  return normalizeExtractedText(raw.replace(/<w:tab\/>/g, " ").replace(/<[^>]+>/g, " ").replace(/word\/document\.xml/g, " "));
}
