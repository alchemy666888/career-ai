import { redactValue, sanitizeError } from "./redact";

export type LogEvent = {
  severity: "debug" | "info" | "warn" | "error";
  event: string;
  code?: string;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
  operation?: string;
  entityId?: string;
  durationMs?: number;
  provider?: string;
  model?: string;
  retry?: number;
  backgroundJobId?: string;
  error?: unknown;
};

export function serializeLogEvent(event: LogEvent) {
  const safe = redactValue({ ...event, error: event.error ? sanitizeError(event.error) : undefined });
  return JSON.stringify(safe).replace(/[\r\n]/g, " ").slice(0, 4096);
}

export function logEvent(event: LogEvent) {
  try {
    const line = serializeLogEvent(event);
    const writer = event.severity === "error" ? console.error : event.severity === "warn" ? console.warn : console.log;
    writer(line);
  } catch {
    // Logging must never break business operations.
  }
}
