# AI Job Platform Journey Enhancement — Implementation Tasks

**Document status:** Draft for stakeholder approval  
**Version:** 0.1  
**Date:** 2026-07-11  
**Target repository:** `alchemy666888/career-ai`  
**Implementation branch:** `full-job-hunter-journey`  
**Specification path:** `docs/specs/job-hunter-journey/tasks.md`  
**Controlling documents:**

1. `requirements.md`
2. `design.md`
3. This `tasks.md`
4. The subsequently approved `codex-prompt.md`

## 1. Purpose

This document converts the approved product requirements and system design into an executable implementation plan for Codex.

The implementation is delivered through:

- One Git branch: `full-job-hunter-journey`
- One pull request against `main`
- Exactly one commit per top-level task
- Targeted validation after every task
- Full quality gates at every capability-group checkpoint
- No automatic merge
- No automatic Production database reset
- No automated call to a live DeepSeek, OAuth, Resend, Sentry, or JobSpy service

## 2. Execution Rules

### 2.1 Task order

Tasks are dependency-driven.

Codex may work on independent subtasks together, but it must:

- Complete dependencies before dependent tasks.
- Preserve the approved capability sequence.
- Complete and commit each top-level task before beginning the next top-level task.
- Keep every existing public route functional after every commit.
- Avoid leaving intentionally broken intermediate commits.
- Stop and update the specification if an implementation discovery requires a material design change.

### 2.2 Commit rule

Every top-level task produces **exactly one commit**.

A task must not be split into multiple commits, and multiple top-level tasks must not be combined into one commit.

Before committing, Codex must:

1. Review the task acceptance criteria.
2. Run the task's required commands.
3. Inspect `git diff`.
4. Confirm that no secret, generated binary, local environment file, test artifact, or unrelated change is staged.
5. Use the task's prescribed commit subject or a semantically equivalent Conventional Commit subject.

### 2.3 Validation rule

Every task must run:

```text
npm run lint
npm run typecheck
targeted tests relevant to the task
```

The final task in each capability group is a checkpoint and must additionally run:

```text
npm test
npm run build
npm run db:check
```

Database tasks must also run the applicable migration commands.

The final readiness task must run all repository quality gates, including Playwright.

### 2.4 External integration rule

During implementation and automated testing, use:

```text
AI_ENABLED=false
EMAIL_AUTH_ENABLED=false
LIVE_JOB_INGESTION_ENABLED=false
ADMIN_INGESTION_ENABLED=false
ANONYMOUS_DEMO_ENABLED=true
SENTRY_ENABLED=false
```

External integrations are implemented and tested through contracts, deterministic fakes, and configuration tests.

Real-provider verification is documented as manual Preview-deployment smoke testing.

### 2.5 Test database rule

- Integration and Playwright tests use `TEST_DATABASE_URL`.
- Tests use unique users and records.
- Tests clean only records they own.
- Tests must be safe for parallel execution.
- Tests must fail when pointed at a database identified as Production.
- No test command may reset the Production database.

### 2.6 Dependency rule

- Pin every new dependency to an explicit compatible version.
- Do not perform a repository-wide dependency upgrade.
- Do not replace existing dependencies merely for preference.
- Review every heavy package for Vercel Node.js compatibility.
- Keep server-only packages out of client bundles.

### 2.7 UI rule

- Preserve public route URLs.
- Preserve the current overall visual language.
- Permit component movement and refactoring.
- Permit visual changes required by accessibility, new workflows, error handling, or responsive behavior.
- Do not rebuild the product as a visually unrelated interface.
- Maintain route functionality during incremental migration.

### 2.8 Documentation rule

Update `README.md` and `.env.example` incrementally with each capability.

The final documentation task consolidates:

- Local setup
- Test setup
- Database setup and reset
- Vercel configuration
- Authentication
- DeepSeek
- Resend
- Sentry
- OpenTelemetry
- Feature flags
- Cron
- Admin bootstrap
- Retention and deletion
- Troubleshooting and runbooks

## 3. Capability Groups

| Group | Tasks | Checkpoint |
|---|---|---|
| A. Repository and platform foundation | T01–T07 | T07 |
| B. Profile and résumé ingestion | T08–T10 | T10 |
| C. Job acquisition and discovery | T11–T13 | T13 |
| D. AI foundation and fit matching | T14–T16 | T16 |
| E. Transparent résumé tailoring | T17–T19 | T19 |
| F. Cover letters | T20–T21 | T21 |
| G. Interview workflows | T22–T24 | T24 |
| H. Application tracker and learning | T25–T27 | T27 |
| I. Demo, administration, and privacy | T28–T30 | T30 |
| J. End-to-end quality and delivery | T31–T34 | T34 |

---

# Group A — Repository and Platform Foundation

## T01 — Establish the implementation branch and approved specification baseline

- [x] Complete T01.

**Requirements:** DEP-001, DEP-003, DEP-004, NFR-MAINT-001, NFR-MAINT-004  
**Dependencies:** None

### Implementation actions

- Create or switch to branch `full-job-hunter-journey` from the current `main`.
- Confirm the working tree is clean before implementation.
- Add the four approved specification files under:

```text
docs/specs/job-hunter-journey/
├── requirements.md
├── design.md
├── tasks.md
└── codex-prompt.md
```

- Record the starting `main` commit SHA in the pull-request notes or implementation log.
- Audit current scripts, routes, schema, environment variables, fixture imports, and test configuration.
- Create a concise migration inventory identifying:
  - Existing tables to retain
  - Existing tables to replace
  - Existing fields requiring backfill or deletion
  - Fixture-powered production routes
- Do not change product behavior in this task.
- Add an implementation checklist to the specification directory if useful, but do not create a competing requirements source.

### Expected files/modules

- `docs/specs/job-hunter-journey/*`
- Optional implementation inventory under the same specification directory
- No application-code changes unless necessary to fix a pre-existing validation failure discovered during baseline verification

### Acceptance criteria

- All four approved specifications are present.
- The branch is based on current `main`.
- Existing routes still behave as before.
- Current baseline command results are recorded.
- No secret or local environment file is committed.
- The task identifies any pre-existing failing gate without concealing it.

### Required tests and commands

```text
npm install
npm run lint
npm run typecheck
npm test
npm run build
npm run db:check
git status
git diff --check
```

### Commit checkpoint

```text
chore(spec): add approved job hunter journey specifications
```

---

## T02 — Add validated environment configuration and feature flags

- [x] Complete T02.

**Requirements:** AI-003, AI-008, AUTH-004, JOB-002, JOB-003, DEP-003, DEP-004, NFR-SEC-004, NFR-MAINT-002  
**Dependencies:** T01

### Implementation actions

- Add a central server-side environment parser using Zod.
- Distinguish:
  - Required core variables
  - Optional integration variables
  - Public client-safe variables
  - Test-only variables
- Implement server-side feature flags:
  - `AI_ENABLED`
  - `EMAIL_AUTH_ENABLED`
  - `LIVE_JOB_INGESTION_ENABLED`
  - `ADMIN_INGESTION_ENABLED`
  - `ANONYMOUS_DEMO_ENABLED`
  - `SENTRY_ENABLED`
  - `OTEL_ENABLED`
- Use safe boolean parsing rather than JavaScript string truthiness.
- Ensure disabled integrations do not require their credentials.
- Ensure enabled integrations fail fast when required configuration is missing.
- Add `TEST_DATABASE_URL` validation and Production-safety checks.
- Update `.env.example` and README environment sections.
- Keep `DEEPSEEK_API_KEY` server-only.
- Add tests for configuration combinations and invalid values.

### Expected files/modules

- `lib/env.ts`
- `lib/flags/*`
- `.env.example`
- `README.md`
- Environment/configuration tests

### Acceptance criteria

- The application can start locally with risky integrations disabled.
- Enabling a feature without required credentials produces a clear startup or operation error.
- No secret is exposed through a `NEXT_PUBLIC_` variable except explicitly client-safe Sentry DSN configuration.
- Test configuration refuses a Production database target.
- Feature checks are callable from server code without importing client modules.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- env flags
git diff --check
```

### Commit checkpoint

```text
feat(config): add validated environment and feature flags
```

---

## T03 — Rebuild the Drizzle schema and forward-only migration foundation

- [x] Complete T03.

**Requirements:** BR-002, BR-006, BR-008, AUTH-005, PROF-001, RES-002, JOB-006, MATCH-002, TAILOR-006, TAILOR-009, TRACK-001, TRACK-004, PRIV-003, AI-010, NFR-COMP-002, NFR-COMP-003  
**Dependencies:** T02

### Implementation actions

- Replace obsolete schema structures as permitted by the approved design.
- Preserve and expand useful evidence-oriented concepts.
- Use UUID primary keys throughout.
- Implement Auth.js adapter tables.
- Implement the approved domain tables, including:
  - Users and account status
  - Profiles and profile sections
  - Résumé sources
  - Evidence items and provenance
  - Global job postings
  - User-job state
  - Job searches
  - Ingestion runs and errors
  - Fit evaluations
  - Applications
  - Application status events
  - Checklist items
  - Application artifacts
  - Artifact changes
  - Interview sessions, questions, answers, and reviews
  - Outcomes
  - AI usage and quota buckets
  - Background jobs
  - Audit events
- Add foreign keys, ownership columns, checks, unique constraints, cascade behavior, and indexes.
- Add PostgreSQL full-text-search support and a GIN index for jobs.
- Rebuild migrations in a reviewable way.
- Document clean reset steps for local and Preview databases.
- Add an explicit safeguard stating that Production must never be reset automatically.
- Provide a deterministic development seed command that does not power Production routes.

### Expected files/modules

- `lib/db/schema/*`
- `drizzle/*`
- `drizzle.config.*`
- `scripts/db/*`
- `package.json`
- `.env.example`
- `README.md`
- Schema tests

### Acceptance criteria

- The schema matches the approved design responsibilities.
- Every private record is ownership-scopeable.
- Status and score constraints are enforced.
- A clean test database can migrate successfully.
- Re-running migrations is safe.
- Reset tooling refuses Production.
- No résumé file binary column exists.
- Job search indexes are present.
- Fixture seed data is clearly development-only.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm run db:generate
npm run db:migrate
npm run db:check
npm test -- schema migrations
git diff --check
```

### Commit checkpoint

```text
feat(db): rebuild journey schema and migrations
```

---

## T04 — Implement database client, repositories, transactions, and test-database utilities

- [x] Complete T04.

**Requirements:** BR-006, NFR-SEC-001, NFR-PERF-001, NFR-PERF-004, NFR-REL-002, NFR-MAINT-002, NFR-MAINT-003, NFR-COMP-001, NFR-COMP-002  
**Dependencies:** T03

### Implementation actions

- Configure the Neon/PostgreSQL Drizzle client for Vercel Node.js runtime.
- Create repository modules grouped by domain.
- Ensure private-record read/update methods accept or derive user ownership.
- Avoid unscoped `findById` methods for private entities.
- Add transaction helpers for:
  - Application creation plus first event
  - Status changes plus events
  - Artifact approval
  - Cover-letter replacement
  - Résumé replacement and deletion
  - Quota consumption
  - Account deletion
- Add cursor or bounded pagination primitives.
- Create test database helpers:
  - Unique user factories
  - Record cleanup by test owner
  - Migration verification
  - Parallel-safe identifiers
- Add integration tests for ownership isolation, constraints, transactions, and cleanup.
- Do not connect repositories to UI components yet.

### Expected files/modules

- `lib/db/client.ts`
- `lib/db/repositories/*`
- `lib/db/transactions/*`
- `tests/integration/db/*`
- `tests/helpers/database.*`
- Test scripts in `package.json`

### Acceptance criteria

- Repository methods are domain-focused and typed.
- User A cannot retrieve or update User B's private records through repository APIs.
- Transactions roll back on failure.
- Test cleanup affects only the test user's records.
- Database integration tests can run against `TEST_DATABASE_URL`.
- Client components do not import the database client.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- repositories transactions ownership
git diff --check
```

### Commit checkpoint

```text
feat(core): add repositories and transactional data access
```

---

## T05 — Implement Auth.js providers, database sessions, and administrator authorization

- [x] Complete T05.

**Requirements:** AUTH-001 through AUTH-006, ADMIN-001, ADMIN-005, BR-006, NFR-SEC-001, NFR-SEC-004, NFR-COMP-004  
**Dependencies:** T04

### Implementation actions

- Configure Auth.js with:
  - GitHub OAuth
  - Google OAuth
  - Resend email magic links behind `EMAIL_AUTH_ENABLED`
  - Drizzle adapter
  - Database-backed sessions
- Add safe verified-email account-linking behavior.
- Normalize email addresses.
- Implement active, disabled, and deletion-pending account enforcement.
- Implement `ADMIN_EMAILS` allowlist authorization.
- Synchronize the effective admin role to the database for audit visibility.
- Ensure removing an address from `ADMIN_EMAILS` removes effective access at the next check.
- Add central helpers:
  - `requireUser`
  - `requireActiveUser`
  - `requireAdmin`
  - ownership assertions
- Protect dashboard and admin routes server-side.
- Add sign-in, verification, error, and sign-out flows.
- Add configuration/adapter tests without real OAuth or Resend requests.
- Update README and `.env.example` incrementally.

### Expected files/modules

- `auth.ts` or equivalent Auth.js configuration
- `app/api/auth/[...nextauth]/route.ts`
- `lib/auth/*`
- Auth pages/components
- Route protection
- Auth tests
- README and environment documentation

### Acceptance criteria

- GitHub, Google, and email providers are correctly configured when enabled.
- Disabled email authentication is not displayed and does not require Resend credentials.
- Database sessions can be revoked.
- Disabled users cannot use protected routes.
- Non-admin users cannot access admin routes or services.
- No provider test calls a real service.
- Public route URLs remain stable.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- auth authorization sessions admin
git diff --check
```

### Commit checkpoint

```text
feat(auth): add providers sessions and authorization
```

---

## T06 — Add structured logging, correlation context, OpenTelemetry, and Sentry foundations

- [x] Complete T06.

**Requirements:** NFR-OBS-001 through NFR-OBS-014, NFR-REL-003, NFR-REL-004, NFR-PRIV-001, PRIV-002, DEP-003  
**Dependencies:** T02, T05

### Implementation actions

- Add pinned dependencies:
  - `@vercel/otel`
  - `@opentelemetry/api`
  - `@sentry/nextjs`
- Implement:
  - Structured single-line JSON logger
  - Correlation-context creation and propagation
  - Stable application error taxonomy
  - Allowlist-based redaction
  - Safe error serialization
  - OpenTelemetry initialization
  - Custom-span wrapper
  - Sentry server/client configuration
  - Sentry request-error integration
  - `beforeSend` redaction
  - Release/environment mapping
- Keep Session Replay disabled.
- Set `sendDefaultPii` to false.
- Add global and route-safe error boundaries with correlation references.
- Add observed wrappers for server actions, route handlers, and background jobs.
- Ensure logging never throws into the business operation.
- Add unit tests proving prohibited data is absent.
- Add tests for span completion and sanitized Sentry events.
- Document Vercel Hobby log-retention constraints and required Sentry setup.
- Do not create the external Sentry project.

### Expected files/modules

- `instrumentation.ts`
- `sentry.*.config.ts`
- `lib/observability/*`
- `app/error.tsx`
- `app/global-error.tsx`
- Error components
- Observability tests
- README and `.env.example`

### Acceptance criteria

- Logger output is valid bounded one-line JSON.
- Correlation IDs appear in safe error results.
- OpenTelemetry spans end on both success and failure.
- Sentry receives sanitized test events.
- Résumé text, prompts, responses, interview answers, email, cookies, tokens, and secrets are removed.
- Session Replay is disabled.
- The implementation works with Vercel Hobby and does not require Drains or Observability Plus.
- Production source-map configuration is documented.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- observability logger redact tracing sentry errors
git diff --check
```

### Commit checkpoint

```text
feat(observability): add logging tracing and error capture
```

---

## T07 — Add shared audit, quota, background-job, and action infrastructure

- [x] Complete T07.

**Requirements:** BR-007, BR-008, AI-006 through AI-010, JOB-003, ADMIN-004, NFR-REL-001 through NFR-REL-004, NFR-SEC-007, NFR-OBS-004, NFR-OBS-010  
**Dependencies:** T03, T04, T05, T06

### Implementation actions

- Implement audit-event writer with event-specific metadata allowlists.
- Implement PostgreSQL atomic rate-limit buckets.
- Implement daily feature quotas and monthly usage guard.
- Implement per-user concurrency control.
- Implement PostgreSQL background-job queue:
  - Enqueue
  - Dedupe key
  - Claim through `FOR UPDATE SKIP LOCKED`
  - Retry and backoff
  - Stale-lock release
  - Success/failure finalization
- Implement observed server-action and route-handler wrappers.
- Implement cron-secret verification.
- Add safe operational records for job executions.
- Add worker entry points suitable for bounded Vercel invocations.
- Instrument every shared operation with logger, correlation ID, span, and sanitized exception capture.
- Add tests for quota atomicity, job claiming, retries, dedupe, audit redaction, and unauthorized cron access.
- Add documentation for current default flags and limits.

### Expected files/modules

- `lib/audit/*`
- `lib/rate-limit/*`
- `lib/background/*`
- Shared server-action/route wrappers
- Cron authorization helper
- Integration tests
- README and `.env.example`

### Acceptance criteria

- Concurrent quota requests cannot exceed configured limits.
- Concurrent workers do not claim the same job.
- Failed jobs retry only to their configured maximum.
- Stale locks can be safely released.
- Audit metadata excludes sensitive fields.
- Cron requests reject invalid secrets.
- Shared wrappers produce safe errors and observability context.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- audit quota rate-limit background cron
npm run build
npm run db:check
git diff --check
```

### Commit checkpoint

```text
feat(core): add audit quotas background jobs and wrappers
```

---

# Group B — Profile and Résumé Ingestion

## T08 — Persist profile management and completeness

- [x] Complete T08.

**Requirements:** PROF-001 through PROF-003, BR-001 through BR-003, BR-006, UX-001 through UX-005, NFR-A11Y-001 through NFR-A11Y-004  
**Dependencies:** T04, T05, T06, T07

### Implementation actions

- Replace fixture-backed profile production state with server-authoritative queries.
- Implement profile service and repository operations.
- Support all approved profile fields and broad professional roles.
- Implement deterministic profile-completeness scoring.
- Implement profile form validation and safe server actions.
- Preserve the current profile route and visual language.
- Use client state only for unsaved form interaction.
- Add loading, empty, validation, success, and error states.
- Instrument profile reads and writes.
- Create audit events for material profile changes.
- Add unit, integration, component, and authorization tests.
- Keep profile fixtures only in test or isolated demo modules.

### Expected files/modules

- `lib/domain/profile/*`
- Profile repositories
- `components/career/profile/*`
- `app/(dashboard)/profile/page.tsx`
- Profile tests
- README updates if setup changes

### Acceptance criteria

- Profile data persists across sessions and devices.
- The UI does not depend on production fixture data.
- Broad non-engineering roles are supported.
- Completeness is deterministic and tested.
- A user cannot modify another user's profile.
- Async and validation feedback is accessible.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- profile completeness authorization
git diff --check
```

### Commit checkpoint

```text
feat(profile): persist profile management and completeness
```

---

## T09 — Implement secure PDF and DOCX résumé parsing and first import

- [x] Complete T09.

**Requirements:** RES-001 through RES-003, RES-005, BR-001 through BR-003, NFR-SEC-003, NFR-PERF-003, NFR-OBS-006 through NFR-OBS-010  
**Dependencies:** T08

### Implementation actions

- Select and pin maintained PDF and DOCX parser dependencies compatible with Vercel Node.js.
- Implement a parser interface and separate PDF/DOCX adapters.
- Validate:
  - Extension
  - MIME type
  - Maximum 10 MB
  - Parser compatibility
  - Extracted text length
  - Processing duration
- Never retain source file bytes.
- Normalize extracted text.
- Store source text and hash in PostgreSQL.
- Parse deterministic sections where possible.
- Allow optional fake-AI structuring without requiring live AI.
- Treat directly extracted content as imported evidence.
- Treat inferred content as suggestions.
- Implement the first-import user flow.
- Add safe temporary-file/buffer cleanup.
- Add parser fixtures that contain no real personal data.
- Add observed spans and sanitized failures.
- Add parser, route/action, ownership, and redaction tests.

### Expected files/modules

- `lib/documents/parsing/*`
- Résumé import actions/components
- Test résumé fixtures
- Domain services and repositories
- README dependency notes

### Acceptance criteria

- Valid PDF and DOCX fixtures import successfully.
- Files over 10 MB and unsupported files fail safely.
- Original file bytes are not persisted.
- Imported evidence retains source provenance.
- Parser failures do not overwrite profile data.
- No extracted text appears in logs or Sentry test events.
- The first import commits immediately and displays editable results.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- resume parser import provenance redaction
git diff --check
```

### Commit checkpoint

```text
feat(profile): add secure resume parsing and import
```

---

## T10 — Implement résumé replacement, correction, deletion, and profile reconciliation

- [ ] Complete T10.

**Requirements:** RES-003 through RES-005, PRIV-002, PRIV-003, BR-002, BR-003, UX-002, NFR-PRIV-003, NFR-OBS-004  
**Dependencies:** T09

### Implementation actions

- Implement replacement-import preview.
- Show extracted text and a bounded change summary before replacing existing imported data.
- On confirmation:
  - Archive prior source
  - Replace source-linked imported sections/evidence
  - Preserve independent user-authored evidence
  - Recalculate completeness
  - Create audit event
- Implement correction and removal of imported claims.
- Implement résumé-source deletion and dependent-data explanation.
- Ensure deleted data is excluded from future AI context.
- Add confirmation and accessible recovery/error behavior.
- Add transaction and cascade tests.
- Add browser/component coverage for replacement and deletion.
- Update privacy and data-behavior documentation.

### Expected files/modules

- Profile/résumé domain services
- Replacement preview components
- Deletion actions and dialogs
- Transaction tests
- README/privacy documentation

### Acceptance criteria

- Replacement never silently destroys existing data.
- User-authored evidence survives unless explicitly selected.
- Deleted source content is unavailable to future AI operations.
- Every replacement and deletion is authorized and audited.
- Partial failure rolls back.
- Production routes remain functional.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- resume replacement deletion reconciliation
npm run build
npm run db:check
git diff --check
```

### Commit checkpoint

```text
feat(profile): add resume replacement and deletion
```

---

# Group C — Job Acquisition and Discovery

## T11 — Implement job-provider contracts, normalization, deduplication, and manual import

- [ ] Complete T11.

**Requirements:** JOB-001, JOB-002, JOB-005, JOB-006, JOB-011, BR-006, NFR-SEC-002, NFR-SEC-006  
**Dependencies:** T04, T07, T10

### Implementation actions

- Implement `JobProvider` contract.
- Implement deterministic mock provider.
- Implement manual provider.
- Add experimental Node JobSpy adapter:
  - Dynamic import
  - Disabled by default
  - Strict timeout and result cap
  - No tests against live services
  - Safe unsupported-runtime behavior
- Implement normalized job model.
- Implement sanitization for retained description HTML, or store/render text only.
- Implement canonical URL handling and fingerprint deduplication.
- Implement manual job-import form:
  - Description
  - Source URL metadata
  - Title
  - Company
  - Location
  - Work style
  - Salary
  - Closing date
- Do not fetch arbitrary user-provided URLs.
- Add duplicate warning and user correction.
- Instrument import and normalization.
- Add provider contract, normalization, dedupe, authorization, and validation tests.

### Expected files/modules

- `lib/jobs/providers/*`
- `lib/jobs/normalize.ts`
- Job repositories/services
- Manual-import route/components
- Job fixtures and tests
- README provider notes

### Acceptance criteria

- Manual import works when all crawling is disabled.
- Mock provider is deterministic.
- JobSpy adapter remains inactive unless explicitly enabled.
- Duplicate records are detected safely.
- Arbitrary source URLs are not fetched.
- Job content is safe to render.
- Provider failures do not corrupt existing jobs.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- job provider normalize dedupe manual-import
git diff --check
```

### Commit checkpoint

```text
feat(jobs): add providers normalization and manual import
```

---

## T12 — Implement PostgreSQL job search, discovery, saved state, comparison, and pagination

- [ ] Complete T12.

**Requirements:** JOB-007 through JOB-010, NFR-PERF-001, NFR-PERF-004, UX-001 through UX-005, BR-006  
**Dependencies:** T11

### Implementation actions

- Implement PostgreSQL full-text search using English configuration.
- Weight title, company, tags/skills, description, and location.
- Implement indexed filters:
  - Keyword
  - Role
  - Location
  - Work style
  - Salary
  - Source
  - Freshness
  - Saved state
  - Match threshold where evaluation exists
  - Application status
- Implement deterministic cursor pagination and sorting.
- Replace fixture-backed production job pages.
- Implement user-specific:
  - Save
  - Dismiss
  - Restore
  - Compare selection
  - Notes/priority where shown
- Keep comparison selection transient when appropriate, while persisted job state remains authoritative.
- Preserve public job route URLs and visual language.
- Add accessible empty, loading, error, and pagination states.
- Add query, performance, ownership, and UI tests.

### Expected files/modules

- Job search repositories/services
- `components/career/jobs/*`
- Existing jobs routes
- Search tests
- Component tests

### Acceptance criteria

- Search results come from PostgreSQL.
- Saving or dismissing a job affects only the current user.
- Search and filters are indexed and bounded.
- Pagination is deterministic.
- Existing job routes remain functional.
- Production job pages import no fixture data.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- job-search filters pagination user-jobs
git diff --check
```

### Commit checkpoint

```text
feat(jobs): persist job discovery search and user state
```

---

## T13 — Implement scheduled ingestion, retention state, and ingestion administration

- [ ] Complete T13.

**Requirements:** JOB-002 through JOB-004, JOB-006, JOB-011, ADMIN-002, NFR-REL-001 through NFR-REL-004, NFR-OBS-012  
**Dependencies:** T07, T11, T12

### Implementation actions

- Implement protected Vercel cron route for job ingestion.
- Enqueue deduplicated background jobs rather than unbounded work.
- Implement bounded ingestion worker.
- Record:
  - Start and finish
  - Provider
  - Trigger
  - Counts
  - Partial failures
  - Error summaries
- Implement admin ingestion service:
  - View runs
  - Inspect safe errors
  - Trigger enabled provider
  - Retry failed run
  - Deactivate problematic job
- Respect both live-ingestion and admin-ingestion flags.
- Implement active freshness and inactive state.
- Add retention eligibility logic without deleting referenced jobs.
- Add alerts/runbook notes for missed or failed runs.
- Add tests for cron secret, flags, idempotency, retries, partial failure, and authorization.
- Add `vercel.json` cron configuration with safe disabled behavior.

### Expected files/modules

- `app/api/cron/jobs/route.ts`
- Background handlers
- Ingestion admin service/components
- `vercel.json`
- Ingestion tests
- README operational notes

### Acceptance criteria

- Unauthorized cron calls fail.
- Duplicate cron runs are prevented or idempotent.
- Disabled live ingestion makes no external call.
- Manual import remains available.
- Failed runs are visible to admins.
- Referenced jobs are retained for application history.
- Instrumentation contains no job-description body.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- ingestion cron jobspy admin-jobs retention
npm run build
npm run db:check
git diff --check
```

### Commit checkpoint

```text
feat(jobs): add scheduled ingestion and operations
```

---

# Group D — AI Foundation and Fit Matching

## T14 — Implement provider-independent AI contracts, DeepSeek adapter, and deterministic fake

- [ ] Complete T14.

**Requirements:** AI-001 through AI-005, AI-009, AI-010, BR-001 through BR-004, NFR-MAINT-002, NFR-OBS-006 through NFR-OBS-009  
**Dependencies:** T02, T06, T07, T10, T11

### Implementation actions

- Implement provider-independent structured/text AI interfaces.
- Implement DeepSeek adapter using:
  - Existing `DEEPSEEK_API_KEY`
  - Configurable base URL
  - Configurable model IDs
  - Request timeout
  - One bounded retry
  - Safe provider-error mapping
- Hide any OpenAI-compatible transport inside the adapter.
- Implement deterministic fake provider.
- Implement prompt-version modules.
- Implement Zod schemas and optional single repair attempt for malformed structured output.
- Implement server-side evidence-packet assembly.
- Exclude unsupported and archived claims.
- Verify all returned evidence IDs.
- Record sanitized usage metadata without prompt or response bodies.
- Add provider contract tests and failure scenarios.
- Add manual Preview smoke-test documentation without making a live call.

### Expected files/modules

- `lib/ai/contracts.ts`
- `lib/ai/provider.ts`
- `lib/ai/deepseek.ts`
- `lib/ai/fake.ts`
- `lib/ai/prompts/*`
- `lib/ai/schemas/*`
- AI tests
- README and `.env.example`

### Acceptance criteria

- Domain services depend only on the AI interface.
- Fake and DeepSeek adapters satisfy the same contract.
- Invalid responses are rejected before persistence.
- Evidence references are verified.
- AI is disabled by default.
- Tests make no real provider call.
- No prompt or response body appears in logs.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- ai-provider deepseek fake prompts schemas evidence
git diff --check
```

### Commit checkpoint

```text
feat(ai): add DeepSeek provider abstraction and fake
```

---

## T15 — Implement AI quotas, usage accounting, concurrency, and kill-switch behavior

- [ ] Complete T15.

**Requirements:** AI-006 through AI-010, ADMIN-003, ADMIN-004, NFR-SEC-007, NFR-REL-001, NFR-OBS-003 through NFR-OBS-012  
**Dependencies:** T07, T14

### Implementation actions

- Apply shared quota infrastructure to AI features.
- Implement configurable limits for:
  - User daily requests
  - Anonymous live requests
  - Résumé per job/day
  - Cover letter per job/day
  - Interview questions/session
  - Interview evaluations/session
  - Per-user concurrency
  - Instance concurrency
  - Monthly global usage
- Use approved defaults.
- Implement global `AI_ENABLED` kill switch.
- Record usage status, latency, provider/model, unit counts, estimated cost where available, and safe error code.
- Implement refund policy for failures that occur before provider acceptance where practical.
- Implement safe rate-limit errors with retry timing.
- Add aggregate admin query services.
- Add tests for atomic concurrency, limits, kill switch, disabled provider, and logging.

### Expected files/modules

- AI quota services
- Usage repositories
- Admin aggregate queries
- Tests
- README configuration

### Acceptance criteria

- A user cannot exceed limits under concurrent requests.
- Kill switch prevents provider calls.
- Existing persisted artifacts remain readable while AI is disabled.
- Demo fake AI consumes no live quota.
- Usage records contain no content.
- Admin aggregates do not expose sensitive payloads.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- ai-quota concurrency usage kill-switch
git diff --check
```

### Commit checkpoint

```text
feat(ai): enforce quotas usage and kill switch
```

---

## T16 — Implement evidence-backed fit evaluation and job-detail integration

- [ ] Complete T16.

**Requirements:** MATCH-001 through MATCH-006, BR-001 through BR-005, AI-004 through AI-010, UX-001 through UX-005  
**Dependencies:** T12, T14, T15

### Implementation actions

- Implement fit-evaluation service.
- Build approved profile/job fingerprints.
- Generate or reuse immutable evaluation snapshots.
- Validate score, confidence, strengths, gaps, coverage, recommendations, deal breakers, and honest assessment.
- Verify evidence references after AI response.
- Add deterministic pre/post-processing guardrails.
- Prevent failed evaluations from replacing successful ones.
- Replace fixture match data on job detail pages.
- Display:
  - Score
  - Confidence
  - Evidence-backed strengths
  - Gaps
  - Requirement coverage
  - Honest assessment
  - Timestamp/model metadata where appropriate
- Add re-evaluation after profile/job changes.
- Instrument the full evaluation sequence.
- Add unit, integration, component, authorization, and fake-provider tests.

### Expected files/modules

- `lib/domain/matching/*`
- Fit repositories
- Job-detail components
- Match tests

### Acceptance criteria

- Every strength references valid evidence.
- Unsupported strengths are not represented as facts.
- Scores are bounded.
- Sparse evidence lowers confidence.
- A provider failure preserves the last successful evaluation.
- User A cannot evaluate against User B's private profile.
- No production fixture match text remains.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- matching evidence fit-evaluation job-detail
npm run build
npm run db:check
git diff --check
```

### Commit checkpoint

```text
feat(matching): add evidence backed fit evaluation
```

---

# Group E — Transparent Résumé Tailoring

## T17 — Implement job-specific résumé generation and immutable artifact versions

- [ ] Complete T17.

**Requirements:** TAILOR-001, TAILOR-006, TAILOR-009, TAILOR-010, BR-001 through BR-004, AI-004 through AI-010  
**Dependencies:** T10, T16

### Implementation actions

- Implement résumé generation service using:
  - Active source résumé
  - Approved/imported evidence
  - Selected job
  - Latest fit evaluation
  - Controlled résumé template
- Create immutable artifact versions.
- Store provider/model/prompt/template versions.
- Generate structured document content and proposed changes.
- Prevent regeneration from overwriting approved history.
- Implement working and archived states.
- Add safe manual-edit derivation.
- Instrument generation and persistence.
- Add tests for version sequencing, immutable history, unsupported evidence, failure preservation, and authorization.

### Expected files/modules

- `lib/domain/resume/*`
- Artifact repositories
- Prompt/schema modules
- Résumé workspace service
- Tests

### Acceptance criteria

- Every generation creates a new version.
- Approved artifacts are never silently overwritten.
- Unsupported evidence is excluded from final content.
- Failure preserves prior working/approved artifacts.
- Versions retain prompt, model, and template metadata.
- Artifact access is owner-scoped.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- resume-generation artifact-version evidence
git diff --check
```

### Commit checkpoint

```text
feat(resume): add versioned job specific tailoring
```

---

## T18 — Implement transparent change review, acceptance, rejection, and approval

- [ ] Complete T18.

**Requirements:** TAILOR-002 through TAILOR-007, BR-002 through BR-004, UX-001 through UX-005, NFR-A11Y-001 through NFR-A11Y-004  
**Dependencies:** T17

### Implementation actions

- Build change-review UI showing:
  - Original text
  - Suggested text
  - Reason
  - Job requirement
  - Evidence references
  - Support status
- Implement individual accept/reject controls.
- Block acceptance of unsupported changes.
- Add “add evidence” path.
- Persist decisions transactionally.
- Generate approved artifact from accepted changes and manual edits.
- Add ATS guidance and warnings without guaranteeing success.
- Add safe regeneration comparison.
- Add accessible keyboard operation, focus handling, and live announcements.
- Replace any fixture résumé-workspace state.
- Add component, domain, transaction, authorization, and accessibility tests.

### Expected files/modules

- Résumé review components
- Artifact-change services/repositories
- Approval transaction
- Tests

### Acceptance criteria

- Every substantive change exposes rationale and provenance.
- Unsupported changes cannot enter approved output.
- Users can accept/reject independently.
- Approved output exactly reflects accepted/manual content.
- Regeneration does not erase decisions without confirmation.
- Change-review controls are keyboard accessible.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- resume-review artifact-changes approval accessibility
git diff --check
```

### Commit checkpoint

```text
feat(resume): add transparent review and approval
```

---

## T19 — Implement controlled résumé exports

- [ ] Complete T19.

**Requirements:** TAILOR-008, BR-004, DEP-002, NFR-SEC-006, NFR-PERF-002, NFR-OBS-006, NFR-OBS-012  
**Dependencies:** T18

### Implementation actions

- Select and pin Vercel-compatible DOCX and PDF generation dependencies.
- Implement one controlled ATS-safe résumé template.
- Generate:
  - Markdown
  - Plain text
  - DOCX
  - PDF
  - Clipboard content
- Generate output from normalized artifact structure.
- Never render arbitrary user HTML.
- Implement protected export route with ownership and approved-state checks.
- Set safe content type, filename, and `Content-Disposition`.
- Add export audit event and observability.
- Add snapshot/structure tests and download authorization tests.
- Document Vercel compatibility and manual PDF/DOCX verification.

### Expected files/modules

- `lib/documents/exports/*`
- `lib/documents/templates/resume/*`
- Export route
- Client clipboard control
- Export tests

### Acceptance criteria

- All five résumé formats work.
- PDF and DOCX use one consistent template.
- Export route rejects non-owners.
- Unapproved unsupported content cannot be exported.
- Output does not execute arbitrary HTML.
- Export failures include safe correlation references.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- resume-export pdf docx download-authorization
npm run build
npm run db:check
git diff --check
```

### Commit checkpoint

```text
feat(resume): add controlled resume exports
```

---

# Group F — Cover Letters

## T20 — Implement evidence-backed cover-letter generation, rationale, editing, and latest-version persistence

- [ ] Complete T20.

**Requirements:** COVER-001 through COVER-006, COVER-008, BR-001 through BR-004, AI-004 through AI-010  
**Dependencies:** T14, T15, T16, T17

### Implementation actions

- Implement cover-letter generation in:
  - Professional
  - Enthusiastic
  - Technical styles
- Limit context to approved evidence and persisted job data.
- Do not perform external company research.
- Produce paragraph-level rationale and evidence references.
- Implement manual editing.
- Persist one user-visible latest version.
- Require explicit user action before regeneration replaces current latest content.
- Ensure replacement is transactional.
- Prevent unverified company facts.
- Instrument generation and replacement.
- Add tests for style, evidence references, latest-version behavior, unsupported company claims, and authorization.

### Expected files/modules

- `lib/domain/cover-letter/*`
- Cover prompt/schema
- Cover workspace components
- Tests

### Acceptance criteria

- All three styles are available.
- Every paragraph exposes rationale or evidence.
- Only latest content is user-visible.
- Regeneration does not replace content silently.
- No external company lookup occurs.
- Unsupported candidate or company facts are blocked.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- cover-letter generation rationale latest-version
git diff --check
```

### Commit checkpoint

```text
feat(cover): add evidence backed cover letters
```

---

## T21 — Implement controlled cover-letter exports and application-workspace integration

- [ ] Complete T21.

**Requirements:** COVER-007, TRACK-005, TRACK-007, UX-001 through UX-005, NFR-SEC-006  
**Dependencies:** T20, T19

### Implementation actions

- Implement one controlled cover-letter template.
- Support:
  - Plain text
  - DOCX
  - PDF
  - Clipboard
- Add protected download routes.
- Integrate current cover letter into application workspace.
- Add submission-readiness state.
- Add audit and observability.
- Add authorization, template, export, and workspace tests.
- Ensure no old cover-letter version selector is exposed.

### Expected files/modules

- Cover export template/generator
- Export routes
- Application workspace components
- Tests

### Acceptance criteria

- All approved cover-letter export formats work.
- Only the latest version is exported.
- Export access is owner-scoped.
- Application workspace shows readiness and current content.
- Template remains consistent across PDF and DOCX.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- cover-export application-workspace
npm run build
npm run db:check
git diff --check
```

### Commit checkpoint

```text
feat(cover): add cover exports and workspace integration
```

---

# Group G — Interview Workflows

## T22 — Implement structured interview sessions, preparation, and question generation

- [ ] Complete T22.

**Requirements:** INT-001 through INT-003, INT-005 through INT-007, AI-006, BR-001 through BR-004  
**Dependencies:** T14, T15, T16, T25 is not required; sessions may link directly to job until an application exists

### Implementation actions

- Implement interview-session creation linked to job and optional application.
- Support planned, in-progress, completed, and cancelled states.
- Persist:
  - Stage
  - Format
  - Schedule
  - Participants
  - Checklist
  - Selected evidence
  - Questions to ask
  - Notes
- Generate role-specific text questions through the AI provider.
- Enforce configured question limits.
- Persist question ordering and categories.
- Replace fixture interview production state.
- Preserve existing interview routes and visual language.
- Instrument generation and session updates.
- Add unit, integration, component, quota, and authorization tests.

### Expected files/modules

- `lib/domain/interview/*`
- Interview repositories
- Interview session and preparation components
- Tests

### Acceptance criteria

- Sessions persist across devices.
- Questions are grounded in job and approved evidence.
- Limits are enforced.
- Users can create sessions before or after creating an application.
- Production interview pages use no fixture data.
- Notes and preparation fields are owner-scoped.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- interview-session questions preparation quotas
git diff --check
```

### Commit checkpoint

```text
feat(interview): add sessions preparation and questions
```

---

## T23 — Implement answer evaluation, STAR analysis, scoring, and safe improvement guidance

- [ ] Complete T23.

**Requirements:** INT-003, INT-004, INT-006, INT-007, BR-001 through BR-004, AI-004 through AI-010  
**Dependencies:** T22

### Implementation actions

- Implement text-answer submission and persistence.
- Generate structured evaluation:
  - Score
  - STAR analysis
  - Strengths
  - Improvements
  - Relevance
  - Specificity
  - Metrics
  - Clarity
  - Evidence-backed improved outline
- Verify referenced evidence.
- Prevent improved guidance from inventing facts.
- Enforce evaluation limits.
- Preserve answer when evaluation fails.
- Add accessible feedback presentation.
- Instrument evaluation.
- Add schema, evidence, failure, quota, UI, and authorization tests.

### Expected files/modules

- Interview evaluation services
- Prompt/schema modules
- Answer and feedback components
- Tests

### Acceptance criteria

- Evaluation is structured and persisted.
- Unsupported improved answers are not generated as fact.
- Failed evaluation preserves user answer and prior feedback.
- Evaluation limits are enforced.
- Feedback is accessible and understandable.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- interview-answer star evaluation evidence
git diff --check
```

### Commit checkpoint

```text
feat(interview): add answer evaluation and STAR feedback
```

---

## T24 — Implement post-interview review, thank-you draft, follow-up, and strategy signals

- [ ] Complete T24.

**Requirements:** INT-008, INT-009, LEARN-001 through LEARN-004, BR-001 through BR-005, UX-001 through UX-005  
**Dependencies:** T23

### Implementation actions

- Implement post-interview review fields.
- Persist actual questions, assessment, signals, employer feedback, follow-up, and next action.
- Generate evidence-backed thank-you draft using the same content policy as cover letters.
- Add follow-up due date and dashboard query support.
- Produce advisory strategy signals without asserting employer intent or false causality.
- Instrument review and generation.
- Add domain, UI, evidence, follow-up, and authorization tests.

### Expected files/modules

- Post-interview services/repositories
- Review components
- Learning/strategy primitives
- Tests

### Acceptance criteria

- Post-interview data persists.
- Thank-you content uses approved evidence.
- Recommendations clearly state their basis.
- No employer intent is represented as fact.
- Follow-up dates are queryable for dashboard use.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- post-interview thank-you follow-up strategy
npm run build
npm run db:check
git diff --check
```

### Commit checkpoint

```text
feat(interview): add post interview review and follow up
```

---

# Group H — Application Tracker and Learning

## T25 — Implement persisted applications, status machine, timeline, checklist, and workspace

- [ ] Complete T25.

**Requirements:** TRACK-001, TRACK-003 through TRACK-009, BR-006, BR-008, NFR-MAINT-003  
**Dependencies:** T12, T16, T19, T21, T24

### Implementation actions

- Implement application creation from a job.
- Implement approved status state machine.
- Implement backward correction rules.
- In one transaction:
  - Update application status
  - Append status event
  - Append audit event
- Implement application workspace with linked:
  - Job
  - Evaluation
  - Résumé
  - Cover letter
  - Checklist
  - Notes
  - Timeline
  - Interviews
  - Outcome
- Implement manual submission marking.
- Implement submission checklist.
- Preserve route URLs.
- Replace fixture application production state.
- Instrument state transitions.
- Add state-machine, transaction, authorization, workspace, and timeline tests.

### Expected files/modules

- `lib/domain/applications/*`
- Application repositories
- Workspace components
- Tests

### Acceptance criteria

- Every status change creates an immutable timeline event.
- Accidental corrections append history rather than deleting it.
- External submission remains manual.
- A user cannot access another user's workspace.
- Workspace links current approved artifacts.
- No production fixture applications remain.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- applications status-machine timeline checklist workspace
git diff --check
```

### Commit checkpoint

```text
feat(tracker): persist applications timeline and workspace
```

---

## T26 — Implement accessible dnd-kit Kanban and keyboard status movement

- [ ] Complete T26.

**Requirements:** TRACK-002 through TRACK-004, TRACK-008, NFR-A11Y-001 through NFR-A11Y-004, UX-001 through UX-005  
**Dependencies:** T25

### Implementation actions

- Pin and add `dnd-kit` packages.
- Build application Kanban from persisted data.
- Implement optimistic drag behavior.
- Roll back optimistic state on server failure.
- Use the same state-change service as other controls.
- Add keyboard-accessible “Move to” control.
- Add screen-reader announcements.
- Ensure touch and responsive behavior.
- Preserve current visual language.
- Add component, state, keyboard, failure-rollback, and accessibility tests.

### Expected files/modules

- Kanban components
- DnD client island
- Status action
- Tests

### Acceptance criteria

- Dragging persists status and timeline.
- Keyboard users can perform every movement.
- Failed server changes roll back.
- Invalid transitions are blocked.
- Status is not represented by color alone.
- Board works at supported viewport sizes.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- kanban dnd status accessibility
git diff --check
```

### Commit checkpoint

```text
feat(tracker): add accessible application Kanban
```

---

## T27 — Implement dashboard aggregates, outcomes, stale-work detection, and learning recommendations

- [ ] Complete T27.

**Requirements:** TRACK-009, TRACK-010, LEARN-001 through LEARN-004, NFR-PERF-001, NFR-PERF-004, UX-001 through UX-005  
**Dependencies:** T24, T25, T26

### Implementation actions

- Implement outcome recording for rejection, withdrawal, offer, acceptance, decline, compensation notes, feedback, and follow-up.
- Implement server-side aggregate dashboard queries:
  - Counts by status
  - Upcoming interviews
  - Follow-ups due
  - Stale applications
  - Missing artifacts
  - Next best actions
- Implement learning recommendations based on the user's own data.
- Ensure recommendations identify basis and confidence.
- Prevent false causal claims.
- Replace fixture dashboard summaries.
- Avoid loading the entire journey into one client payload.
- Instrument dashboard and learning generation.
- Add aggregate, performance, outcome, recommendation, and authorization tests.

### Expected files/modules

- Outcome and learning domain modules
- Dashboard repositories/services
- Dashboard components
- Tests

### Acceptance criteria

- Dashboard reflects persisted data.
- Aggregate queries are bounded and indexed.
- Outcomes update relevant next actions.
- Recommendations are advisory and evidence-based.
- Production dashboard imports no journey fixtures.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- dashboard outcomes learning aggregates
npm run build
npm run db:check
git diff --check
```

### Commit checkpoint

```text
feat(dashboard): add outcomes aggregates and learning
```

---

# Group I — Demo, Administration, and Privacy

## T28 — Isolate browser-local anonymous demo mode

- [ ] Complete T28.

**Requirements:** AUTH-004, FIX-001 through FIX-003, BR-007, NFR-SEC-001, NFR-PRIV-001  
**Dependencies:** T08, T12, T16, T18, T20, T22, T25

### Implementation actions

- Move reusable fixture data into a demo-specific module.
- Ensure authenticated production modules do not import demo fixtures.
- Implement browser-local demo state with a namespaced storage key.
- Use deterministic fake AI and mock jobs only.
- Implement visible demo labeling.
- Implement reset behavior.
- Provide sign-in conversion path.
- Hide or reject demo route when disabled.
- Ensure demo cannot access authenticated APIs or production records.
- Add enabled/disabled, isolation, reset, and no-network tests.

### Expected files/modules

- `components/career/demo/*`
- Demo fixture modules
- Public demo route
- Tests

### Acceptance criteria

- Demo writes nothing to PostgreSQL.
- Demo makes no live AI, email, or ingestion call.
- Production routes use no demo fixtures.
- Disabling the flag removes access.
- Local state can be reset safely.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- demo fixtures isolation feature-flag
git diff --check
```

### Commit checkpoint

```text
feat(demo): isolate browser local anonymous journey
```

---

## T29 — Assemble protected administration screens and operational controls

- [ ] Complete T29.

**Requirements:** ADMIN-001 through ADMIN-007, AI-010, JOB-004, JOB-011, BR-008, NFR-OBS-012  
**Dependencies:** T05, T07, T13, T15, T27

### Implementation actions

- Assemble protected admin layout and navigation.
- Implement operational screens for:
  - Ingestion runs and failures
  - Job deactivation
  - AI usage, failures, and estimated cost
  - Feature-status display
  - User search and account status
  - Audit-event inspection
  - Failed/stale background jobs
- Reuse services created alongside capabilities.
- Implement account disable/re-enable.
- Do not add user impersonation.
- Do not expose résumé content, prompts, responses, or interview answers.
- Do not add donation administration.
- Instrument all privileged actions.
- Add authorization, redaction, admin UI, and audit tests.

### Expected files/modules

- `app/admin/*`
- `components/admin/*`
- Admin services/queries
- Tests

### Acceptance criteria

- Non-admins cannot access any admin page or mutation.
- Admin screens show safe operational metadata.
- User suspension revokes effective access.
- Privileged actions create audit events.
- Sensitive user content is absent.
- Donation functionality is absent.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- admin authorization audit operations
git diff --check
```

### Commit checkpoint

```text
feat(admin): add operational administration
```

---

## T30 — Implement account deletion, privacy controls, retention jobs, and user data export

- [ ] Complete T30.

**Requirements:** PRIV-001 through PRIV-007, RES-004, NFR-PRIV-001 through NFR-PRIV-003, NFR-SEC-001, NFR-OBS-008  
**Dependencies:** T07, T10, T13, T25, T27, T29

### Implementation actions

- Implement account-deletion confirmation and recent-session protection.
- Invalidate sessions.
- Delete or irreversibly anonymize private user data.
- Retain only minimal permitted security audit metadata.
- Implement machine-readable user data export.
- Implement daily maintenance job:
  - Deactivate stale jobs after configured freshness
  - Delete eligible inactive unreferenced jobs
  - Retain application-referenced jobs
  - Delete expired quota buckets
  - Apply audit/usage retention
  - Release stale background locks
- Implement English privacy notice.
- Document no-training policy and third-party AI processing.
- Add deletion, export, cascade, retention, authorization, and redaction tests.

### Expected files/modules

- Privacy/settings pages
- Account deletion service
- Data export route
- Maintenance cron/handler
- Privacy notice
- Tests
- README and `vercel.json`

### Acceptance criteria

- Deleted accounts cannot continue using prior sessions.
- Private data is removed or irreversibly anonymized.
- Retention does not delete referenced job history.
- User export is owner-authorized and machine-readable.
- Privacy notice covers AI, retention, deletion, and no training.
- Maintenance jobs are idempotent and observable.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test -- privacy account-deletion data-export retention maintenance
npm run build
npm run db:check
git diff --check
```

### Commit checkpoint

```text
feat(privacy): add deletion retention and data export
```

---

# Group J — End-to-End Quality and Delivery

## T31 — Add Playwright infrastructure and critical browser-flow coverage

- [ ] Complete T31.

**Requirements:** DEP-002, NFR-SEC-001, NFR-A11Y-001 through NFR-A11Y-004, NFR-OBS-013, all mandatory critical browser flows  
**Dependencies:** T28, T29, T30

### Implementation actions

- Pin and configure Playwright.
- Add `test:e2e` script.
- Configure:
  - Dedicated `TEST_DATABASE_URL`
  - Unique test users
  - Owner-only cleanup
  - Parallel-safe data
  - Fake AI
  - Mock job provider
  - Controlled authentication helper
  - Fixed clock where needed
- Cover at minimum:
  1. Authentication entry and protected route
  2. Profile creation/edit
  3. PDF and DOCX import
  4. Manual job import
  5. Discovery/save/dismiss
  6. Fit evaluation
  7. Résumé review/approval/export
  8. Cover generation/edit/export
  9. Interview session/evaluation
  10. Kanban status movement/timeline
  11. Post-interview review
  12. Account deletion
  13. Admin boundaries
  14. AI kill switch
  15. Demo enabled/disabled
- Capture traces/screenshots only on failure and ensure artifacts contain synthetic data.
- Add CI-friendly browser installation documentation.

### Expected files/modules

- `playwright.config.*`
- `tests/e2e/*`
- Test auth/data helpers
- `package.json`
- README

### Acceptance criteria

- Critical flows run without live services.
- Tests use real PostgreSQL persistence.
- Cleanup is owner-scoped.
- Tests are parallel-safe.
- Test artifacts contain only synthetic data.
- Production safety checks prevent accidental target misuse.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test
npm run test:e2e
git diff --check
```

### Commit checkpoint

```text
test(e2e): cover critical job hunter journeys
```

---

## T32 — Complete security, accessibility, performance, and observability hardening

- [ ] Complete T32.

**Requirements:** NFR-SEC-001 through NFR-SEC-007, NFR-A11Y-001 through NFR-A11Y-004, NFR-PERF-001 through NFR-PERF-004, NFR-REL-001 through NFR-REL-004, NFR-OBS-001 through NFR-OBS-014  
**Dependencies:** T31

### Implementation actions

- Perform authorization review of every action, handler, download, and admin operation.
- Add or complete cross-user denial tests.
- Verify origin/CSRF protections for custom handlers.
- Verify upload, text, timeout, concurrency, and pagination bounds.
- Run accessibility checks on major routes.
- Test full keyboard navigation and focus management.
- Verify live-region announcements.
- Review query plans/index use for job search and dashboard aggregates.
- Verify no full journey state is hydrated globally.
- Verify all critical operations are instrumented.
- Verify correlation IDs across request, AI, job, and export paths.
- Verify Sentry redaction and Session Replay disabled.
- Verify logs remain bounded.
- Add missing error, loading, empty, disabled, and rate-limited states.
- Fix discovered defects without changing approved scope.

### Expected files/modules

- Security tests
- Accessibility tests
- Performance query tests
- Observability tests
- Hardened actions/components

### Acceptance criteria

- Cross-user and non-admin access tests pass.
- Critical pages meet automated accessibility checks.
- Kanban is fully keyboard operable.
- Sensitive data cannot reach logs or Sentry mocks.
- Search and aggregate queries are bounded/indexed.
- All expected execution boundaries are observable.
- No debug logging is enabled in Production defaults.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run db:check
git diff --check
```

### Commit checkpoint

```text
chore: harden security accessibility and observability
```

---

## T33 — Consolidate deployment documentation, environment references, and operational runbooks

- [ ] Complete T33.

**Requirements:** DEP-001 through DEP-005, PRIV-006, NFR-OBS-012, NFR-OBS-014, documentation requirements  
**Dependencies:** T32

### Implementation actions

- Consolidate README and `.env.example`.
- Document every environment variable:
  - Purpose
  - Required/optional
  - Server-only/client-safe
  - Local/Preview/Production
  - Feature dependency
- Document Vercel Hobby setup:
  - Environment variables
  - Node runtime
  - Cron
  - System environment variables
  - Runtime Log retention limitation
- Document:
  - Neon database and migrations
  - Safe local/Preview reset
  - Production migration order
  - GitHub OAuth
  - Google OAuth
  - Resend
  - DeepSeek
  - Sentry project and source maps
  - OpenTelemetry
  - Admin bootstrap
  - Feature flags
  - AI quotas
  - Job ingestion cautions
  - Retention/deletion
  - Test database
  - Playwright
- Add manual smoke-test checklists for:
  - OAuth
  - Resend
  - DeepSeek
  - Sentry source maps
  - OTel spans
  - Preview deployment
- Add incident runbooks:
  - Locate by correlation ID
  - AI failure
  - Résumé parser failure
  - Ingestion failure
  - Background job stuck
  - Export failure
  - Database failure
  - Rollback
- Document known limitations.

### Expected files/modules

- `README.md`
- `.env.example`
- Optional `docs/operations/*`
- `vercel.json`
- No functional behavior changes unless documentation verification reveals a defect

### Acceptance criteria

- Every environment variable is documented.
- No real credential appears.
- Sentry external project setup is clear but not performed by Codex.
- Manual live-service checks are separated from automated tests.
- Production reset is explicitly prohibited.
- Rollback and feature-disable procedures are documented.
- Hobby limitations and no-Drain assumption are explicit.

### Required tests and commands

```text
npm run lint
npm run typecheck
npm test
npm run build
npm run db:check
git diff --check
```

### Commit checkpoint

```text
docs: add deployment configuration and runbooks
```

---

## T34 — Run final acceptance gates and prepare the single pull request

- [ ] Complete T34.

**Requirements:** All approved requirements, all approved design decisions, DEP-001, requirement traceability  
**Dependencies:** T33

### Implementation actions

- Review every task checkbox and requirement mapping.
- Confirm exactly one commit exists per top-level task.
- Confirm the branch is up to date with `main`; resolve conflicts without losing approved behavior.
- Run the complete clean-install and validation sequence.
- Review generated migration SQL.
- Verify no Production reset or live-provider operation is part of automated commands.
- Verify no fixture powers authenticated Production routes.
- Verify every risky feature defaults to disabled except local demo mode.
- Verify README and `.env.example` agree with code.
- Inspect bundle boundaries for server-only dependencies.
- Search the repository for:
  - Secrets
  - `.env` files
  - Raw logging of sensitive content
  - Fixture imports in Production domain modules
  - Direct Drizzle calls from UI components
  - Unscoped private record lookups
  - Unpinned new dependencies
  - Accidental live service calls in tests
- Produce a pull-request description containing:
  - Feature summary
  - Architecture summary
  - Migration instructions
  - Vercel environment variables
  - Feature flags
  - Manual verification steps
  - Test results
  - Security and privacy notes
  - Observability setup
  - Known limitations
  - Rollback guidance
- Push `full-job-hunter-journey`.
- Open one PR against `main`.
- Do not merge.

### Expected files/modules

- Final codebase
- Final specifications
- Pull-request description
- No unrelated files

### Acceptance criteria

- Every requirement is implemented or explicitly identified as blocked with stakeholder approval.
- All automated gates pass.
- The PR is reviewable commit by commit.
- The PR contains no secret.
- The PR clearly identifies required manual Vercel configuration.
- The PR clearly identifies JobSpy as experimental and disabled by default.
- The PR clearly identifies Sentry external setup as manual.
- Codex does not merge the PR.

### Required tests and commands

Run from a clean checkout or after removing generated state as appropriate:

```text
npm ci
npm run lint
npm run typecheck
npm test
npm run db:check
npm run build
npm run test:e2e
git diff --check
git status
```

Also run any additional scripts introduced by the implementation, including integration and accessibility suites.

### Commit checkpoint

Use this final task only for small acceptance fixes and PR metadata preparation:

```text
chore: complete full journey acceptance checks
```

If no tracked-file change is needed after validation, make an allowed empty checkpoint commit so the one-task/one-commit rule remains true:

```text
git commit --allow-empty -m "chore: complete full journey acceptance checks"
```

---

## 4. Requirement Coverage Matrix

| Requirement group | Primary tasks |
|---|---|
| Authentication and access | T02, T05, T28, T31, T32 |
| Profile and résumé import | T03, T08, T09, T10 |
| Job acquisition and discovery | T03, T11, T12, T13 |
| AI provider and controls | T02, T07, T14, T15 |
| Fit analysis | T16 |
| Résumé tailoring and export | T17, T18, T19 |
| Cover letters | T20, T21 |
| Interviews | T22, T23, T24 |
| Tracker and outcomes | T25, T26, T27 |
| Learning and strategy | T24, T27 |
| Administration | T05, T13, T15, T29 |
| Privacy and retention | T09, T10, T30 |
| Fixtures and demo | T01, T28, T34 |
| Security | T02 through T34, with final hardening in T32 |
| Accessibility | Every UI task, with final hardening in T32 |
| Performance and reliability | T03, T04, T07, T12, T13, T15, T27, T32 |
| Observability | T06 foundation; every later task instruments its boundaries; T32 verifies completeness |
| Deployment and documentation | T01, incremental updates in every capability, T33, T34 |

## 5. Manual Integration Verification

These checks are **not** automated and must be performed on a Vercel Preview deployment after the PR is ready and required environment variables are configured.

### DeepSeek

- Enable `AI_ENABLED`.
- Confirm a fit evaluation.
- Confirm a résumé generation.
- Confirm a cover-letter generation.
- Confirm an interview evaluation.
- Confirm usage metadata and sanitized Sentry/Runtime Log behavior.
- Disable AI after the test if launch readiness is not approved.

### OAuth

- Confirm GitHub sign-in.
- Confirm Google sign-in.
- Confirm repeat sign-in maps to the same user.
- Confirm disabled account cannot continue.
- Confirm admin allowlist behavior.

### Resend

- Enable `EMAIL_AUTH_ENABLED`.
- Request a magic link.
- Confirm expiration/single-use behavior.
- Confirm response does not reveal whether an account exists.

### Sentry

- Configure project and Vercel variables.
- Trigger controlled server and client exceptions.
- Confirm source maps resolve.
- Confirm release equals Vercel commit SHA.
- Confirm no PII or career content appears.
- Confirm Session Replay is disabled.
- Confirm alert delivery.

### OpenTelemetry and Vercel Logs

- Confirm service registration.
- Confirm custom spans for a controlled critical flow.
- Confirm structured Runtime Log output.
- Confirm correlation ID can be followed across logs and Sentry.
- Confirm behavior does not depend on a Log Drain.

### JobSpy

- Keep disabled initially.
- Enable only in Preview.
- Run a tightly bounded search.
- Confirm timeout, dedupe, partial errors, source attribution, and admin visibility.
- Disable after verification unless separately approved for launch.

## 6. Pull Request Definition of Done

The pull request is ready for stakeholder review only when:

- All T01–T34 checkboxes are complete.
- Every task has exactly one commit.
- All capability checkpoints passed.
- Final full gates passed.
- No Production route depends on fixture data.
- No automated test calls a live integration.
- No secret is committed.
- All new dependencies are pinned.
- Database reset is documented but Production-safe.
- All environment variables are documented.
- Observability is privacy-safe and Hobby-compatible.
- The PR is open against `main`.
- Codex has not merged it.

## 7. Approval

Approval of this task plan authorizes creation of `codex-prompt.md`.

The final Codex prompt must instruct Codex to:

- Read all four specification documents before coding.
- Follow T01–T34 in dependency order.
- Produce exactly one commit per top-level task.
- Keep routes functional after every commit.
- Use fake integrations in automation.
- Preserve visual language and public URLs.
- Stop rather than invent scope when requirements or design conflict.
- Push one branch and open one PR without merging.
