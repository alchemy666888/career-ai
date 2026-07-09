# Requirements: AI Job Search Next.js Product

## 1. Purpose

This document defines the target requirements for converting the AI Job Search concept into a deployable, pure Next.js web application. The final product must be Vercel-ready, use PostgreSQL as its only persistent database, provide a browser-based frontend, and keep all runtime secrets and environment-specific values in Vercel project environment variables.

No implementation is included in this specification. It is intended to drive a later Codex implementation process together with `design.md`, `tasks.md`, and `codex-prompt.md`.

## 2. Product goals

1. Deliver a full-stack Next.js application for managing an AI-assisted job search workflow.
2. Provide a responsive frontend for profile management, job discovery, job evaluation, application drafting, interview preparation, and outcome tracking.
3. Use PostgreSQL for all durable application data, including users, profiles, jobs, applications, generated artifacts metadata, and workflow audit records.
4. Deploy cleanly on Vercel without local-only runtime assumptions.
5. Require all environment variables to be configured in Vercel Cloud for production and preview deployments.
6. Use the DeepSeek API for all AI model calls, including fit evaluation, profile assistance, application drafting, and interview preparation.
7. Preserve user agency: the system may draft, score, recommend, and organize, but it must not submit job applications automatically.

## 3. Non-goals

1. Do not build browser automation that submits external job applications.
2. Do not require local filesystem storage for production data.
3. Do not depend on non-Next.js backend frameworks such as Express, NestJS, Django, Rails, or FastAPI.
4. Do not introduce a separate SPA frontend outside the Next.js application.
5. Do not commit production secrets, `.env` files, database credentials, API keys, or Vercel tokens.

## 4. Users and roles

### 4.1 Job seeker

A job seeker creates a profile, imports or enters career evidence, searches and saves job opportunities, requests AI-assisted fit evaluation, drafts application materials, prepares for interviews, and records outcomes.

### 4.2 Application administrator

An administrator can inspect system health, manage user access if admin features are enabled, review integration status, and configure system-level settings that are not secrets.

### 4.3 AI assistant workflow

The AI assistant helps summarize profile material, evaluate job fit, suggest honest application content, identify gaps, and generate structured drafts based on evidence available in the database.

## 5. Functional requirements

### FR-1: Next.js-only application architecture

- The project must use Next.js as the single application framework for frontend pages, server-rendered routes, API route handlers, server actions, middleware, and deployment entry points.
- The frontend must be implemented in the Next.js app, preferably using the App Router.
- Backend behavior must be implemented through Next.js route handlers, server actions, server components, and framework-native middleware.
- The project must not add a second long-running backend service for core application behavior.

### FR-2: Vercel-ready deployment

- The repository must build successfully using Vercel's standard Next.js deployment flow.
- The app must avoid serverful assumptions incompatible with Vercel serverless or edge runtimes unless explicitly isolated to supported Node.js runtime route handlers.
- The app must include clear deployment documentation for Vercel project setup, build command, install command, framework preset, environment variables, and post-deploy verification.
- Production, preview, and development behavior must be controlled through environment variables rather than hard-coded hostnames or credentials.

### FR-3: Environment variable management

- All production and preview environment variables must be configured in Vercel Cloud.
- The repository may include an `.env.example` template, but it must not include real secrets.
- Required variables must be documented with purpose, scope, example shape, and whether they are server-only or safe for client exposure.
- Client-exposed variables must use the `NEXT_PUBLIC_` prefix only when the value is intentionally public.
- Missing required environment variables must fail fast with a clear diagnostic during startup, build, or first server use.

### FR-4: PostgreSQL persistence

- PostgreSQL must be the system of record for all durable data.
- The application must use a Vercel-compatible PostgreSQL provider or any managed PostgreSQL service reachable from Vercel.
- Database access must be safe for serverless execution, using connection pooling or a serverless-compatible driver.
- Schema migrations must be versioned and repeatable.
- The data model must support users, candidate profiles, evidence items, job postings, search queries, fit evaluations, application records, generated artifact records, interview preparation records, outcome history, and audit events.

### FR-5: Authentication and authorization

- The system must authenticate users before exposing personal job-search data.
- Each user's profile, jobs, applications, and generated material must be isolated from other users.
- Server-side authorization checks must protect every data access path.
- Authentication provider secrets must be configured only through Vercel environment variables.

### FR-6: Candidate profile management

- Users must be able to create, edit, and review structured profile data including contact preferences, experience, education, projects, skills, achievements, constraints, writing style, and job preferences.
- Users must be able to add evidence sources for claims, such as resume snippets, project notes, certifications, or manually entered examples.
- AI-generated profile suggestions must remain drafts until accepted by the user.
- Unsupported claims must not be presented as verified facts.

### FR-7: Job discovery and tracking

- Users must be able to enter job URLs, paste job descriptions, and manually create job records.
- If external job search integrations are implemented later, they must normalize results into the same job-posting schema.
- The app must support job statuses such as discovered, saved, evaluating, rejected, applying, applied, interviewing, offered, accepted, declined, and archived.
- Duplicate detection must consider canonical URL, company, title, location, and posting text similarity where available.

### FR-8: Fit evaluation

- The system must score a job against the user's profile and preferences.
- Evaluations must include strengths, gaps, risks, deal-breakers, recommended next action, and confidence level.
- Scoring must be explainable and stored for later review.
- A deal-breaker must be able to block a recommendation even if other dimensions score highly.

### FR-9: Application drafting

- The system must generate or organize tailored application draft content using only supported profile evidence and user-approved profile data.
- Drafts must clearly distinguish verified claims, inferred positioning, and gaps.
- Users must be able to edit and approve generated drafts before using them externally.
- The system must store draft metadata, versions, timestamps, and source job/profile references.

### FR-10: Interview preparation

- The system must provide interview preparation notes for an application based on the job posting, submitted draft content, profile evidence, and outcome stage.
- Interview prep must include likely questions, STAR-style examples, gaps to handle honestly, company research placeholders, and user notes.
- Interview prep records must be versioned or timestamped.

### FR-11: Outcome tracking and analytics

- Users must record application outcomes, interview stages, rejections, offers, compensation notes, feedback, and follow-up dates.
- The app must provide dashboards or summaries showing pipeline counts, conversion rates, response timing, and recurring skill gaps.
- Analytics must be computed from PostgreSQL data and scoped to the authenticated user.

### FR-12: DeepSeek AI integration

- All AI model calls must use the DeepSeek API.
- DeepSeek credentials must be configured only through Vercel Cloud environment variables and must never be exposed to the client.
- The AI integration must run server-side through Next.js server actions, route handlers, or server-only modules.
- The system must support configurable DeepSeek model names, base URL, request timeouts, token limits, and temperature through validated server-side configuration.
- DeepSeek responses must be validated before being persisted to PostgreSQL or shown as structured recommendations.
- DeepSeek prompts must minimize sensitive data and include only the user/job context required for the requested workflow.

### FR-13: Security, privacy, and compliance

- Secrets must never be logged or sent to the client.
- Personally identifiable information must be accessed only on the server unless intentionally rendered to the authenticated user.
- AI provider requests must avoid sending unnecessary sensitive data.
- The app must include basic rate limiting or abuse protection for expensive AI endpoints.
- Generated content must include a user-review expectation and must not imply automatic application submission.

### FR-14: Testing and quality gates

- The implementation must include automated checks for linting, type safety, unit tests for core business logic, database migration validation, and route/action authorization.
- Production builds must pass before deployment.
- Critical flows must have integration or end-to-end test coverage where practical.

## 6. Acceptance criteria

1. A fresh clone can install dependencies, validate environment configuration, run database migrations against PostgreSQL, and build the Next.js app.
2. A Vercel deployment can be created using documented environment variables stored in Vercel Cloud.
3. The deployed application renders a frontend and supports authenticated user workflows.
4. All durable data persists in PostgreSQL.
5. No production secret is committed to the repository.
6. No code path requires a separate backend server outside Next.js for core features.
