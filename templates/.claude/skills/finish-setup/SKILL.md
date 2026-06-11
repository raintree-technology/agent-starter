---
name: finish-setup
description: "Finish provisioning a freshly scaffolded SaaS project using the MCP servers wired by agent.json (Neon, Stripe, Resend, PostHog, GitHub). Verifies env vars, creates Stripe products matching the billing plans, checks database migrations, walks email-domain DNS, and confirms analytics. Use when the user says \"finish setup\", \"provision the project\", \"set up stripe/the database\", or after scaffolding a new project."
argument-hint: "[service (optional: stripe, database, email, analytics, github)]"
user-invocable: true
---

Finish provisioning a freshly scaffolded SaaS project. Configure what exists, link what doesn't — never create cloud resources the user did not ask for (no new databases, no new Vercel projects). Report every change made and every step that still needs a human.

If an argument names a single service, run only that section.

## Preflight

1. Read `.env.example` and the project's env loading (`lib/env.ts` or equivalent) to learn which integrations are expected.
2. Read `.env` / `.env.local` (never print secret values — report only SET or UNSET per key).
3. List which MCP servers are reachable. For each unreachable MCP that a section below needs, skip that section and add it to the final report with the missing env var.
4. Detect the stack: billing plan definitions (`lib/billing/plans.ts` or similar), migration setup (`drizzle.config.ts`, `db/migrations/`), email templates (`emails/`), analytics keys (`NEXT_PUBLIC_POSTHOG_KEY` or similar).

## Database (Neon MCP)

1. Confirm `DATABASE_URL` is set and the Neon MCP can see the project's database. If unset, stop this section and tell the user to create a database and set `DATABASE_URL` — do not create one.
2. Compare applied migrations against the local migrations directory. If migrations are pending, run the project's migrate script (`db:migrate` or equivalent) locally — not via MCP — and confirm the result.
3. Verify the auth tables exist (sessions, users, organizations if multi-tenant).

## Billing (Stripe MCP)

1. Parse the plan definitions from the billing module: plan names, prices, intervals, per-seat flags.
2. List existing Stripe products. For each plan with no matching product, create the product and price(s) to match the code exactly (amount, currency, interval, per-seat `usage_type` if applicable). Never delete or modify existing products without explicit confirmation.
3. Write the resulting price IDs to `.env` (or the file the project reads them from) under the env var names the billing module expects.
4. Confirm the webhook endpoint the project exposes (e.g. `/api/auth/stripe/webhook`) and tell the user the exact URL to register in the Stripe dashboard for the deployed domain — webhook registration needs the production URL, so leave it to the user unless a deployed URL is known.

## Email (Resend MCP)

1. Check domain verification status for the sending domain implied by the project's from-address.
2. If unverified, list the exact DNS records (type, name, value) the user must add, then stop — do not retry verification on their behalf.
3. Send one test email to the user's own address if they confirm.

## Analytics (PostHog MCP)

1. Confirm the project API key in env matches a reachable PostHog project.
2. Verify the key is wired into the app (provider component or snippet).
3. Offer to create a starter dashboard (signups, activation, revenue events) — create it only on confirmation.

## Repository (GitHub MCP)

1. If the project has no `origin` remote: offer to create a repo (ask for org/name/visibility), push the initial commit, and confirm CI triggers.
2. If a remote exists: verify the default branch is pushed and CI status for the latest commit.

## Report

End with a checklist: each service → done / needs human (with the exact next action) / skipped (with the missing env var or MCP). Keep it short enough to act on without scrolling.
