import { and, eq, lt } from "drizzle-orm";
import { enqueueJob } from "@/lib/background/queue";
import type { Database } from "@/lib/db";
import { ingestionErrors, ingestionRuns, jobPostings, applications } from "@/lib/db/schema";
import { getServerEnv } from "@/lib/env";
import { logEvent } from "@/lib/observability/logger";
import { mockJobProvider } from "@/lib/jobs/providers/mock";
import { jobSpyProvider } from "@/lib/jobs/providers/jobspy";
import { importManualJobForUser } from "@/lib/jobs/service";

export async function enqueueScheduledIngestion(db: Database, trigger: "cron" | "admin" = "cron") {
  const env = getServerEnv();
  if (!env.LIVE_JOB_INGESTION_ENABLED && trigger === "cron") return { enqueued: false, reason: "live_ingestion_disabled" };
  if (!env.ADMIN_INGESTION_ENABLED && trigger === "admin") return { enqueued: false, reason: "admin_ingestion_disabled" };
  const dedupeKey = `job-ingestion:${trigger}:${new Date().toISOString().slice(0, 13)}`;
  const job = await enqueueJob(db, { kind: "job-ingestion", payload: { trigger }, dedupeKey, maxAttempts: 2 });
  logEvent({ severity: "info", event: "job_ingestion_enqueued", operation: "jobs.ingestion.enqueue", backgroundJobId: job.id });
  return { enqueued: true, jobId: job.id };
}

export async function runIngestionWorker(db: Database, input: { provider: "mock" | "jobspy"; trigger: "cron" | "admin"; requestedByUserId?: string }) {
  const env = getServerEnv();
  if (input.provider === "jobspy" && !env.LIVE_JOB_INGESTION_ENABLED) return createSkippedRun(db, input.provider, "live_ingestion_disabled", input.requestedByUserId);
  const [run] = await db.insert(ingestionRuns).values({ provider: input.provider, status: "running", startedAt: new Date(), requestedByUserId: input.requestedByUserId, metadata: { trigger: input.trigger } }).returning();
  let inserted = 0, failed = 0;
  try {
    const provider = input.provider === "mock" ? mockJobProvider : jobSpyProvider;
    const records = (await provider.search({ query: "software", limit: 10 })).slice(0, 10);
    for (const record of records) {
      try {
        await importManualJobForUser(db, { userId: input.requestedByUserId ?? "00000000-0000-0000-0000-000000000000", title: record.title, company: record.company, location: record.location, workStyle: record.workStyle, canonicalUrl: record.canonicalUrl, description: record.description });
        inserted += 1;
      } catch {
        failed += 1;
        await db.insert(ingestionErrors).values({ runId: run.id, code: "JOB_IMPORT_FAILED", message: "A provider record failed validation.", sourceRef: record.externalId });
      }
    }
    const status = failed > 0 ? "partial" : "succeeded";
    const [finished] = await db.update(ingestionRuns).set({ status, finishedAt: new Date(), foundCount: records.length, insertedCount: inserted, failedCount: failed }).where(eq(ingestionRuns.id, run.id)).returning();
    return finished;
  } catch {
    const [finished] = await db.update(ingestionRuns).set({ status: "failed", finishedAt: new Date(), failedCount: failed + 1 }).where(eq(ingestionRuns.id, run.id)).returning();
    await db.insert(ingestionErrors).values({ runId: run.id, code: "PROVIDER_FAILED", message: "Provider failed without exposing raw payloads." });
    return finished;
  }
}

async function createSkippedRun(db: Database, provider: string, reason: string, requestedByUserId?: string) {
  const [run] = await db.insert(ingestionRuns).values({ provider, status: "succeeded", startedAt: new Date(), finishedAt: new Date(), requestedByUserId, metadata: { skipped: true, reason } }).returning();
  return run;
}

export async function listIngestionRunsForAdmin(db: Database, limit = 25) {
  return db.query.ingestionRuns.findMany({ limit: Math.min(limit, 100), orderBy: (table, { desc }) => [desc(table.finishedAt), desc(table.startedAt)] });
}

export async function retryIngestionRunForAdmin(db: Database, runId: string) {
  const run = await db.query.ingestionRuns.findFirst({ where: eq(ingestionRuns.id, runId) });
  if (!run) throw new Error("Run not found");
  return enqueueJob(db, { kind: "job-ingestion", payload: { trigger: "admin", retryOf: runId, provider: run.provider }, dedupeKey: `job-ingestion-retry:${runId}`, maxAttempts: 2, runAfter: new Date() });
}

export async function deactivateProblematicJobForAdmin(db: Database, jobId: string) {
  const referenced = await db.query.applications.findFirst({ where: eq(applications.jobId, jobId) });
  const state = referenced ? "deactivated" : "archived";
  const [job] = await db.update(jobPostings).set({ state, updatedAt: new Date() }).where(eq(jobPostings.id, jobId)).returning();
  return job;
}

export async function markStaleJobsInactive(db: Database, olderThan: Date) {
  return db.update(jobPostings).set({ state: "deactivated", updatedAt: new Date() }).where(and(eq(jobPostings.state, "available"), lt(jobPostings.updatedAt, olderThan))).returning({ id: jobPostings.id });
}
