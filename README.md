# AI Job Search

A pure Next.js App Router product for evidence-backed AI-assisted job search workflows. The app is designed for Vercel deployment and PostgreSQL durability.

## Local setup

1. Copy `.env.example` to `.env.local` and fill local placeholder values for development only.
2. Install dependencies with `npm install`.
3. Generate migrations with `npm run db:generate`.
4. Apply migrations with `npm run db:migrate`.
5. Run checks with `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

## Architecture

- Next.js owns pages, route handlers, server actions, middleware, and deployment runtime.
- PostgreSQL is the only durable database.
- Drizzle defines schema and migrations.
- Auth.js is configured for Next.js-compatible authentication.
- AI provider calls and prompts must remain server-side and must use approved evidence only.

## Environment and feature flags

Configuration is parsed server-side with Zod in `lib/env.ts`. Risky integrations are disabled by default so local development, tests, and builds do not require live DeepSeek, Resend, Sentry, OAuth, or job-ingestion credentials.

Core server variables: `DATABASE_URL`, `AUTH_SECRET`, and optional `AUTH_URL` / `AUTH_TRUST_HOST`. Public client-safe variables are limited to `NEXT_PUBLIC_APP_URL` and optional public Sentry DSN configuration. `TEST_DATABASE_URL` is for integration tests only and must never target or equal Production.

Feature flags default to: `AI_ENABLED=false`, `EMAIL_AUTH_ENABLED=false`, `LIVE_JOB_INGESTION_ENABLED=false`, `ADMIN_INGESTION_ENABLED=false`, `ANONYMOUS_DEMO_ENABLED=true`, `SENTRY_ENABLED=false`, and `OTEL_ENABLED=true`. Enabling AI requires `DEEPSEEK_API_KEY`; enabling email auth requires Resend sender configuration; enabling ingestion requires cron protection; enabling Sentry requires Sentry DSN configuration.

See `docs/vercel-deployment.md` for Vercel deployment steps. Every key listed in `.env.example` must be configured in Vercel Cloud for Preview and Production; committed `.env` files are forbidden.
