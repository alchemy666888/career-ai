import { eq, gte, sql } from "drizzle-orm";
import type { Database } from "@/lib/db";
import { aiUsageEvents } from "@/lib/db/schema";
import { getServerEnv } from "@/lib/env";
import { consumeFeatureQuota } from "@/lib/rate-limit/quota";
import { AiProviderError, type AiProvider, type AiTextRequest } from "./contracts";

export const aiQuotaDefaults = { userDailyRequests: 25, anonymousDailyRequests: 0, resumePerJobDaily: 5, coverLetterPerJobDaily: 5, interviewQuestionsPerSession: 20, interviewEvaluationsPerSession: 20, monthlyGlobalUsage: 1000 } as const;

export async function runAiTextWithUsage(db: Database, provider: AiProvider, input: AiTextRequest & { userId: string; quotaKey?: string }) {
  const env = getServerEnv();
  if (!env.AI_ENABLED && provider.name !== "fake") throw new AiProviderError("AI_DISABLED");
  const start = Date.now();
  if (provider.name !== "fake") await consumeFeatureQuota(db, { userId: input.userId, key: input.quotaKey ?? `ai:${input.operation}:daily`, limit: aiQuotaDefaults.userDailyRequests, window: "daily" });
  try {
    const result = await provider.generateText(input);
    if (provider.name !== "fake") await recordAiUsage(db, { userId: input.userId, operation: input.operation, ...result.usage });
    return { ...result, latencyMs: Date.now() - start };
  } catch (error) {
    throw error instanceof AiProviderError ? error : new AiProviderError("AI_PROVIDER_FAILED");
  }
}

export async function recordAiUsage(db: Database, input: { userId?: string; operation: string; provider: string; model: string; inputTokens: number; outputTokens: number; costMicros?: number }) {
  const [event] = await db.insert(aiUsageEvents).values({ userId: input.userId, operation: input.operation, provider: input.provider, model: input.model, inputTokens: input.inputTokens, outputTokens: input.outputTokens, costMicros: input.costMicros ?? 0 }).returning();
  return event;
}

export async function getAiUsageAggregatesForAdmin(db: Database, since: Date) {
  return db.select({ provider: aiUsageEvents.provider, model: aiUsageEvents.model, requests: sql<number>`count(*)`, inputTokens: sql<number>`sum(${aiUsageEvents.inputTokens})`, outputTokens: sql<number>`sum(${aiUsageEvents.outputTokens})`, costMicros: sql<number>`sum(${aiUsageEvents.costMicros})` }).from(aiUsageEvents).where(gte(aiUsageEvents.createdAt, since)).groupBy(aiUsageEvents.provider, aiUsageEvents.model);
}

export async function getUserAiUsageForAdmin(db: Database, userId: string) {
  return db.query.aiUsageEvents.findMany({ where: eq(aiUsageEvents.userId, userId), columns: { id: true, operation: true, provider: true, model: true, inputTokens: true, outputTokens: true, costMicros: true, createdAt: true }, limit: 100, orderBy: (table, { desc }) => [desc(table.createdAt)] });
}
