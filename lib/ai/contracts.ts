import type { z } from "zod";
export type AiEvidence = { id: string; title: string; content: string };
export type AiUsage = { provider: string; model: string; inputTokens: number; outputTokens: number };
export type AiTextRequest = { operation: string; promptVersion: string; system: string; user: string; evidence: AiEvidence[]; timeoutMs?: number };
export type AiTextResult = { text: string; usage: AiUsage };
export type AiStructuredResult<T> = { data: T; usage: AiUsage; repaired: boolean };
export interface AiProvider { name: string; model: string; generateText(request: AiTextRequest): Promise<AiTextResult>; generateStructured<T>(request: AiTextRequest, schema: z.ZodSchema<T>): Promise<AiStructuredResult<T>>; }
export class AiProviderError extends Error { constructor(public code: "AI_DISABLED" | "AI_TIMEOUT" | "AI_PROVIDER_FAILED" | "AI_INVALID_RESPONSE", message = code) { super(message); } }
