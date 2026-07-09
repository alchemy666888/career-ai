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

See `docs/vercel-deployment.md` for Vercel deployment steps. Every key listed in `.env.example` must be configured in Vercel Cloud for Preview and Production; committed `.env` files are forbidden.
