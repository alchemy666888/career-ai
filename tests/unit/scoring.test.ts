import { describe, expect, it } from "vitest";
import { evaluateFit } from "@/lib/evaluations/scoring";
import { approvedEvidenceOnly } from "@/lib/applications/drafting";
import { jobContentHash, normalizeJobUrl } from "@/lib/jobs/model";

describe("fit evaluation", () => {
  it("lets deal breakers veto an otherwise high score", () => {
    const result = evaluateFit({ matchedRequirements: 9, totalRequirements: 10, dealBreakers: ["Requires relocation"] });
    expect(result.dealBreaker).toBe(true);
    expect(result.score).toBeLessThan(50);
    expect(result.recommendation).toBe("reject");
  });
});

describe("application drafting", () => {
  it("uses only approved evidence", () => {
    expect(approvedEvidenceOnly([{ title: "A", content: "B", claimState: "user_approved" }, { title: "C", content: "D", claimState: "unsupported" }])).toHaveLength(1);
  });
});

describe("job dedupe helpers", () => {
  it("normalizes URLs and hashes normalized content", () => {
    expect(normalizeJobUrl("https://example.com/job?b=2&a=1#top")).toBe("https://example.com/job?a=1&b=2");
    expect(jobContentHash({ title: "Engineer", company: "Acme", description: "Build things" })).toHaveLength(64);
  });
});
