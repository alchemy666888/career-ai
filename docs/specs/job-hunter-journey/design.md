# AI Job Platform Journey Enhancement — System Design

**Document status:** Draft for stakeholder approval — observability amended  
**Version:** 0.2  
**Date:** 2026-07-11  
**Target repository:** `alchemy666888/career-ai`  
**Specification path:** `docs/specs/job-hunter-journey/design.md`  
**Controlling requirements:** `docs/specs/job-hunter-journey/requirements.md`

## 1. Purpose

This document defines the technical design for transforming the existing `career-ai` repository into the approved full-MVP AI job-hunting platform.

The design preserves the current visual identity and selected evidence-oriented domain concepts while replacing production fixture state with server-authoritative PostgreSQL workflows.

This document describes **how** the approved requirements will be implemented. It does not change product scope.

## 2. Design Summary

The target system is a **server-first modular monolith** deployed on Vercel:

- Next.js App Router owns pages, layouts, route handlers, server actions, and server rendering.
- Neon PostgreSQL is the sole durable database.
- Drizzle ORM defines schemas, migrations, queries, and transactions.
- Auth.js provides GitHub OAuth, Google OAuth, and Resend-backed email magic links.
- Server actions call domain services.
- Domain services enforce authorization and business rules.
- Repository modules isolate Drizzle queries.
- DeepSeek is accessed through a provider-independent AI interface.
- Résumé parsing, exports, email, AI, and job ingestion are isolated adapters.
- PostgreSQL-backed quota and background-job tables avoid adding Redis or a managed queue.
- Browser-local state is limited to transient UI concerns and isolated demo fixtures.
- Playwright covers critical browser journeys.
- One implementation branch and one pull request contain atomic, reviewable commits.

## 3. Architectural Drivers

The design is driven by these constraints:

1. Production data must be authoritative in PostgreSQL.
2. AI-generated candidate claims must remain evidence-backed and auditable.
3. User-level authorization must be enforced server-side.
4. Live external integrations must be replaceable, mockable, and feature-flagged.
5. The application must remain deployable through GitHub and Vercel.
6. The full MVP must fit into one repository and one pull request.
7. No new always-on infrastructure may be required beyond Neon, Vercel, Resend, and DeepSeek.
8. Existing useful schema concepts and visual patterns should be preserved.
9. No meaningful production data needs to be preserved, but migrations must remain reviewable.
10. The implementation must support deterministic tests without live external calls.
11. Production runs on Vercel Hobby, so durable exception history must not depend on native Runtime Log retention or Vercel Drains.

## 4. Existing-System Assessment

The current repository already provides useful foundations:

- Next.js App Router
- TypeScript
- Auth.js
- Drizzle ORM
- PostgreSQL adapters
- Zod
- Vitest and Testing Library
- Evidence-oriented tables
- Fit-evaluation and application-artifact concepts
- A polished journey-oriented UI
- Browser-local fixture journey state
- Existing lint, type-check, test, build, and database scripts

The primary architectural gap is that the UI journey currently models jobs, applications, interviews, profile data, and artifacts inside a client-side provider backed by fixture data.

The enhancement will preserve visual components where practical but replace client-owned domain state with server queries and mutations.

## 5. Architectural Style

### 5.1 Modular Monolith

The application remains one Next.js deployment and one PostgreSQL database. Domain boundaries are enforced by directory structure, typed contracts, and module ownership rather than separate network services.

Benefits:

- Lower deployment complexity
- Transactional consistency
- Easier local development
- Lower operational cost
- Fast iteration within one pull request
- Clear future extraction points for AI, ingestion, or document processing

### 5.2 Server-First Rendering

Authenticated pages should render initial data through server components.

Client components are used only where interactivity requires them, including:

- Forms with optimistic feedback
- Modal and disclosure state
- Drag-and-drop Kanban
- Rich change-review interactions
- Clipboard actions
- File selection
- Temporary filtering controls
- Demo-mode local state

### 5.3 Command and Query Separation

The design uses a pragmatic separation:

- Queries are read functions called from server components or route handlers.
- Commands are server actions or protected route handlers.
- Both delegate to domain services.
- Domain services call repositories and external adapters.

No UI component may call Drizzle directly.

## 6. High-Level Architecture

```text
┌──────────────────────────────── Browser ────────────────────────────────┐
│                                                                        │
│ Server-rendered pages     Client interaction islands     Demo fixtures │
│ Jobs/Profile/Tracker      Kanban/Edit review/Forms       Browser-only  │
│          │                          │                          │         │
└──────────┼──────────────────────────┼──────────────────────────┼─────────┘
           │                          │                          │
           └──────── Server Components / Server Actions ────────┘
                                      │
                           Validation + Auth Context
                                      │
┌──────────────────────────── Next.js Domain Layer ───────────────────────┐
│ Profile │ Jobs │ Matching │ Résumé │ Cover │ Interview │ Tracker │ Admin│
│                                      │                                 │
│                          Shared policy services                         │
│             authorization │ audit │ quota │ feature flags              │
└──────────────────────────────────────┬───────────────────────────────────┘
                                       │
                           Repository / Adapter Layer
                  ┌────────────────────┼────────────────────┐
                  │                    │                    │
          Drizzle repositories     AI adapters       Document/job/email
                  │                DeepSeek/Fake      adapters
                  │                    │                    │
                  └────────────────────┼────────────────────┘
                                       │
          ┌────────────────────────────┼───────────────────────────┐
          │                            │                           │
   Neon PostgreSQL               DeepSeek API                 Resend API
          │
   Background jobs, quotas,
   domain data, audit events
```

## 7. Proposed Repository Structure

```text
app/
├── (public)/
│   ├── page.tsx
│   ├── privacy/page.tsx
│   └── demo/page.tsx
├── (auth)/
│   ├── signin/page.tsx
│   ├── verify-request/page.tsx
│   └── error/page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── profile/page.tsx
│   ├── jobs/page.tsx
│   ├── jobs/import/page.tsx
│   ├── jobs/[jobId]/page.tsx
│   ├── applications/page.tsx
│   ├── applications/[applicationId]/page.tsx
│   ├── interviews/page.tsx
│   ├── interviews/[interviewId]/page.tsx
│   └── settings/page.tsx
├── admin/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── ingestion/page.tsx
│   ├── jobs/page.tsx
│   ├── ai/page.tsx
│   ├── users/page.tsx
│   └── audit/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── cron/jobs/route.ts
│   ├── cron/maintenance/route.ts
│   ├── exports/resume/[artifactId]/route.ts
│   ├── exports/cover-letter/[coverLetterId]/route.ts
│   └── health/route.ts
└── globals.css

components/
├── career/
│   ├── shell/
│   ├── dashboard/
│   ├── profile/
│   ├── jobs/
│   ├── matching/
│   ├── resume/
│   ├── cover-letter/
│   ├── applications/
│   ├── interviews/
│   ├── outcomes/
│   └── demo/
├── admin/
└── ui/

lib/
├── auth/
│   ├── config.ts
│   ├── session.ts
│   ├── authorization.ts
│   └── admin.ts
├── db/
│   ├── client.ts
│   ├── schema/
│   ├── repositories/
│   ├── transactions/
│   └── migrations/
├── domain/
│   ├── profile/
│   ├── jobs/
│   ├── matching/
│   ├── resume/
│   ├── cover-letter/
│   ├── interview/
│   ├── applications/
│   ├── outcomes/
│   ├── admin/
│   └── shared/
├── ai/
│   ├── contracts.ts
│   ├── provider.ts
│   ├── deepseek.ts
│   ├── fake.ts
│   ├── prompts/
│   └── schemas/
├── documents/
│   ├── parsing/
│   ├── exports/
│   └── templates/
├── jobs/
│   ├── providers/
│   │   ├── contract.ts
│   │   ├── mock.ts
│   │   ├── manual.ts
│   │   └── jobspy-node.ts
│   └── normalize.ts
├── background/
│   ├── queue.ts
│   ├── worker.ts
│   └── handlers/
├── rate-limit/
├── audit/
├── flags/
├── validation/
├── observability/
└── env.ts

tests/
├── unit/
├── integration/
├── fixtures/
├── contract/
└── e2e/

docs/
└── specs/job-hunter-journey/
```

Existing component paths may be migrated incrementally; the final structure should follow these boundaries even if exact names vary.

## 8. Runtime Boundaries

### 8.1 Node.js Runtime

The following must run in the Node.js runtime rather than Edge:

- Drizzle/Neon operations requiring Node-compatible libraries
- PDF and DOCX parsing
- DOCX generation
- PDF generation
- DeepSeek requests
- Resend requests
- JobSpy experimental adapter
- Background-job handlers
- Export downloads

Route handlers and pages using these modules must explicitly avoid Edge runtime assumptions.

### 8.2 Request Duration

Interactive AI requests should remain synchronous when bounded by timeout.

Longer or retryable operations use background-job records, including:

- Scheduled ingestion
- Maintenance cleanup
- Large résumé parsing fallback
- Export generation if it exceeds the synchronous threshold
- Non-interactive AI regeneration jobs if added later

## 9. Environment Configuration

All environment variables are parsed and validated centrally in `lib/env.ts`.

The application must fail fast for missing required production settings while permitting explicitly disabled integrations.

### 9.1 Core

```text
DATABASE_URL
AUTH_SECRET
AUTH_URL
AUTH_TRUST_HOST
NEXT_PUBLIC_APP_URL
```

### 9.2 OAuth

```text
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
```

### 9.3 Email

```text
EMAIL_AUTH_ENABLED
RESEND_API_KEY
AUTH_EMAIL_FROM
```

### 9.4 AI

```text
AI_ENABLED
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY
DEEPSEEK_BASE_URL
DEEPSEEK_MATCH_MODEL
DEEPSEEK_WRITING_MODEL
DEEPSEEK_INTERVIEW_MODEL
AI_REQUEST_TIMEOUT_MS
AI_MAX_RETRIES
AI_MAX_CONCURRENCY
AI_MONTHLY_USAGE_LIMIT
```

`DEEPSEEK_API_KEY` already exists in Vercel Cloud. It remains server-only.

### 9.5 AI Quotas

```text
AI_USER_DAILY_LIMIT
AI_ANONYMOUS_IP_DAILY_LIMIT
AI_RESUME_JOB_DAILY_LIMIT
AI_COVER_JOB_DAILY_LIMIT
AI_INTERVIEW_QUESTION_LIMIT
AI_INTERVIEW_EVALUATION_LIMIT
```

### 9.6 Demo and Jobs

```text
ANONYMOUS_DEMO_ENABLED
LIVE_JOB_INGESTION_ENABLED
ADMIN_INGESTION_ENABLED
JOB_PROVIDER=mock
JOB_INGESTION_MAX_RESULTS
JOB_INGESTION_CONCURRENCY
JOB_INGESTION_TIMEOUT_MS
CRON_SECRET
```

### 9.7 Administration and Retention

```text
ADMIN_EMAILS
JOB_ACTIVE_DAYS
JOB_RETENTION_DAYS
AUDIT_RETENTION_DAYS
AI_USAGE_RETENTION_DAYS
```

### 9.8 Observability

```text
LOG_LEVEL=info
LOG_FORMAT=json
OTEL_ENABLED=true
OTEL_SERVICE_NAME=career-ai
SENTRY_ENABLED
SENTRY_DSN
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
SENTRY_TRACES_SAMPLE_RATE
```

`SENTRY_AUTH_TOKEN` is build/server-only and is used for source-map upload. Session Replay is disabled for the MVP.

### 9.9 Safety

Client bundles must never receive:

- Database credentials
- DeepSeek keys
- Resend keys
- OAuth secrets
- Cron secrets
- Admin allowlist details

## 10. Authentication Design

## 10.1 Auth.js Providers

Auth.js is configured with:

- GitHub OAuth
- Google OAuth
- Resend email magic links when `EMAIL_AUTH_ENABLED=true`

The existing user model is expanded to support Auth.js adapter tables:

- `users`
- `accounts`
- `sessions`
- `verification_tokens`

JWT-only sessions are not preferred because database-backed sessions support immediate account suspension and account deletion.

## 10.2 Account Linking

Safe-linking rule:

- OAuth identities link automatically only when the provider reports a verified email and Auth.js considers the flow trusted.
- Existing accounts are not silently linked on unverified email matches.
- Email sign-in uses normalized lowercase email.
- Duplicate normalized emails are prevented.

## 10.3 Admin Bootstrap

`ADMIN_EMAILS` is an environment allowlist.

At sign-in or admin authorization check:

1. Normalize current verified email.
2. Compare against the allowlist.
3. Treat a match as admin for authorization.
4. Persist or synchronize the `admin` role on the user row for audit visibility.
5. Removal from the allowlist removes effective admin access at the next authorization check, even if the stored role has not yet been synchronized.

The environment allowlist remains the root source for bootstrap authorization.

## 10.4 Account Status

`users.status`:

- `active`
- `disabled`
- `deletion_pending`

Disabled users cannot create new sessions or access protected routes.

## 10.5 Authorization Helpers

Central helpers:

```ts
requireUser()
requireActiveUser()
requireAdmin()
assertOwner(recordUserId, sessionUserId)
```

Domain services call these helpers or receive an already verified actor context.

Client-supplied `userId` is never trusted.

## 11. Feature Flags

Feature flags are server-side configuration values, not client authority.

```ts
type FeatureFlags = {
  aiEnabled: boolean;
  anonymousDemoEnabled: boolean;
  emailAuthEnabled: boolean;
  liveJobIngestionEnabled: boolean;
  adminIngestionEnabled: boolean;
};
```

Public clients may receive a safe projection for UI visibility.

Each risky operation checks its feature flag inside the domain service or protected handler, not only in the UI.

## 12. Anonymous Demo Design

Demo mode is isolated from authenticated production workflows.

### 12.1 Storage

- Browser-local state only
- Namespaced localStorage key
- No PostgreSQL writes
- No real authentication session
- No live AI requests
- No live job ingestion
- No access to authenticated routes or data

### 12.2 Data

Demo data comes from deterministic fixture modules under a demo-specific directory.

Production server components must not import demo fixtures.

### 12.3 Behavior

- UI visibly labels demo mode.
- Demo data can be reset.
- A sign-in call to action is always available.
- Disabling `ANONYMOUS_DEMO_ENABLED` removes access without code changes.
- Existing fixture-based UI logic may be adapted for demo mode, but must not remain the production source of truth.

## 13. Database Design

## 13.1 General Rules

- UUID primary keys throughout
- `timestamp with time zone`
- Explicit foreign keys
- Cascading deletion for private child records where appropriate
- Restricted deletion for shared or operational records
- User ownership on private records
- JSONB only for bounded structured payloads with schemas
- Normalized columns for frequently filtered or joined fields
- Check constraints for bounded scores and counters
- Unique indexes for idempotency
- GIN indexes for full-text search
- Forward-only Drizzle migrations

## 13.2 Enumerations

Proposed enums:

```text
user_role: user, admin
user_status: active, disabled, deletion_pending

claim_state:
  imported
  user_approved
  ai_suggested
  unsupported
  archived

job_status:
  discovered
  saved
  evaluating
  applying
  applied
  interviewing
  offered
  accepted
  rejected
  withdrawn
  declined
  archived

work_style:
  remote
  hybrid
  onsite
  unknown

artifact_type:
  resume
  cover_letter

artifact_state:
  generated
  working
  approved
  archived

interview_status:
  planned
  in_progress
  completed
  cancelled

background_job_status:
  queued
  running
  succeeded
  failed
  cancelled

ingestion_run_status:
  queued
  running
  partial
  succeeded
  failed

ai_request_status:
  started
  succeeded
  failed
  rate_limited
  disabled
```

## 13.3 Core Identity Tables

### `users`

```text
id uuid PK
email text unique normalized
name text nullable
image text nullable
role user_role default user
status user_status default active
created_at timestamptz
updated_at timestamptz
deleted_at timestamptz nullable
```

### Auth.js adapter tables

- `accounts`
- `sessions`
- `verification_tokens`

Use the Auth.js Drizzle adapter schema appropriate to the installed Auth.js version.

## 13.4 Profile and Evidence Tables

### `profiles`

One active profile per user.

```text
id uuid PK
user_id uuid FK unique
headline text
summary text
location text
target_roles jsonb string[]
preferred_locations jsonb string[]
work_preferences jsonb
salary_preferences jsonb
portfolio_links jsonb
completeness integer
created_at
updated_at
```

### `profile_sections`

Structured user data.

```text
id uuid PK
user_id uuid FK
profile_id uuid FK
kind text
content jsonb
claim_state claim_state
source_resume_id uuid nullable
sort_order integer
created_at
updated_at
```

Kinds include:

- experience
- education
- skill
- certification
- achievement
- project
- language
- link

### `resume_sources`

```text
id uuid PK
user_id uuid FK
profile_id uuid FK
filename text
media_type text
byte_size integer
text_content text
content_hash text
parser_version text
is_active boolean
created_at
deleted_at nullable
```

No binary column is permitted.

### `evidence_items`

```text
id uuid PK
user_id uuid FK
profile_id uuid FK
source_type text
source_id uuid nullable
title text
content text
skills jsonb string[]
claim_state claim_state
provenance jsonb
star jsonb nullable
created_at
updated_at
archived_at nullable
```

`provenance` identifies exact imported text ranges or user-entry sources when feasible.

## 13.5 Jobs and Ingestion Tables

### `job_postings`

Global normalized jobs, not duplicated per user.

```text
id uuid PK
provider text
external_id text nullable
canonical_url text nullable
source_url text nullable
source_name text
title text
company text
location text nullable
work_style work_style
description_text text
description_html text nullable sanitized
employment_type text nullable
salary_min integer nullable
salary_max integer nullable
salary_currency text nullable
salary_interval text nullable
date_posted timestamptz nullable
closing_date timestamptz nullable
content_hash text
search_vector tsvector generated or maintained
is_active boolean
last_seen_at timestamptz
expires_at timestamptz nullable
created_at
updated_at
```

Unique/index strategy:

- Unique provider + external ID when external ID exists
- Unique canonical URL when reliable
- Fallback dedupe on normalized fingerprint
- GIN index on search vector
- B-tree indexes on active state, posted date, company, location, and work style

### `user_jobs`

User-specific state for a global job.

```text
id uuid PK
user_id uuid FK
job_id uuid FK
status job_status
dismissed_at nullable
saved_at nullable
priority text nullable
notes text
created_at
updated_at
unique(user_id, job_id)
```

### `job_searches`

Saved or recent search criteria.

### `ingestion_runs`

```text
id uuid PK
provider text
trigger text
status ingestion_run_status
requested_by uuid nullable
parameters jsonb
started_at
finished_at nullable
received_count integer
inserted_count integer
updated_count integer
skipped_count integer
error_count integer
error_summary text nullable
created_at
```

### `ingestion_errors`

Bounded failure details with no secrets.

## 13.6 Fit Evaluation Tables

### `fit_evaluations`

Immutable evaluation snapshot.

```text
id uuid PK
user_id uuid FK
profile_id uuid FK
job_id uuid FK
score integer check 0..100
confidence text
deal_breaker boolean
recommendation text
honest_assessment text
strengths jsonb
gaps jsonb
requirement_coverage jsonb
evidence_refs jsonb
provider text
model text
prompt_version text
profile_fingerprint text
job_fingerprint text
created_at
```

A new evaluation is created when profile/job fingerprints change or user explicitly re-runs.

## 13.7 Applications and History

### `applications`

```text
id uuid PK
user_id uuid FK
profile_id uuid FK
job_id uuid FK
status job_status
applied_at nullable
submitted_url nullable
notes text
created_at
updated_at
unique(user_id, job_id)
```

### `application_status_events`

Append-only history:

```text
id uuid PK
user_id uuid FK
application_id uuid FK
from_status job_status nullable
to_status job_status
actor_user_id uuid nullable
source text
note text nullable
created_at
```

No correction deletes an event.

### `application_checklist_items`

Structured pre-submission checks.

## 13.8 Artifact Tables

### `application_artifacts`

Immutable generations for résumés.

```text
id uuid PK
user_id uuid FK
application_id uuid FK
artifact_type artifact_type
version integer
state artifact_state
content_markdown text
content_text text
content_structure jsonb
source_refs jsonb
provider text nullable
model text nullable
prompt_version text nullable
parent_artifact_id uuid nullable
created_at
approved_at nullable
archived_at nullable
unique(application_id, artifact_type, version)
```

For résumé:

- Each generated version is immutable.
- Working edits create a new or separately tracked working version.
- Approval records the approved state.
- Previous generations remain archived.

For cover letters:

- The current latest record is replaced transactionally or old records are archived.
- UI exposes only the latest version.
- Audit metadata may remain even if previous content is removed.

### `artifact_changes`

Transparent résumé change units.

```text
id uuid PK
artifact_id uuid FK
section_key text
original_text text
suggested_text text
reason text
job_requirement text nullable
evidence_refs jsonb
support_state claim_state
decision text: pending, accepted, rejected
decided_at nullable
created_at
```

## 13.9 Interview Tables

### `interview_sessions`

```text
id uuid PK
user_id uuid FK
application_id uuid FK
status interview_status
stage text
format text
scheduled_at nullable
participants jsonb
selected_evidence_ids jsonb
checklist jsonb
questions_to_ask jsonb
notes text
overall_score integer nullable
created_at
updated_at
completed_at nullable
```

### `interview_questions`

```text
id uuid PK
session_id uuid FK
sort_order integer
question text
category text
expected_focus text
evidence_refs jsonb
created_at
```

### `interview_answers`

```text
id uuid PK
question_id uuid FK unique
answer_text text
score integer nullable
feedback jsonb nullable
provider text nullable
model text nullable
created_at
updated_at
evaluated_at nullable
```

### `post_interview_reviews`

```text
id uuid PK
session_id uuid FK unique
questions_asked text
self_assessment text
signals text
feedback_received text
thank_you_draft text
follow_up_at timestamptz nullable
next_action text
created_at
updated_at
```

## 13.10 Outcomes and Learning

### `outcomes`

```text
id uuid PK
user_id uuid FK
application_id uuid FK
stage text
result text
feedback text nullable
compensation_notes text nullable
follow_up_at nullable
created_at
updated_at
```

Learning recommendations may be generated on request and stored as bounded snapshots or computed from current data.

## 13.11 AI Usage and Quotas

### `ai_usage_events`

```text
id uuid PK
user_id uuid nullable
anonymous_key_hash text nullable
feature text
provider text
model text
status ai_request_status
input_units integer nullable
output_units integer nullable
estimated_cost_micros bigint nullable
latency_ms integer nullable
request_fingerprint text
error_code text nullable
created_at
```

No raw prompt or response content.

### `rate_limit_buckets`

```text
scope_key text
feature text
window_start timestamptz
window_seconds integer
count integer
updated_at
primary key(scope_key, feature, window_start)
```

Atomic upsert increments count and rejects over-limit requests.

### `monthly_usage_buckets`

Aggregate cost/usage guard.

## 13.12 Background Jobs

### `background_jobs`

```text
id uuid PK
type text
status background_job_status
dedupe_key text nullable unique
payload jsonb
attempts integer
max_attempts integer
available_at timestamptz
locked_at nullable
locked_by text nullable
last_error text nullable
created_at
updated_at
completed_at nullable
```

Payloads contain entity IDs and bounded parameters, not full résumé or prompt text.

## 13.13 Audit Events

### `audit_events`

```text
id uuid PK
actor_user_id uuid nullable
actor_type text
action text
entity_type text
entity_id uuid nullable
metadata jsonb
ip_hash text nullable
created_at
```

Metadata is allowlisted by action to prevent accidental sensitive logging.

## 14. Migration Strategy

No meaningful production data must survive, but the migration remains explicit and reviewable.

### 14.1 Approach

1. Add new enums and tables.
2. Extend existing tables where compatible.
3. Add replacement global job and user-job tables.
4. Backfill only fields that have a safe mapping.
5. Remove or archive obsolete fixture-era schema in a later migration within the PR.
6. Validate constraints and indexes.
7. Add deterministic development seed tooling.
8. Document reset instructions for non-production environments.

### 14.2 Constraints

- No hand-edited production SQL outside committed migrations.
- Generated Drizzle migration SQL must be reviewed.
- Destructive operations require comments in the migration and README.
- Application deployment must not assume schema exists before migration.
- Vercel deployment instructions must specify migration execution order.

## 15. Data Access and Domain Services

## 15.1 Repository Contract

Repositories contain only persistence concerns.

Example:

```ts
export interface JobRepository {
  findVisibleJobs(query: JobSearchQuery): Promise<Page<JobSummary>>;
  findById(jobId: string): Promise<JobPosting | null>;
  upsertNormalized(input: NormalizedJob): Promise<JobPosting>;
  setUserState(input: SetUserJobState): Promise<UserJobState>;
}
```

Repositories do not:

- Read sessions
- Decide permissions
- Call AI
- Render UI
- Interpret feature flags

## 15.2 Domain Service Contract

Domain services orchestrate:

- Actor authorization
- Validation
- Feature checks
- Quota consumption
- Transactions
- Repository calls
- Adapter calls
- Audit events

Example:

```ts
export async function evaluateJobFit(
  actor: Actor,
  input: EvaluateJobFitInput,
  deps: MatchDependencies
): Promise<FitEvaluation>
```

## 15.3 Transactions

Use transactions for:

- Creating application plus initial status event
- Moving application status plus timeline and audit events
- Accepting résumé changes plus producing approved artifact
- Replacing latest cover letter
- Deleting résumé source and dependent imported evidence
- Account deletion
- Quota consumption plus AI usage start record
- Job ingestion upsert batches where practical

## 16. Client State Design

The existing journey provider is reduced to transient UI state or replaced with narrower providers.

Permitted client state:

- Open panel or modal
- Active tab
- Unsaved textarea value
- Selected comparison job IDs
- Optimistic Kanban position
- Pending accepted/rejected résumé changes before submit
- Demo-only domain state

Not permitted as production authority:

- Profile
- Jobs
- Applications
- Interview records
- Artifact versions
- Match evaluations
- Status history
- Admin records

Server actions return typed results and trigger `revalidatePath` or `revalidateTag`.

## 17. Server Actions and Route Handlers

### 17.1 Server Actions

Use for authenticated same-origin mutations:

- Update profile
- Import parsed résumé result
- Save/dismiss job
- Manual job import
- Run fit evaluation
- Generate résumé
- Decide résumé changes
- Generate/update cover letter
- Create/update interview session
- Evaluate answer
- Move application status
- Update outcome
- Account deletion
- Admin mutations

### 17.2 Route Handlers

Use for:

- Auth.js callback routes
- Cron endpoints
- File downloads
- Health checks
- Future inbound provider webhooks

### 17.3 Action Results

Standard result shape:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string[]>;
        retryAfterSeconds?: number;
      };
    };
```

User-visible messages are safe and stable. Logs use internal error details and correlation IDs.

## 18. Résumé Import Design

## 18.1 Supported Types

- PDF
- DOCX
- Maximum 10 MB

Proposed libraries must be selected based on active maintenance and server compatibility during implementation.

Likely adapters:

- PDF text extraction library
- `mammoth` or equivalent for DOCX extraction

Library choice is isolated behind:

```ts
interface ResumeParser {
  supports(mediaType: string, filename: string): boolean;
  parse(buffer: Buffer): Promise<ParsedResumeDocument>;
}
```

## 18.2 Security Controls

- Validate extension and declared MIME type.
- Detect parser mismatch.
- Enforce size before reading entire body where possible.
- Bound page count, extracted character count, parser time, and memory.
- Strip embedded scripts and active content.
- Never execute document macros.
- Discard the binary in a `finally` block.
- Do not log extracted text.

## 18.3 First Import

First import flow:

1. Parse file.
2. Normalize text.
3. Persist `resume_sources`.
4. Structure content with deterministic parsing and optional AI.
5. Insert imported evidence and profile sections.
6. Recalculate completeness.
7. Discard file bytes.
8. Display imported result for correction.

## 18.4 Replacement Import

Replacement flow:

1. Parse new file into a temporary in-memory or temporary database result.
2. Show extracted-text preview and change summary.
3. User confirms replacement.
4. Transaction marks previous source inactive.
5. Imported sections/evidence tied exclusively to prior source are archived or replaced.
6. Independently user-authored evidence remains.
7. New source becomes active.

## 19. Job Provider Design

## 19.1 Provider Contract

```ts
interface JobProvider {
  readonly name: string;
  search(input: ProviderSearchInput): Promise<ProviderSearchResult>;
}
```

Result includes:

- Raw provider records
- Provider errors
- Request metadata
- Partial success status

## 19.2 Providers

### Mock provider

- Deterministic
- Used in tests and local demos
- Never makes network requests

### Manual provider

- Converts user-entered job information into normalized records
- Always available to authenticated users

### Experimental JobSpy Node adapter

- Installed only if compatible with the repository runtime
- Wrapped in a dynamic import
- Disabled unless `LIVE_JOB_INGESTION_ENABLED=true`
- Never used by tests
- Has strict timeout, result cap, and concurrency controls
- Records partial failures
- Must not bypass authentication walls
- May be omitted at runtime when unsupported, while keeping interface compatibility

## 19.3 Ingestion Flow

```text
Vercel Cron / Admin Trigger
        ↓
Authorization and feature checks
        ↓
Create ingestion_run
        ↓
Create background_job with dedupe key
        ↓
Worker claims job
        ↓
Provider search
        ↓
Normalize and sanitize
        ↓
Deduplicate and upsert
        ↓
Update ingestion_run
        ↓
Audit privileged trigger
```

## 19.4 Dedupe

Priority:

1. Provider + external ID
2. Canonical URL
3. Normalized source URL
4. Fingerprint of company, title, location, and description

## 20. PostgreSQL Background Job Design

## 20.1 Claiming Jobs

Workers claim jobs using a transaction and `FOR UPDATE SKIP LOCKED`.

A bounded worker invocation:

1. Claims up to N available jobs.
2. Sets `locked_at` and `locked_by`.
3. Processes within Vercel duration limits.
4. Marks success or schedules retry.
5. Stops before timeout.

## 20.2 Invocation

- Cron endpoint processes ingestion and maintenance jobs.
- Admin trigger may enqueue and optionally start a bounded worker.
- Interactive requests do not run unbounded ingestion loops.

## 20.3 Retry

- Exponential backoff
- Max attempts by job type
- Stable error code
- Last safe error summary
- Manual retry for failed admin-visible jobs

## 20.4 Idempotency

Dedupe keys:

```text
ingestion:{provider}:{searchHash}:{timeBucket}
maintenance:{task}:{date}
export:{artifactId}:{format}:{version}
```

## 21. AI Provider Design

## 21.1 Provider Interface

```ts
interface AiProvider {
  generateStructured<T>(
    request: StructuredAiRequest<T>
  ): Promise<AiResponse<T>>;

  generateText(
    request: TextAiRequest
  ): Promise<AiResponse<string>>;
}
```

Domain modules do not import an OpenAI or DeepSeek SDK directly.

## 21.2 DeepSeek Adapter

The DeepSeek adapter:

- Reads `DEEPSEEK_API_KEY`
- Uses configurable base URL and model IDs
- Supports OpenAI-compatible transport internally if useful
- Applies request timeout
- Applies bounded retry only to safe transient failures
- Captures request ID, latency, token usage, and model
- Does not log prompt or response bodies
- Maps provider errors to domain error codes

## 21.3 Fake Adapter

The fake adapter:

- Returns deterministic structured values
- Supports configurable error scenarios
- Drives unit, integration, and browser tests
- Powers anonymous demo mode
- Produces evidence references consistent with fixtures

## 21.4 Prompt Management

Prompts are versioned modules:

```text
lib/ai/prompts/
├── match/v1.ts
├── resume/v1.ts
├── cover-letter/v1.ts
├── interview-questions/v1.ts
├── interview-evaluate/v1.ts
└── learning/v1.ts
```

Each prompt exports:

- Version
- System instructions
- Input formatter
- Output schema
- Safety rules

## 21.5 Structured Output

Zod validates every structured response.

On invalid output:

1. One repair attempt may be made when safe.
2. If still invalid, return a controlled failure.
3. Do not persist partial invalid data.
4. Keep the latest successful artifact/evaluation unchanged.

## 21.6 Evidence Packet

All candidate-writing calls receive an evidence packet assembled server-side:

```ts
type EvidencePacket = {
  profileSummary: string;
  evidence: Array<{
    id: string;
    title: string;
    content: string;
    provenance: string;
    claimState: "imported" | "user_approved";
  }>;
  prohibitedClaims: string[];
};
```

Unsupported and archived evidence is excluded from approved-generation context.

## 22. AI Quota Design

## 22.1 Scope Keys

- Authenticated user: `user:{userId}`
- Anonymous demo or public endpoint: hashed IP plus rotating salt
- Global monthly guard: `global:{year-month}`

## 22.2 Default Limits

Proposed defaults:

```text
Authenticated AI requests per day: 40
Anonymous live AI requests per day: 0
Résumé generations per user/job/day: 5
Cover-letter generations per user/job/day: 5
Interview questions per session: 10
Interview answer evaluations per session: 15
Maximum concurrent AI requests per user: 2
Maximum global concurrent requests per instance: 8
AI request timeout: 45 seconds
AI retry count: 1
```

Demo mode uses the fake provider and does not consume live AI quotas.

All values remain configurable.

## 22.3 Atomic Consumption

Quota check and increment occur atomically before provider execution.

Failed transient calls are recorded. Whether they consume quota is policy-based:

- Provider success: consume
- Provider validation failure after valid provider response: consume
- Platform-disabled request: do not consume
- Pre-request rate limit: do not consume additional quota
- Network failure before provider acceptance: may be refunded transactionally

## 23. Fit Matching Design

## 23.1 Input

- Active profile
- Approved/imported evidence
- Target job
- Job requirements extracted from description
- User preferences

## 23.2 Output Schema

```ts
const FitEvaluationSchema = z.object({
  score: z.number().int().min(0).max(100),
  confidence: z.enum(["low", "medium", "high"]),
  strengths: z.array(EvidenceBackedPointSchema),
  gaps: z.array(GapSchema),
  requirements: z.array(RequirementCoverageSchema),
  recommendations: z.array(z.string()),
  dealBreakers: z.array(z.string()),
  honestAssessment: z.string(),
});
```

## 23.3 Deterministic Guardrails

Before AI:

- Extract known job requirements.
- Match direct skill terms.
- Apply preference deal-breakers.
- Bound evidence supplied.

After AI:

- Verify referenced evidence IDs exist.
- Reject invented evidence IDs.
- Clamp scores.
- Mark low confidence when evidence is sparse.
- Persist immutable snapshot.

## 24. Résumé Tailoring Design

## 24.1 Generation

Input:

- Original source résumé
- Approved profile evidence
- Selected job
- Latest fit evaluation
- Controlled résumé template

Output:

- Structured résumé document
- Proposed changes
- ATS keywords
- Warnings
- Match rationale

## 24.2 Change Review

Client receives pending changes and displays:

- Original
- Suggested
- Reason
- Job requirement
- Evidence chips
- Support state
- Accept/reject control

Decisions are submitted in one transaction or bounded batches.

## 24.3 Unsupported Claims

If response contains a claim without valid evidence:

- Mark `unsupported`
- Prevent acceptance
- Offer “Add evidence” workflow
- Never include it in approved export

## 24.4 Immutable History

- Every AI generation receives a version.
- Change decisions are persisted.
- Approved output creates or marks an approved immutable artifact.
- Manual editing creates a derived working version.
- Regeneration creates a new version and does not overwrite approved history.

## 24.5 Controlled Template

One résumé template:

- Semantic heading hierarchy
- ATS-safe single-column layout
- No tables for core content
- Consistent date and bullet formatting
- Print-safe CSS
- Template version stored with artifact

## 25. Cover-Letter Design

## 25.1 Context

Allowed context:

- Approved/imported candidate evidence
- Persisted job description
- User-approved job metadata
- Selected style

No web research is performed.

## 25.2 Output

Structured letter:

```ts
type CoverLetterDocument = {
  greeting: string;
  paragraphs: Array<{
    text: string;
    rationale: string;
    evidenceRefs: string[];
  }>;
  closing: string;
};
```

## 25.3 Persistence

- One user-visible latest version per application
- Explicit regeneration replaces latest visible content
- Previous content may be archived briefly for transactional safety but is not a user-facing version history
- Manual edits update latest content with audit metadata

## 25.4 Template

One controlled cover-letter template with:

- Contact header
- Date
- Recipient/company block
- Body
- Closing
- Print-safe styling

## 26. Interview Design

## 26.1 Session State

```text
planned → in_progress → completed
                    ↘ cancelled
```

## 26.2 Question Generation

Inputs:

- Job requirements
- Interview stage
- Evidence packet
- Requested categories
- Configured question count

Question categories may include:

- Behavioral
- Role-specific
- Leadership
- Collaboration
- Technical/problem-solving
- Motivation
- Gap clarification

## 26.3 Answer Evaluation

Evaluation schema includes:

- Overall score
- STAR booleans and notes
- Specificity
- Metrics
- Relevance
- Clarity
- Strengths
- Improvements
- Evidence-backed improved outline

The system must not generate a polished answer containing unsupported facts.

## 26.4 Post-Interview

The review page saves:

- Actual questions
- Assessment
- Signals
- Feedback
- Thank-you draft
- Follow-up date
- Next action

Thank-you draft follows the same evidence policy as cover letters.

## 27. Application Tracker Design

## 27.1 State Machine

Allowed primary progression:

```text
discovered
  → saved
  → evaluating
  → applying
  → applied
  → interviewing
  → offered
  → accepted
```

Alternate terminal states:

```text
rejected
withdrawn
declined
archived
```

The domain service validates transitions.

Reasonable backward corrections are allowed and create new events.

## 27.2 Kanban

Use `dnd-kit`.

Client flow:

1. User drags card.
2. Client displays optimistic position.
3. Server action validates transition and ownership.
4. Transaction updates application and appends event.
5. Success confirms state.
6. Failure rolls back and announces error.

Keyboard alternative:

- “Move to” menu or buttons
- Same server action
- Full screen-reader announcement

## 27.3 Dashboard Queries

Server-side aggregate queries provide:

- Counts by status
- Next best action
- Upcoming interviews
- Stale applications
- Incomplete artifacts
- Follow-ups due

No full journey dataset is loaded into one client provider.

## 28. Learning and Strategy Design

A learning service aggregates the user's own data:

- Applications by status
- Repeated fit gaps
- Interview category scores
- Stale follow-ups
- Outcome history
- Artifact completion

AI-generated recommendations receive only aggregate and approved evidence context.

Recommendations are advisory and contain:

- Basis
- Confidence
- Suggested action
- Affected entity IDs
- No causal hiring claims

## 29. Search Design

Use PostgreSQL full-text search.

### 29.1 Search Document

Weighted fields:

- Title: highest
- Company: high
- Description: normal
- Location: lower
- Skills or normalized tags: high

### 29.2 Query

- `websearch_to_tsquery('english', query)`
- GIN index
- Prefix search only where bounded
- Escaped fallback for very short terms
- Indexed filters for active status, location, work style, date, salary, source

### 29.3 Pagination

Cursor pagination preferred using:

- Ranking
- Posted date
- Stable job ID tie-breaker

Offset pagination is acceptable for admin tables with bounded sizes.

## 30. Export Design

## 30.1 Formats

Résumé:

- Markdown
- Plain text
- DOCX
- PDF
- Clipboard

Cover letter:

- Plain text
- DOCX
- PDF
- Clipboard

## 30.2 Generation

### Markdown/plain text

Generated from normalized artifact structure.

### DOCX

Generated server-side using a controlled template and a maintained DOCX library.

### PDF

Preferred order:

1. Generate sanitized controlled HTML from artifact structure.
2. Render through a server-compatible PDF approach.
3. If browser-based PDF generation is incompatible with Vercel limits, use a pure document/PDF library with matching template semantics.

The implementation must not introduce a fragile Chromium dependency without proving Vercel compatibility.

## 30.3 Download Authorization

Export route:

1. Requires active user.
2. Loads artifact by ID.
3. Verifies ownership.
4. Ensures artifact is approved where required.
5. Generates or retrieves bounded output.
6. Returns safe `Content-Disposition`.
7. Emits audit event.

## 31. Administration Design

## 31.1 Admin Dashboard

Shows:

- Recent ingestion runs
- Failed background jobs
- AI request success/failure summary
- Estimated usage
- Active/disabled user counts
- Recent audit events
- Current feature status

## 31.2 Ingestion

Admin can:

- Trigger mock provider in non-production
- Trigger enabled live provider
- View run detail
- Retry failed run
- Deactivate job

## 31.3 Users

Admin can:

- Search by email
- View account status and created date
- Disable or re-enable account
- Trigger no impersonation
- Avoid viewing private résumé content

## 31.4 Audit

Filters:

- Actor
- Action
- Entity type
- Date range

Audit metadata is human-readable but redacted.

## 32. Privacy and Deletion Design

## 32.1 Account Deletion

Flow:

1. Re-authentication or recent-session confirmation
2. Typed confirmation
3. Transaction marks `deletion_pending`
4. Invalidate sessions
5. Delete private child data
6. Delete or anonymize user identity
7. Retain minimal security audit event
8. Sign out

Given the MVP scale, deletion may run synchronously if bounded; otherwise enqueue a background job.

## 32.2 Résumé Deletion

- Deletes or archives active résumé source text.
- Deletes imported profile sections and evidence solely tied to it.
- Preserves user-authored evidence unless selected.
- Invalidates future AI context.
- Existing generated artifacts may remain only when user explicitly keeps them; design should warn that they contain derived content.

## 32.3 Logging

Never log:

- Résumé text
- Interview answers
- Cover letters
- Generated résumés
- Raw prompts
- Session tokens
- API keys

## 32.4 Retention Jobs

Daily maintenance job:

- Deactivates stale jobs after 7 days without refresh
- Deletes inactive jobs after 90 days when unreferenced
- Retains referenced jobs for application history
- Deletes expired rate buckets
- Deletes audit events after 365 days unless security retention applies
- Deletes aggregate AI usage events after 365 days
- Releases stale background-job locks

## 33. Security Design

### 33.1 Validation

All actions and handlers use Zod schemas.

### 33.2 Ownership

Every private repository query includes `user_id` where applicable.

Avoid:

```ts
findApplicationById(applicationId)
```

Prefer:

```ts
findApplicationForUser(applicationId, userId)
```

### 33.3 HTML Safety

- Job description HTML is sanitized or rendered as text/Markdown.
- Generated content is stored as structured data or Markdown.
- User-provided HTML is not rendered directly.
- Export HTML is generated only from controlled templates.

### 33.4 CSRF and Origin

- Use Auth.js and Next.js same-origin protections.
- Validate origin for sensitive custom route handlers.
- Use POST for mutations.
- Cron endpoints require bearer secret.

### 33.5 SSRF

Manual job import does not fetch arbitrary URLs in the initial implementation.

A source URL is stored as metadata. The user pastes description content manually.

### 33.6 File Security

- No persistent binaries
- No macros
- No arbitrary decompression without size limits
- Parser timeouts and extracted-text bounds

### 33.7 Secret Handling

- Central environment validation
- Redacted errors
- No client exposure
- README safe placeholders only

## 34. Accessibility Design

- Preserve visible focus indicators.
- Ensure all controls have accessible names.
- Use semantic headings and landmarks.
- Announce async AI, import, export, and status updates through live regions.
- Provide non-drag Kanban movement.
- Ensure score and provenance are expressed in text, not color alone.
- Support reduced motion.
- Keep dialogs focus-trapped and restorable.
- Associate validation errors with fields.
- Use native elements before custom roles.
- Test critical flows with axe or equivalent and Playwright keyboard checks.

## 35. Performance Design

- Server-render initial page data.
- Paginate jobs and audit tables.
- Select only needed columns.
- Avoid global client hydration of domain state.
- Cache public static pages.
- Do not cache user-private data across users.
- Use request memoization for repeated within-request lookups.
- Bound résumé and job text sent to AI.
- Use DB indexes described above.
- Avoid N+1 queries through joins or batched repository methods.
- Stream slow page sections where appropriate.
- Dynamically import heavy client libraries such as `dnd-kit` only where used.

## 36. Observability, Logging, and Exception Tracing

## 36.1 Vercel Hobby operating model

The production deployment uses Vercel Cloud Hobby. Native Runtime Logs are used for immediate diagnosis, but their short retention means they are not the durable incident system. Vercel Log and Trace Drains are not available on Hobby and are not required.

Required stack:

```text
Vercel Runtime Logs
        +
@vercel/otel and OpenTelemetry custom spans
        +
Sentry exception monitoring, source maps, releases, and sampled traces
        +
PostgreSQL audit, AI usage, ingestion, and background-job records
```

## 36.2 Centralized logger

Create `lib/observability/` with:

```text
logger.ts
context.ts
errors.ts
redact.ts
sentry.ts
tracing.ts
wrappers.ts
```

The logger emits one-line JSON and automatically attaches safe Vercel metadata when available: environment, region, deployment ID, branch, and commit SHA. Event names use stable dot notation such as `resume.parse.failed`, `ai.match.failed`, and `background_job.failed`.

## 36.3 Correlation context

Every server action, route handler, cron request, background-job attempt, AI request, parser call, and export receives a validated correlation ID. The ID is propagated to logger events, Sentry tags, OpenTelemetry spans, AI usage events, ingestion runs, and user-safe error references.

## 36.4 Stable errors

Use typed application errors with public code, safe message, retryability, correlation ID, internal cause, and safe metadata. Codes include authentication, authorization, validation, database, AI timeout/rate-limit/invalid-response, résumé parsing, job-provider, export, background-job, cron, rate-limit, feature-disabled, and internal-error categories.

## 36.5 Redaction

Use allowlist-based structured metadata. Never log résumé text, cover letters, interview answers, raw prompts or AI responses, email addresses, cookies, authorization headers, tokens, keys, database URLs, SQL parameters, uploaded bytes, or arbitrary bodies. Redaction must handle nested and circular objects and must never throw.

## 36.6 Vercel Runtime Logs

Use Runtime Logs for recent incident debugging. Emit batch summaries instead of row-level noise, keep well below Vercel per-request log limits, disable debug logs in production, and include a correlation ID in every warning and error. README instructions shall explain filtering by environment, deployment, branch, route, status, request ID, trace ID, and correlation ID.

## 36.7 OpenTelemetry

Install `@vercel/otel` and `@opentelemetry/api`, initialize from root `instrumentation.ts`, and add custom spans for authentication, profile operations, résumé parsing, job search/import/ingestion, DeepSeek calls, résumé and cover-letter generation, interview evaluation, application status moves, exports, background jobs, and admin operations.

Custom spans must run in the Node.js runtime. Span attributes are restricted to safe IDs, operation names, duration, provider/model, media type, byte size, retry attempt, and stable error codes.

## 36.8 Sentry

Use `@sentry/nextjs` for server, client, request, and background-job exceptions. Configure App Router request-error capture, `app/global-error.tsx`, route error boundaries where useful, and production source-map upload through `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT`. Use the Vercel commit SHA as the release and Vercel environment as the Sentry environment.

Required privacy defaults:

```text
sendDefaultPii=false
replaysSessionSampleRate=0
replaysOnErrorSampleRate=0
production traces sample rate=0.10 initially
```

Apply `beforeSend` redaction, omit request bodies on sensitive routes, avoid form-value breadcrumbs, and tag events with correlation ID and stable error code.

## 36.9 Observability wrappers

Provide shared wrappers:

```text
observedAction
observedRoute
observedBackgroundJob
withSpan
captureOperationalException
```

Each wrapper establishes context, starts a span, measures duration, maps known errors, emits one completion or failure event, captures unexpected exceptions in Sentry, closes the span in `finally`, and returns only safe response data.

## 36.10 Error boundaries

Add `app/error.tsx`, `app/global-error.tsx`, and `app/not-found.tsx`. Error pages capture unexpected exceptions, present an accessible safe message, show a short correlation reference, and provide retry or navigation without exposing raw exception text.

## 36.11 Alerts

Initial alert procedures cover repeated unhandled exceptions, HTTP 5xx rates above baseline, AI provider failure spikes, invalid structured AI outputs, parser failures, final background-job failures, stale job locks, missed cron runs, database failures, export failures, and authentication anomalies. Sentry alerts are the durable baseline on Hobby.

## 36.12 Persistent operational records

The admin dashboard reads persistent operational state from `ai_usage_events`, `ingestion_runs`, `background_jobs`, and `audit_events`. It links safe correlation IDs but does not duplicate Sentry payloads or user content. PostgreSQL is not the primary exception sink because database failures must still be observable.

## 36.13 Tests

Tests verify one-line JSON output, severity mapping, correlation propagation, redaction of prohibited fields, safe typed error responses, Sentry sanitization through mocks, OpenTelemetry span closure, safe error-boundary rendering, and that logger or database failures do not hide the original exception.

## 36.14 Runbooks

README or operations documentation explains Hobby retention limits, locating Vercel Runtime Logs, searching by correlation ID, inspecting Sentry releases and stack traces, verifying source maps, inspecting spans, and debugging DeepSeek, parsing, ingestion, exports, and background jobs.

## 36.15 Future upgrade path

Vercel Pro, Observability Plus, Log/Trace Drains, Axiom, Datadog, New Relic, and Session Replay are optional future upgrades. Structured logs and OpenTelemetry keep that migration possible without changing domain services.

## 37. Error Handling

Stable error categories:

```text
AUTH_REQUIRED
FORBIDDEN
ACCOUNT_DISABLED
NOT_FOUND
VALIDATION_FAILED
RATE_LIMITED
FEATURE_DISABLED
AI_PROVIDER_UNAVAILABLE
AI_RESPONSE_INVALID
DOCUMENT_UNSUPPORTED
DOCUMENT_TOO_LARGE
DOCUMENT_PARSE_FAILED
EXPORT_FAILED
JOB_PROVIDER_UNAVAILABLE
CONFLICT
INTERNAL_ERROR
```

The UI provides:

- User-safe explanation
- Retry when appropriate
- Correlation ID for support
- No stack traces or provider secrets

## 38. Caching and Revalidation

- Private queries are dynamic by default.
- Use `revalidatePath` after mutations.
- Use tags only where cache boundaries are explicit.
- Public landing/privacy pages may be static.
- Job-list caching, if added, must not include user-specific saved/dismissed state in shared cache entries.
- Admin pages are uncached.

## 39. Testing Strategy

## 39.1 Unit Tests

Cover:

- Status transition policy
- Profile completeness
- Evidence eligibility
- Claim support validation
- Job normalization and dedupe
- Quota calculations
- Feature flags
- Prompt schemas
- Export mapping
- Retention rules

## 39.2 Repository Integration Tests

Run against a dedicated PostgreSQL test database or disposable schema.

Cover:

- Ownership-scoped reads
- Transactions
- Unique constraints
- Full-text search
- Job upsert
- Quota atomicity
- Background-job claiming
- Cascade deletion
- Status event append

## 39.3 Adapter Contract Tests

Shared contracts for:

- AI provider
- Job provider
- Résumé parser
- Export generator
- Email sender

Live services are not required.

## 39.4 Server Action and Route Tests

Cover:

- Authentication
- Validation
- Authorization
- Feature flags
- Rate limiting
- Safe error mapping
- Cron secret
- Export ownership

## 39.5 Playwright

Add Playwright and deterministic test mode.

Critical flows match the approved requirements.

Playwright uses:

- Seeded test database
- Fake AI provider
- Mock job provider
- Test authentication helper or controlled credentials
- No real Resend or OAuth calls
- Fixed clock where needed

## 39.6 Accessibility

- Automated axe checks on major pages
- Keyboard Kanban test
- Focus management test
- Form error association
- Live-region status assertions

## 39.7 CI Commands

Required:

```text
npm run lint
npm run typecheck
npm test
npm run build
npm run db:check
npm run test:e2e
```

Additional scripts may include:

```text
npm run test:unit
npm run test:integration
npm run test:a11y
npm run db:generate
npm run db:migrate
npm run db:seed
```

## 40. Package Additions

Expected package categories:

- Auth.js Drizzle adapter if not already present
- Resend
- PDF parser
- DOCX parser
- DOCX generator
- PDF generator or compatible renderer
- `@dnd-kit/core` and supporting packages
- Playwright
- Accessibility testing package
- `@vercel/otel` and `@opentelemetry/api`
- `@sentry/nextjs`
- HTML sanitizer if job HTML is retained

Package versions must be pinned to compatible, reviewed versions rather than using unbounded `latest` for new critical dependencies.

The implementation should consider replacing existing `latest` ranges with stable pinned versions if feasible within the PR.

## 41. Deployment Design

## 41.1 Delivery

Codex:

1. Branches from current `main`.
2. Implements atomic commits.
3. Pushes branch.
4. Opens one PR.
5. Does not merge.

## 41.2 Vercel

- `main` remains the production deployment branch.
- Preview deployments use Preview environment variables.
- Production uses Production environment variables.
- Node runtime is selected for heavy routes.
- Cron endpoints are configured in `vercel.json`.
- All new environment variables are documented.

## 41.3 Migration Execution

Recommended deployment order:

1. Configure new environment variables with risky features disabled.
2. Apply database migrations.
3. Deploy application.
4. Verify health, auth, manual job import, and mock AI.
5. Enable email auth if configured.
6. Enable live AI after smoke test.
7. Keep live job ingestion disabled until separately verified.
8. Enable admin ingestion only after live provider validation.

## 42. Atomic Commit Plan

The single PR should contain commits in this order:

1. `chore(spec): add approved journey specifications`
2. `feat(db): redesign schema and migrations`
3. `feat(auth): add providers, sessions, roles, and authorization`
4. `feat(core): add repositories, services, flags, audit, and quotas`
5. `feat(profile): persist profile and resume import`
6. `feat(jobs): add search, manual import, and provider contracts`
7. `feat(ai): add DeepSeek provider and fit evaluation`
8. `feat(resume): add transparent tailoring and artifact history`
9. `feat(cover): add latest cover letter and exports`
10. `feat(interview): add structured interview workflows`
11. `feat(tracker): add persisted Kanban, timeline, and outcomes`
12. `feat(admin): add operational admin screens`
13. `feat(demo): isolate browser-local demo mode`
14. `feat(observability): add structured logs, OTel, Sentry, and error boundaries`
15. `test(e2e): add Playwright critical flows`
16. `docs: document Vercel configuration, observability, and operations`
17. `chore: final accessibility, security, and build hardening`

Commit grouping may vary slightly, but dependencies and reviewability must remain clear.

## 43. Key Sequence Flows

## 43.1 Fit Evaluation

```text
User selects Evaluate
  → server action validates input
  → require active user
  → load owned profile and visible job
  → check AI flag
  → consume quota atomically
  → build evidence packet
  → call DeepSeek adapter
  → validate response
  → verify evidence references
  → persist immutable evaluation
  → record AI usage and audit event
  → revalidate job/application pages
```

## 43.2 Application Status Move

```text
Drag or keyboard move
  → optimistic client state
  → server action
  → require user
  → load application by applicationId + userId
  → validate transition
  → transaction:
       update application
       append status event
       append audit event
  → success: revalidate
  → failure: rollback optimistic state and announce
```

## 43.3 Résumé Import Replacement

```text
Upload replacement
  → validate and parse transiently
  → create preview token/result
  → display extracted text and change summary
  → user confirms
  → transaction:
       archive old source-linked imported data
       insert new source text
       insert normalized sections/evidence
       preserve independent user evidence
       recalculate completeness
       audit replacement
  → discard binary
```

## 43.4 Background Ingestion

```text
Cron
  → verify secret
  → verify live ingestion flag
  → create run + enqueue deduped job
  → worker claims job
  → provider search with timeout
  → normalize/sanitize/dedupe
  → upsert in batches
  → finalize run
  → expose result to admin
```

## 44. Requirement Traceability by Module

| Module | Primary requirement groups |
|---|---|
| Auth and authorization | AUTH, BR-006, ADMIN-001 |
| Profile and import | PROF, RES, BR-001 to BR-004 |
| Jobs and ingestion | JOB, FIX, DEP |
| AI provider and quotas | AI, MATCH, NFR-SEC |
| Résumé tailoring | TAILOR, BR-001 to BR-004 |
| Cover letter | COVER |
| Interview | INT |
| Tracker | TRACK, BR-008 |
| Learning | LEARN |
| Admin | ADMIN |
| Privacy and retention | PRIV, NFR-PRIV |
| Observability and exception tracing | NFR-OBS, NFR-REL |
| Accessibility | NFR-A11Y |
| Testing and deployment | Quality gates, DEP |

`tasks.md` must map every task to exact requirement IDs.

## 45. Architecture Decisions

### ADR-001 — Modular monolith

Accepted because separate services would add unnecessary MVP complexity.

### ADR-002 — Neon PostgreSQL

Accepted as the durable provider because it already matches the repository and Vercel deployment model.

### ADR-003 — UUID primary keys

Accepted to preserve existing identity conventions and safe external references.

### ADR-004 — Server actions → services → repositories

Accepted to separate presentation, business policy, and persistence.

### ADR-005 — PostgreSQL-backed quotas and jobs

Accepted to avoid Redis and managed queue dependencies.

### ADR-006 — DeepSeek behind provider interface

Accepted to avoid provider lock-in and keep deterministic tests.

### ADR-007 — Browser-local anonymous demo

Accepted to isolate demo data and external costs.

### ADR-008 — Experimental Node JobSpy adapter disabled by default

Accepted because crawling reliability and platform policy risk must not block the MVP.

### ADR-009 — Immutable résumé history

Accepted because evidence provenance and user approval are core product values.

### ADR-010 — One controlled template per artifact

Accepted to reduce export complexity and improve consistency.

### ADR-011 — PostgreSQL full-text search

Accepted for MVP scale and operational simplicity.

### ADR-012 — dnd-kit with accessible fallback

Accepted for usable Kanban interaction without sacrificing keyboard access.

### ADR-013 — Playwright

Accepted because full browser workflows and authorization boundaries require end-to-end coverage.

### ADR-014 — Vercel Runtime Logs, OpenTelemetry, and Sentry

Accepted because Hobby Runtime Logs are short-lived and Hobby does not provide Drains. Native logs provide immediate diagnosis, OpenTelemetry provides portable tracing, and Sentry provides durable exception grouping, source maps, releases, and alerts.

### ADR-015 — Session Replay disabled

Accepted because authenticated pages contain sensitive résumé, application, and interview data.

## 46. Risks and Mitigations

### Risk: Full MVP in one pull request

Mitigation:

- Atomic commits
- Strict module boundaries
- Feature flags
- Continuous passing gates
- One capability completed before beginning dependent capability
- PR checklist by requirement group

### Risk: Vercel duration limits

Mitigation:

- Bounded synchronous calls
- PostgreSQL job table
- Short worker invocations
- Strict provider timeout
- No unbounded crawling loop

### Risk: JobSpy instability

Mitigation:

- Disabled by default
- Experimental adapter
- Manual import always available
- Mock provider for tests
- Admin-visible failures

### Risk: AI hallucinations

Mitigation:

- Approved evidence packet
- Structured response schemas
- Evidence-reference verification
- Unsupported state
- User approval gate
- Immutable audit trail

### Risk: Heavy PDF/DOCX processing

Mitigation:

- 10 MB cap
- Parser adapters
- transient binaries
- bounded extracted text
- Vercel compatibility test
- fallback error path

### Risk: Database contention from quotas/jobs

Mitigation:

- Narrow atomic statements
- indexed buckets
- short transactions
- `SKIP LOCKED`
- periodic cleanup
- future Redis abstraction point

### Risk: Short Vercel Hobby log retention

Mitigation:

- Sentry durable exception history
- Correlation IDs and OpenTelemetry spans
- PostgreSQL operational records
- Structured logs optimized for immediate diagnosis
- No dependency on Vercel Drains

### Risk: Sensitive career data leaks into observability tools

Mitigation:

- Allowlist-based metadata
- Central redaction
- Sentry PII disabled
- Session Replay disabled
- No résumé, prompt, cover-letter, or interview content
- Automated redaction tests

### Risk: Schema reset causes accidental loss

Mitigation:

- Environment confirmation
- explicit migrations
- no automatic production reset
- backups before migration
- documented destructive steps

## 47. Implementation Exit Criteria

The design is implemented when:

- Production journey screens no longer depend on fixtures.
- Server authorization covers every private operation.
- All required tables and migrations exist.
- GitHub, Google, and enabled email auth work.
- Manual job import is production-capable.
- Mock provider and disabled live JobSpy adapter exist.
- DeepSeek provider and fake provider satisfy the same contract.
- Fit, résumé, cover, interview, tracker, outcomes, and admin flows persist.
- Exports work through controlled templates.
- Demo mode is isolated.
- Retention, quotas, kill switches, and audit events operate.
- Structured Vercel logs, OpenTelemetry spans, Sentry capture, source maps, correlation IDs, redaction, alerts, and error boundaries operate.
- Playwright critical flows pass.
- All approved quality gates pass.
- README and `.env.example` document every setting.
- One PR is ready for manual review and merge.

## 48. Approval Notes

Approval of this document authorizes creation of `tasks.md`.

The task plan must preserve:

- The approved architecture decisions
- The module boundaries
- The schema responsibilities
- The one-PR atomic-commit strategy
- The feature-flag rollout
- The security, privacy, accessibility, and testing controls

Any implementation discovery that requires changing this design must update the specification before Codex proceeds.
