# Vercel Functions API Design

## Problem

The Vercel deployment currently serves the Vite frontend only. The browser uses the relative API base `/api/v1`, but the repository has no Vercel API function, so login and data requests resolve to Vercel's static frontend and return 404. The local Vite proxy does not exist in production.

## Approved approach

Expose the existing Fastify application through Vercel Node.js Functions for API paths up to four segments deep. Each function delegates to one shared handler that reuses `buildApp`, preserves the original URL, method, headers, cookies, request body, and Fastify response, and caches the initialized Fastify app per warm function instance. The frontend keeps using the same-origin `/api/v1` base, so session cookies remain first-party and no public backend URL or browser-side CORS setup is needed.

Vercel must install the root Vite dependencies and the backend's separate dependencies, then build both the static frontend and backend function adapter. Keep the local Vite proxy unchanged for local development.

## Runtime configuration

The Vercel project needs these runtime variables in Preview and Production: `DATABASE_URL`, `SESSION_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `PUBLIC_APP_URL`. `DATABASE_URL` should use Neon's pooled application URL. `WEB_ORIGIN` must match the site's origin for same-origin mutation checks. Do not commit secret values. Vercel requires a new deployment after environment variables are added or changed.

The existing Nodemailer sender awaits `sendMail`; Vercel's Node runtime permits SMTP submission over port 587. Keep the Node.js runtime, not Edge.

## Invariants

- Every existing route under `/api/v1` keeps its current path and behavior.
- The function never calls `app.listen` and never exposes database or SMTP secrets to the client bundle.
- The Fastify app and its PostgreSQL pool are reused while the Vercel instance remains warm.
- Vercel requests keep the complete `/api/v1/...` path when Fastify receives them.
- Missing environment configuration returns a generic 500 response; secrets and exception details are logged only server-side and never returned.
- Local `npm run dev` continues to proxy API requests to `127.0.0.1:3001`.

## Acceptance criteria

1. A Vercel Node handler can route GET and JSON POST requests to a Fastify app while preserving path, query, body, and cookies.
2. `GET /api/v1/health` works through the Vercel function.
3. Public points and neighborhoods routes reach PostgreSQL through the function.
4. Unauthenticated private endpoints at every used route depth return 401 rather than Vercel 404.
5. The function can be built from a clean Vercel-style install that installs both package manifests.
6. Frontend lint, typecheck, build, backend tests/build, and function integration tests pass.
7. Vercel deployment settings are documented without including credentials.

## Out of scope

Changing the database provider, email provider, frontend API paths, or existing business rules. Configuring Vercel dashboard secrets is also out of scope because those values must be entered into the user's Vercel project settings.
