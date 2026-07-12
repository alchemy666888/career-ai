import { eq, sql } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { applicationArtifacts, applications, applicationStatusEvents, artifactChanges, quotaBuckets, resumeSources, users, type applicationStatus } from "@/lib/db/schema";

type AppStatus = (typeof applicationStatus.enumValues)[number];

export async function createApplicationWithFirstEvent(db: Database, input: { userId: string; profileId: string; jobId: string; status?: AppStatus }) {
  return db.transaction(async (tx) => {
    const [application] = await tx.insert(applications).values({ userId: input.userId, profileId: input.profileId, jobId: input.jobId, status: input.status ?? "applying" }).returning();
    await tx.insert(applicationStatusEvents).values({ userId: input.userId, applicationId: application.id, toStatus: application.status, reason: "created" });
    return application;
  });
}

export async function changeApplicationStatus(db: Database, input: { userId: string; applicationId: string; from: AppStatus; to: AppStatus; reason?: string }) {
  return db.transaction(async (tx) => {
    const [application] = await tx.update(applications).set({ status: input.to, updatedAt: new Date() }).where(eq(applications.id, input.applicationId)).returning();
    await tx.insert(applicationStatusEvents).values({ userId: input.userId, applicationId: input.applicationId, fromStatus: input.from, toStatus: input.to, reason: input.reason });
    return application;
  });
}

export async function approveArtifact(db: Database, input: { userId: string; artifactId: string }) {
  return db.transaction(async (tx) => {
    await tx.update(artifactChanges).set({ decision: "accepted" }).where(eq(artifactChanges.artifactId, input.artifactId));
    const [artifact] = await tx.update(applicationArtifacts).set({ state: "approved", approvedAt: new Date() }).where(eq(applicationArtifacts.id, input.artifactId)).returning();
    return artifact;
  });
}

export async function replaceCoverLetter(db: Database, input: { userId: string; applicationId: string; content: string; sourceRefs?: unknown[] }) {
  return db.transaction(async (tx) => {
    await tx.update(applicationArtifacts).set({ state: "archived" }).where(eq(applicationArtifacts.applicationId, input.applicationId));
    const [artifact] = await tx.insert(applicationArtifacts).values({ userId: input.userId, applicationId: input.applicationId, type: "cover_letter", version: 1, content: input.content, sourceRefs: input.sourceRefs ?? [] }).returning();
    return artifact;
  });
}

export async function replaceResumeSource(db: Database, input: { userId: string; profileId: string; fileName: string; mimeType: string; sizeBytes: number; extractedText: string; parserVersion: string; sourceHash?: string }) {
  return db.transaction(async (tx) => {
    await tx.update(resumeSources).set({ deletedAt: new Date() }).where(eq(resumeSources.profileId, input.profileId));
    const [source] = await tx.insert(resumeSources).values({ ...input, sourceHash: input.sourceHash ?? "legacy-unavailable" }).returning();
    return source;
  });
}

export async function deleteResumeSource(db: Database, input: { resumeSourceId: string }) {
  return db.transaction((tx) => tx.update(resumeSources).set({ deletedAt: new Date() }).where(eq(resumeSources.id, input.resumeSourceId)).returning());
}

export async function consumeQuota(db: Database, input: { key: string; limit: number; userId?: string }) {
  return db.transaction(async (tx) => {
    const [bucket] = await tx.insert(quotaBuckets).values({ userId: input.userId, key: input.key, windowStart: new Date(), used: 1, limit: input.limit }).onConflictDoUpdate({ target: [quotaBuckets.userId, quotaBuckets.key, quotaBuckets.windowStart], set: { used: sql`${quotaBuckets.used} + 1` } }).returning();
    if (bucket.used > bucket.limit) throw new Error("Quota exceeded");
    return bucket;
  });
}

export async function deleteAccount(db: Database, input: { userId: string }) {
  return db.transaction((tx) => tx.update(users).set({ status: "deleted", deletedAt: new Date() }).where(eq(users.id, input.userId)).returning());
}
