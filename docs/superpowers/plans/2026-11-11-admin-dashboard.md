# Admin Dashboard Implementation Plan

> **For agentic workers:** Execute this plan task-by-task in order. The user requested frontend first, backend second, then tests, push, and merge into `development`.

**Goal:** Add an admin-only, glassmorphism dashboard for report moderation, recycling point maintenance, Córdoba neighborhood schedules, and admin-role management.

**Architecture:** Keep the current React/Vite SPA and hash router. Add a role-gated `/admin` route and focused panels that call the existing API through `apiRequest`; after the frontend, add protected Fastify routes for listing, promoting, and revoking admins. Use transactions and row locks to keep at least one active admin.

**Tech Stack:** React 18, TypeScript, Vite, Zustand, Tailwind CSS, Fastify 5, Drizzle ORM, PostgreSQL, Zod, Node built-in test runner with `tsx`.

**Spec:** `docs/superpowers/specs/2026-11-11-admin-panel-design.md`

## Global Constraints

- Córdoba is the only supported city.
- The admin role is verified in the API on every protected operation; client route guards are supplementary.
- Report approval does not mutate the official point status.
- Neighborhood schedule writes replace the full schedule set and must be confirmed in the UI.
- Point and neighborhood archival are soft-delete operations and must be confirmed in the UI.
- Admin promotion requires an existing active account with a verified email; the panel never creates accounts or lists ordinary users.
- The last active admin cannot be revoked; each admin-role change is audited.
- Use existing endpoints for reports, points, neighborhoods, and schedules; only admin-role management adds endpoints.
- Preserve the approved dark glassmorphism style with blue accents, readable contrast, keyboard access, and mobile support.

---

## File Map

### Frontend
- `src/lib/routes.ts`: route key and `#/admin` hash parsing.
- `src/components/layout/AppShell.tsx`: lazy-load the admin page and map route.
- `src/components/layout/Header.tsx`: show admin entry only for admin accounts.
- `src/components/admin/AdminSection.tsx`: role guard, layout, responsive navigation, and data loading.
- `src/components/admin/AdminOverview.tsx`: dashboard metrics from already available point/report/neighborhood lists.
- `src/components/admin/AdminReportsPanel.tsx`: report queue and moderation actions.
- `src/components/admin/AdminPointsPanel.tsx`: point list, create/edit form, and archive confirmation.
- `src/components/admin/AdminSchedulesPanel.tsx`: neighborhood selection, schedule editor, replace confirmation, and archive confirmation.
- `src/components/admin/AdminUsersPanel.tsx`: active admin list, promotion form, and revocation confirmation.
- `src/components/admin/admin-api.ts`: typed calls for existing admin APIs and new admin-role APIs.
- `src/components/admin/admin-model.ts`: pure response/form mapping helpers shared by the panels.
- `backend/tests/admin-model.test.ts`: tests for point mapping, schedule time mapping, and admin visibility decisions.

### Backend
- `backend/src/modules/admin/admin-users.schemas.ts`: Zod payload/parameter schemas for admin role endpoints.
- `backend/src/modules/admin/admin-users.service.ts`: transactional promote/revoke rules, row locking, last-admin invariant, and audit writes.
- `backend/src/modules/admin/admin-users.routes.ts`: admin-only list/promote/revoke routes.
- `backend/src/app.ts`: register the new admin-user route module.
- `backend/package.json`: add the Node test runner script.
- `backend/tests/admin-users.service.test.ts`: tests for normalization, eligibility, self-revocation, and last-admin protection.

### Verification / delivery
- `docs/superpowers/specs/2026-11-11-admin-panel-design.md`: approved feature contract.
- `docs/superpowers/plans/2026-11-11-admin-dashboard.md`: implementation record.

---

## Task 1: Frontend Models and Tests

**Interfaces:**
- `isAdmin(user: AuthUser | null): boolean`
- `toAdminPointInput(point: RecyclePoint)` maps the public type labels to the API enums.
- `toScheduleInput(schedule: Schedule)` maps `HH:mm a HH:mm` to `startTime` and `endTime`.
- Add a Node test script: `node --require ./scripts/node-compat.cjs --import tsx --test`.

- [ ] Write `backend/tests/admin-model.test.ts` covering admin visibility, both point-type mappings, schedule range conversion, and malformed schedule rejection.
- [ ] Add the backend `test` script using Node's built-in test runner and `tsx`; run `npm test` from `backend` and confirm the route test fails because `#/admin` currently resolves to home.
- [ ] Create `src/components/admin/admin-model.ts` with the four pure functions and explicit input/output types.
- [ ] Re-run `npm test` and confirm the model tests pass.

## Task 2: Frontend Dashboard and Existing Admin Workflows

**Interfaces:**
- Every panel uses `apiRequest`, which already unwraps the `{ data }` response envelope.
- `AdminSection` accepts no props and reads the session from `useAuthStore`.
- Mutations update the displayed data only after a successful API response.

- [ ] Extend `RouteKey`, `parseHash`, `ROUTE_COMPONENTS`, and `AppShell` for `#/admin`; keep the component lazy-loaded.
- [ ] Add the admin link to the header only when `user.role === 'admin'`; direct access by non-admin shows an access-denied screen.
- [ ] Build responsive glassmorphism shell with four existing-data tabs: overview, reports, points, schedules; add admins tab calling the future `/admin/admins` contract.
- [ ] Implement report status tabs and approve/reject calls with per-row pending state, error messages, and immediate queue refresh.
- [ ] Implement point create/edit forms with schema-compatible enums/material keys and a confirmation dialog before soft-archiving.
- [ ] Implement schedule editing for name, icon, color, description, weekdays, and start/end time; show that Save replaces the existing schedule set and require confirmation.
- [ ] Add neighborhood archive confirmation and refresh neighborhood/schedule state after success.
- [ ] Implement admin list, promote-by-email, and revoke actions with confirmation; show current admin and last-admin constraints in the UI.
- [ ] Keep desktop side navigation and switch to a compact selector on mobile; ensure empty/error/loading states and keyboard focus styles.
- [ ] Run `npm test` from `backend`, `npm run typecheck`, `npm run lint`, and `npm run build` from the project root.

## Task 3: Backend Admin-Role Endpoints

**Interfaces:**
- `GET /api/v1/admin/admins` returns `{ data: AdminUser[] }` where each row includes `id`, `email`, `emailVerifiedAt`, and `createdAt`.
- `POST /api/v1/admin/admins` accepts `{ email }`; it promotes an existing active verified user and returns the admin row.
- `DELETE /api/v1/admin/admins/:id` revokes another admin; returns `{ data: { id, role: 'user' } }`.
- Errors: `404 USER_NOT_ELIGIBLE` for missing/inactive/unverified account, `409 ALREADY_ADMIN`, `409 SELF_REVOKE`, and `409 LAST_ADMIN`.

- [ ] Add focused tests for normalized email validation, eligibility decisions, self-revoke refusal, and last-admin refusal; run them to confirm the expected failures before implementation.
- [ ] Add pure rule helpers in `admin-users.service.ts` and make those tests pass.
- [ ] Implement list, promote, and revoke database operations behind `createRequireAdmin`.
- [ ] In promotion and revocation transactions, lock the current active admin rows with `FOR UPDATE`; re-count after locking; refuse to revoke the final active admin.
- [ ] Write `admin.promoted` and `admin.revoked` rows to `audit_log` in the same transaction as each role change.
- [ ] Register routes in `app.ts`; document schemas and ensure user password hashes/tokens are never selected or returned.
- [ ] Run backend `npm test` and `npm run build`.

## Task 4: Integrated Verification

- [ ] Start the frontend and backend against the configured development Neon branch.
- [ ] In the browser, verify admin nav and dashboard render for the signed-in admin and verify a non-admin session cannot access the dashboard.
- [ ] Verify report list/filter/moderation, point list/create/edit/archive, schedule load/save/archive, and admin list/promote/revoke UI states.
- [ ] Use disposable verified accounts only for promotion/revocation flow checks; preserve the primary admin and do not send test emails without explicit need.
- [ ] Confirm public routes still return updated point and schedule data after successful admin writes.
- [ ] Run final frontend typecheck/lint/build and backend tests/build; run `git diff --check`.

## Task 5: Push and Merge

- [ ] Review the full branch diff, including pre-existing backend/auth work already in this branch, and confirm no `.env` or generated secret is staged.
- [ ] Commit the intended implementation changes on `codex/admin-dashboard-glassmorphism`.
- [ ] Push that branch to `origin`.
- [ ] Fetch and inspect the latest `origin/development`, merge the feature branch into local `development` only if the merge is conflict-free, then push `development`.
- [ ] If remote branch protection blocks the merge or push, leave the feature branch pushed and report the exact blocker without force-pushing.
