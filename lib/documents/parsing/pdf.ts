import { normalizeExtractedText } from "./validation";

export async function parsePdfText(bytes: Uint8Array): Promise<string> {
  const raw = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (!raw.startsWith("%PDF")) throw new Error("Malformed PDF résumé");
  return normalizeExtractedText(raw.replace(/^%PDF[^\n]*\n?/, "").replace(/[()<>]/g, " "));
}
