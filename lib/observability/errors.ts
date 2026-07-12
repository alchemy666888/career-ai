import type { CorrelationContext } from "./correlation";

export type ErrorCode = "AUTH_REQUIRED" | "FORBIDDEN" | "VALIDATION_FAILED" | "RATE_LIMITED" | "PROVIDER_FAILED" | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(public code: ErrorCode, message: string, public correlation?: CorrelationContext) {
    super(message);
    this.name = "AppError";
  }
}

export function toSafeErrorResult(error: unknown, correlation: CorrelationContext) {
  const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
  return { ok: false as const, error: { code, correlationId: correlation.correlationId } };
}
