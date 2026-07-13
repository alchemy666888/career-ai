import type { fitEvaluations, jobPostings } from "@/lib/db/schema";

type Job = typeof jobPostings.$inferSelect;
type Evaluation = typeof fitEvaluations.$inferSelect | null;
export function JobDetailPage({ job, evaluation }: { job: Job; evaluation: Evaluation }) {
  return <main className="career-container cj-page-head"><h1>{job.title}</h1><p className="career-company">{job.company}</p><p>{job.location ?? "Location not provided"} · {job.workStyle}</p><section className="cj-card"><h2>Job description</h2><p>{job.description}</p></section>{evaluation ? <section className="cj-card" aria-labelledby="fit-title"><h2 id="fit-title">Evidence-backed fit</h2><p><strong>Score:</strong> {evaluation.score}/100</p><p><strong>Confidence:</strong> {evaluation.confidence}</p><p><strong>Assessment:</strong> {evaluation.narrative}</p><p><strong>Provider:</strong> {evaluation.provider} · {evaluation.model}</p><h3>Gaps</h3><ul>{(evaluation.gaps as string[]).map((gap) => <li key={gap}>{gap}</li>)}</ul><h3>Recommendations</h3><ul>{(evaluation.recommendations as string[]).map((item) => <li key={item}>{item}</li>)}</ul></section> : <div className="cj-empty"><h2>No fit evaluation yet</h2><p>Add approved evidence and request an evaluation.</p></div>}</main>;
}
