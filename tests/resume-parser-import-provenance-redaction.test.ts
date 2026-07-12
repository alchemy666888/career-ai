import { describe, expect, it } from "vitest";
import { parseResume } from "@/lib/documents/parsing";
import { sanitizeAuditMetadata } from "@/lib/audit";

const pdfText = "%PDF-1.4\nSUMMARY\nSynthetic candidate with product operations experience and measurable delivery evidence.";
const docxText = "word/document.xml <w:document>SUMMARY Synthetic candidate with support operations experience and evidence.</w:document>";
const upload = (fileName: string, mimeType: string, text: string) => {
  const bytes = new TextEncoder().encode(text);
  return { fileName, mimeType, sizeBytes: bytes.byteLength, bytes };
};

describe("resume parser import provenance and redaction", () => {
  it("imports valid PDF and clears source bytes", async () => {
    const input = upload("resume.pdf", "application/pdf", pdfText);
    const parsed = await parseResume(input);
    expect(parsed.kind).toBe("pdf");
    expect(parsed.text).toContain("Synthetic candidate");
    expect(parsed.hash).toHaveLength(64);
    expect(input.bytes.every((byte) => byte === 0)).toBe(true);
  });

  it("imports valid DOCX-like fixtures and rejects unsupported files", async () => {
    await expect(parseResume(upload("resume.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", docxText))).resolves.toMatchObject({ kind: "docx" });
    await expect(parseResume(upload("resume.txt", "text/plain", "plain text resume content that should not import"))).rejects.toThrow("Unsupported résumé file type");
  });

  it("does not allow extracted text through audit metadata", () => {
    expect(sanitizeAuditMetadata("admin_action", { operation: "resume_imported", resumeText: "Synthetic private content", entityId: "resume-source-1" })).toEqual({ operation: "resume_imported", entityId: "resume-source-1" });
  });
});
