# Codex Execution Prompt — Full AI Job-Hunter Journey

## Mission

Enhance the public GitHub repository:

```text
https://github.com/alchemy666888/career-ai.git
```

Implement the complete AI job-hunter journey defined by the approved specification documents under:

```text
docs/specs/job-hunter-journey/
├── requirements.md
├── design.md
├── tasks.md
└── codex-prompt.md
```

Work autonomously through the complete approved task plan unless a defined stop condition occurs.

The final delivery must be one reviewable GitHub pull request from:

```text
full-job-hunter-journey
```

into:

```text
main
```

Do not merge the pull request.

---

# 1. Mandatory First Actions

Before editing application code:

1. Read all four specification documents completely.
2. Inspect the current repository state.
3. Confirm the current `main` branch commit SHA.
4. Confirm the working tree is clean.
5. Create or switch to:

```text
full-job-hunter-journey
```

6. Create:

```text
docs/specs/job-hunter-journey/implementation-log.md
```

7. Record in the implementation log:
   - Starting `main` SHA
   - Start date
   - Branch name
   - Initial command results
   - Any confirmed pre-existing failures
8. Execute T01 through T34 from `tasks.md` in dependency order.
9. Do not pause for approval between tasks unless a defined stop condition occurs.

Do not begin implementation from a stale mental model. Inspect the actual repository, package versions, routes, schema, tests, and current branch before making decisions.

---

# 2. Controlling Documents and Precedence

Use this precedence order whenever sources conflict:

```text
requirements.md
    ↓
design.md
    ↓
tasks.md
    ↓
codex-prompt.md
    ↓
existing repository behavior
```

The existing repository may inform implementation details, but fixture-era behavior must not override the approved specifications.

## 2.1 Specification editing restrictions

Treat these documents as read-only:

```text
requirements.md
design.md
codex-prompt.md
```

Do not alter their wording, requirements, architecture decisions, scope, or acceptance criteria.

`tasks.md` is also substantively read-only. You may modify only:

- The checkbox for the top-level task being completed
- Its nested completion checkboxes when present
- Purely mechanical progress markers explicitly required by the task plan

Do not rewrite task instructions, dependencies, requirement mappings, acceptance criteria, command lists, or commit subjects.

Record discoveries, blockers, validation results, and approved deviations in:

```text
implementation-log.md
```

Do not silently change the approved specifications to fit the implementation.

---

# 3. Autonomy and Decision Policy

When a minor implementation detail is not prescribed:

- Choose the safest reasonable option.
- Keep it consistent with the approved requirements and design.
- Prefer simple, testable, maintainable solutions.
- Prefer existing repository conventions when they do not conflict with the specifications.
- Minimize new infrastructure and dependencies.
- Preserve Vercel Node.js and Neon compatibility.
- Document consequential choices in the implementation log.

Stop only when a decision would materially change:

- Product scope
- Architecture
- Privacy
- Security
- Data retention
- Authorization
- Deployment model
- Operational cost
- External-service dependence
- Approved user experience
- Migration safety

Do not stop for trivial naming, file placement, formatting, or internal refactoring decisions that can be resolved safely.

---

# 4. Scope Discipline

Implement only the approved scope.

Explicitly do not add:

- Donation or Stripe functionality
- Automatic job submission
- Gmail or mailbox integration
- Video interviews
- Audio interviews
- Facial-expression analysis
- Body-language analysis
- External company research
- Social networking
- Referral matching
- Native mobile applications
- Non-English UI
- Non-English generated materials
- Sentry Session Replay
- Production fixture dependencies
- User-content model training
- Unrequested analytics products
- Unrelated dependency upgrades
- Broad visual redesigns
- User impersonation
- Automatic fetching of arbitrary manual job URLs
- Extra AI providers beyond the approved abstraction and deterministic fake unless required for compatibility
- Additional infrastructure services without a defined blocker and stakeholder approval

Do not use implementation convenience as a reason to reduce approved functionality.

---

# 5. Branch and Git Safety

## 5.1 Required branch

All implementation work must occur on:

```text
full-job-hunter-journey
```

Never commit directly to `main`.

## 5.2 Prohibited Git actions

Never:

- Merge the pull request
- Force-push `main`
- Rewrite published task commits unless required to remove an exposed secret
- Delete unrelated user work
- Remove unrelated branches
- Commit local environment files
- Commit credentials
- Commit uploaded résumés
- Commit real user data
- Commit Playwright screenshots, videos, traces, or reports
- Commit generated document binaries
- Commit database dumps
- Commit production logs
- Commit Sentry payloads
- Commit `.DS_Store`, editor state, or temporary build artifacts
- Run destructive Production database commands

## 5.3 Main synchronization

Before final acceptance and PR creation:

1. Fetch the latest `main`.
2. Merge the latest `main` into `full-job-hunter-journey`.
3. Resolve conflicts without losing approved behavior.
4. Re-run the full validation suite.

A final synchronization merge commit is permitted and is not counted as one of the 34 required task commits.

Do not rebase published task commits because the task history must remain reviewable and stable.

---

# 6. Exactly One Commit per Top-Level Task

Complete T01 through T34.

Each top-level task must produce exactly one task commit.

Use the prescribed commit subject exactly where practical.

Before every task commit:

1. Confirm all task dependencies are complete.
2. Complete all implementation actions.
3. Update the relevant task checkbox in `tasks.md`.
4. Update `implementation-log.md`.
5. Run the task's required commands.
6. Fix every newly introduced failure.
7. Inspect:

```text
git status
git diff
git diff --check
git diff --cached
```

8. Confirm no unrelated or sensitive files are staged.
9. Commit once.

Do not:

- Split one top-level task into multiple commits
- Combine multiple top-level tasks into one commit
- Mark a task complete before all acceptance criteria and required checks pass
- Use `--no-verify` to bypass project checks
- Amend already published task commits for cosmetic reasons

T34 may use an empty commit when the task requires no tracked-file change:

```text
git commit --allow-empty -m "chore: complete full journey acceptance checks"
```

---

# 7. Implementation Log

Create and maintain:

```text
docs/specs/job-hunter-journey/implementation-log.md
```

Use a concise structure such as:

```markdown
# Implementation Log

## Baseline
- Starting main SHA:
- Branch:
- Started:
- Pre-existing failures:

## Task Progress
| Task | Status | Commit SHA | Validation | Notes |
|---|---|---|---|---|

## Manual Verification Required
...

## Deviations and Blockers
...
```

For every completed task, record:

- Task ID
- Commit SHA
- Commands run
- Pass/fail result
- Notable implementation choice
- Manual verification still required
- Any approved deviation
- Any pre-existing issue encountered

Do not include:

- Secrets
- Tokens
- Environment values
- Résumé text
- AI prompts or responses
- User emails
- Real personal data
- Raw production logs
- Sensitive test output

Because a commit cannot include its own SHA before it exists, update the task row using one of these safe approaches:

- Record the short SHA in the next task's implementation-log update, or
- Record `HEAD after commit` and reconcile all SHAs in T34

Do not create an extra commit solely to backfill a task's own SHA.

---

# 8. Validation Policy

## 8.1 Every task

At minimum run:

```text
npm run lint
npm run typecheck
```

and the targeted tests listed in `tasks.md`.

## 8.2 Capability checkpoints

At every capability-group checkpoint, also run:

```text
npm test
npm run build
npm run db:check
```

plus any migration, integration, accessibility, or browser commands required by the task.

## 8.3 Final validation

Before opening the PR, run from a clean dependency state when practical:

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

Run any additional scripts introduced by the implementation, including integration and accessibility suites.

## 8.4 Newly introduced failures

Fix every newly introduced:

- Lint failure
- Type error
- Unit-test failure
- Integration-test failure
- Browser-test failure
- Build failure
- Migration failure
- Accessibility failure
- Security failure
- Authorization failure
- Redaction failure
- Observability failure

before committing the corresponding task.

## 8.5 Pre-existing failures

When a failure is confirmed to exist on the starting commit, record:

- Exact command
- Error summary
- Evidence that it exists on the starting commit
- Whether it blocks the enhancement
- Smallest remediation if it blocks a required task

Fix only the smallest necessary pre-existing issue when it blocks approved work.

Do not expand the PR into unrelated defect cleanup.

---

# 9. Database Safety

Codex may:

- Create local databases
- Create dedicated test databases
- Use `TEST_DATABASE_URL`
- Generate Drizzle migrations
- Review generated SQL
- Apply migrations to local or dedicated test databases
- Add safe development and Preview reset tooling
- Document Preview and Production migration commands

Codex must not:

- Reset Production
- Apply destructive migrations to Production
- Connect automated tests to Production
- Use `DATABASE_URL` when a task requires `TEST_DATABASE_URL`
- Assume Preview and Production share a database
- Automatically apply migrations to Vercel Production
- Drop meaningful Production data
- Hide destructive SQL
- Bypass migration review

All reset tooling must refuse Production based on explicit environment checks.

No meaningful Production data is expected, but migration safety remains mandatory.

---

# 10. External-Service Restrictions

Automated implementation and tests must not make live calls to:

- DeepSeek
- GitHub OAuth
- Google OAuth
- Resend
- Sentry ingestion
- JobSpy
- Indeed
- LinkedIn
- Glassdoor
- Employer career pages
- Any other live job board
- Any arbitrary user-provided URL

Use:

- Deterministic fake AI
- Mock job providers
- Authentication adapter/configuration tests
- Mock email transport
- Mock Sentry transport or capture hooks
- Test PostgreSQL
- Synthetic document fixtures

Manual Preview smoke-test instructions are required, but Codex must not perform those live verifications automatically.

## 10.1 DeepSeek secret

The Vercel project already contains:

```text
DEEPSEEK_API_KEY
```

Never:

- Read it
- Print it
- Copy it
- Replace it
- Commit it
- Expose it to client code
- Include it in logs
- Include it in documentation

Only reference the environment-variable name.

## 10.2 Sentry

Implement Sentry code and document setup.

Do not create or configure the external Sentry project.

Automated tests must mock:

- Event capture
- Transport
- Source-map upload behavior where applicable

Session Replay must remain disabled.

## 10.3 Vercel

Do not:

- Modify Vercel Cloud settings
- Add or change Vercel environment values
- Trigger Production deployment
- Change project ownership
- Change deployment protection
- Upgrade the Vercel plan

Only document required settings.

---

# 11. Default Feature State During Implementation

Use safe development defaults:

```text
AI_ENABLED=false
EMAIL_AUTH_ENABLED=false
LIVE_JOB_INGESTION_ENABLED=false
ADMIN_INGESTION_ENABLED=false
ANONYMOUS_DEMO_ENABLED=true
SENTRY_ENABLED=false
OTEL_ENABLED=true
```

Tests use deterministic fakes.

Risky integrations must remain disabled by default until manually enabled in a configured Preview or Production environment.

Core persisted workflows must not require live AI, crawling, email, or Sentry to build and test.

---

# 12. Architecture Enforcement

Implement the approved server-first modular monolith.

Required application flow:

```text
Server Component / Server Action
        ↓
Domain service
        ↓
Authorization + validation
        ↓
Repository
        ↓
Drizzle / Neon PostgreSQL
```

Use route handlers for:

- Auth callbacks
- Cron
- Protected downloads
- Health checks
- Genuine external HTTP boundaries

Do not:

- Call Drizzle directly from UI components
- Trust client-supplied user IDs
- Store production journey state only in React context
- Let external adapters contain domain authorization rules
- Let repositories read sessions
- Let domain services depend directly on DeepSeek-specific SDK types
- Put server-only dependencies into client bundles
- Run heavy document, AI, export, or custom-span work on Edge runtime

Maintain the module boundaries defined by `design.md`.

---

# 13. Authorization and Data Isolation

Server-side authorization is mandatory for every private operation.

Every private query or mutation must be scoped to the authenticated owner.

Prefer patterns such as:

```ts
findApplicationForUser(applicationId, userId)
```

Do not rely on:

```ts
findApplicationById(applicationId)
```

followed only by client-side checks.

Tests must prove:

- User A cannot read User B's profile
- User A cannot update User B's résumé
- User A cannot access User B's job state
- User A cannot access User B's application
- User A cannot export User B's artifact
- User A cannot access User B's interviews or outcomes
- Non-admin users cannot access admin operations
- Demo mode cannot access production data
- Cron endpoints reject unauthorized requests

Do not mark security-sensitive tasks complete until these boundaries are tested.

---

# 14. Evidence and AI Safety

Treat the evidence policy as a hard product invariant.

AI must never invent:

- Employers
- Employment history
- Dates
- Qualifications
- Skills
- Education
- Certifications
- Achievements
- Metrics
- Projects
- Job experience
- Company information

Every generated candidate claim must derive from:

- Directly imported résumé evidence
- User-entered evidence
- User-approved evidence

Unsupported claims must:

- Be clearly labelled
- Be blocked from approved artifacts
- Offer an “add evidence” path where specified

Every structured AI response must:

- Be validated with Zod
- Use valid evidence IDs
- Be rejected when malformed after the permitted repair attempt
- Preserve the latest successful user data when a provider call fails

Never log:

- AI prompts
- AI responses
- Résumé text
- Cover letters
- Interview answers

---

# 15. Observability Requirements

Implement the approved Hobby-compatible stack:

```text
Vercel Runtime Logs
        +
OpenTelemetry through @vercel/otel
        +
Sentry
        +
PostgreSQL audit and operational records
```

## 15.1 Structured logging

Use bounded single-line JSON.

Include safe fields such as:

- Severity
- Stable event name
- Stable error code
- Correlation ID
- Trace/span ID
- Operation
- Safe entity ID
- Duration
- Provider/model
- Retry
- Background-job ID
- Vercel environment/deployment/commit metadata

Do not log arbitrary objects.

## 15.2 Redaction

Never emit:

- Résumé content
- Cover-letter content
- Interview content
- Raw AI payloads
- Email addresses
- Cookies
- Authorization headers
- OAuth tokens
- Magic-link tokens
- API keys
- Database URLs
- Raw SQL parameters
- Uploaded bytes
- Unbounded request bodies
- Unbounded provider errors

Use allowlist-based event metadata.

Logging failures must never fail the business operation.

## 15.3 Correlation IDs

Propagate correlation IDs through:

- Server actions
- Route handlers
- Background jobs
- Cron
- AI calls
- Parsing
- Ingestion
- Exports
- Sentry tags
- OpenTelemetry spans
- Safe user-facing error references

## 15.4 Sentry privacy

Configure:

- `sendDefaultPii: false`
- Session Replay disabled
- Sanitizing `beforeSend`
- No sensitive request bodies
- No user email in context
- Configurable trace sampling
- Source maps linked to Vercel commit SHA

## 15.5 Hobby limitations

Do not depend on:

- Vercel Log Drains
- Vercel Trace Drains
- Observability Plus
- Paid Vercel retention

Document that Hobby Runtime Logs are short-lived and Sentry supplies durable exception history.

---

# 16. UI and Route Preservation

Preserve:

- Existing public route URLs
- Current overall visual language
- Current recognizable product identity
- Existing route functionality after every task commit

Changes are permitted when required for:

- Accessibility
- New approved workflows
- Responsive behavior
- Error states
- Empty states
- Loading states
- Disabled-feature states
- Rate-limit states
- Security
- Better component boundaries

Do not replace the product with a visually unrelated design.

The production application must not depend on hard-coded journey fixtures.

Fixtures may exist only in:

- Unit tests
- Integration tests
- Playwright tests
- Isolated component examples
- Development seed tooling
- Browser-local anonymous demo mode

---

# 17. Accessibility

Meet the approved WCAG 2.2 AA-oriented requirements.

At minimum:

- Keyboard-operable controls
- Keyboard alternative to drag and drop
- Visible focus
- Semantic headings and landmarks
- Programmatic form labels
- Associated validation errors
- Focus management in dialogs and errors
- Screen-reader announcements for asynchronous changes
- Textual score/status/provenance indicators
- Reduced-motion support
- Accessible empty/loading/error states

Do not treat automated axe checks as sufficient by themselves.

Test critical keyboard workflows in Playwright.

---

# 18. Dependency Policy

For every new dependency:

- Pin an exact compatible version.
- Review maintenance status.
- Review security implications.
- Review Vercel Node.js compatibility.
- Review bundle/runtime placement.
- Avoid unnecessary install scripts.
- Avoid packages with disproportionate risk.
- Record the reason for major dependencies in implementation notes or documentation.
- Remove unused dependencies before final acceptance.

Do not perform a repository-wide upgrade.

Do not change existing package ranges unless necessary for compatibility with an approved task.

When multiple libraries can satisfy a need, prefer:

- Maintained package
- Minimal API surface
- Serverless compatibility
- TypeScript support
- Deterministic tests
- Lower transitive dependency risk

---

# 19. Existing Defects

When a pre-existing defect blocks a required task:

1. Confirm it exists on the starting `main` SHA.
2. Record it in `implementation-log.md`.
3. Fix the smallest necessary issue.
4. Keep the fix within the same affected task commit.
5. Do not broaden scope.

When a pre-existing defect is unrelated and non-blocking:

- Record it briefly if important.
- Do not fix it in this PR.

---

# 20. Stop Conditions

Stop autonomous implementation and report a blocker when you discover:

- A committed secret
- Evidence of active data loss
- A migration that could destroy meaningful Production data
- An authorization design that cannot satisfy user isolation
- A required package with unacceptable security risk
- A required package that cannot run in the approved Vercel deployment
- A material conflict between approved specifications
- A material scope change required to proceed
- A legal or access-control issue that makes the requested live ingestion behavior unsafe
- A repository state showing unrelated work would be overwritten
- A Production database connection being used by automated tests
- A required external credential being unavailable for build-time code that cannot be safely disabled or mocked

If you accidentally introduce a secret:

1. Stop.
2. Remove it from the working tree and Git history as necessary.
3. Do not conceal the incident.
4. Record the remediation.
5. Report that credential rotation may be required.

Do not stop for minor implementation choices covered by the autonomy policy.

---

# 21. Partial Completion

If all 34 tasks cannot be completed:

1. Keep completed task commits passing.
2. Do not mark incomplete tasks complete.
3. Push the completed branch.
4. Open a **draft pull request**.
5. Document:
   - Completed tasks
   - Incomplete tasks
   - Exact blocker
   - Validation results
   - Security or data implications
   - Recommended next action
6. Do not claim full completion.
7. Do not open a ready-for-review PR.

If all tasks and gates pass, open a ready-for-review PR.

---

# 22. Pull Request Requirements

## 22.1 Ready state

Open as **Ready for review** only when:

- T01–T34 are complete
- Every task has its required commit
- Full validation passes
- Latest `main` is merged
- No unresolved blocker remains
- Documentation is complete
- No secret is present

Do not assign reviewers, labels, or milestones.

## 22.2 PR description

Include:

### Summary

- Full feature summary
- User journeys delivered

### Architecture

- Server-first modular monolith
- Domain services and repositories
- Neon/PostgreSQL
- Auth.js
- DeepSeek abstraction
- PostgreSQL jobs and quotas
- Observability stack

### Database

- Schema changes
- Migration instructions
- Reset limitations
- Production safety

### Vercel configuration

- Required environment-variable names
- Feature flags
- Cron
- Node runtime
- System environment variables
- Sentry setup
- OpenTelemetry setup

Never include secret values.

### Testing

- Commands run
- Results
- Unit/integration/Playwright/accessibility/security coverage

### Manual verification

- DeepSeek
- GitHub OAuth
- Google OAuth
- Resend
- Sentry source maps
- OpenTelemetry spans
- JobSpy Preview smoke test

### Security and privacy

- Evidence rules
- Authorization
- Redaction
- No training
- No sensitive logging
- Deletion and retention

### Known limitations

- Experimental JobSpy disabled by default
- English-only scope
- Manual job submission
- One export template per artifact
- Hobby observability limitations
- External setup still required

### Rollback

- Feature flags
- Deployment rollback
- Migration considerations
- Integration disablement

### Task traceability

- Completed task count
- Commit count
- Specification links

---

# 23. Final Report

After pushing and opening the PR, report:

- Branch name
- PR link
- PR state
- Number of completed tasks
- Number of task commits
- Any synchronization merge commit
- Test results
- Build result
- Migration summary
- Required Vercel environment-variable names
- Manual smoke tests still required
- Known limitations
- Deviations
- Unresolved blockers
- Confirmation that the PR was not merged

Do not print secret values.

If partial:

- State clearly that delivery is partial.
- Provide the draft PR link.
- List incomplete tasks and blockers.

---

# 24. Coding Style

Prefer:

- Clear module boundaries
- Explicit types
- Zod validation
- Small domain services
- Ownership-scoped repositories
- Deterministic tests
- Stable error codes
- Semantic HTML
- Accessible native controls
- Clear naming
- Minimal client state
- Server-side enforcement

Add comments only for non-obvious:

- Security behavior
- Authorization behavior
- Evidence rules
- Transactional invariants
- Retry/idempotency logic
- Provider compatibility
- Vercel-runtime constraints
- Privacy/redaction behavior

Do not add redundant comments that merely repeat the code.

---

# 25. Task Execution Loop

For each task T01–T34:

```text
1. Read the complete task.
2. Verify dependencies.
3. Inspect relevant existing code.
4. Implement the smallest complete solution satisfying the task.
5. Add or update tests.
6. Add observability and redaction at every new boundary.
7. Update README and .env.example incrementally when configuration changes.
8. Run required targeted commands.
9. Fix newly introduced failures.
10. Verify acceptance criteria.
11. Check the task checkbox.
12. Update implementation-log.md.
13. Inspect staged changes for secrets, fixtures, artifacts, and unrelated edits.
14. Create exactly one commit using the prescribed subject.
15. Continue to the next eligible task.
```

At capability checkpoints, run the full checkpoint commands before committing.

Do not postpone tests, authorization, accessibility, documentation, or observability to the end when the task requires them.

---

# 26. Final Acceptance Search

Before T34 completion, search and inspect for:

- `.env`
- API keys
- Database passwords
- OAuth secrets
- Sentry auth tokens
- Real email addresses
- Real résumé content
- Raw AI prompts
- Raw AI responses
- Interview-answer logging
- `console.log` with unbounded objects
- Fixture imports in authenticated production modules
- Direct Drizzle imports in client/UI components
- Private `findById` calls without ownership scope
- Disabled authorization checks
- `TODO` markers that represent missing requirements
- `skip` or `only` in tests
- Unpinned new dependencies
- Live provider calls in tests
- Production database reset commands
- Edge runtime on heavy/custom-span routes
- Session Replay configuration
- Arbitrary HTML rendering
- Arbitrary URL fetching
- Generated test artifacts
- Untracked migration files

Resolve every relevant finding before opening a ready-for-review PR.

---

# 27. Completion Instruction

Execute the entire approved task plan autonomously in one continuous implementation effort.

Continue through T01–T34 unless:

- A defined stop condition occurs, or
- The task cannot be completed safely within the approved scope.

Do not ask for approval between tasks.

Do not merge the pull request.

Deliver a ready-for-review PR only when all tasks and gates pass. Otherwise deliver a draft PR with transparent blockers and partial progress.
