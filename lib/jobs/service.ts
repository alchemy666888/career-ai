import { and, eq, ilike, lt, or } from "drizzle-orm";
import { writeAuditEvent } from "@/lib/audit";
import type { Database } from "@/lib/db";
import { jobPostings, userJobStates } from "@/lib/db/schema";
import { normalizeJob, type NormalizedJobInput } from "./normalize";

export async function importManualJobForUser(db: Database, input: NormalizedJobInput & { userId: string }) {
  const normalized = normalizeJob(input);
  return db.transaction(async (tx) => {
    const duplicate = await tx.query.jobPostings.findFirst({ where: or(eq(jobPostings.contentHash, normalized.contentHash), normalized.canonicalUrl ? eq(jobPostings.canonicalUrl, normalized.canonicalUrl) : eq(jobPostings.contentHash, normalized.contentHash)) });
    const job = duplicate ?? (await tx.insert(jobPostings).values({ source: "manual", provider: "manual", externalId: normalized.fingerprint, canonicalUrl: normalized.canonicalUrl, title: normalized.title, company: normalized.company, location: normalized.location, workStyle: normalized.workStyle, salaryMin: normalized.salaryMin, salaryMax: normalized.salaryMax, currency: normalized.currency, closingDate: normalized.closingDate?.toISOString().slice(0, 10), description: normalized.safeDescription, contentHash: normalized.contentHash }).returning())[0];
    await tx.insert(userJobStates).values({ userId: input.userId, jobId: job.id, status: "saved", savedAt: new Date(), notes: duplicate ? "Duplicate warning: existing normalized job reused." : undefined }).onConflictDoNothing();
    await writeAuditEvent(tx as unknown as Database, { userId: input.userId, action: "admin_action", entityType: "job_posting", entityId: job.id, metadata: { operation: duplicate ? "manual_job_duplicate" : "manual_job_imported", entityId: job.id } });
    return { job, duplicate: Boolean(duplicate) };
  });
}

export type JobSearchFilters = { keyword?: string; role?: string; location?: string; workStyle?: "remote" | "hybrid" | "onsite" | "unknown"; source?: "manual" | "mock" | "jobspy"; saved?: "saved" | "dismissed"; cursor?: string; limit?: number };

export async function searchJobsForUser(db: Database, userId: string, filters: JobSearchFilters = {}) {
  const limit = Math.min(Math.max(filters.limit ?? 20, 1), 50);
  const conditions = [eq(jobPostings.state, "available")];
  if (filters.keyword) conditions.push(or(ilike(jobPostings.title, `%${filters.keyword}%`), ilike(jobPostings.company, `%${filters.keyword}%`), ilike(jobPostings.description, `%${filters.keyword}%`))!);
  if (filters.role) conditions.push(eq(jobPostings.title, filters.role));
  if (filters.location) conditions.push(eq(jobPostings.location, filters.location));
  if (filters.workStyle) conditions.push(eq(jobPostings.workStyle, filters.workStyle));
  if (filters.source) conditions.push(eq(jobPostings.source, filters.source));
  if (filters.cursor) conditions.push(lt(jobPostings.id, filters.cursor));
  const jobs = await db.query.jobPostings.findMany({ where: conditions.length === 1 ? conditions[0] : and(...conditions), limit: limit + 1, orderBy: (table, { desc }) => [desc(table.updatedAt), desc(table.id)] });
  const states = await db.query.userJobStates.findMany({ where: eq(userJobStates.userId, userId) });
  const stateByJob = new Map(states.map((state) => [state.jobId, state]));
  const filtered = jobs.filter((job) => filters.saved === "saved" ? stateByJob.get(job.id)?.status === "saved" : filters.saved === "dismissed" ? Boolean(stateByJob.get(job.id)?.dismissedAt) : !stateByJob.get(job.id)?.dismissedAt);
  return { items: filtered.slice(0, limit).map((job) => ({ job, userState: stateByJob.get(job.id) })), nextCursor: filtered.length > limit ? filtered[limit]?.id : undefined };
}

export async function setUserJobState(db: Database, input: { userId: string; jobId: string; action: "save" | "dismiss" | "restore"; notes?: string }) {
  return db.transaction(async (tx) => {
    const job = await tx.query.jobPostings.findFirst({ where: eq(jobPostings.id, input.jobId) });
    if (!job) throw new Error("Job not found");
    const values = input.action === "dismiss" ? { status: "archived" as const, dismissedAt: new Date(), notes: input.notes } : { status: "saved" as const, savedAt: new Date(), dismissedAt: null, notes: input.notes };
    const [state] = await tx.insert(userJobStates).values({ userId: input.userId, jobId: input.jobId, ...values }).onConflictDoUpdate({ target: [userJobStates.userId, userJobStates.jobId], set: { ...values, updatedAt: new Date() } }).returning();
    await writeAuditEvent(tx as unknown as Database, { userId: input.userId, action: "admin_action", entityType: "user_job_state", entityId: state.id, metadata: { operation: `job_${input.action}`, entityId: state.id } });
    return state;
  });
}
