export type ProfileCompletenessInput = {
  name?: string | null;
  headline?: string | null;
  summary?: string | null;
  location?: string | null;
  targetRoles?: unknown[] | null;
  preferredLocations?: unknown[] | null;
  skills?: unknown[] | null;
  experience?: unknown[] | null;
  education?: unknown[] | null;
  evidenceCount?: number | null;
};

const checks: Array<{ key: string; weight: number; complete: (profile: ProfileCompletenessInput) => boolean; next: string }> = [
  { key: "name", weight: 10, next: "Add your name", complete: (p) => Boolean(p.name) },
  { key: "headline", weight: 10, next: "Add a professional headline", complete: (p) => Boolean(p.headline) },
  { key: "summary", weight: 15, next: "Add a professional summary", complete: (p) => Boolean(p.summary && p.summary.length >= 40) },
  { key: "location", weight: 10, next: "Add your location", complete: (p) => Boolean(p.location) },
  { key: "targetRoles", weight: 15, next: "Add target roles", complete: (p) => Boolean(p.targetRoles?.length) },
  { key: "preferredLocations", weight: 10, next: "Add preferred locations", complete: (p) => Boolean(p.preferredLocations?.length) },
  { key: "skills", weight: 10, next: "Add skills", complete: (p) => Boolean(p.skills?.length) },
  { key: "experience", weight: 10, next: "Add work experience", complete: (p) => Boolean(p.experience?.length) },
  { key: "evidence", weight: 10, next: "Add evidence-backed achievements", complete: (p) => Boolean(p.evidenceCount) }
];

export function calculateProfileCompleteness(profile: ProfileCompletenessInput) {
  const score = checks.reduce((total, check) => total + (check.complete(profile) ? check.weight : 0), 0);
  const next = checks.find((check) => !check.complete(profile))?.next ?? "Review job matches";
  return { score, nextRecommendedAction: next };
}
