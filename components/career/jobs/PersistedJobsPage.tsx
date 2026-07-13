import Link from "next/link";
import { dismissJobAction, importManualJobFormAction, restoreJobAction, saveJobAction } from "@/app/(dashboard)/jobs/actions";
import type { searchJobsForUser } from "@/lib/jobs/service";

type SearchResult = Awaited<ReturnType<typeof searchJobsForUser>>;

export function PersistedJobsPage({ results, filters }: { results: SearchResult; filters: Record<string, string | undefined> }) {
  return <main className="career-container cj-page-head" aria-labelledby="jobs-title">
    <h1 id="jobs-title">Discover roles</h1>
    <p>Search persisted PostgreSQL jobs, save roles, dismiss mismatches, and keep comparison selection local to this browser session.</p>
    <form className="cj-card" action="/jobs" aria-label="Job filters">
      <label>Keyword<input name="keyword" defaultValue={filters.keyword ?? ""} /></label>
      <label>Role<input name="role" defaultValue={filters.role ?? ""} /></label>
      <label>Location<input name="location" defaultValue={filters.location ?? ""} /></label>
      <label>Work style<select name="workStyle" defaultValue={filters.workStyle ?? ""}><option value="">Any</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option><option value="unknown">Unknown</option></select></label>
      <label>Source<select name="source" defaultValue={filters.source ?? ""}><option value="">Any</option><option value="manual">Manual</option><option value="mock">Mock</option><option value="jobspy">JobSpy</option></select></label>
      <label>Saved state<select name="saved" defaultValue={filters.saved ?? ""}><option value="">Available</option><option value="saved">Saved</option><option value="dismissed">Dismissed</option></select></label>
      <button className="career-btn" type="submit">Search jobs</button>
    </form>
    <section className="cj-card" aria-labelledby="manual-import-title"><h2 id="manual-import-title">Manual job import</h2><p>Paste job details manually. Source URLs are metadata only and are never fetched.</p><form action={importManualJobFormAction} aria-describedby="manual-import-help"><label>Title<input name="title" required /></label><label>Company<input name="company" required /></label><label>Location<input name="location" /></label><label>Work style<select name="workStyle" defaultValue="unknown"><option value="unknown">Unknown</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></label><label>Salary min<input name="salaryMin" inputMode="numeric" /></label><label>Salary max<input name="salaryMax" inputMode="numeric" /></label><label>Closing date<input name="closingDate" type="date" /></label><label>Source URL metadata<input name="canonicalUrl" type="url" /></label><label>Description<textarea name="description" required minLength={20} /></label><button className="career-btn" type="submit">Import manual job</button><p id="manual-import-help">Duplicate imports reuse the existing job and save it for you.</p></form></section>
    <p role="status" aria-live="polite">{results.items.length} persisted role{results.items.length === 1 ? "" : "s"} shown.</p>
    {results.items.length === 0 ? <div className="cj-empty"><h2>No roles match these filters</h2><p>Try broader filters or import a job manually.</p></div> : <section className="career-cards">{results.items.map(({ job, userState }) => <article className="career-job-card cj-card" key={job.id}><h2 className="career-job-title"><Link href={`/jobs/${job.id}`}>{job.title}</Link></h2><p className="career-company">{job.company}</p><p>{job.location ?? "Location not provided"} · {job.workStyle} · {job.source}</p><p>{job.description.slice(0, 240)}</p><form action={saveJobAction}><input type="hidden" name="jobId" value={job.id} /><label>Notes<input name="notes" defaultValue={userState?.notes ?? ""} /></label><button className="career-tool" type="submit">{userState?.status === "saved" ? "Update saved notes" : "Save"}</button></form><form action={dismissJobAction}><input type="hidden" name="jobId" value={job.id} /><button className="career-tool" type="submit">Dismiss</button></form>{userState?.dismissedAt ? <form action={restoreJobAction}><input type="hidden" name="jobId" value={job.id} /><button className="career-tool" type="submit">Restore</button></form> : null}</article>)}</section>}
    {results.nextCursor ? <Link className="career-btn" href={{ pathname: "/jobs", query: { ...filters, cursor: results.nextCursor } }}>Next page</Link> : null}
  </main>;
}
