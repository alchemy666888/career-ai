export type EvaluationInput = { matchedRequirements: number; totalRequirements: number; dealBreakers: string[]; confidence?: "low" | "medium" | "high" };
export function evaluateFit(input: EvaluationInput) {
  const ratio = input.totalRequirements === 0 ? 0 : input.matchedRequirements / input.totalRequirements;
  const baseScore = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
  const blocked = input.dealBreakers.length > 0;
  return { score: blocked ? Math.min(baseScore, 49) : baseScore, dealBreaker: blocked, confidence: input.confidence ?? "medium", recommendation: blocked ? "reject" : baseScore >= 75 ? "apply" : baseScore >= 50 ? "review_gaps" : "reject", strengths: [`Matched ${input.matchedRequirements} of ${input.totalRequirements} requirements`], risks: input.dealBreakers };
}
