# Vercel Functions API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing Fastify API reachable from the Vercel-hosted frontend at the same-origin `/api/v1/*` paths.

**Architecture:** Add one catch-all Node.js Vercel Function that adapts Vercel's Node request/response objects to the existing Fastify server. Install and build the nested backend package during Vercel deployment while preserving Vite's local development proxy.

**Tech Stack:** Vercel Node.js Functions, Fastify 5, Node 24, PostgreSQL/Neon, Vite, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-12-vercel-functions-api.md`

## File map

- `backend/src/vercel.ts`: singleton Fastify bootstrap and Node HTTP adapter for Vercel.
- `backend/tests/vercel-handler.test.ts`: integration tests for path/query/body/cookie forwarding and safe bootstrap errors.
- `backend/package.json` and `backend/package-lock.json`: Vercel database-pool helper dependency if available and build/test scripts as needed.
- `api/_handler.js` and `api/v1/[route]...`: shared handler plus Vercel function entrypoints for one through four API path segments.
- `vercel.json`: install both package manifests and build the Vite app plus backend adapter.
- `.gitignore`: ignore Vercel local project files.
- `backend/README.md`: document Vercel runtime configuration and deployment steps.

## Task 1: Adapter contract tests (TDD)

- [x] Create a Fastify test app with JSON routes under `/api/v1`.
- [x] Write a Node HTTP test server that passes requests through the Vercel adapter.
- [x] Assert full API path, query string, JSON body, cookies, and response headers survive the adapter.
- [x] Assert bootstrap errors return generic JSON and do not leak internal exception messages.
- [x] Run the new test and confirm it fails because the adapter does not exist.

## Task 2: Vercel-compatible Fastify adapter

- [x] Implement an injectable request handler that resolves one cached Fastify app and forwards each Node request to `app.server`.
- [x] Build the production Fastify app from validated `process.env`; do not call `listen`.
- [x] Keep the PostgreSQL pool attached to the cached Fastify instance for warm invocations.
- [x] Run the adapter tests and confirm all cases pass.
- [x] Run backend typecheck/build and tests.

## Task 3: Vercel deployment wiring

- [x] Add Node function entrypoints for one through four API path segments and keep request bodies available to Fastify.
- [x] Add Vercel install/build commands that run `npm ci` at the root and in `backend`, then build both packages.
- [x] Keep the Vite `/api` proxy intact for local development.
- [x] Add required runtime variable names and environment scopes to the backend deployment README; never copy secret values into the repo.
- [x] Set Node.js 24 via the root package engine and document SMTP port 587.

## Task 4: End-to-end verification

- [x] Run backend tests/build, frontend lint/typecheck/build, and `git diff --check`.
- [x] Verify adapter behavior locally through a real Node HTTP server and JSON GET/POST semantics; deployment testing exposed and fixed nested route matching.
- [x] Confirm no `.env`, credentials, or generated local Vercel files are included.
- [ ] Verify health, points, and private endpoints on an actual Vercel deployment after the user configures environment variables.
- [ ] Push to `development`; then inspect the resulting Vercel preview if deployment access is available.
- [x] Provide the exact Vercel environment variables the user must configure.
