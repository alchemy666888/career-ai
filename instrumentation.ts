export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.OTEL_ENABLED !== "false") {
    const otel = await import("@vercel/otel").catch(() => null);
    otel?.registerOTel?.({ serviceName: "ai-job-search" });
  }
  if (process.env.SENTRY_ENABLED === "true") await import("./lib/observability/sentry").then((m) => m.initSentryServer());
}

export async function onRequestError(error: unknown) {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const sentry = await import("@sentry/nextjs").catch(() => null);
  sentry?.captureException?.(error);
}
