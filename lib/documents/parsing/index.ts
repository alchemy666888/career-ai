import { logEvent } from "@/lib/observability/logger";
import { withObservedSpan } from "@/lib/observability/tracing";
import { parseDocxText } from "./docx";
import { parsePdfText } from "./pdf";
import type { ParsedResume, ResumeUpload } from "./types";
export type { ResumeUpload } from "./types";
import { hashBytes, parseDeterministicSections, validateResumeUpload } from "./validation";

export async function parseResume(upload: ResumeUpload): Promise<ParsedResume> {
  const started = Date.now();
  return withObservedSpan("resume.parse", async (correlation) => {
    const kind = validateResumeUpload(upload);
    try {
      const text = kind === "pdf" ? await parsePdfText(upload.bytes) : await parseDocxText(upload.bytes);
      return { kind, text, hash: hashBytes(upload.bytes), sections: parseDeterministicSections(text), durationMs: Date.now() - started };
    } catch (error) {
      logEvent({ severity: "warn", event: "resume_parse_failed", code: "RESUME_PARSE_FAILED", correlationId: correlation.correlationId });
      throw error;
    } finally {
      upload.bytes.fill(0);
    }
  });
}
