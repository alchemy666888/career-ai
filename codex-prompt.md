# Codex Prompt: Implement the AI Job Search Next.js Product

Use this prompt when asking Codex to implement the project described by `requirements.md`, `design.md`, and `tasks.md`.

## Role

You are a senior full-stack engineer and system analyst. Implement the AI Job Search product as a pure Next.js full-stack application with PostgreSQL persistence and Vercel-ready deployment.

## Source documents

Read these documents before making changes:

1. `requirements.md`
2. `design.md`
3. `tasks.md`
4. Any repository-specific instructions such as `AGENTS.md`
5. Existing project files, scripts, and documentation

## Hard constraints

1. Do not implement a separate backend framework. Use Next.js for frontend, server actions, route handlers, middleware, and deployment runtime.
2. Use PostgreSQL as the durable database.
3. Use the DeepSeek API for all AI model calls.
4. Make the app deployable to Vercel using the standard Next.js deployment flow.
5. Configure production and preview secrets through Vercel Cloud environment variables, not committed files.
6. Do not commit real secrets, `.env.local`, production credentials, API keys, tokens, DeepSeek API keys, or database passwords.
7. Do not build automatic external job-application submission.
8. Do not fabricate user career claims in AI-generated content.
9. Preserve existing useful code where it fits the architecture, but migrate or remove code that violates the pure Next.js requirement.

## Recommended implementation process

### Step 1: Inspect and plan

- Inspect the repository structure and package scripts.
- Determine the existing framework state.
- Identify gaps relative to `requirements.md`.
- Create a concise implementation plan mapped to `tasks.md`.
- Avoid large rewrites until the target structure is clear.

### Step 2: Establish foundation

- Ensure a Next.js App Router structure exists.
- Add TypeScript, linting, tests, and formatting if missing.
- Create route groups for auth, dashboard, profile, jobs, applications, interviews, outcomes, and settings.
- Build a minimal responsive UI shell before deeper feature work.

### Step 3: Add configuration validation

- Create a central configuration module for environment variables.
- Add `.env.example` with placeholder values only.
- Document every required variable and whether it is server-only or public. Required AI variables must include `DEEPSEEK_API_KEY` and `DEEPSEEK_MODEL`, with optional `DEEPSEEK_BASE_URL` and timeout/token settings as needed.
- Ensure missing required variables produce clear errors.

### Step 4: Add PostgreSQL persistence

- Choose a Vercel-compatible database toolkit.
- Add schemas and migrations for the domain model described in `design.md`.
- Configure database access for serverless execution.
- Add migration scripts and validation steps.
- Ensure every user-owned query is scoped by authenticated user context.

### Step 5: Add authentication and authorization

- Integrate a Next.js-compatible authentication solution.
- Store auth provider secrets in environment variables only.
- Protect private routes.
- Add server-side authorization checks to every read and mutation.
- Add tests for cross-user isolation.

### Step 6: Add DeepSeek AI integration

- Create a server-only DeepSeek client module.
- Validate `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, and optional DeepSeek configuration through the central config module.
- Route all AI model calls through DeepSeek; do not add OpenAI, Anthropic, or other model-provider calls unless a human changes the requirement.
- Keep prompts server-side and validate structured DeepSeek responses before database writes.
- Add rate limiting and safe logging for DeepSeek-backed endpoints and actions.

### Step 7: Implement product workflows

Implement workflows incrementally in this order:

1. Profile management and evidence tracking.
2. Job creation, ingestion, deduplication, and status tracking.
3. Fit evaluation with explainable scores and deal-breaker vetoes.
4. Application drafting with supported claims only.
5. Interview preparation linked to applications.
6. Outcomes and analytics dashboard.

For each workflow:

- Add database persistence.
- Add server-side validation.
- Add UI screens and states.
- Add tests for domain logic and authorization.
- Update documentation if behavior or setup changes.

### Step 8: Prepare for Vercel

- Verify the production build.
- Verify migrations can run against PostgreSQL.
- Confirm no local filesystem persistence is required in production.
- Document Vercel environment variables and deployment steps.
- Deploy to a Vercel preview environment when credentials are available.

## Quality gates

Run the strongest available equivalents of these commands before finalizing:

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

If the repository uses `pnpm`, `yarn`, or `bun`, use the matching package manager commands instead. If any command is unavailable, either add the script or document why it is not applicable.

## Expected final response format

When implementation is complete, report:

1. Summary of changes with file citations.
2. Database and migration notes.
3. Vercel deployment notes.
4. Environment variables that must be configured in Vercel Cloud, including DeepSeek variables.
5. Tests and checks run, with pass/fail/warning status.
6. Any known limitations or follow-up tasks.

## Implementation reminders

- Keep business logic out of React components when possible; place it in server-side domain modules.
- Keep AI prompts and DeepSeek API calls server-side.
- Validate AI structured outputs before writing to PostgreSQL.
- Prefer small, reviewable commits grouped by feature area.
- Update `tasks.md` progress as implementation advances.
- If requirements conflict with existing code, follow `requirements.md` unless a human explicitly changes the requirements.
