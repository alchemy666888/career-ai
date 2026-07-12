ALTER TABLE "resume_sources" ADD COLUMN "source_hash" text NOT NULL DEFAULT 'legacy-unavailable';
ALTER TABLE "resume_sources" ALTER COLUMN "source_hash" DROP DEFAULT;
