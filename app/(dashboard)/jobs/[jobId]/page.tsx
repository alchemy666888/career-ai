import { requireActiveUser } from "@/lib/auth/authorization";
import { getDb } from "@/lib/db";
import { getOrCreateProfileForUser } from "@/lib/domain/profile/service";
import { evaluateJobFitForUser } from "@/lib/domain/matching/service";
import { jobPostings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { JobDetailPage } from "@/components/career/jobs/JobDetailPage";

export default async function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const user = await requireActiveUser();
  const db = getDb();
  const profile = await getOrCreateProfileForUser(db, user.id);
  const job = await db.query.jobPostings.findFirst({ where: eq(jobPostings.id, jobId) });
  if (!job) return <main className="career-container cj-page-head"><h1>Job not found</h1></main>;
  const evaluation = await evaluateJobFitForUser(db, { userId: user.id, profileId: profile.id, jobId });
  return <JobDetailPage job={job} evaluation={evaluation} />;
}
