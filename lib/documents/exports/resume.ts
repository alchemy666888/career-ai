import type { ResumeArtifact } from "@/lib/domain/resume/service";
export type ExportFormat = "markdown" | "text" | "docx" | "pdf" | "clipboard";
function ensureApproved(a: ResumeArtifact) { if (a.state !== "approved") throw new Error("Only approved resumes can be exported"); if (a.changes.some(c => c.decision === "accepted" && c.supportStatus !== "supported")) throw new Error("Unsupported content cannot be exported"); }
export function renderResumeMarkdown(a: ResumeArtifact) { ensureApproved(a); return `# Tailored Resume\n\n${a.content}`; }
export function renderResumeText(a: ResumeArtifact) { ensureApproved(a); return a.content.replace(/[<>]/g, ""); }
export function exportResume(a: ResumeArtifact, format: ExportFormat) { ensureApproved(a); const text = format === "markdown" ? renderResumeMarkdown(a) : renderResumeText(a); const contentType = format === "pdf" ? "application/pdf" : format === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "text/plain; charset=utf-8"; return { contentType, filename: `resume-${a.jobId}-v${a.version}.${format === "clipboard" ? "txt" : format}`, body: Buffer.from(text) }; }
