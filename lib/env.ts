import { z } from "zod";

const booleanString = z
  .enum(["true", "false", "1", "0", "yes", "no", "on", "off"])
  .transform((value) => ["true", "1", "yes", "on"].includes(value));

const optionalBoolean = (defaultValue: boolean) =>
  z.preprocess((value) => (value === undefined || value === "" ? undefined : String(value).toLowerCase()), booleanString.default(defaultValue));

const postgresUrl = z.string().url().refine((value) => value.startsWith("postgres://") || value.startsWith("postgresql://"), {
  message: "must be a PostgreSQL connection URL"
});

const serverSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
    DATABASE_URL: postgresUrl,
    TEST_DATABASE_URL: postgresUrl.optional(),
    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
    AUTH_URL: z.string().url().optional(),
    AUTH_TRUST_HOST: optionalBoolean(false),
    AUTH_GITHUB_ID: z.string().optional(),
    AUTH_GITHUB_SECRET: z.string().optional(),
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    ADMIN_EMAILS: z.string().optional(),
    DEEPSEEK_API_KEY: z.string().optional(),
    AI_ENABLED: optionalBoolean(false),
    EMAIL_AUTH_ENABLED: optionalBoolean(false),
    LIVE_JOB_INGESTION_ENABLED: optionalBoolean(false),
    ADMIN_INGESTION_ENABLED: optionalBoolean(false),
    ANONYMOUS_DEMO_ENABLED: optionalBoolean(true),
    SENTRY_ENABLED: optionalBoolean(false),
    OTEL_ENABLED: optionalBoolean(true),
    CRON_SECRET: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
    RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(10)
  })
  .superRefine((env, ctx) => {
    if (env.AI_ENABLED && !env.DEEPSEEK_API_KEY) ctx.addIssue({ code: "custom", path: ["DEEPSEEK_API_KEY"], message: "required when AI_ENABLED=true" });
    if (env.EMAIL_AUTH_ENABLED && (!env.RESEND_API_KEY || !env.EMAIL_FROM)) ctx.addIssue({ code: "custom", path: ["EMAIL_AUTH_ENABLED"], message: "requires RESEND_API_KEY and EMAIL_FROM" });
    if ((env.LIVE_JOB_INGESTION_ENABLED || env.ADMIN_INGESTION_ENABLED) && !env.CRON_SECRET) ctx.addIssue({ code: "custom", path: ["CRON_SECRET"], message: "required when ingestion is enabled" });
    if (env.SENTRY_ENABLED && !env.SENTRY_DSN) ctx.addIssue({ code: "custom", path: ["SENTRY_DSN"], message: "required when SENTRY_ENABLED=true" });
  });

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional()
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type PublicEnv = z.infer<typeof publicSchema>;

export function parseServerEnv(input: Record<string, string | undefined>): ServerEnv {
  const parsed = serverSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Invalid server environment: ${issues}`);
  }
  return parsed.data;
}

export function parsePublicEnv(input: Record<string, string | undefined>): PublicEnv {
  return publicSchema.parse(input);
}

export function assertSafeTestDatabaseUrl(url: string, productionUrl?: string): void {
  if (productionUrl && url === productionUrl) throw new Error("TEST_DATABASE_URL must not equal DATABASE_URL");
  if (/prod|production/i.test(url)) throw new Error("TEST_DATABASE_URL must not target a production database");
}

export function getServerEnv() {
  return parseServerEnv(process.env);
}

export const publicEnv = parsePublicEnv(process.env);
