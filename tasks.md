# Tasks: Spec-Driven Implementation Plan

## Phase 0: Repository assessment

- [x] Inspect the existing repository structure and identify whether a Next.js app already exists.
- [x] Record current package manager, scripts, framework versions, TypeScript settings, styling approach, and test tooling.
- [x] Identify any non-Next.js backend code and classify it as reusable business logic, migration candidate, or removal candidate.
- [x] Confirm there are no committed secrets or production `.env` files.

## Phase 1: Next.js foundation

- [x] Ensure the project is a pure Next.js application using the App Router unless a strong repository constraint requires otherwise.
- [x] Add or verify TypeScript configuration.
- [x] Add or verify linting, formatting, and test scripts.
- [x] Establish route groups for auth, dashboard, profile, jobs, applications, interviews, outcomes, and settings.
- [x] Create a shared layout, navigation shell, loading states, error boundaries, and empty states.

## Phase 2: Vercel readiness

- [ ] Verify the app builds with the standard Vercel Next.js preset.
- [ ] Remove assumptions about persistent local filesystem writes in production.
- [x] Document Vercel project creation and deployment steps.
- [x] Add `.env.example` with placeholders only.
- [x] Add centralized environment validation for all required server and client variables.
- [x] Document which variables must be configured in Vercel Cloud for production and preview.

## Phase 3: PostgreSQL data layer

- [x] Select the database toolkit: Prisma, Drizzle, Kysely, or another TypeScript-friendly option.
- [x] Configure PostgreSQL access using a Vercel-compatible connection approach.
- [x] Define migrations for users, profiles, profile sections, evidence items, jobs, searches, evaluations, applications, artifacts, interview preps, outcomes, and audit events.
- [ ] Add migration scripts for local and production workflows.
- [ ] Add seed or fixture data only if it does not include real personal data.
- [ ] Add database access helpers that require authenticated user context.

## Phase 4: Authentication and authorization

- [x] Choose an authentication approach compatible with Next.js and Vercel.
- [x] Configure provider secrets exclusively through environment variables.
- [ ] Protect dashboard routes through middleware or server-side redirects.
- [ ] Add server-side authorization checks for every user-owned read and write.
- [ ] Add tests for cross-user access denial.

## Phase 5: Profile management

- [ ] Build profile overview and editor screens.
- [ ] Implement CRUD for profile sections and evidence items.
- [ ] Add claim verification state: user-approved, AI-suggested, unsupported, or archived.
- [ ] Add profile preferences and constraints for job evaluation.
- [ ] Add validation for profile forms.

## Phase 6: Job discovery and tracking

- [ ] Build jobs inbox with filters, statuses, and sorting.
- [ ] Implement manual job creation from title, company, URL, location, and description.
- [ ] Implement pasted job description ingestion.
- [ ] Add canonical URL and content-based duplicate detection.
- [ ] Add job detail page with notes and status transitions.
- [ ] Reserve integration interfaces for future external job search adapters without implementing browser automation.

## Phase 7: Fit evaluation

- [x] Define scoring rubric and structured evaluation output schema.
- [ ] Implement server-side evaluation flow using profile data, evidence, preferences, constraints, and job text.
- [ ] Persist evaluation scores, explanations, deal-breakers, confidence, and recommendations.
- [ ] Display evaluations on the job detail page.
- [x] Add tests for deal-breaker veto behavior and explainable scoring.

## Phase 8: Application drafting

- [x] Define application artifact types and versioning rules.
- [ ] Implement draft generation from approved profile evidence and target job data.
- [ ] Store draft metadata, source references, approval state, and versions in PostgreSQL.
- [ ] Build application workspace UI for reviewing and editing drafts.
- [x] Add safeguards that flag unsupported claims and require user approval before finalization.

## Phase 9: Interview preparation

- [ ] Implement interview prep generation for an application.
- [ ] Include likely questions, STAR examples, gap-handling notes, and company research placeholders.
- [ ] Store interview prep versions and user notes.
- [ ] Build interview prep UI linked from the application workspace.

## Phase 10: Outcomes and analytics

- [ ] Implement outcome recording for rejections, offers, interviews, follow-ups, silence, and feedback.
- [ ] Build analytics queries for pipeline counts, response rates, stage conversion, and recurring gaps.
- [ ] Build dashboard widgets and outcomes page.
- [ ] Add tests for analytics calculations.

## Phase 11: Security and privacy hardening

- [ ] Validate all form and API inputs with schemas.
- [ ] Add rate limiting or equivalent abuse controls for AI-heavy endpoints.
- [ ] Redact secrets and sensitive payloads from logs.
- [ ] Review client bundles to ensure server-only secrets are not exposed.
- [ ] Add security-focused tests for authorization and validation failures.

## Phase 12: Testing, documentation, and release

- [x] Add or update README with local setup, database setup, Vercel deployment, and environment variable instructions.
- [x] Add unit tests for domain logic.
- [ ] Add integration tests for route handlers or server actions.
- [ ] Add end-to-end smoke tests for sign-in, profile creation, job creation, evaluation, application drafting, and outcome recording where practical.
- [ ] Run lint, type check, tests, migrations, and production build.
- [ ] Deploy to Vercel preview and verify the frontend, auth, PostgreSQL connection, and core workflow smoke tests.

## Definition of done

- [ ] The project is a pure Next.js full-stack application.
- [ ] The frontend is usable in a browser and supports authenticated workflows.
- [ ] PostgreSQL is the only durable database.
- [ ] Production and preview environment variables are configured in Vercel Cloud.
- [ ] The app builds and deploys successfully on Vercel.
- [ ] No production secrets are committed.
- [ ] Requirements, design decisions, and deployment steps are documented.
