# Design: AI Job Search Next.js and PostgreSQL Architecture

## 1. Architecture overview

The target system is a full-stack Next.js application deployed on Vercel. Next.js owns the user interface, server-rendered pages, API boundaries, server actions, authentication integration, and deployment runtime. PostgreSQL is the durable data store. External services such as DeepSeek for AI model calls, email providers, authentication providers, and observability systems are accessed from server-side code using secrets configured in Vercel Cloud.

```text
Browser
  |
  | HTTPS
  v
Vercel-hosted Next.js app
  |-- React Server Components and Client Components
  |-- Server Actions and Route Handlers
  |-- Auth Middleware
  |-- AI orchestration services
  |-- Database access layer
  v
Managed PostgreSQL
```

## 2. Repository structure target

The later implementation should organize the Next.js project around clear application boundaries:

```text
app/
  (marketing)/
  (auth)/
  (dashboard)/
  api/
components/
  ui/
  forms/
  dashboard/
lib/
  auth/
  config/
  db/
  ai/
  jobs/
  applications/
  profile/
  security/
db/
  migrations/
  schema/
tests/
  unit/
  integration/
docs/
```

If the existing repository already has a different Next.js layout, Codex should adapt the design while preserving the same boundaries: UI in Next.js, server behavior in Next.js, PostgreSQL persistence, and Vercel deployment readiness.

## 3. Runtime model

### 3.1 Frontend

- Use Next.js App Router pages for primary product screens.
- Prefer React Server Components for data-heavy pages to reduce client JavaScript.
- Use Client Components only for interactive forms, editors, filters, modals, and optimistic interactions.
- Provide responsive layouts for desktop and mobile job-search workflows.

### 3.2 Backend inside Next.js

- Use server actions for authenticated mutations triggered by forms or UI actions.
- Use route handlers under `app/api` for webhook endpoints, AI streaming endpoints, file export endpoints, and integration callbacks.
- Use middleware for authentication gating and coarse route protection.
- Keep business logic in `lib/*` modules so route handlers and server actions stay thin.

### 3.3 Vercel execution

- Use the Node.js runtime for code that needs PostgreSQL drivers, AI SDKs, authentication libraries, or crypto features not supported by edge runtime.
- Use edge runtime only for lightweight middleware or read-only public behavior when compatible.
- Avoid local disk persistence because Vercel functions are ephemeral.
- Use object storage only if future requirements demand file binaries; metadata remains in PostgreSQL.

## 4. Configuration and environment variables

### 4.1 Configuration rules

- All production and preview variables must be configured in Vercel Cloud.
- Local development may use `.env.local`, but that file must be ignored by Git.
- `.env.example` may document required keys with placeholder values only.
- Server-only variables must never be exposed through client bundles.
- Runtime config must be validated by a central `lib/config` module.

### 4.2 Expected variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Server | PostgreSQL connection string or pooled connection URL. |
| `AUTH_SECRET` | Server | Session or token signing secret. |
| `AUTH_URL` or provider-specific callback URL | Server | Public application URL used by the auth provider. |
| `AUTH_*_ID` / `AUTH_*_SECRET` | Server | OAuth provider credentials if OAuth is used. |
| `DEEPSEEK_API_KEY` | Server | Required DeepSeek API key for all AI model calls. |
| `DEEPSEEK_MODEL` | Server | DeepSeek model used for fit evaluation, drafting, profile assistance, and interview preparation. |
| `DEEPSEEK_BASE_URL` | Server | Optional DeepSeek-compatible API base URL override; defaults to the official DeepSeek endpoint. |
| `DEEPSEEK_TIMEOUT_MS` | Server | Optional request timeout for DeepSeek calls. |
| `NEXT_PUBLIC_APP_URL` | Client-safe | Public base URL when the client needs it. |
| `RATE_LIMIT_*` | Server | Optional abuse-protection settings. |
| `OBSERVABILITY_*` | Server/client as appropriate | Optional logging, tracing, or analytics config. |

The exact list may change during implementation, but every required variable must be documented before production deployment.

## 5. Database design

PostgreSQL is the source of truth. The implementation may use Prisma, Drizzle, Kysely, or another TypeScript-friendly migration tool, provided migrations are committed and compatible with Vercel deployment.

### 5.1 Core tables

- `users`: authenticated user identity and account metadata.
- `profiles`: one or more candidate profiles per user if multi-profile support is enabled.
- `profile_sections`: structured profile content such as experience, education, skills, preferences, constraints, and writing style.
- `evidence_items`: claim-supporting records sourced from resumes, notes, projects, certifications, or user entries.
- `job_postings`: normalized job records from URLs, pasted descriptions, or future integrations.
- `job_searches`: saved queries, filters, and discovery metadata.
- `fit_evaluations`: explainable job-to-profile scoring records.
- `applications`: application pipeline records linking users, profiles, jobs, statuses, and key dates.
- `application_artifacts`: generated draft metadata, versions, content references, and approval state.
- `interview_preps`: interview preparation records linked to applications.
- `outcomes`: stage history, feedback, offers, rejections, and follow-up notes.
- `audit_events`: important user and system actions for traceability.

### 5.2 Data ownership

Every user-owned table must include a `user_id` or have an enforced path to a user-owned parent. Data access helpers must require user context and must not expose cross-user records.

### 5.3 Migrations

- Migrations must be deterministic and committed.
- Production migrations must run through an explicit command or Vercel deployment step appropriate for the chosen ORM.
- Destructive migrations require backup and rollout notes.

## 6. Domain modules

### 6.1 Profile module

Owns profile CRUD, evidence management, user-approved claims, writing style, preferences, and constraints. It exposes server-only functions for retrieving a profile package for AI prompts.

### 6.2 Jobs module

Owns manual job creation, URL ingestion hooks, deduplication, status transitions, search records, and normalized job content.

### 6.3 Evaluation module

Owns scoring dimensions, deal-breaker checks, confidence levels, explanation generation, and persistence of evaluation output.

### 6.4 Application module

Owns application state, draft version metadata, user approval state, and links among profile, job, fit evaluation, and generated content.

### 6.5 DeepSeek AI module

Owns the DeepSeek client, model configuration, prompt templates, structured output validation, token/cost controls, rate limiting, retries, and safety checks. All AI model calls must go through this server-only module. The module must never be called directly from Client Components, and DeepSeek credentials must never be returned to the browser.

### 6.6 Analytics module

Owns dashboard calculations such as pipeline counts, conversion rates, response timing, gap frequency, and activity history.

## 7. UI design

Primary screens should include:

1. Landing or sign-in page.
2. Dashboard with pipeline summary and next actions.
3. Profile editor with evidence and preferences sections.
4. Jobs inbox with filters, search, status, and duplicate indicators.
5. Job detail page with posting text, evaluation, notes, and application actions.
6. Application workspace with draft versions and approval controls.
7. Interview prep page with generated questions, STAR examples, and notes.
8. Outcomes and analytics page.
9. Settings page for non-secret preferences and integration status.

## 8. DeepSeek integration design

- Implement a server-only DeepSeek client wrapper in the AI module.
- Read `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, optional `DEEPSEEK_BASE_URL`, and optional timeout/token settings from validated server configuration.
- Keep prompt templates server-side and version them with the application code.
- Validate DeepSeek structured outputs with schemas before database writes.
- Store AI output metadata such as model, prompt version, created timestamp, workflow type, and validation status.
- Apply rate limiting to DeepSeek-backed endpoints and server actions.
- Redact DeepSeek API keys, request headers, and sensitive prompt payloads from logs.

## 9. Security design

- Enforce authentication before rendering dashboard data.
- Perform authorization checks in every server action, route handler, and database query helper.
- Validate all external input with schemas before database writes.
- Apply rate limits to AI and ingestion endpoints.
- Use secure session cookies or provider-recommended session handling.
- Redact secrets and sensitive prompt payloads from logs.
- Keep AI prompts server-side.

## 10. Deployment design

### 10.1 Vercel setup

- Framework preset: Next.js.
- Build command: project default, typically `next build` through the package manager.
- Install command: package-manager default unless the repo requires otherwise.
- Output directory: Next.js default.
- Environment variables: configured in Vercel Cloud for production and preview.
- Database: managed PostgreSQL with pooled connection string in `DATABASE_URL`.

### 10.2 Release checks

Before deployment, the implementation should pass:

1. Dependency installation.
2. Type checking.
3. Linting.
4. Unit tests.
5. Database migration validation.
6. Production build.
7. Smoke test against a preview deployment.

## 11. Observability

The app should include structured server logs for key events, error boundaries for user-facing failures, and optional integration with Vercel logs, analytics, or a third-party monitoring provider. Logs must not include secrets or unnecessary personal data.
