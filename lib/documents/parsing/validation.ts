import { createHash } from "node:crypto";
import type { ResumeFileKind, ResumeUpload } from "./types";

const maxBytes = 10 * 1024 * 1024;
const rules = {
  pdf: { extensions: [".pdf"], mimeTypes: ["application/pdf"] },
  docx: { extensions: [".docx"], mimeTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] }
} as const;

export function detectResumeKind(upload: ResumeUpload): ResumeFileKind {
  const name = upload.fileName.toLowerCase();
  for (const [kind, rule] of Object.entries(rules)) {
    if (rule.extensions.some((extension) => name.endsWith(extension)) && rule.mimeTypes.includes(upload.mimeType as never)) return kind as ResumeFileKind;
  }
  throw new Error("Unsupported résumé file type");
}

export function validateResumeUpload(upload: ResumeUpload): ResumeFileKind {
  if (upload.sizeBytes < 1 || upload.sizeBytes > maxBytes) throw new Error("Résumé files must be between 1 byte and 10 MB");
  if (upload.bytes.byteLength !== upload.sizeBytes) throw new Error("Uploaded file size did not match received bytes");
  return detectResumeKind(upload);
}

export function hashBytes(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function normalizeExtractedText(text: string): string {
  const normalized = text.replace(/\r/g, "\n").replace(/[\t ]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (normalized.length < 20) throw new Error("Could not extract enough résumé text");
  return normalized.slice(0, 200_000);
}

export function parseDeterministicSections(text: string) {
  return text.split(/\n(?=[A-Z][A-Z ]{2,}:?\n)/).map((section) => {
    const [first, ...rest] = section.split("\n");
    return { title: first.replace(/:$/, "").trim().slice(0, 80) || "Résumé", content: rest.join("\n").trim() || section.trim() };
  }).filter((section) => section.content.length > 0).slice(0, 20);
}
