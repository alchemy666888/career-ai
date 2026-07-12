import { and, eq, lte, sql } from "drizzle-orm";
import type { Database } from "@/lib/db";
import { backgroundJobs } from "@/lib/db/schema";
import { logEvent } from "@/lib/observability/logger";
import { withObservedSpan } from "@/lib/observability/tracing";

export async function enqueueJob(db: Database, input: { kind: string; payload?: Record<string, unknown>; dedupeKey?: string; runAfter?: Date; maxAttempts?: number }) {
  const values = { kind: input.kind, payload: input.payload ?? {}, dedupeKey: input.dedupeKey, runAfter: input.runAfter ?? new Date(), maxAttempts: input.maxAttempts ?? 3 };
  if (input.dedupeKey) {
    const [job] = await db.insert(backgroundJobs).values(values).onConflictDoUpdate({ target: [backgroundJobs.dedupeKey], set: { payload: values.payload, runAfter: values.runAfter, updatedAt: new Date() } }).returning();
    return job;
  }
  const [job] = await db.insert(backgroundJobs).values(values).returning();
  return job;
}

export async function claimNextJob(db: Database, workerId: string) {
  return withObservedSpan("background.claim", async () => {
    const [job] = await db.execute(sql`update background_jobs set status = 'running', locked_by = ${workerId}, locked_at = now(), attempts = attempts + 1, updated_at = now() where id = (select id from background_jobs where status = 'queued' and run_after <= now() order by run_after asc for update skip locked limit 1) returning *`);
    return job ?? null;
  });
}

export async function releaseStaleLocks(db: Database, olderThan: Date) {
  return db.update(backgroundJobs).set({ status: "queued", lockedBy: null, lockedAt: null, updatedAt: new Date() }).where(and(eq(backgroundJobs.status, "running"), lte(backgroundJobs.lockedAt, olderThan))).returning();
}

export async function finalizeJob(db: Database, input: { jobId: string; status: "succeeded" | "failed"; errorCode?: string; retryAfter?: Date }) {
  const failedWithRetry = input.status === "failed" && input.retryAfter;
  const [job] = await db.update(backgroundJobs).set({ status: failedWithRetry ? "queued" : input.status, runAfter: input.retryAfter, lockedBy: null, lockedAt: null, lastErrorCode: input.errorCode, updatedAt: new Date() }).where(eq(backgroundJobs.id, input.jobId)).returning();
  logEvent({ severity: input.status === "failed" ? "warn" : "info", event: "background_job_finalized", backgroundJobId: input.jobId, code: input.errorCode });
  return job;
}
