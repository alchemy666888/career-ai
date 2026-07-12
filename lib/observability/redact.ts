const prohibitedKeys = /email|cookie|authorization|token|secret|api[_-]?key|database_url|password|prompt|response|resume|cover.?letter|interview.?answer|body/i;
const safeKeys = new Set(["severity", "event", "code", "correlationId", "traceId", "spanId", "operation", "entityId", "durationMs", "provider", "model", "retry", "backgroundJobId", "environment", "release"]);

export function redactValue(value: unknown): unknown {
  if (typeof value === "string") return value.length > 256 ? `${value.slice(0, 256)}…` : value;
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.slice(0, 10).map(redactValue);
  const output: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (prohibitedKeys.test(key)) output[key] = "[REDACTED]";
    else if (safeKeys.has(key)) output[key] = redactValue(nested);
  }
  return output;
}

export function sanitizeError(error: unknown) {
  if (error instanceof Error) return { name: error.name, message: error.message.slice(0, 200) };
  return { name: "UnknownError", message: "Unknown error" };
}
