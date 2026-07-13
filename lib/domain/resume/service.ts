import { and, eq, isNull } from "drizzle-orm";
import { writeAuditEvent } from "@/lib/audit";
import type { Database } from "@/lib/db";
import { evidenceItems, profiles, profileSections, resumeSources } from "@/lib/db/schema";
import { parseResume, type ResumeUpload } from "@/lib/documents/parsing";
import { calculateProfileCompleteness } from "@/lib/domain/profile/completeness";

export type ResumeReplacementPreview = {
  parsedText: string;
  newSectionTitles: string[];
  activeSourceCount: number;
  importedEvidenceToArchive: number;
  importedSectionsToReplace: number;
  preservedUserEvidence: number;
  changeSummary: string[];
};

export async function importFirstResume(db: Database, input: { userId: string; profileId: string; upload: ResumeUpload }) {
  const parsed = await parseResume(input.upload);
  return db.transaction(async (tx) => {
    const [source] = await tx.insert(resumeSources).values({ userId: input.userId, profileId: input.profileId, fileName: input.upload.fileName, mimeType: input.upload.mimeType, sizeBytes: input.upload.sizeBytes, extractedText: parsed.text, sourceHash: parsed.hash, parserVersion: `deterministic-${parsed.kind}-1` }).returning();
    await tx.insert(evidenceItems).values({ userId: input.userId, profileId: input.profileId, resumeSourceId: source.id, sourceType: "resume_import", title: "Imported résumé", content: parsed.text, claimState: "imported", provenance: { source: "resume", resumeSourceId: source.id, hash: parsed.hash } });
    if (parsed.sections.length > 0) await tx.insert(profileSections).values(parsed.sections.map((section, index) => ({ userId: input.userId, profileId: input.profileId, kind: "resume_section", title: section.title, content: { text: section.content, evidence: "imported" }, displayOrder: index })));
    await recalculateCompleteness(tx as unknown as Database, input.userId, input.profileId);
    await writeAuditEvent(tx as unknown as Database, { userId: input.userId, action: "admin_action", entityType: "resume_source", entityId: source.id, metadata: { operation: "resume_imported", entityId: source.id } });
    return { source, parsed };
  });
}

export async function previewResumeReplacement(db: Database, input: { userId: string; profileId: string; upload: ResumeUpload }): Promise<ResumeReplacementPreview> {
  const parsed = await parseResume(input.upload);
  const [sources, importedEvidence, importedSections, userEvidence] = await Promise.all([
    db.query.resumeSources.findMany({ where: and(eq(resumeSources.userId, input.userId), eq(resumeSources.profileId, input.profileId), isNull(resumeSources.deletedAt)) }),
    db.query.evidenceItems.findMany({ where: and(eq(evidenceItems.userId, input.userId), eq(evidenceItems.profileId, input.profileId), eq(evidenceItems.sourceType, "resume_import"), eq(evidenceItems.claimState, "imported")) }),
    db.query.profileSections.findMany({ where: and(eq(profileSections.userId, input.userId), eq(profileSections.profileId, input.profileId), eq(profileSections.kind, "resume_section")) }),
    db.query.evidenceItems.findMany({ where: and(eq(evidenceItems.userId, input.userId), eq(evidenceItems.profileId, input.profileId), eq(evidenceItems.claimState, "user_approved")) })
  ]);
  return buildResumeReplacementPreview({ parsedText: parsed.text, newSectionTitles: parsed.sections.map((section) => section.title), activeSourceCount: sources.length, importedEvidenceToArchive: importedEvidence.length, importedSectionsToReplace: importedSections.length, preservedUserEvidence: userEvidence.length });
}

export function buildResumeReplacementPreview(input: Omit<ResumeReplacementPreview, "changeSummary">): ResumeReplacementPreview {
  return { ...input, changeSummary: [
    `${input.activeSourceCount} active résumé source(s) will be archived before the new import is saved.`,
    `${input.importedEvidenceToArchive} imported evidence item(s) and ${input.importedSectionsToReplace} imported section(s) will be replaced.`,
    `${input.preservedUserEvidence} user-authored evidence item(s) will be preserved.`,
    `New import contains ${input.newSectionTitles.length} detected section(s).`
  ] };
}

export async function replaceResumeImport(db: Database, input: { userId: string; profileId: string; upload: ResumeUpload; confirmed: boolean }) {
  if (!input.confirmed) throw new Error("Resume replacement requires confirmation");
  const parsed = await parseResume(input.upload);
  return db.transaction(async (tx) => {
    const now = new Date();
    await tx.update(resumeSources).set({ deletedAt: now, updatedAt: now }).where(and(eq(resumeSources.userId, input.userId), eq(resumeSources.profileId, input.profileId), isNull(resumeSources.deletedAt)));
    await tx.update(evidenceItems).set({ claimState: "archived", updatedAt: now }).where(and(eq(evidenceItems.userId, input.userId), eq(evidenceItems.profileId, input.profileId), eq(evidenceItems.sourceType, "resume_import")));
    await tx.delete(profileSections).where(and(eq(profileSections.userId, input.userId), eq(profileSections.profileId, input.profileId), eq(profileSections.kind, "resume_section")));
    const [source] = await tx.insert(resumeSources).values({ userId: input.userId, profileId: input.profileId, fileName: input.upload.fileName, mimeType: input.upload.mimeType, sizeBytes: input.upload.sizeBytes, extractedText: parsed.text, sourceHash: parsed.hash, parserVersion: `deterministic-${parsed.kind}-1` }).returning();
    await tx.insert(evidenceItems).values({ userId: input.userId, profileId: input.profileId, resumeSourceId: source.id, sourceType: "resume_import", title: "Imported résumé", content: parsed.text, claimState: "imported", provenance: { source: "resume", resumeSourceId: source.id, hash: parsed.hash } });
    if (parsed.sections.length > 0) await tx.insert(profileSections).values(parsed.sections.map((section, index) => ({ userId: input.userId, profileId: input.profileId, kind: "resume_section", title: section.title, content: { text: section.content, evidence: "imported" }, displayOrder: index })));
    await recalculateCompleteness(tx as unknown as Database, input.userId, input.profileId);
    await writeAuditEvent(tx as unknown as Database, { userId: input.userId, action: "admin_action", entityType: "resume_source", entityId: source.id, metadata: { operation: "resume_replaced", entityId: source.id } });
    return { source, parsed };
  });
}

export async function correctImportedClaim(db: Database, input: { userId: string; profileId: string; evidenceId: string; title: string; content: string }) {
  return db.transaction(async (tx) => {
    const [updated] = await tx.update(evidenceItems).set({ title: input.title, content: input.content, claimState: "user_approved", resumeSourceId: null, provenance: { source: "user_correction" }, updatedAt: new Date() }).where(and(eq(evidenceItems.id, input.evidenceId), eq(evidenceItems.userId, input.userId), eq(evidenceItems.profileId, input.profileId))).returning();
    if (!updated) throw new Error("Evidence not found");
    await recalculateCompleteness(tx as unknown as Database, input.userId, input.profileId);
    await writeAuditEvent(tx as unknown as Database, { userId: input.userId, action: "admin_action", entityType: "evidence_item", entityId: updated.id, metadata: { operation: "resume_claim_corrected", entityId: updated.id } });
    return updated;
  });
}

export async function deleteResumeSourceForUser(db: Database, input: { userId: string; profileId: string; resumeSourceId: string; confirmed: boolean }) {
  if (!input.confirmed) throw new Error("Resume deletion requires confirmation");
  return db.transaction(async (tx) => {
    const now = new Date();
    const [source] = await tx.update(resumeSources).set({ deletedAt: now, extractedText: "", updatedAt: now }).where(and(eq(resumeSources.id, input.resumeSourceId), eq(resumeSources.userId, input.userId), eq(resumeSources.profileId, input.profileId))).returning();
    if (!source) throw new Error("Resume source not found");
    await tx.update(evidenceItems).set({ claimState: "archived", content: "", updatedAt: now }).where(and(eq(evidenceItems.userId, input.userId), eq(evidenceItems.profileId, input.profileId), eq(evidenceItems.resumeSourceId, input.resumeSourceId)));
    await tx.delete(profileSections).where(and(eq(profileSections.userId, input.userId), eq(profileSections.profileId, input.profileId), eq(profileSections.kind, "resume_section")));
    await recalculateCompleteness(tx as unknown as Database, input.userId, input.profileId);
    await writeAuditEvent(tx as unknown as Database, { userId: input.userId, action: "admin_action", entityType: "resume_source", entityId: source.id, metadata: { operation: "resume_deleted", entityId: source.id } });
    return source;
  });
}

async function recalculateCompleteness(db: Database, userId: string, profileId: string) {
  const [profile, evidence] = await Promise.all([
    db.query.profiles.findFirst({ where: and(eq(profiles.id, profileId), eq(profiles.userId, userId)) }),
    db.query.evidenceItems.findMany({ where: and(eq(evidenceItems.profileId, profileId), eq(evidenceItems.userId, userId), eq(evidenceItems.claimState, "user_approved")) })
  ]);
  if (!profile) return;
  const completeness = calculateProfileCompleteness({ ...profile, evidenceCount: evidence.length, targetRoles: profile.targetRoles as unknown[], preferredLocations: profile.preferredLocations as unknown[] });
  await db.update(profiles).set({ completenessScore: completeness.score, updatedAt: new Date() }).where(and(eq(profiles.id, profileId), eq(profiles.userId, userId)));
}
