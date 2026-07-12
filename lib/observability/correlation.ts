import { randomUUID } from "node:crypto";

export type CorrelationContext = { correlationId: string; traceId?: string; spanId?: string };

export function createCorrelationContext(input?: Partial<CorrelationContext>): CorrelationContext {
  return { correlationId: input?.correlationId ?? randomUUID(), traceId: input?.traceId, spanId: input?.spanId };
}
