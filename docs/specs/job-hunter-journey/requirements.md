# AI Job Platform Journey Enhancement — Requirements

**Document status:** Approved with observability amendment  
**Version:** 0.2  
**Date:** 2026-07-11  
**Target repository:** `alchemy666888/career-ai`  
**Specification path:** `docs/specs/job-hunter-journey/requirements.md`

## 1. Purpose

This document defines the product and quality requirements for enhancing the existing `career-ai` repository into a production-capable, English-language AI job-hunting platform covering the complete job-seeker journey.

The implementation must preserve the product's current visual identity while replacing fixture-driven runtime behavior with authenticated, persistent, testable workflows. The enhancement will be delivered as one large pull request containing logically separated commits.

This document describes **what** the system must do. Architecture, schema, component boundaries, API contracts, and implementation decisions belong in `design.md`.

## 2. Source Materials and Precedence

The implementation must use these sources:

1. This approved `requirements.md`
2. The subsequently approved `design.md`
3. The subsequently approved `tasks.md`
4. The subsequently approved `codex-prompt.md`
5. Existing repository behavior and visual design
6. `ai-job-platform-mvp-design.html`

When sources conflict, the approved specification documents take precedence in the order listed above.

## 3. Product Vision

The platform must provide one coherent journey from profile creation through job discovery, job-fit analysis, tailored application materials, interview preparation, application tracking, post-interview reflection, and strategy iteration.

The platform must differentiate itself through:

- Evidence-backed AI output
- Transparent explanations for recommendations and edits
- User control over AI-authored changes
- Honest fit assessment rather than indiscriminate application volume
- Persistent, traceable progress across the job-search journey

## 4. Product Goals

The MVP enhancement must:

1. Support the full eight-stage job-seeker journey.
2. Replace production fixture state with PostgreSQL-backed persistence.
3. Support broad professional roles, including engineering, design, marketing, sales, and related knowledge-work roles.
4. Support English-language jobs worldwide, with particular relevance to the United States, Malaysia, and Singapore.
5. Provide English-only user interfaces and English-only generated application materials for the initial release.
6. Use a provider abstraction for AI functionality, with DeepSeek as the initial provider.
7. Preserve the existing visual identity while allowing workflow and component restructuring.
8. Be deployable through the existing GitHub-to-Vercel continuous-delivery process.
9. Maintain strict evidence and anti-hallucination controls.
10. Pass all required automated quality, accessibility, security, and build gates.
11. Provide production-grade exception tracing and debugging compatible with Vercel Cloud Hobby.

## 5. Success Criteria

The release is acceptable when:

- A new user can authenticate, create a profile, import a résumé, discover or import a job, receive an evidence-backed fit assessment, tailor a résumé, generate a cover letter, complete a structured interview practice session, track an application, and record post-interview outcomes.
- A returning authenticated user can resume the journey from persisted PostgreSQL data on another browser or device.
- No production journey screen depends on hard-coded fixture data.
- All AI output is traceable to source evidence or clearly marked as unsupported and blocked from final application artifacts until approved.
- Anonymous demo access can be enabled or disabled without code changes.
- Job crawling can be enabled or disabled without code changes.
- The repository passes all mandatory CI and acceptance gates.
- Vercel deployment requirements and every new environment variable are documented in `README.md` and `.env.example`.

## 6. Scope

### 6.1 Included Journey Stages

The implementation must include all eight stages:

1. Registration, authentication, and profile creation
2. Job discovery, filtering, and manual job import
3. AI job-fit matching and gap analysis
4. Transparent, job-specific résumé optimization
5. Personalized cover-letter generation
6. Structured text-based interview preparation and evaluation
7. Manual application submission and Kanban tracking
8. Post-interview feedback, outcome recording, and strategy iteration

### 6.2 Included Platform Capabilities

- GitHub OAuth
- Google OAuth
- Email-based authentication
- Feature-flagged anonymous demo access
- PDF and DOCX résumé import
- PostgreSQL persistence
- Mock-first JobSpy-compatible ingestion
- Manual job import
- DeepSeek-backed AI via a provider interface
- Configurable AI usage controls and global kill switch
- Full résumé export set
- Cover-letter editing and export
- Structured interview sessions
- Drag-and-drop application Kanban
- Timeline and audit events
- Administrative operations
- Account and résumé deletion
- Production-ready documentation and test coverage
- Structured Vercel Runtime Logs
- OpenTelemetry instrumentation through `@vercel/otel`
- Sentry exception monitoring, source maps, and sampled tracing
- Correlation IDs, stable error codes, privacy redaction, and alerting

### 6.3 Explicitly Excluded

The following are out of scope:

- Stripe or donation functionality
- Donation administration
- Automatic submission to external applicant-tracking systems
- Gmail or mailbox integration
- Video, audio, facial-expression, body-language, or speech analysis
- Social networking, referral matching, or community features
- Native mobile applications
- Non-English UI or generated content
- Use of user content for model training
- Storing original résumé file binaries after extraction
- Automatic employer research beyond approved job data unless later approved
- Production dependency on fixture data
- Multi-version cover-letter history

## 7. User Roles

### 7.1 Anonymous Visitor

An anonymous visitor may:

- View public landing and informational pages.
- Enter anonymous demo mode only when the demo feature flag is enabled.
- Never access another user's data.
- Never create durable production user records unless they authenticate.

### 7.2 Authenticated Job Seeker

An authenticated job seeker may:

- Manage their profile and evidence.
- Import and delete résumé data.
- Search, view, save, dismiss, and manually import jobs.
- Run AI-assisted matching and application workflows within configured limits.
- Track applications and interviews.
- Export generated artifacts.
- Delete their account and private data.

### 7.3 Administrator

An administrator may:

- Review ingestion runs and failures.
- Trigger permitted ingestion operations.
- Deactivate problematic job records.
- View aggregate AI usage and cost information.
- Search and manage user account status.
- Inspect audit events.
- Operate AI and ingestion controls.
- Never view raw sensitive AI prompts or résumé content through aggregate operational views unless a narrowly authorized troubleshooting path is explicitly designed and audited.

## 8. Cross-Cutting Business Rules

### BR-001 — Evidence Integrity

The system must not invent employment history, employers, dates, qualifications, skills, achievements, metrics, education, certifications, or other candidate facts.

### BR-002 — Evidence Provenance

Every candidate claim used in AI analysis or generated artifacts must have provenance indicating at least one of:

- Imported from a user-provided résumé
- Entered directly by the user
- Approved by the user after being AI-suggested
- Unsupported and therefore not eligible for final use

### BR-003 — Imported Résumé Trust

Text directly extracted from a user-uploaded résumé is treated as source-backed evidence without requiring a separate confirmation step. The user must be able to correct or delete it.

AI-inferred information not explicitly present in the imported text is not automatically trusted.

### BR-004 — User Control of Tailoring

Each substantive AI-proposed résumé change must be individually accept-able or reject-able before it becomes part of the approved export.

### BR-005 — Honest Matching

Fit scores must include confidence, strengths, gaps, evidence, and an honest assessment. The system must not represent the score as an objective hiring probability.

### BR-006 — Data Isolation

Every private record must be scoped to its owning user. Server-side authorization must be enforced independently of client state.

### BR-007 — Feature Control

Anonymous demo access, live job ingestion, and AI execution must each be independently controllable through server-side configuration without code changes.

### BR-008 — Auditability

Material state transitions, privileged actions, and AI artifact approvals must create auditable events.

## 9. Functional Requirements

## 9.1 Authentication and Access

### AUTH-001 — GitHub OAuth

The system shall allow users to sign in and register with GitHub OAuth.

**Acceptance criteria:**

- A successful OAuth callback creates or links one user identity.
- A returning GitHub user receives the same account.
- Authentication errors are presented without leaking secrets or provider internals.

### AUTH-002 — Google OAuth

The system shall allow users to sign in and register with Google OAuth.

**Acceptance criteria:**

- A successful OAuth callback creates or links one user identity.
- A returning Google user receives the same account.
- Account linking must not create duplicate users for the same verified email without a defined safe-linking rule.

### AUTH-003 — Email Authentication

The system shall support email-based authentication.

**Draft assumption:** passwordless magic-link authentication is used; password storage is not introduced.

**Acceptance criteria:**

- The user can request an authentication link.
- Responses do not disclose whether an email address already has an account.
- Tokens expire and are single-use.
- Rate limiting applies to link requests.

### AUTH-004 — Anonymous Demo Mode

The system shall support an anonymous demo mode controlled by a server-side feature flag.

**Acceptance criteria:**

- Demo mode can be disabled without a deployment-time code change.
- Demo users cannot access production user data.
- Demo state is isolated and resettable.
- Demo mode uses mock job and AI data by default to prevent uncontrolled cost and external crawling.
- The UI clearly identifies demo mode and provides a sign-in path.

### AUTH-005 — Protected Routes

Private journey and admin routes shall enforce authentication and authorization on the server.

**Acceptance criteria:**

- Unauthenticated access redirects or returns an appropriate unauthorized response.
- A user cannot access another user's object by changing a URL, form value, action argument, or API request.
- Non-admin users cannot access admin capabilities.

### AUTH-006 — Sign-Out

The system shall allow users to sign out and invalidate their active application session.

## 9.2 Profile and Résumé Import

### PROF-001 — Profile Management

Users shall be able to create and edit:

- Name
- Professional headline
- Professional summary
- Location
- Target roles
- Preferred locations
- Remote/hybrid/on-site preferences
- Salary preferences where applicable
- Work experience
- Education
- Skills
- Certifications
- Evidence-backed achievements
- Portfolio and professional links

### PROF-002 — Broad Role Support

Profile fields and AI prompts shall not assume the user is a software engineer. They must support engineering, design, marketing, sales, and other professional roles.

### PROF-003 — Profile Completeness

The system shall calculate profile completeness using documented required and recommended fields.

**Acceptance criteria:**

- The user can see the completeness score.
- The user can see the next recommended action.
- The calculation is deterministic and testable.

### RES-001 — Supported Uploads

The system shall accept PDF and DOCX résumé files up to 10 MB.

**Acceptance criteria:**

- Unsupported formats are rejected before parsing.
- Files exceeding 10 MB are rejected.
- MIME type, extension, and parser validation are applied.
- Malformed files fail safely with a user-readable error.

### RES-002 — Extracted Text Storage Only

The system shall process the uploaded file transiently and store extracted text and structured résumé data in PostgreSQL.

**Acceptance criteria:**

- Original PDF or DOCX binary data is not retained after extraction.
- Temporary files are removed after success or failure.
- Extracted content is associated with the authenticated owner.
- The implementation does not store file bytes in PostgreSQL.

### RES-003 — Résumé Parsing

The system shall parse the résumé into editable structured profile and evidence fields.

**Acceptance criteria:**

- Directly extracted statements retain provenance to the imported résumé.
- AI-inferred fields are marked as suggestions unless directly supported by source text.
- Parsing failures do not overwrite existing profile data.
- Re-import behavior is explicit and prevents silent destructive replacement.

### RES-004 — Résumé and Parsed-Data Deletion

Users shall be able to delete imported résumé text and associated parsed data.

**Acceptance criteria:**

- The system explains what linked data will be removed or retained.
- Deletion is authorized and auditable.
- Deleted private content is no longer available to AI workflows.
- Deletion does not remove independently user-authored evidence unless the user explicitly selects it.

### RES-005 — Manual Corrections

Users shall be able to correct imported data, change provenance where permitted, and remove inaccurate claims.

## 9.3 Job Acquisition and Discovery

### JOB-001 — Mock-First Provider Interface

The job-ingestion subsystem shall use a provider interface and a mock provider for development and automated tests.

**Acceptance criteria:**

- Tests do not call live job boards.
- Mock data is deterministic.
- Provider-specific data is normalized into a common job model.
- Provider failures do not corrupt existing job records.

### JOB-002 — JobSpy-Compatible Ingestion

The system shall include a JobSpy-compatible provider for future or controlled live ingestion.

**Draft assumption:** live crawling is disabled by default and requires explicit server-side enablement.

**Acceptance criteria:**

- Enabling or disabling live ingestion does not require code changes.
- Provider errors and partial failures are recorded.
- Rate limits, timeouts, retries, and concurrency limits are configurable.
- Source attribution and source URLs are retained.
- The implementation does not bypass authentication walls or anti-access controls.

### JOB-003 — Scheduled Ingestion

The system shall support scheduled ingestion through a protected Vercel-compatible cron endpoint.

**Acceptance criteria:**

- Cron requests require a secret or equivalent platform authorization.
- A run records start time, finish time, provider, counts, and failures.
- Concurrent duplicate runs are prevented or made idempotent.
- The schedule is documented.

### JOB-004 — Administrative Ingestion Trigger

An administrator shall be able to trigger a permitted ingestion run and inspect its result.

### JOB-005 — Manual Job Import

Authenticated users shall be able to create a job record by:

- Pasting a job description
- Supplying a source URL
- Entering or correcting title, company, location, work style, salary, and closing date when known

**Acceptance criteria:**

- Manual import remains functional when all crawling providers are disabled.
- The user can review and correct imported job data.
- Duplicate detection warns the user before creating a duplicate.
- The source of the record is explicit.

### JOB-006 — Job Normalization and Deduplication

The system shall normalize job records and prevent avoidable duplicates.

Deduplication may use canonical URL, provider external ID, normalized company/title/location, and content hash.

### JOB-007 — Job Discovery

Users shall be able to browse persisted jobs and see:

- Title
- Company
- Location
- Work style
- Salary when available
- Source
- Date posted
- Data freshness
- Match status when available

### JOB-008 — Search and Filtering

Users shall be able to search and filter jobs by:

- Keyword
- Target role
- Location
- Remote/hybrid/on-site
- Salary range when available
- Source
- Date posted or freshness
- Saved status
- Match threshold
- Application status

### JOB-009 — Sorting and Pagination

Job results shall support deterministic sorting and pagination or cursor-based loading.

### JOB-010 — Save, Dismiss, Restore, and Compare

Users shall be able to save, dismiss, restore, and compare jobs without affecting other users.

### JOB-011 — Job Deactivation and Retention

Expired or problematic jobs shall be deactivated rather than immediately deleted. Retention must be configurable.

## 9.4 AI Fit Analysis

### MATCH-001 — Fit Evaluation

An authenticated user shall be able to request a fit evaluation for a persisted profile and job.

### MATCH-002 — Structured Result

A fit evaluation shall include:

- Score from 0 to 100
- Confidence level
- Evidence-backed strengths
- Material gaps
- Requirement-by-requirement coverage
- Recommendations
- Honest narrative assessment
- Deal-breaker indicators when relevant
- Timestamp, provider, and model metadata

### MATCH-003 — Evidence Links

Each strength and coverage claim shall link to or identify supporting profile evidence.

### MATCH-004 — Unsupported Information

Unsupported inferred strengths shall not be presented as established candidate facts.

### MATCH-005 — Re-evaluation

Users shall be able to re-run an evaluation after profile or job changes, subject to rate limits.

### MATCH-006 — Failure Handling

A failed AI request shall not replace the most recent successful evaluation.

## 9.5 Transparent Résumé Optimization

### TAILOR-001 — Job-Specific Tailoring

Users shall be able to generate a résumé draft tailored to one selected job.

### TAILOR-002 — Change-Level Transparency

Each substantive proposed change shall contain:

- Target section or field
- Original text
- Suggested text
- Reason
- Supporting evidence references
- Relevant job requirement or keyword
- Support status
- User decision state

### TAILOR-003 — Accept or Reject

Users shall be able to accept or reject each proposed change individually.

### TAILOR-004 — No Unsupported Final Claims

A change containing an unsupported claim shall not be accepted into the final résumé unless the user first adds or approves valid supporting evidence.

### TAILOR-005 — Manual Editing

Users shall be able to manually edit the working résumé draft.

### TAILOR-006 — Latest and Approved State

The system shall distinguish:

- Original source résumé
- Current working draft
- User-approved export content

### TAILOR-007 — ATS Guidance

The system shall provide ATS-oriented guidance, including relevant keywords, readability warnings, and format warnings, without claiming guaranteed ATS success.

### TAILOR-008 — Export Formats

Users shall be able to export an approved résumé as:

- Markdown
- PDF
- DOCX
- Plain text
- Clipboard content

### TAILOR-009 — Persistence

The latest working and approved résumé state for each job/application shall persist in PostgreSQL.

### TAILOR-010 — Safe Regeneration

Regeneration shall not silently overwrite accepted edits. The user must be able to review the new proposal before replacing current work.

## 9.6 Cover Letters

### COVER-001 — Generation Styles

Users shall be able to generate a cover letter in:

- Professional style
- Enthusiastic style
- Technical style

### COVER-002 — Evidence-Backed Content

The generated letter shall use only supported candidate evidence and approved job information.

### COVER-003 — Rationale

Each paragraph or logical section shall expose its evidence references or generation rationale.

### COVER-004 — Company Context

**Draft assumption:** company context is limited to the supplied and persisted job description and user-approved job metadata. No external company research is performed in this MVP.

### COVER-005 — Manual Editing

Users shall be able to edit the generated letter before export.

### COVER-006 — Single Latest Version

The system shall save only the current latest cover-letter version for a user/job/application combination.

Regeneration or editing may replace the current version only after an explicit user action.

### COVER-007 — Export

**Draft assumption:** cover letters shall support PDF, DOCX, plain text, and copy-to-clipboard export.

### COVER-008 — No Generic Fabrication

The system shall avoid unverified company claims, mission statements, names, or product details.

## 9.7 Structured Interview Preparation

### INT-001 — Session Creation

Users shall be able to create a structured interview session linked to a job and, when applicable, an application.

### INT-002 — Question Generation

The system shall generate role-specific questions based on:

- Approved profile evidence
- Target job requirements
- Selected interview stage
- Selected question categories

### INT-003 — Text Answers

Users shall answer interview questions using text.

### INT-004 — Structured Evaluation

Each answer evaluation shall include:

- Score
- STAR analysis
- Strengths
- Improvement areas
- Relevance to the target role
- Specificity and metric feedback
- Clarity feedback
- A safer improved-answer outline grounded in approved evidence

### INT-005 — Notes and Preparation

Users shall be able to save:

- Interview stage and format
- Schedule details
- Participants
- Preparation checklist
- Selected evidence stories
- Questions to ask
- Free-form notes

### INT-006 — Session Limits

Question count and AI evaluations per session shall be configurable and rate-limited.

### INT-007 — Session Persistence

Questions, answers, scores, notes, and session state shall persist.

### INT-008 — Post-Interview Review

After an interview, users shall be able to record:

- Questions asked
- Self-assessment
- Positive and negative signals
- Feedback received
- Thank-you note draft
- Follow-up date
- Next action

### INT-009 — Strategy Feedback

The platform shall provide evidence-backed recommendations based on recorded outcomes, without inferring employer intent as fact.

## 9.8 Application Tracker and Outcomes

### TRACK-001 — Canonical Status Workflow

The platform shall support these statuses:

`discovered → saved → evaluating → applying → applied → interviewing → offered → accepted`

Terminal or alternate statuses:

`rejected`, `withdrawn`, `declined`, `archived`

### TRACK-002 — Kanban Board

Users shall be able to view applications on a drag-and-drop Kanban board.

### TRACK-003 — Authorized Status Changes

A drag-and-drop or explicit status update shall be persisted server-side and authorized for the owning user.

### TRACK-004 — Timeline Event

Every status change shall create a timeline event containing:

- Previous status
- New status
- Actor
- Timestamp
- Optional note or reason

### TRACK-005 — Application Workspace

Each application shall expose its linked:

- Job
- Fit evaluation
- Résumé
- Cover letter
- Submission checklist
- Notes
- Timeline
- Interviews
- Outcome

### TRACK-006 — Manual Submission

The platform shall direct the user to the external job application URL when available. The user shall manually mark submission as complete.

The platform shall not automatically submit external forms.

### TRACK-007 — Submission Checklist

Users shall be able to confirm role naming, document readiness, links, contact details, evidence coverage, and unsupported-claim checks before marking an application submitted.

### TRACK-008 — Undo and Correction

Users shall be able to correct an accidental status change. The correction must create another timeline event rather than deleting history.

### TRACK-009 — Outcome Recording

Users shall be able to record rejection, withdrawal, offer, acceptance, decline, compensation notes, feedback, and follow-up dates.

### TRACK-010 — Journey Dashboard

The dashboard shall show current progress, next best actions, upcoming interviews, stale applications, and incomplete tasks using persisted data.

## 9.9 Post-Interview Learning and Iteration

### LEARN-001 — Outcome-Based Insights

The system shall summarize patterns from the user's own application and interview data.

### LEARN-002 — Evidence-Based Recommendations

Recommendations may include:

- Strengthening missing evidence
- Improving STAR stories
- Adjusting résumé emphasis
- Reconsidering target-role criteria
- Practicing recurring interview categories
- Following up on stale applications

### LEARN-003 — No False Causality

The system shall not claim that a résumé change or user attribute caused an employer outcome unless the data supports that conclusion.

### LEARN-004 — User Control

The user shall decide whether a recommendation changes profile evidence, target preferences, or application artifacts.

## 9.10 Administration

### ADMIN-001 — Protected Admin Access

All administrative functions shall require an explicit admin role and server-side authorization.

### ADMIN-002 — Ingestion Operations

Administrators shall be able to:

- View ingestion runs
- View provider errors
- Trigger an enabled ingestion provider
- Disable or deactivate problematic jobs
- See source and freshness details

### ADMIN-003 — AI Operations

Administrators shall be able to view aggregate:

- Request counts
- Success and failure counts
- Token or provider usage where available
- Estimated or reported cost
- Rate-limit events
- Model/provider distribution

Sensitive prompts and résumé content shall not appear in aggregate operational views.

### ADMIN-004 — AI Kill Switch

Administrators or deployment operators shall be able to disable AI requests globally without code changes.

### ADMIN-005 — User Management

Administrators shall be able to search users and change account status, including disabling access.

Administrative impersonation is out of scope.

### ADMIN-006 — Audit Inspection

Administrators shall be able to filter and inspect audit events by actor, action, entity type, and date.

### ADMIN-007 — Donation Exclusion

The admin interface shall not contain donation review because donation functionality is excluded.

## 9.11 Privacy, Deletion, and Retention

### PRIV-001 — No Model Training

User content shall not be used to train platform-owned or third-party models.

### PRIV-002 — Sensitive Logging

Raw résumé text, generated application materials, interview answers, authentication secrets, and raw AI prompts shall not be written to standard application logs.

### PRIV-003 — Account Deletion

Users shall be able to request account deletion.

**Acceptance criteria:**

- Private user-owned records are deleted or irreversibly anonymized.
- Active sessions are invalidated.
- The operation is confirmed and protected against accidental execution.
- Any legally or operationally retained audit record contains the minimum necessary information.

### PRIV-004 — AI Request Retention

The platform shall retain only data necessary to provide user-visible history, approved artifacts, debugging metadata, and aggregate usage.

Raw transient provider payloads shall not be retained by default.

### PRIV-005 — Configurable Retention

Audit-event and inactive-job retention periods shall be configurable and documented.

**Draft defaults:**

- Active job freshness window: 7 days unless refreshed
- Inactive job retention: 90 days
- Security and audit-event retention: 365 days
- Aggregated AI usage metrics: 365 days
- Failed transient upload artifacts: deleted immediately

### PRIV-006 — Privacy Notice and Consent

The product shall provide an English privacy notice explaining:

- Data collected
- Purpose of processing
- AI provider involvement
- Retention
- Deletion
- No-training policy
- User controls

### PRIV-007 — Data Export

Users shall be able to export their primary profile, applications, and user-authored journey data in a machine-readable format.

## 9.12 AI Provider, Limits, and Resilience

### AI-001 — Provider Interface

AI features shall use a provider-independent application interface.

### AI-002 — Initial Provider

DeepSeek shall be the initial configured AI provider.

### AI-003 — Configurable Models

Provider and model identifiers shall be configured through validated server-side environment variables rather than hard-coded throughout the application.

### AI-004 — Structured Output

AI features requiring structured data shall validate provider responses against explicit schemas before persistence or display.

### AI-005 — Server-Side Execution

API keys, prompts, evidence assembly, and provider calls shall remain server-side.

### AI-006 — Configurable Limits

The system shall support configurable limits for:

- Per-user AI requests per day
- Per-IP anonymous requests
- Résumé generations per user/job/day
- Cover-letter generations per user/job/day
- Interview questions per session
- Interview evaluations per session
- Concurrent provider requests
- Request timeout
- Retry count
- Monthly usage or spending threshold where provider data permits

### AI-007 — Conservative Defaults

Default limits shall prevent a single user or IP from consuming disproportionate capacity while allowing completion of the primary journey.

Exact values shall be defined in `design.md`.

### AI-008 — Global Kill Switch

A server-side configuration value shall disable all live AI provider calls.

When disabled:

- Existing persisted content remains available.
- The UI explains that generation is temporarily unavailable.
- No provider call is attempted.

### AI-009 — Failure Safety

Timeouts, provider errors, invalid responses, and rate limits shall return safe user-facing errors and shall not corrupt the latest successful user data.

### AI-010 — Usage Recording

Each live AI call shall record non-sensitive operational metadata sufficient for quotas, troubleshooting, and cost reporting.

## 9.13 Notifications and Next Actions

### UX-001 — Action Feedback

Mutating actions shall provide clear success, pending, validation, and failure feedback.

### UX-002 — Recoverability

Destructive or overwriting actions shall require confirmation or provide an undo path where feasible.

### UX-003 — Empty and Disabled States

Every major screen shall define useful empty, loading, error, rate-limited, disabled-feature, and unauthorized states.

### UX-004 — Current Visual Identity

The implementation shall preserve the repository's established visual identity and interaction quality while permitting component and workflow restructuring.

### UX-005 — Responsive Design

All primary journey and admin screens shall be usable on supported mobile, tablet, and desktop viewport sizes.

## 10. Data Requirements

The final design may revise the existing schema but must preserve useful evidence, provenance, artifact, outcome, and audit concepts.

The persistent model must support at minimum:

- Users and linked authentication accounts
- User roles and account status
- Profiles
- Structured profile sections
- Résumé source text
- Evidence items and provenance
- Job records and sources
- Job ingestion runs and errors
- Saved/dismissed user-job state
- Fit evaluations
- Applications and status history
- Résumé working and approved artifacts
- Latest cover letter
- Interview sessions, questions, answers, and evaluations
- Post-interview reviews
- Outcomes and follow-ups
- AI usage and quota events
- Audit events
- Feature configuration where not supplied exclusively by environment variables

All migrations must be forward-only, reviewable Drizzle migrations. Existing useful data must not be destructively dropped without an explicit migration and documented rationale.

## 11. Fixture and Seed Requirements

### FIX-001 — No Production Fixtures

Hard-coded fixture records shall not power production user journeys.

### FIX-002 — Permitted Fixture Use

Fixtures are permitted only in:

- Unit tests
- Integration tests
- Browser tests
- Isolated component examples or Storybook-style examples
- Optional local-development seed scripts
- Anonymous demo mode when clearly isolated and labelled

### FIX-003 — Determinism

Test fixtures and seeds shall be deterministic and must not require live AI or job-provider calls.

## 12. Non-Functional Requirements

## 12.1 Security

### NFR-SEC-001

All private and administrative data access must be authorized server-side.

### NFR-SEC-002

All external input must be validated using explicit schemas.

### NFR-SEC-003

Uploaded documents must be processed as untrusted input with file-size, type, parser, and resource limits.

### NFR-SEC-004

Secrets must exist only in local ignored environment files or Vercel Cloud environment configuration.

### NFR-SEC-005

State-changing HTTP endpoints must use appropriate method, session, origin, and CSRF protections.

### NFR-SEC-006

Rendered job descriptions and generated content must be sanitized against script injection.

### NFR-SEC-007

Rate limiting must apply to authentication, uploads, live AI calls, manual imports, and privileged ingestion triggers.

## 12.2 Privacy

### NFR-PRIV-001

The application shall minimize stored personal data and log only non-sensitive operational metadata.

### NFR-PRIV-002

Third-party AI data transmission must be disclosed in the privacy notice.

### NFR-PRIV-003

Deletion operations must be verified with automated tests.

## 12.3 Accessibility

### NFR-A11Y-001

Primary user journeys shall conform to WCAG 2.2 AA to the extent testable in the product.

### NFR-A11Y-002

All functionality must be keyboard operable, including Kanban status movement through a non-drag alternative.

### NFR-A11Y-003

Forms must have programmatic labels, error association, focus management, and screen-reader announcements for asynchronous changes.

### NFR-A11Y-004

Color shall not be the sole indicator of score, status, provenance, or error.

## 12.4 Performance

### NFR-PERF-001

List endpoints shall use bounded pagination and indexed queries.

### NFR-PERF-002

AI and ingestion work shall not block unrelated page rendering.

### NFR-PERF-003

Large job descriptions and résumé content shall be bounded before provider submission, with deterministic truncation or summarization rules documented in the design.

### NFR-PERF-004

The application shall avoid loading an authenticated user's entire journey state into one browser-side payload.

## 12.5 Reliability and Observability

### NFR-REL-001

External provider operations must implement timeouts and safe failure paths.

### NFR-REL-002

Scheduled ingestion must be idempotent or duplicate-safe.

### NFR-REL-003

The system shall emit structured, non-sensitive logs with correlation identifiers for external operations.

### NFR-REL-004

Health and operational diagnostics shall not expose secrets or private user content.

## 12.6 Observability, Logging, and Exception Tracing

### NFR-OBS-001 — Hobby-plan compatibility

The observability implementation shall run on Vercel Cloud Hobby and shall not require Vercel Observability Plus, Log Drains, Trace Drains, or a paid Vercel plan. Because Hobby Runtime Logs are retained for only a short period, they shall not be the sole durable exception-history mechanism.

### NFR-OBS-002 — Required observability stack

The production stack shall include:

- Vercel Runtime Logs for immediate request and function debugging
- OpenTelemetry instrumentation through `@vercel/otel`
- Sentry for durable exception grouping, readable stack traces, release correlation, sampled tracing, and alerts
- PostgreSQL audit events for business and privileged state changes
- PostgreSQL operational records for AI usage, ingestion runs, and background jobs

Application logs, traces, audit events, and usage records shall remain separate concepts.

### NFR-OBS-003 — Structured logs

Application logs shall be bounded, single-line JSON written to standard output or standard error. Each meaningful event shall include, where available, severity, stable event name, stable error code, correlation ID, trace ID, operation or route, safe entity identifiers, duration, environment, deployment, region, branch, and commit metadata. Batch operations shall emit summaries rather than one log per row. Debug logging shall be disabled in production by default.

### NFR-OBS-004 — Correlation IDs

Every server action, route handler, background-job attempt, AI call, ingestion run, résumé parse, document export, and administrative operation shall create or propagate a validated correlation ID. The same ID shall appear in structured logs, OpenTelemetry spans, Sentry tags, safe user-facing error references, and related operational records.

### NFR-OBS-005 — Stable error taxonomy

Operational failures shall map to stable machine-readable codes covering authentication, authorization, validation, database failures, AI provider failures, invalid AI responses, résumé parsing, job providers, exports, background jobs, cron authorization, rate limits, feature-disabled conditions, and internal errors. User-facing messages shall not expose stack traces, secrets, SQL, or provider payloads.

### NFR-OBS-006 — OpenTelemetry

The application shall initialize OpenTelemetry through `@vercel/otel` and add custom Node.js spans around authentication, profile operations, résumé parsing and structuring, job search and ingestion, AI generation, application status changes, exports, background jobs, and admin operations. Span attributes shall contain only safe operational metadata and never user content.

### NFR-OBS-007 — Sentry

Sentry shall capture unexpected server, client, App Router, route-handler, and background-job exceptions. Production source maps shall be uploaded during the Vercel build. Events shall include release, environment, correlation ID, stable error code, and safe operation metadata.

### NFR-OBS-008 — Privacy and redaction

The observability pipeline shall omit or redact résumé text, cover-letter content, interview content, raw AI prompts and responses, email addresses, cookies, authorization headers, OAuth and magic-link tokens, API keys, database URLs, SQL parameters, uploaded bytes, and unbounded request or response bodies. Sentry default PII collection and Session Replay shall be disabled. A `beforeSend` or equivalent safeguard shall enforce redaction.

### NFR-OBS-009 — Error boundaries

The application shall provide global and route-level error boundaries that capture unexpected exceptions, show a safe accessible message, expose a short correlation reference, and never display raw production stack traces.

### NFR-OBS-010 — Alerting

The production setup shall document Sentry and Vercel alert procedures for repeated unhandled exceptions, HTTP 5xx spikes, AI provider failures, invalid AI outputs, résumé parser failures, final background-job failures, stale locks, missed scheduled runs, database failure clusters, export failures, and authentication anomalies.

### NFR-OBS-011 — Tests

Automated tests shall verify structured output, correlation propagation, stable error mapping, redaction, safe error boundaries, Sentry sanitization through mocks, OpenTelemetry span closure on success and failure, and that logging failures do not break the original business operation.

### NFR-OBS-012 — Future upgrades

Vercel Log Drains, Trace Drains, Observability Plus, and third-party long-term log analytics are optional future upgrades and shall not be required by the MVP.

## 12.7 Maintainability

### NFR-MAINT-001

TypeScript strictness shall be preserved.

### NFR-MAINT-002

Provider-specific logic shall be isolated from domain and UI logic.

### NFR-MAINT-003

Business rules and state transitions shall be tested independently from presentation components.

### NFR-MAINT-004

The implementation shall reuse existing useful repository concepts rather than duplicate them without rationale.

## 12.8 Compatibility

### NFR-COMP-001

The application must remain compatible with the repository's Next.js App Router deployment model.

### NFR-COMP-002

PostgreSQL remains the only durable database.

### NFR-COMP-003

Drizzle remains the schema and migration tool.

### NFR-COMP-004

Auth.js remains the authentication framework unless the design identifies a blocking incompatibility and receives approval.

## 13. Deployment and Configuration Requirements

### DEP-001 — Delivery Workflow

Codex shall:

1. Create or use one implementation branch.
2. Make logically separated commits.
3. Push the branch to GitHub.
4. Open one pull request against `main`.
5. Not merge the pull request.

The repository owner will review and manually merge. Vercel Cloud will deploy from `main`.

### DEP-002 — Vercel Compatibility

The application must build and run on Vercel using PostgreSQL and serverless-compatible libraries.

### DEP-003 — Environment Documentation

Every existing and new environment variable shall be:

- Listed in `.env.example` with a safe placeholder
- Described in `README.md`
- Classified as server-only or client-safe
- Marked required or optional
- Documented for Preview and Production configuration in Vercel Cloud

Likely new configuration categories include:

- DeepSeek API credentials
- AI provider and model identifiers
- AI kill switch
- AI quota and concurrency settings
- Email authentication provider settings
- Google OAuth settings
- Anonymous demo flag
- Live ingestion flag
- Job-provider configuration
- Cron secret and schedule
- Admin identity or role bootstrap configuration
- Retention settings

Exact names belong in `design.md`.

### DEP-004 — No Committed Secrets

No real secret, production URL credential, database password, or API key may be committed.

### DEP-005 — Database Migrations

Production schema changes must be represented by committed Drizzle migrations and documented deployment steps.

## 14. Quality and Acceptance Gates

Every completed implementation must pass:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run db:check`
- Drizzle migration generation and review
- Unit tests
- Route-handler and server-action integration tests
- Critical user-flow browser tests
- Accessibility checks
- Security and authorization checks
- Structured logging and redaction tests
- OpenTelemetry instrumentation tests
- Sentry exception-capture and source-map checks

### 14.1 Mandatory Critical Browser Flows

Automated browser tests must cover at least:

1. Authentication entry and protected-route behavior
2. Profile creation and editing
3. PDF or DOCX résumé import using safe fixtures
4. Manual job import
5. Job discovery and saved/dismissed state
6. Fit evaluation using a mock AI provider
7. Résumé change review, acceptance, and export
8. Cover-letter generation, editing, and export
9. Interview session completion and evaluation
10. Kanban status movement and timeline creation
11. Post-interview review
12. Account deletion
13. Admin authorization boundaries
14. AI kill-switch behavior
15. Anonymous demo enabled and disabled states

### 14.2 Mandatory Authorization Tests

Tests must prove that:

- User A cannot read or mutate User B's profile, job state, application, artifacts, interviews, or outcomes.
- A non-admin cannot invoke administrative actions.
- Cron and ingestion endpoints reject unauthorized requests.
- Anonymous demo sessions cannot access production user records.

### 14.3 Live Provider Testing

Automated tests must not require DeepSeek, GitHub, Google, email, JobSpy, or other live external services.

Provider contract tests shall use deterministic fakes or mocks. Optional manual smoke-test steps may be documented separately.

## 15. Documentation Requirements

The implementation shall update:

- `README.md`
- `.env.example`
- Local setup instructions
- Database migration instructions
- Vercel Preview and Production configuration
- Authentication provider setup
- DeepSeek setup
- Job-ingestion flags and operational cautions
- Cron setup
- Admin bootstrap instructions
- Rate-limit and kill-switch configuration
- Data deletion and retention behavior
- Test commands
- Known MVP limitations
- Vercel Hobby Runtime Log retention limitations
- Correlation-ID debugging procedure
- Sentry setup, source-map upload, privacy settings, and alerts
- OpenTelemetry span naming and debugging
- Prohibited logging fields and redaction rules

## 16. Requirement Traceability

Each task in `tasks.md` must reference one or more requirement IDs from this document.

Each critical requirement must map to:

- An implementation task
- One or more acceptance checks
- An automated test where practical

No task may silently change an approved requirement. Required changes must update this document first.

## 17. Assumptions Requiring Approval

This draft uses the following assumptions:

1. Email authentication uses passwordless magic links, not passwords.
2. Anonymous demo mode uses isolated fixture data and mock AI responses by default.
3. Live JobSpy crawling is implemented behind a provider interface but disabled by default.
4. Directly extracted résumé content is trusted as source-backed without separate review; AI-inferred additions still require approval.
5. Company context for cover letters is limited to the supplied job description and user-approved job metadata.
6. Cover letters export to PDF, DOCX, plain text, and clipboard.
7. Donation functionality and donation administration are fully excluded.
8. Active jobs expire after 7 days unless refreshed; inactive jobs are retained 90 days.
9. Audit and aggregate AI usage records are retained 365 days.
10. The documents are written in English under `docs/specs/job-hunter-journey/`.
11. The current PostgreSQL provider may remain in use; the implementation must not assume migration to a different database vendor.
12. One pull request may contain many atomic commits and must remain reviewable despite the full-MVP scope.

## 18. Approval

Approval of this document means:

- The functional scope is accepted.
- The stated assumptions are accepted or explicitly amended.
- `design.md` may be produced from these requirements.
- Architecture or implementation choices in `design.md` must not reduce this scope without approval.
