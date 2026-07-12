ALTER TABLE "background_jobs" ADD COLUMN "dedupe_key" text;--> statement-breakpoint
ALTER TABLE "background_jobs" ADD COLUMN "locked_by" text;--> statement-breakpoint
ALTER TABLE "background_jobs" ADD COLUMN "locked_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "background_jobs_dedupe_unique" ON "background_jobs" USING btree ("dedupe_key");--> statement-breakpoint
CREATE INDEX "background_jobs_claim_idx" ON "background_jobs" USING btree ("status","run_after");