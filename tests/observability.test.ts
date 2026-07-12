import { describe, expect, it } from "vitest";
import { createCorrelationContext } from "@/lib/observability/correlation";
import { toSafeErrorResult } from "@/lib/observability/errors";
import { serializeLogEvent } from "@/lib/observability/logger";
import { redactValue } from "@/lib/observability/redact";
import { sanitizeSentryEvent } from "@/lib/observability/sentry";
import { withObservedSpan } from "@/lib/observability/tracing";

describe("observability foundations", () => {
  it("serializes bounded one-line safe JSON logs", () => {
    const line = serializeLogEvent({ severity: "info", event: "test", correlationId: "c1", error: new Error("boom"), operation: "op" });
    expect(line).not.toContain("\n");
    expect(JSON.parse(line)).toMatchObject({ severity: "info", event: "test", correlationId: "c1" });
  });

  it("redacts prohibited sensitive fields", () => {
    const redacted = redactValue({ email: "person@example.test", authorization: "bearer", resumeText: "private", prompt: "secret", event: "safe" });
    expect(JSON.stringify(redacted)).not.toContain("person@example.test");
    expect(JSON.stringify(redacted)).not.toContain("private");
    expect(redacted).toMatchObject({ event: "safe" });
  });

  it("returns safe correlation references and completes spans on failure", async () => {
    const correlation = createCorrelationContext({ correlationId: "test-correlation" });
    await expect(withObservedSpan("failing", () => { throw new Error("failure"); }, correlation)).rejects.toThrow("failure");
    expect(toSafeErrorResult(new Error("failure"), correlation).error.correlationId).toBe("test-correlation");
  });

  it("sanitizes Sentry events without Session Replay configuration", () => {
    const event = sanitizeSentryEvent({ event: "capture", request: { cookies: "abc" }, email: "person@example.test" });
    expect(JSON.stringify(event)).not.toContain("person@example.test");
  });
});
