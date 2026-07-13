# AI Job Search

AI Job Search is a Next.js App Router product for managing a modern job hunt from discovery through offer decision. It combines job discovery, profile and résumé context, evidence-backed fit evaluation, application preparation, interview planning, and status tracking into one workflow.

> **Current product mode:** the app can run locally without authentication, AI, or a database for core demo pages. PostgreSQL, OAuth, email, AI, and live ingestion are optional deployment capabilities controlled by environment variables.

## Contents

- [Project overview](#project-overview)
- [Basic information and scope](#basic-information-and-scope)
- [Core concepts](#core-concepts)
- [User journey and workflow](#user-journey-and-workflow)
- [Local development environment setup](#local-development-environment-setup)
- [Database and migrations](#database-and-migrations)
- [Vercel Cloud setup](#vercel-cloud-setup)
- [External cron job setup](#external-cron-job-setup)
- [Operations notes](#operations-notes)
- [Job hunter guides](#job-hunter-guides)

## Project overview

AI Job Search helps job hunters answer five practical questions:

1. **What roles should I look at?** Discover or import roles and keep only the relevant ones.
2. **Which roles are worth applying to?** Compare fit, strengths, risks, and gaps.
3. **What do I need before I submit?** Prepare résumé and cover-letter artifacts and run a preflight checklist.
4. **What happens after submission?** Track follow-ups, interviews, offers, and closed opportunities.
5. **What evidence supports my story?** Keep profile, résumé, and imported evidence organized so AI assistance can be grounded in user-approved context.

The product is intentionally user-controlled: it can draft, evaluate, track, and prepare, but the user remains responsible for reviewing content and submitting applications externally.

## Basic information and scope

| Area | Details |
| --- | --- |
| Product name | AI Job Search |
| Primary user | Job hunters managing multiple opportunities |
| Framework | Next.js App Router with React and TypeScript |
| Styling | Global CSS in `app/globals.css` |
| Database | PostgreSQL through Drizzle ORM; Neon-compatible runtime driver |
| Authentication | NextAuth/Auth.js with optional GitHub and Google providers |
| AI provider | Deterministic fake provider by default; DeepSeek adapter when enabled |
| Deployment target | Vercel Cloud |
| Ingestion model | Manual import, deterministic mock data, and optional JobSpy-backed ingestion |
| Non-goals | The app does not submit applications on behalf of users, scrape arbitrary user-provided URLs, or store original résumé upload bytes |

### In scope

- Discover persisted jobs and demo fixture roles.
- Save, dismiss, restore, and manually import roles.
- Maintain a job-search pipeline with clear status transitions.
- Draft application materials for user review.
- Track application and interview preparation state.
- Evaluate role fit from approved evidence when AI is enabled.
- Trigger job ingestion through a secured external scheduler endpoint.

### Out of scope / guardrails

- No automatic external application submission.
- No unbounded provider work inside a request/response cycle.
- No committing generated Drizzle migration artifacts from local experimentation unless intentionally part of a schema change.
- No logging of prompts, résumé text, generated documents, raw provider payloads, or secrets.

## Core concepts

### Pipeline

The **pipeline** is the ordered set of stages a role moves through during a job search:

| Stage | Definition | Typical user action |
| --- | --- | --- |
| **Discovered** | A role has been found but not yet selected for active pursuit. | Review fit, requirements, location, compensation, and freshness. |
| **Shortlisted** | A role looks promising and is saved for deeper review. | Add notes, compare against other roles, decide whether to apply. |
| **Applying** | The user is preparing application materials. | Tailor résumé, draft cover letter, check requirements, verify links. |
| **Submitted** | The user has submitted the application outside the app and marked it complete. | Record submission date and plan follow-up. |
| **Interviewing** | The employer has moved the user into interview steps. | Prepare stories, questions, logistics, and follow-up notes. |
| **Offer** | The employer has extended an offer or is in final offer discussion. | Compare compensation, constraints, and negotiation points. |
| **Accepted** | The user accepted the offer. | Archive remaining search activity or close competing opportunities. |
| **Closed** | The opportunity is no longer active. | Record rejection, withdrawal, expiration, decline, or other closure reason. |

### Other terms

- **Role / job posting:** an opportunity with title, company, location, work style, source, and description.
- **Shortlist:** saved roles that deserve further review.
- **Application workspace:** the local workspace for tailoring documents and tracking readiness before external submission.
- **Preflight checklist:** user-controlled checks before marking an application submitted.
- **Evidence:** user-approved facts from profile, résumé, or manual corrections that can support AI-generated recommendations.
- **Fit evaluation:** a bounded, persisted snapshot describing match score, confidence, strengths, gaps, and recommendations.
- **Ingestion:** a background process that imports provider jobs into normalized persisted postings.
- **External cron:** a third-party scheduler calling the app's secured ingestion endpoint; this project does not rely on Vercel Cron Jobs.

## User journey and workflow

1. **Set up profile context**
   - Add or update profile details.
   - Import or replace résumé content when using authenticated/profile features.
   - Correct imported claims so important facts become user-approved evidence.

2. **Discover roles**
   - Browse `/jobs` for persisted jobs when a database is configured.
   - Use demo/fixture discovery when running without a database.
   - Filter by keyword, role, location, work style, source, saved state, or dismissed state.
   - Manually import roles with user-provided job metadata and description text.

3. **Shortlist and compare**
   - Save relevant jobs to the Shortlist.
   - Dismiss mismatches and restore them later if needed.
   - Add notes that capture why the role matters, risks, and next actions.

4. **Apply deliberately**
   - Start an application workspace for a shortlisted role.
   - Tailor résumé and cover-letter drafts.
   - Complete the preflight checklist before external submission.
   - Mark the role as submitted only after the user submits outside the app.

5. **Interview and follow up**
   - Prepare interview stories, practice answers, questions to ask, and logistics.
   - Record post-interview signals and follow-up notes.
   - Move opportunities forward to Offer, Accepted, or Closed as appropriate.

6. **Review outcomes**
   - Keep accepted and closed opportunities for search history.
   - Use notes and pipeline state to avoid duplicate effort.

## Local development environment setup

### Prerequisites

- Node.js 22.
- npm.
- Optional local PostgreSQL 16 if you want to run migrations or database-backed pages.

### Install dependencies

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

- Set `DATABASE_URL` to a valid PostgreSQL URL. A database is required by strict environment validation, even though many demo pages do not query it.
- Set `AUTH_SECRET` to at least 32 characters. Generate one with:

```bash
openssl rand -base64 32
```

Recommended local defaults:

```dotenv
NODE_ENV="development"
VERCEL_ENV="development"
AUTH_TRUST_HOST="true"
AI_ENABLED="false"
EMAIL_AUTH_ENABLED="false"
LIVE_JOB_INGESTION_ENABLED="false"
ADMIN_INGESTION_ENABLED="false"
ANONYMOUS_DEMO_ENABLED="true"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Run the app

```bash
npm run dev
```

Open <http://localhost:3000>. The health endpoint is available at <http://localhost:3000/api/health>.

### Useful checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Database and migrations

The runtime database driver is `@neondatabase/serverless`, but local migrations use `drizzle-kit` with a standard PostgreSQL connection.

### Local PostgreSQL example

```bash
sudo pg_ctlcluster 16 main start
sudo -u postgres psql -c "CREATE ROLE postgres WITH LOGIN PASSWORD 'postgres' SUPERUSER;" || true
sudo -u postgres createdb ai_job_search -O postgres || true
```

Use this local URL in `.env.local` when matching the default setup:

```dotenv
DATABASE_URL="postgres://postgres:postgres@localhost:5432/ai_job_search"
```

### Generate and apply migrations

```bash
npm run db:generate
npm run db:migrate
npm run db:check
```

`db/migrations/0000_initial.sql` is a hand-written reference and is not tracked in a Drizzle journal. Generate tracked migration files first, then migrate. Generated migration files from local experimentation should not be committed unless they are part of an intentional schema change.

## Vercel Cloud setup

### 1. Create the Vercel project

1. Import the repository into Vercel.
2. Select the Next.js framework preset.
3. Use the default install/build commands unless your team overrides them:
   - Install: `npm install`
   - Build: `npm run build`
4. Configure Preview and Production environment variables separately.

### 2. Provision PostgreSQL

Use a Vercel Postgres/Neon-compatible database or another hosted PostgreSQL provider with SSL. Set `DATABASE_URL` to the pooled serverless connection string when available.

### 3. Configure required environment variables

| Variable | Scope | Required? | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Server | Yes | PostgreSQL connection URL. Use SSL for hosted databases. |
| `AUTH_SECRET` | Server | Yes | At least 32 characters. Generate per environment. |
| `AUTH_URL` | Server | Recommended | Canonical deployment URL for auth callbacks. |
| `AUTH_TRUST_HOST` | Server | Recommended | Set to `true` on Vercel. |
| `NEXT_PUBLIC_APP_URL` | Client | Recommended | Public app origin for absolute client links. |
| `CRON_SECRET` | Server | Required for ingestion | Shared secret for external scheduler calls. |

### 4. Configure optional environment variables

| Capability | Variables |
| --- | --- |
| GitHub auth | `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` |
| Google auth | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` |
| Email auth/sending | `EMAIL_AUTH_ENABLED`, `RESEND_API_KEY`, `EMAIL_FROM` |
| AI provider | `AI_ENABLED`, `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `DEEPSEEK_MODEL` |
| Job ingestion | `LIVE_JOB_INGESTION_ENABLED`, `ADMIN_INGESTION_ENABLED`, `CRON_SECRET` |
| Admin features | `ADMIN_EMAILS` |
| Observability | `SENTRY_ENABLED`, `SENTRY_DSN`, `SENTRY_TRACES_SAMPLE_RATE`, `OTEL_ENABLED` |
| Rate limiting | `RATE_LIMIT_WINDOW_SECONDS`, `RATE_LIMIT_MAX_REQUESTS` |

### 5. Deploy and verify

After deployment:

```bash
curl https://your-vercel-project.vercel.app/api/health
```

A healthy app returns JSON with `ok: true`.

## External cron job setup

This project does **not** use Vercel Cron Jobs. Configure an external scheduler such as GitHub Actions, cron-job.org, EasyCron, Trigger.dev, Inngest, or a hosted worker to call:

```text
GET https://your-vercel-project.vercel.app/api/ingestion/jobs/run
```

or:

```text
POST https://your-vercel-project.vercel.app/api/ingestion/jobs/run
```

Include one of these authentication methods:

```http
Authorization: Bearer <CRON_SECRET>
```

or:

```http
x-cron-secret: <CRON_SECRET>
```

Example cURL command:

```bash
curl -X POST \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  https://your-vercel-project.vercel.app/api/ingestion/jobs/run
```

Important behavior:

- `LIVE_JOB_INGESTION_ENABLED=true` is required for scheduled ingestion to enqueue work.
- `ADMIN_INGESTION_ENABLED=true` is required for admin-triggered ingestion.
- `CRON_SECRET` is required when ingestion is enabled.
- The endpoint enqueues a deduplicated background job; it does not run unbounded provider ingestion inline.
- The legacy `/api/cron/jobs` path remains a compatibility alias but is not scheduled by `vercel.json`.
- Investigate missed or failed runs using scheduler history, Vercel Runtime Logs, ingestion run records, and Sentry if enabled.

## Operations notes

### Résumé replacement and deletion behavior

Authenticated users can preview a replacement résumé before confirming it. Confirmed replacement archives prior active résumé sources, archives source-linked imported evidence, replaces imported résumé sections, preserves independent user-authored evidence, recalculates completeness, and writes a safe audit event. Original upload bytes are processed transiently and are not stored.

### Job provider and manual import behavior

Manual import accepts job metadata and description text supplied by the user, normalizes canonical URL metadata for deduplication, stores text-only descriptions, and does not fetch arbitrary user-provided URLs. Duplicate fingerprints reuse the existing normalized job and show a warning.

### Persisted job discovery

When `DATABASE_URL` is configured, `/jobs` reads persisted job postings and user-specific job state from PostgreSQL. Users can filter, save jobs with notes, dismiss jobs, restore dismissed jobs, and page through bounded results.

### AI provider abstraction

`AI_ENABLED=false` selects the deterministic fake provider for local development and automated tests. `AI_ENABLED=true` selects the DeepSeek adapter, which reads `DEEPSEEK_API_KEY`, supports `DEEPSEEK_BASE_URL` and `DEEPSEEK_MODEL`, applies a timeout and bounded retry, validates structured JSON with Zod, and maps provider failures to safe error codes.

### AI quotas and usage accounting

Live AI requests are guarded by the global `AI_ENABLED` kill switch and shared quota buckets. Usage records store safe metadata only: operation, provider, model, token counts, estimated cost, and timestamps.

### Evidence-backed fit evaluation

Job details use persisted job records and immutable fit-evaluation snapshots when the database and profile context are available. Evaluations are scoped to the authenticated user's profile, use approved evidence packets only, bound scores from 0–100, and preserve the latest successful evaluation if a provider call fails.

## Job hunter guides

User-facing guides are available in two formats:

- Markdown: [`docs/job-hunter-user-guide.md`](docs/job-hunter-user-guide.md)
- HTML: [`docs/job-hunter-user-guide.html`](docs/job-hunter-user-guide.html)
