import { describe, expect, it } from "vitest";
import { assertSafeTestDatabaseUrl, parseServerEnv } from "@/lib/env";

const base = {
  NODE_ENV: "test",
  DATABASE_URL: "postgres://user:pass@localhost:5432/ai_job_search",
  AUTH_SECRET: "12345678901234567890123456789012"
};

describe("environment configuration", () => {
  it("uses safe disabled defaults", () => {
    const env = parseServerEnv(base);
    expect(env.AI_ENABLED).toBe(false);
    expect(env.EMAIL_AUTH_ENABLED).toBe(false);
    expect(env.LIVE_JOB_INGESTION_ENABLED).toBe(false);
    expect(env.ADMIN_INGESTION_ENABLED).toBe(false);
    expect(env.ANONYMOUS_DEMO_ENABLED).toBe(true);
    expect(env.SENTRY_ENABLED).toBe(false);
    expect(env.OTEL_ENABLED).toBe(true);
  });

  it("parses boolean strings explicitly", () => {
    const env = parseServerEnv({ ...base, AI_ENABLED: "1", ANONYMOUS_DEMO_ENABLED: "off", DEEPSEEK_API_KEY: "test-key" });
    expect(env.AI_ENABLED).toBe(true);
    expect(env.ANONYMOUS_DEMO_ENABLED).toBe(false);
  });

  it("fails fast when an enabled integration is missing credentials", () => {
    expect(() => parseServerEnv({ ...base, AI_ENABLED: "true" })).toThrow(/DEEPSEEK_API_KEY/);
    expect(() => parseServerEnv({ ...base, EMAIL_AUTH_ENABLED: "true" })).toThrow(/RESEND_API_KEY/);
    expect(() => parseServerEnv({ ...base, LIVE_JOB_INGESTION_ENABLED: "true" })).toThrow(/CRON_SECRET/);
    expect(() => parseServerEnv({ ...base, SENTRY_ENABLED: "true" })).toThrow(/SENTRY_DSN/);
  });

  it("rejects unsafe test database targets", () => {
    expect(() => assertSafeTestDatabaseUrl(base.DATABASE_URL, base.DATABASE_URL)).toThrow(/must not equal/);
    expect(() => assertSafeTestDatabaseUrl("postgres://user:pass@localhost:5432/production")).toThrow(/production/);
  });
});
