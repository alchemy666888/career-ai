import { and, eq } from "drizzle-orm";
import { z } from "zod";
import type { Database } from "@/lib/db";
import { fitEvaluations, jobPostings, profiles } from "@/lib/db/schema";
import { getAiProvider } from "@/lib/ai/provider";
import { assembleEvidencePacket, verifyEvidenceIds } from "@/lib/ai/evidence";
import { aiSummarySchema } from "@/lib/ai/schemas/summary";

export const fitEvaluationSchema = z.object({ score: z.number().int().min(0).max(100), confidence: z.enum(["low", "medium", "high"]), dealBreaker: z.boolean().default(false), strengths: z.array(z.object({ text: z.string(), evidenceIds: z.array(z.string()) })).default([]), gaps: z.array(z.string()).default([]), coverage: z.array(z.object({ requirement: z.string(), status: z.enum(["met", "partial", "missing"]), evidenceIds: z.array(z.string()).default([]) })).default([]), recommendations: z.array(z.string()).default([]), narrative: z.string().min(1) });
export type FitEvaluation = z.infer<typeof fitEvaluationSchema>;

export function deterministicFitEvaluation(input: { evidenceCount: number; jobText: string }): FitEvaluation {
  const score = Math.max(25, Math.min(85, 45 + input.evidenceCount * 10));
  return { score, confidence: input.evidenceCount >= 3 ? "high" : input.evidenceCount >= 1 ? "medium" : "low", dealBreaker: input.evidenceCount === 0, strengths: [], gaps: input.evidenceCount === 0 ? ["Add approved evidence before relying on this match."] : [], coverage: [], recommendations: ["Review the job requirements against approved profile evidence."], narrative: `Evidence-backed fit score ${score}.` };
}

export async function evaluateJobFitForUser(db: Database, input: { userId: string; profileId: string; jobId: string; force?: boolean }) {
  const [profile, job] = await Promise.all([db.query.profiles.findFirst({ where: and(eq(profiles.id, input.profileId), eq(profiles.userId, input.userId)) }), db.query.jobPostings.findFirst({ where: eq(jobPostings.id, input.jobId) })]);
  if (!profile || !job) throw new Error("Profile or job not found");
  const latest = await db.query.fitEvaluations.findFirst({ where: and(eq(fitEvaluations.userId, input.userId), eq(fitEvaluations.profileId, input.profileId), eq(fitEvaluations.jobId, input.jobId)), orderBy: (table, { desc }) => [desc(table.createdAt)] });
  if (latest && !input.force) return latest;
  const evidence = await assembleEvidencePacket(db, input.userId, input.profileId);
  try {
    const provider = getAiProvider();
    const structured = await provider.generateStructured({ operation: "fit-evaluation", promptVersion: "fit-evaluation-v1", system: "Use only supplied evidence IDs.", user: `Evaluate fit for ${job.title} at ${job.company}.`, evidence }, aiSummarySchema);
    verifyEvidenceIds(structured.data.evidenceIds, evidence);
    const deterministic = deterministicFitEvaluation({ evidenceCount: evidence.length, jobText: job.description });
    const [saved] = await db.insert(fitEvaluations).values({ userId: input.userId, profileId: input.profileId, jobId: input.jobId, score: deterministic.score, confidence: deterministic.confidence, dealBreaker: deterministic.dealBreaker, strengths: deterministic.strengths, gaps: deterministic.gaps, coverage: deterministic.coverage, recommendations: deterministic.recommendations, narrative: deterministic.narrative, provider: structured.usage.provider, model: structured.usage.model }).returning();
    return saved;
  } catch {
    if (latest) return latest;
    throw new Error("Fit evaluation failed safely");
  }
}
