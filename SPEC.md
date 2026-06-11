# agent-starter: Revised Spec

**Status:** Draft  
**Date:** 2026-06-11

---

## Problem

Every AI agent tool — Claude Code, Codex, Cursor — has its own config format, its own skills/rules directory, its own MCP setup. Teams that want consistent agent behavior either maintain parallel configs manually or document it in a README and hope contributors follow it.

There is no `package.json` equivalent for agent environments.

The rules-sync space is already crowded (ruler, rulesync, agent_sync). The MCP-install space has a clear leader (Neon's `add-mcp`). The gap is the layer above both: a **project-level declarative file** that captures the full agent environment — skills, MCPs, model config, hooks — checked into git, and curated profiles that make setup zero-effort for common stacks.

---

## Core Concept

`agent.json` is to agent environments what `package.json` is to Node projects.

Check it into git. Every contributor runs `npx agent-starter sync` and their agent — whichever one they use — is fully configured. No README setup steps, no config drift between teammates.

---

## `agent.json` Schema

```json
{
  "version": 1,
  "profile": "next-saas",
  "targets": ["claude", "codex", "cursor"],
  "skills": [
    "cleanup-unused",
    "cleanup-types",
    "copywriting-frameworks"
  ],
  "mcps": [
    {
      "name": "neon",
      "command": "npx",
      "args": ["-y", "@neondatabase/mcp-server-neon"],
      "env": { "NEON_API_KEY": "${NEON_API_KEY}" }
    },
    {
      "name": "stripe",
      "command": "npx",
      "args": ["-y", "@stripe/mcp"],
      "env": { "STRIPE_SECRET_KEY": "${STRIPE_SECRET_KEY}" }
    },
    {
      "name": "resend",
      "command": "npx",
      "args": ["-y", "@resend/mcp"],
      "env": { "RESEND_API_KEY": "${RESEND_API_KEY}" }
    },
    {
      "name": "github",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    }
  ],
  "model": {
    "claude": "claude-sonnet-4-6"
  }
}
```

All fields except `version` are optional. Env var interpolation (`${VAR}`) resolves at sync time from the shell — never stored as literals in generated files. If a var is missing at sync time, agent-starter logs a warning and documents it in `.env.example`.

---

## Profiles

Profiles are the main differentiator. A profile is an opinionated, stack-aware bundle of skills + MCPs for a specific project type. Instead of manually picking skills and hunting for MCP server packages, you declare a profile and get a sensible environment immediately.

### Built-in profiles

**`next-saas`** — Next.js SaaS applications (targets next-starter stack)
- Skills: `cleanup-unused`, `cleanup-types`, `copywriting-frameworks`, `cleanup-slop`
- MCPs: neon, stripe, resend, github
- Detects from: `package.json` containing `next`, `drizzle-orm`, `better-auth`, `@neondatabase/serverless`

**`next`** — Generic Next.js projects
- Skills: `cleanup-unused`, `cleanup-types`
- MCPs: github
- Detects from: `package.json` containing `next`

**`node`** — Generic Node.js
- Skills: `cleanup-unused`, `cleanup-types`
- MCPs: github

**`base`** — Minimal, no assumptions
- Skills: `cleanup-unused`
- MCPs: none

Profiles are a starting point, not a lock-in. Anything in `agent.json` overrides or extends the profile defaults.

### Profile detection

`npx agent-starter init` reads `package.json`, `starter.config.ts`, and `.env.example` to infer the best profile. It shows what it found and confirms before writing `agent.json`.

---

## Two-Package Architecture: `create-next-saas-starter` + `create-agent-starter`

next-starter graduates from "repo you clone" to a published scaffolder, and the two packages form a tandem with a thin, versioned contract between them.

### Package 1: `create-next-saas-starter` (new npm package)

Owns the **application**. Scaffolds a SaaS app from the next-starter template:

- Auth (Better Auth: email, OAuth, passkeys, 2FA), Postgres (Neon + Drizzle), Redis rate limiting (Upstash), billing (Stripe, per-seat), transactional email (Resend), multi-tenancy toggle — all already wired in the template
- Interactive prompts: tenancy mode, which integrations to enable (`starter.config.ts` is written from answers, not edited by hand)
- Vercel-first deploy: `vercel link`, `vercel env pull`, deploy button in README, zero-config `vercel.json`
- Telemetry baked in: PostHog for product analytics + LLM analytics on the AI routes
- Evals baked in: an `evals/` harness (Vitest-based) for the chat and structured-output endpoints, runs in CI

Publish as `create-next-saas-starter` so `npm create next-saas-starter@latest my-app` works.

### Package 2: `create-agent-starter` (this repo)

Owns the **agent environment**. `agent.json`, profiles, sync, skills — everything in this spec. Knows nothing about Next.js internals; it just maintains the `next-saas` profile.

### The handshake

The scaffolder's last step writes `agent.json` with `"profile": "next-saas"` and runs `npx agent-starter sync`. That's the entire coupling — a profile name and a schema version. Both packages release independently; the contract is the profile.

```
npm create next-saas-starter my-app
  → prompts (tenancy, integrations, agent targets)
  → scaffold app + starter.config.ts
  → write agent.json (profile: next-saas)
  → npx agent-starter sync        ← .claude/ + AGENTS.md + .cursor/ all configured
  → vercel link (optional)
```

### The killer feature: agents finish the setup

Because the scaffolded project lands with MCPs already wired, the remaining manual setup becomes an agent task. The `next-saas` profile ships a `finish-setup` skill, so the first thing a user does after scaffolding is open Claude Code and say "finish setup":

- **Stripe MCP** → creates the Free/Pro/Team products and prices matching `lib/billing/plans.ts`, writes the price IDs back to env
- **Neon MCP** → verifies the database exists, runs/checks migrations
- **Resend MCP** → checks domain verification status, walks through DNS records
- **PostHog MCP** → confirms the project key, sets up the initial dashboards
- **GitHub MCP** → creates the repo, pushes, confirms CI is green

No other starter does this. Everyone else stops at "here's your `.env.example`, good luck." The tandem turns provisioning — the worst part of every SaaS starter — into a conversation.

### What the next-saas profile contains

- **MCPs**: neon, stripe, resend, posthog, github
- **Skills**: `finish-setup`, `cleanup-unused`, `cleanup-types`, `cleanup-slop`, `copywriting-frameworks` (for `app/(marketing)/` copy)
- **Stack knowledge**: generated CLAUDE.md/AGENTS.md sections describing the conventions (Drizzle schema split, Better Auth plugin stack, billing seat sync) so the agent never guesses the stack

---

## CLI

### `npx agent-starter sync`

Reads `agent.json` and writes native config for all listed targets. Safe to re-run — generated sections are fenced with markers so manual edits outside the markers survive.

**Claude Code** → `.claude/settings.json` (mcpServers, model, hooks) + `.claude/skills/`  
**Codex** → `.codex/config.toml` (mcp, model) + `AGENTS.md` skill instructions  
**Cursor** → `.cursor/mcp.json` + `.cursor/rules/*.mdc`

For rules/skills sync, agent-starter writes directly. It does not delegate to ruler or rulesync — adding a dependency for something this simple would be worse than owning the small set of target formats.

### `npx agent-starter init`

Interactive setup. Detects stack → proposes profile → confirms → writes `agent.json` → runs sync. Generates `.env.example` entries for any MCP env vars not already present.

### `npx agent-starter add mcp <name-or-package>`

Adds an MCP entry to `agent.json`, prompts for required env vars, appends to `.env.example`, re-syncs.

### `npx agent-starter add skill <name>`

Resolves skill from skills.sh or local templates, adds to `agent.json`, installs skill files, re-syncs.

### `npx agent-starter status`

Diffs `agent.json` against what's currently in each target's native config. Shows what's in sync and what's drifted.

### `npx create-agent-starter` (unchanged alias)

Runs `init`. Existing CLI aliases (`claude-starter`, `create-claude-starter`) preserved.

---

## MCP Config Translation

Same entry in `agent.json`, three output formats:

**Claude Code** (`.claude/settings.json`):
```json
{
  "mcpServers": {
    "neon": {
      "command": "npx",
      "args": ["-y", "@neondatabase/mcp-server-neon"],
      "env": { "NEON_API_KEY": "${NEON_API_KEY}" }
    }
  }
}
```

**Codex** (`.codex/config.toml`):
```toml
[[mcp_servers]]
name = "neon"
command = "npx"
args = ["-y", "@neondatabase/mcp-server-neon"]

[mcp_servers.env]
NEON_API_KEY = "${NEON_API_KEY}"
```

**Cursor** (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "neon": {
      "command": "npx",
      "args": ["-y", "@neondatabase/mcp-server-neon"],
      "env": { "NEON_API_KEY": "${NEON_API_KEY}" }
    }
  }
}
```

---

## What agent-starter Does Not Do

- **Runtime orchestration.** Config management only.
- **Secrets management.** Env vars interpolated at sync time; never stored.
- **Agent version pinning.** Out of scope.
- **Cloud/remote config sync.** `agent.json` lives in the repo; no server component.
- **Compete with add-mcp on per-server onboarding.** `add-mcp` is good at "add this one MCP to your machine." agent-starter is good at "this project needs these MCPs for everyone."
- **Compete with skills.sh on discovery.** skills.sh is the registry; agent-starter is the project-level installer.

---

## Open Questions

1. **How deep does `finish-setup` provision?** Creating Stripe products and checking Neon migrations is clearly in scope. Creating the Neon database itself, or the Vercel project, starts overlapping with `vercel` CLI and marketplace integrations — draw the line at "configure what exists, link what doesn't."

2. **Codex MCP scoping.** Codex defaults to user-level (`~/.codex/config.toml`). Agent-starter should write project-level (`.codex/config.toml`) for project MCPs, and document that users may need to add it to trusted projects. Needs verification against Codex docs.

3. **Conflict resolution on sync.** Fenced markers handle most cases. But if someone has manually added MCPs to `.claude/settings.json` that aren't in `agent.json`, does sync clobber them or merge? Proposal: merge by key, warn on conflicts, never delete keys agent-starter didn't write.

4. **Profile versioning.** If the `next-saas` profile changes (new MCP added), existing projects on that profile should be notified on `status` but not auto-updated on sync. Profiles should be pinned at init time and updated explicitly.

5. **Name.** "agent-starter" reads as scaffolding. This is closer to a config manager. Potential rename candidates: `agentenv`, `agent-config`, `agentfile`. Not urgent — defer until after v4 ships.
