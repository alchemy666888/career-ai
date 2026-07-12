import { eq } from "drizzle-orm";
import type { Database } from "@/lib/db";
import { evidenceItems, profiles, profileSections } from "@/lib/db/schema";
import { writeAuditEvent } from "@/lib/audit";
import { logEvent } from "@/lib/observability/logger";
import { withObservedSpan } from "@/lib/observability/tracing";
import { calculateProfileCompleteness } from "./completeness";
import type { ProfileFormInput } from "./schema";

export async function getOrCreateProfileForUser(db: Database, userId: string) {
  return withObservedSpan("profile.read", async () => {
    const existing = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });
    if (existing) return existing;
    const [created] = await db.insert(profiles).values({ userId, completenessScore: 0 }).returning();
    await writeAuditEvent(db, { userId, action: "admin_action", entityType: "profile", entityId: created.id, metadata: { operation: "profile_created", entityId: created.id } });
    return created;
  });
}

export async function getProfileView(db: Database, userId: string) {
  const profile = await getOrCreateProfileForUser(db, userId);
  const sections = await db.query.profileSections.findMany({ where: eq(profileSections.profileId, profile.id) });
  const evidence = await db.query.evidenceItems.findMany({ where: eq(evidenceItems.profileId, profile.id) });
  const skills = sections.find((section) => section.kind === "skills")?.content as string[] | undefined;
  const experience = sections.find((section) => section.kind === "experience")?.content as string[] | undefined;
  const education = sections.find((section) => section.kind === "education")?.content as string[] | undefined;
  const completeness = calculateProfileCompleteness({ ...profile, skills, experience, education, evidenceCount: evidence.length, targetRoles: profile.targetRoles as unknown[], preferredLocations: profile.preferredLocations as unknown[] });
  return { profile: { ...profile, skills: skills ?? [], experience: experience ?? [], education: education ?? [], nextRecommendedAction: completeness.nextRecommendedAction }, evidence, completeness };
}

export async function updateProfileForUser(db: Database, userId: string, input: ProfileFormInput) {
  return withObservedSpan("profile.update", async (correlation) => {
    const current = input.profileId ? await db.query.profiles.findFirst({ where: eq(profiles.id, input.profileId) }) : await getOrCreateProfileForUser(db, userId);
    if (!current || current.userId !== userId) throw new Error("Profile not found");
    const completeness = calculateProfileCompleteness({ ...input, evidenceCount: 0 });
    const [updated] = await db.update(profiles).set({ name: input.name, headline: input.headline, summary: input.summary, location: input.location, targetRoles: input.targetRoles, preferredLocations: input.preferredLocations, workStyle: input.workStyle, completenessScore: completeness.score, updatedAt: new Date() }).where(eq(profiles.id, current.id)).returning();
    await upsertSection(db, userId, updated.id, "skills", input.skills);
    await upsertSection(db, userId, updated.id, "experience", input.experience);
    await upsertSection(db, userId, updated.id, "education", input.education);
    await writeAuditEvent(db, { userId, action: "admin_action", entityType: "profile", entityId: updated.id, correlationId: correlation.correlationId, metadata: { operation: "profile_updated", entityId: updated.id } });
    logEvent({ severity: "info", event: "profile_updated", operation: "profile.update", entityId: updated.id, correlationId: correlation.correlationId });
    return updated;
  });
}

async function upsertSection(db: Database, userId: string, profileId: string, kind: string, content: string[]) {
  const existing = await db.query.profileSections.findFirst({ where: eq(profileSections.profileId, profileId) });
  if (existing && existing.kind === kind) return db.update(profileSections).set({ content, updatedAt: new Date() }).where(eq(profileSections.id, existing.id));
  return db.insert(profileSections).values({ userId, profileId, kind, content });
}
