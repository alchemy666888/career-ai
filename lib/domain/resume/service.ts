import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import type { AiEvidence } from "@/lib/ai/contracts";
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
export type ResumeArtifactState = "working" | "approved" | "archived";
export type ResumeChangeDecision = "pending" | "accepted" | "rejected";
export type ResumeChange = { id: string; section: string; originalText: string; suggestedText: string; reason: string; jobRequirement: string; evidenceRefs: string[]; supportStatus: "supported" | "unsupported"; decision: ResumeChangeDecision };
export type ResumeArtifact = { id: string; ownerId: string; jobId: string; version: number; state: ResumeArtifactState; content: string; changes: ResumeChange[]; provider: string; model: string; promptVersion: string; templateVersion: string; createdAt: string; approvedAt?: string };
export type ResumeStore = { artifacts: ResumeArtifact[] };
export const resumeDocumentSchema = z.object({ summary: z.string(), bullets: z.array(z.string()), skills: z.array(z.string()) });

export function nextResumeVersion(store: ResumeStore, ownerId: string, jobId: string) { return Math.max(0, ...store.artifacts.filter(a => a.ownerId === ownerId && a.jobId === jobId).map(a => a.version)) + 1; }
export function generateJobSpecificResume(store: ResumeStore, input: { ownerId: string; jobId: string; jobTitle: string; company: string; sourceResume: string; evidence: AiEvidence[]; fitNarrative?: string; provider?: string; model?: string; promptVersion?: string; templateVersion?: string }) {
  const supportedEvidence = input.evidence.filter(e => e.content.trim().length > 0);
  const version = nextResumeVersion(store, input.ownerId, input.jobId);
  const changes: ResumeChange[] = supportedEvidence.slice(0, 4).map((e, index) => ({ id: `chg-${version}-${index + 1}`, section: index === 0 ? "summary" : "experience", originalText: input.sourceResume.slice(0, 120), suggestedText: `${e.title}: ${e.content}`, reason: `Aligns ${input.jobTitle} resume with approved evidence.`, jobRequirement: input.fitNarrative ?? `Relevant to ${input.company} requirements`, evidenceRefs: [e.id], supportStatus: "supported", decision: "pending" }));
  const artifact: ResumeArtifact = { id: `resume-${input.jobId}-${version}`, ownerId: input.ownerId, jobId: input.jobId, version, state: "working", content: [input.sourceResume, `Target role: ${input.jobTitle} at ${input.company}`, ...changes.map(c => c.suggestedText)].join("\n"), changes, provider: input.provider ?? "fake", model: input.model ?? "deterministic-fake-v1", promptVersion: input.promptVersion ?? "resume-tailor-v1", templateVersion: input.templateVersion ?? "ats-resume-v1", createdAt: new Date(0).toISOString() };
  store.artifacts.push(artifact); return artifact;
}
export function deriveManualResumeEdit(store: ResumeStore, artifactId: string, ownerId: string, content: string) { const base = assertOwned(store, artifactId, ownerId); const artifact = { ...base, id: `${base.id}-manual-${Date.now()}`, version: nextResumeVersion(store, ownerId, base.jobId), state: "working" as const, content, changes: [], createdAt: new Date(0).toISOString(), approvedAt: undefined }; store.artifacts.push(artifact); return artifact; }
export function decideResumeChange(store: ResumeStore, input: { ownerId: string; artifactId: string; changeId: string; decision: ResumeChangeDecision }) { const artifact = assertOwned(store, input.artifactId, input.ownerId); const change = artifact.changes.find(c => c.id === input.changeId); if (!change) throw new Error("Change not found"); if (input.decision === "accepted" && change.supportStatus !== "supported") throw new Error("Unsupported changes require additional evidence before acceptance"); change.decision = input.decision; return change; }
export function approveResumeArtifact(store: ResumeStore, artifactId: string, ownerId: string) { const artifact = assertOwned(store, artifactId, ownerId); const accepted = artifact.changes.filter(c => c.decision === "accepted"); if (artifact.changes.some(c => c.decision === "accepted" && c.supportStatus !== "supported")) throw new Error("Unsupported accepted change"); const approved: ResumeArtifact = { ...artifact, id: `${artifact.id}-approved`, version: nextResumeVersion(store, ownerId, artifact.jobId), state: "approved", content: accepted.length ? accepted.map(c => c.suggestedText).join("\n") : artifact.content, approvedAt: new Date(0).toISOString() }; store.artifacts.push(approved); return approved; }
export function assertOwned(store: ResumeStore, artifactId: string, ownerId: string) { const artifact = store.artifacts.find(a => a.id === artifactId && a.ownerId === ownerId); if (!artifact) throw new Error("Artifact not found"); return artifact; }
