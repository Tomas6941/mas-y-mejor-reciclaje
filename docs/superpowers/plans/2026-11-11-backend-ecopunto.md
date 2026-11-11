# Backend EcoPunto Implementation Plan

> Estado de ejecución: paquete backend, esquema/migraciones iniciales, autenticación, rutas de negocio/admin y conexión inicial del frontend están implementados. Falta configurar credenciales de Neon/SMTP, ejecutar migraciones y seed contra la base real, revisar despliegue/producción y completar validación funcional cuando se solicite.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a secure Fastify API backed by Neon PostgreSQL and connect EcoPunto's existing frontend to accounts and shared/personal data.

**Architecture:** Keep Vite/React as the client and add an independent TypeScript Node service under `backend/`. Use Fastify, Drizzle ORM, PostgreSQL, Zod schemas, secure cookie sessions and a Nodemailer SMTP adapter. Public map/calendar data stays anonymously readable; personal data and writes require authorization.

**Tech Stack:** Node.js 24, TypeScript, Fastify, Drizzle ORM, PostgreSQL (Neon), Zod, Argon2id, Nodemailer, PostgreSQL-backed sessions.

**Spec:** `docs/superpowers/specs/2026-11-11-backend-design.md`

## Global Constraints

- Córdoba será la única ciudad inicial.
- No se migrarán los datos actuales de `localStorage`.
- El navegador se comunica solo con la API; las credenciales permanecen en el servidor.
- El mapa, la guía y los calendarios se consultan sin cuenta.
- Crear reportes y guardar datos personales requiere sesión.
- Solo admin puede moderar reportes y editar puntos/calendarios.
- La cuenta Gmail dedicada y la Contraseña de Aplicación son secretos del servidor.
- No exponer email, hashes de contraseña, tokens ni secretos en respuestas o logs.
- Tema claro/oscuro permanece local.

---

## File Map

- `backend/package.json`, `backend/tsconfig.json`: dependencias y compilación aisladas de Vite.
- `backend/src/config/env.ts`: validación fail-fast de variables de entorno.
- `backend/src/app.ts`, `backend/src/server.ts`: composición Fastify y arranque con cierre ordenado.
- `backend/src/plugins/database.ts`: conexión PostgreSQL/Drizzle y lifecycle.
- `backend/src/db/schema/*.ts`: tablas, relaciones, índices y restricciones.
- `backend/drizzle.config.ts`, `backend/drizzle/*`: configuración y migraciones versionadas.
- `backend/src/modules/*`: módulos HTTP/domain para auth, puntos, calendarios, reportes, seguimiento, quiz y preferencias.
- `backend/src/lib/*`: errores, validación, sesiones, correo, logging y respuestas compartidas.
- `backend/src/seed.ts`: carga repetible de catálogos, puntos y barrios de Córdoba.
- `backend/src/seed-data/*.json`: snapshot versionado de catálogos y datos demostrativos iniciales.
- `backend/scripts/copy-seed-data.mjs`: copia los JSON a `dist` para el seed de producción.
- `backend/.env.example`: nombres de variables sin secretos reales.
- `backend/README.md`: desarrollo local, Neon, migraciones, seed y arranque.
- `src/lib/api.ts`, `src/store/*`, `src/hooks/*`, `src/components/*`: cliente HTTP y sustitución de persistencia de negocio por llamadas a API.
- `src/store/themeStore.ts`: conserva persistencia local del tema.

## Task 1: API Foundation

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/config/env.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Create: `backend/src/modules/health/health.routes.ts`
- Create: `backend/.env.example`
- Modify: `.gitignore`
- Create: `backend/README.md`

**Interfaces:**
- `buildApp(options?: { logger?: boolean }): Promise<FastifyInstance>` registers API routes and centralized errors.
- `GET /api/v1/health` returns `{ status: 'ok' }` and no infrastructure secrets.
- `server.ts` parses env before listen, binds `0.0.0.0`, and closes on SIGINT/SIGTERM.

- [ ] Create isolated Node ESM package with `dev`, `build`, `start`, `db:generate`, `db:migrate`, `db:seed` scripts.
- [ ] Pin compatible Fastify, TypeScript, tsx, Zod, and type packages in `backend/package.json`.
- [ ] Define strict NodeNext TypeScript config with `src` and `dist` separation.
- [ ] Parse `PORT`, `HOST`, `NODE_ENV`, `WEB_ORIGIN`, `DATABASE_URL`, `SESSION_SECRET`, `SMTP_*` from environment; reject malformed production config before listening.
- [ ] Build Fastify app with request IDs, bounded body size, CORS restricted to configured origin with credentials, cookie support, and a JSON error envelope `{ error: { code, message, requestId } }`.
- [ ] Add health route and graceful shutdown.
- [ ] Ignore backend build output, local env files, and generated artifacts; document commands and required environment variables.

## Task 2: Database Schema and Córdoba Seed

**Files:**
- Create: `backend/src/plugins/database.ts`
- Create: `backend/src/db/schema/index.ts`
- Create: `backend/src/db/schema/users.ts`
- Create: `backend/src/db/schema/catalog.ts`
- Create: `backend/src/db/schema/points.ts`
- Create: `backend/src/db/schema/schedules.ts`
- Create: `backend/src/db/schema/reports.ts`
- Create: `backend/src/db/schema/personal.ts`
- Create: `backend/drizzle.config.ts`
- Create: `backend/src/seed.ts`
- Create: `backend/drizzle/*`

**Interfaces:**
- `databasePlugin` decorates Fastify with `db: NodePgDatabase<typeof schema>` using `DATABASE_URL`.
- Export schema tables for users/profiles, materials, points/pointMaterials, neighborhoods/schedules, reports, trackingEntries, quizAttempts, userPreferences, authTokens, sessions, auditLog.
- `seedDatabase(db)` upserts stable catalog keys and Córdoba records without duplicating them.

- [ ] Define enums/check constraints for roles, point/report status, material keys, positive bounded kg, score bounds, token purpose, and schedule weekdays.
- [ ] Use UUID primary keys; normalize unique email; use numeric precision for kilograms; represent local tracking date as SQL `date`.
- [ ] Add foreign keys and owner/time indexes for all user-owned records; index points and report review queues.
- [ ] Add revocable database session rows and hashed single-use verification/reset tokens.
- [ ] Configure Drizzle migration generation and direct migration connection support.
- [ ] Add idempotent seed of seven material keys, existing Córdoba points and barrio schedules from frontend data.
- [ ] Document Neon pooled runtime URL vs direct migration URL; never put credentials in source or sample values.

## Task 3: Auth, Email, and Authorization

**Files:**
- Create: `backend/src/lib/errors.ts`
- Create: `backend/src/lib/password.ts`
- Create: `backend/src/lib/email.ts`
- Create: `backend/src/lib/session.ts`
- Create: `backend/src/modules/auth/auth.schemas.ts`
- Create: `backend/src/modules/auth/auth.service.ts`
- Create: `backend/src/modules/auth/auth.routes.ts`
- Create: `backend/src/modules/auth/auth.types.ts`
- Create: `backend/src/modules/auth/require-user.ts`

**Interfaces:**
- `EmailProvider.send(message: { to: string; subject: string; text: string; html: string }): Promise<void>`.
- `AuthService.register(input)`, `login(input)`, `verifyEmail(token)`, `requestPasswordReset(email)`, `resetPassword(token, newPassword)`, `logout(sessionId)`.
- Session cookie contains an opaque random token; database stores only its hash; `requireUser` decorates request with `{ id, role, emailVerifiedAt }`.

- [ ] Hash passwords with Argon2id; enforce minimum length and reject oversized inputs.
- [ ] Generate cryptographically random one-use tokens, store only token hashes and expiration timestamps, consume in a transaction.
- [ ] Configure Nodemailer SMTP from server env; build verification/reset messages from configured public URL and never log token contents.
- [ ] Implement register/login/logout/me/verify/resend/forgot/reset routes; use indistinguishable forgot-password responses.
- [ ] Set `HttpOnly`, `Secure` in production, `SameSite=Lax`, path `/`, and bounded max age cookies; validate Origin on cookie-authenticated state changes.
- [ ] Add bounded rate limits to login, registration, recovery, resend, report creation.
- [ ] Add admin guard and mark verified email requirement for report/personal writes.

## Task 4: Public and Community API

**Files:**
- Create: `backend/src/modules/points/points.schemas.ts`
- Create: `backend/src/modules/points/points.routes.ts`
- Create: `backend/src/modules/schedules/schedules.schemas.ts`
- Create: `backend/src/modules/schedules/schedules.routes.ts`
- Create: `backend/src/modules/reports/reports.schemas.ts`
- Create: `backend/src/modules/reports/reports.service.ts`
- Create: `backend/src/modules/reports/reports.routes.ts`
- Create: `backend/src/modules/admin/admin.routes.ts`

**Interfaces:**
- `GET /api/v1/points?material=&type=&status=&limit=&cursor=` returns public point records with materials.
- `GET /api/v1/neighborhoods` and `GET /api/v1/neighborhoods/:id/schedules` return public schedule data.
- `POST /api/v1/reports` requires verified user and returns pending report; `GET /api/v1/reports` returns approved reports only.
- Admin routes review reports and edit points/schedules; every review writes actor and timestamp to audit log.

- [ ] Validate query enums, cursor/limit bounds and route identifiers with Zod.
- [ ] Filter all public reports by approved status; redact author ID/email.
- [ ] Create report in pending status without mutating official point status.
- [ ] Implement admin approve/reject transaction and audit record.
- [ ] Implement admin point and schedule mutations with relational validation.

## Task 5: Personal API

**Files:**
- Create: `backend/src/modules/tracking/tracking.schemas.ts`
- Create: `backend/src/modules/tracking/tracking.routes.ts`
- Create: `backend/src/modules/quiz/quiz.schemas.ts`
- Create: `backend/src/modules/quiz/quiz.routes.ts`
- Create: `backend/src/modules/preferences/preferences.schemas.ts`
- Create: `backend/src/modules/preferences/preferences.routes.ts`

**Interfaces:**
- All `/api/v1/me/*` routes require session and scope every query/mutation by authenticated `user.id`.
- `POST /me/tracking` accepts `{ material, kg, date }`; list is newest-date first; delete-all is owner scoped.
- `POST /me/quiz-attempts` accepts bounded score/total and stores an immutable attempt.
- `PATCH /me/preferences` accepts only a known neighborhood ID.

- [ ] Implement list/create/delete/delete-all tracking with decimal kilogram rounding and date validation.
- [ ] Implement quiz attempt history and best-score aggregation from persisted attempts.
- [ ] Implement get/patch neighborhood preference; reject unknown neighborhoods.
- [ ] Use ownership filters in SQL predicates rather than checking IDs only in route code.

## Task 6: Frontend API Integration

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/store/authStore.ts`
- Modify: `src/store/index.ts`
- Modify: `src/store/pointsStore.ts`
- Modify: `src/store/reportsStore.ts`
- Modify: `src/store/trackingStore.ts`
- Modify: `src/store/calendarStore.ts`
- Modify: `src/store/quizStore.ts`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/report/ReportSection.tsx`
- Modify: `src/components/tracking/TrackingSection.tsx`
- Create: `src/components/auth/AuthDialog.tsx`
- Modify: `.env.example` or document `VITE_API_URL` in frontend README

**Interfaces:**
- API client includes credentials and returns typed data or `ApiError`.
- Auth store exposes `user`, `status`, `loadSession()`, `login()`, `register()`, `logout()`.
- Business stores retain view state but hydrate/mutate via API; theme store remains local.

- [ ] Add `VITE_API_URL` configuration with local `/api` proxy option.
- [ ] Add auth dialog entry points, account status and logout; load `/auth/me` on app startup.
- [ ] Replace local points/calendar reads with API hydration, preserving current component data interfaces.
- [ ] Gate private forms and request sign-in; replace tracking/quiz/report mutations with API calls.
- [ ] Clear personal state on logout and on session expiration; show loading/error/empty states in Spanish.
- [ ] Keep theme local; do not migrate old business keys.

## Task 7: Operations and Release Readiness

**Files:**
- Modify: `backend/README.md`
- Create: `backend/.env.example`
- Create: `backend/scripts/migrate.ts`
- Create: `backend/scripts/seed.ts`
- Create: `backend/Dockerfile`
- Create: `backend/.dockerignore`

**Interfaces:**
- `npm run db:migrate` applies versioned migrations using direct database connection.
- `npm run db:seed` is repeatable against a clean or already seeded database.
- Container listens on configured port and serves health endpoint.

- [ ] Document Neon branch setup, pooled/direct URLs, local commands, Gmail 2FA/app-password setup, secret rotation, admin bootstrap, deployment sequence and recovery.
- [ ] Add migration/seed scripts that fail nonzero with actionable safe errors.
- [ ] Package Node runtime in a minimal non-root container.
- [ ] Document CI commands for lint/typecheck/build and the required automated test suites for the project pipeline.
- [ ] Reconcile all implementation files with this plan and spec before deployment.
