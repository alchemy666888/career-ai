import { getServerEnv } from "@/lib/env";

export function getFeatureFlags() {
  const env = getServerEnv();
  return {
    aiEnabled: env.AI_ENABLED,
    emailAuthEnabled: env.EMAIL_AUTH_ENABLED,
    liveJobIngestionEnabled: env.LIVE_JOB_INGESTION_ENABLED,
    adminIngestionEnabled: env.ADMIN_INGESTION_ENABLED,
    anonymousDemoEnabled: env.ANONYMOUS_DEMO_ENABLED,
    sentryEnabled: env.SENTRY_ENABLED,
    otelEnabled: env.OTEL_ENABLED
  } as const;
}
