import { requireActiveUser } from "@/lib/auth/authorization";
import { getDb } from "@/lib/db";
import { searchJobsForUser, type JobSearchFilters } from "@/lib/jobs/service";
import { JobsUnavailablePage } from "@/components/career/jobs/JobsUnavailablePage";
import { PersistedJobsPage } from "@/components/career/jobs/PersistedJobsPage";

export default async function JobsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (!process.env.DATABASE_URL) return <JobsUnavailablePage />;
  const params = await searchParams;
  const user = await requireActiveUser();
  const filters: JobSearchFilters = { keyword: params.keyword || undefined, role: params.role || undefined, location: params.location || undefined, workStyle: params.workStyle as JobSearchFilters["workStyle"], source: params.source as JobSearchFilters["source"], saved: params.saved as JobSearchFilters["saved"], cursor: params.cursor || undefined };
  const results = await searchJobsForUser(getDb(), user.id, filters);
  return <PersistedJobsPage results={results} filters={params} />;
}
