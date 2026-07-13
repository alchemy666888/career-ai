import { describe, expect, it } from "vitest";
import { deterministicFitEvaluation, fitEvaluationSchema } from "@/lib/domain/matching/service";
import { verifyEvidenceIds } from "@/lib/ai/evidence";

describe("matching evidence fit-evaluation job-detail", () => {
  it("bounds scores and lowers confidence when evidence is sparse", () => {
    expect(deterministicFitEvaluation({ evidenceCount: 0, jobText: "role" })).toMatchObject({ confidence: "low", dealBreaker: true });
    expect(deterministicFitEvaluation({ evidenceCount: 10, jobText: "role" }).score).toBeLessThanOrEqual(85);
  });

  it("validates evaluation shape and evidence references", () => {
    const evaluation = fitEvaluationSchema.parse({ score: 75, confidence: "medium", narrative: "Honest assessment", strengths: [{ text: "Supported", evidenceIds: ["e1"] }] });
    expect(evaluation.score).toBe(75);
    expect(() => verifyEvidenceIds(["e2"], [{ id: "e1", title: "Approved", content: "Evidence" }])).toThrow();
  });
});
