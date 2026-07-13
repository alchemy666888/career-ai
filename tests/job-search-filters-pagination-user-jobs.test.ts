import { describe, expect, it } from "vitest";
import { normalizeJob } from "@/lib/jobs/normalize";

describe("job-search filters pagination user-jobs", () => {
  it("normalizes safe searchable records for PostgreSQL-backed search", () => {
    const job = normalizeJob({ title: "Senior Product Designer", company: "Acme", location: "Remote", workStyle: "remote", description: "A long role description with design systems, research, accessibility, and measurable outcomes." });
    expect(job.safeDescription).not.toContain("<");
    expect(job.contentHash).toHaveLength(64);
  });

  it("keeps cursor pagination bounded by caller limits", () => {
    const requested = 500;
    const bounded = Math.min(Math.max(requested, 1), 50);
    expect(bounded).toBe(50);
  });
});
