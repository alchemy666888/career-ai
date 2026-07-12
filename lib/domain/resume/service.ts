import { writeAuditEvent } from "@/lib/audit";
import type { Database } from "@/lib/db";
import { evidenceItems, profileSections, resumeSources } from "@/lib/db/schema";
import { parseResume, type ResumeUpload } from "@/lib/documents/parsing";

export async function importFirstResume(db: Database, input: { userId: string; profileId: string; upload: ResumeUpload }) {
  const parsed = await parseResume(input.upload);
  return db.transaction(async (tx) => {
    const [source] = await tx.insert(resumeSources).values({ userId: input.userId, profileId: input.profileId, fileName: input.upload.fileName, mimeType: input.upload.mimeType, sizeBytes: input.upload.sizeBytes, extractedText: parsed.text, sourceHash: parsed.hash, parserVersion: `deterministic-${parsed.kind}-1` }).returning();
    await tx.insert(evidenceItems).values({ userId: input.userId, profileId: input.profileId, resumeSourceId: source.id, sourceType: "resume_import", title: "Imported résumé", content: parsed.text, claimState: "imported", provenance: { source: "resume", resumeSourceId: source.id, hash: parsed.hash } });
    if (parsed.sections.length > 0) await tx.insert(profileSections).values(parsed.sections.map((section, index) => ({ userId: input.userId, profileId: input.profileId, kind: "resume_section", title: section.title, content: { text: section.content, evidence: "imported" }, displayOrder: index })));
    await writeAuditEvent(tx as unknown as Database, { userId: input.userId, action: "admin_action", entityType: "resume_source", entityId: source.id, metadata: { operation: "resume_imported", entityId: source.id } });
    return { source, parsed };
  });
}
