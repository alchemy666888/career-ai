# Vercel deployment

This project is intended to run through Vercel's standard Next.js deployment flow. **Every variable listed in `.env.example` must be configured in Vercel Cloud for both Preview and Production before deploying.** Local `.env.local` files are only for developer machines and must never be committed.

## Project settings

- Framework preset: Next.js.
- Install command: `npm install`.
- Build command: `npm run build`.
- Output directory: Next.js default.
- Runtime secrets: configure values in Vercel Cloud project settings, not committed files.
- Database: managed PostgreSQL with a pooled/serverless-safe connection string in `DATABASE_URL`.

## Configure environment variables in Vercel Cloud

1. Open the Vercel project dashboard.
2. Go to **Settings → Environment Variables**.
3. Add every key from `.env.example`.
4. Select the environments that should receive each value: **Production**, **Preview**, and, when useful, **Development**.
5. Use real secret values only in Vercel Cloud or local uncommitted `.env.local`; keep `.env.example` as placeholders only.
6. Redeploy the latest deployment after changing environment variables so serverless functions receive the new values.

You can also use the Vercel CLI when authenticated to the target project:

```bash
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add AUTH_SECRET production
vercel env add AUTH_SECRET preview
vercel env add AUTH_URL production
vercel env add AUTH_URL preview
vercel env add AUTH_GITHUB_ID production
vercel env add AUTH_GITHUB_ID preview
vercel env add AUTH_GITHUB_SECRET production
vercel env add AUTH_GITHUB_SECRET preview
vercel env add OPENAI_API_KEY production
vercel env add OPENAI_API_KEY preview
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_APP_URL preview
vercel env add RATE_LIMIT_WINDOW_SECONDS production
vercel env add RATE_LIMIT_WINDOW_SECONDS preview
vercel env add RATE_LIMIT_MAX_REQUESTS production
vercel env add RATE_LIMIT_MAX_REQUESTS preview
```

## Variables from `.env.example`

| Variable | Required for deploy? | Scope | Configure in Vercel environments | Purpose |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Server-only | Production and Preview | Pooled PostgreSQL connection string for Drizzle/Neon-compatible serverless access. |
| `AUTH_SECRET` | Yes | Server-only | Production and Preview | Auth.js session/token signing secret; use a unique strong secret per Vercel project/environment. |
| `AUTH_URL` | Yes | Server-only | Production and Preview | Canonical deployed URL for auth callbacks. Use the production domain for Production and the preview URL/pattern for Preview. |
| `AUTH_GITHUB_ID` | Required when GitHub auth is enabled | Server-only | Production and Preview | GitHub OAuth client ID for the matching Vercel environment callback URL. |
| `AUTH_GITHUB_SECRET` | Required when GitHub auth is enabled | Server-only | Production and Preview | GitHub OAuth client secret for the matching Vercel environment callback URL. |
| `OPENAI_API_KEY` | Required when AI workflows are enabled | Server-only | Production and Preview | AI provider key for evaluation, drafting, and interview-prep workflows. |
| `NEXT_PUBLIC_APP_URL` | Yes | Client-safe | Production and Preview | Public app origin for client-visible absolute links. This is intentionally public because of the `NEXT_PUBLIC_` prefix. |
| `RATE_LIMIT_WINDOW_SECONDS` | Yes | Server-only | Production and Preview | Window size for simple abuse protection around expensive endpoints. |
| `RATE_LIMIT_MAX_REQUESTS` | Yes | Server-only | Production and Preview | Maximum requests allowed within the rate-limit window. |

## Database migrations

Run `npm run db:generate` after schema changes and `npm run db:migrate` against the target PostgreSQL database. Production migrations should be executed deliberately as a release step before or during deployment.

## Post-deploy verification

After adding all Vercel Cloud variables and deploying:

1. Visit `/api/health` and confirm it returns an OK JSON response.
2. Visit `/` and confirm the landing page renders.
3. Visit `/dashboard` and confirm the application shell renders.
4. Exercise auth after provider callback URLs are configured.
5. Run a migration check against the same PostgreSQL database used by the deployment.
