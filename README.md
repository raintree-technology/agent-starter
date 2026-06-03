# agent-starter

An opinionated multi-agent skill pack for Claude Code, Codex, and Cursor. Seven deep, handwritten skills for fintech, SaaS, mobile, copywriting, agent tooling, and TOON token savings.

No orchestration framework. No aspirational YAML. Just agent-native project files generated from one shared skill source.

[![npm version](https://img.shields.io/npm/v/create-agent-starter.svg)](https://www.npmjs.com/package/create-agent-starter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What you get

**7 top-level skills**:

| Skill | Covers |
|---|---|
| **stripe** | Checkout, Payment Intents, subscriptions, Connect/marketplace, Terminal, Radar, Treasury, Issuing, webhooks. |
| **supabase** | Postgres + RLS, Auth with SSR cookies, Realtime, Storage, Edge Functions, pgvector. |
| **plaid** | Link flow, Auth, Transactions sync, Identity, Accounts, balances. |
| **expo** | EAS Build, EAS Update, Expo Router, React Native app patterns. |
| **copywriting-frameworks** | Headlines, landing pages, ads, emails, CTAs, AIDA, objections, proof placeholders, critiques. |
| **anthropic** | Anthropic Claude API plus Claude Code meta-tooling sub-skills. |
| **toon-formatter** | When TOON helps, when it does not, and how to invoke the TOON commands. |

## Agent Targets

| Agent | Generated output | Notes |
|---|---|---|
| Claude Code | `.claude/` | Native Claude skills, settings, TOON slash commands, optional hooks. |
| Codex | `AGENTS.md` + `.codex/skills/*/SKILL.md` | Root Codex guidance points to project-local skill files. |
| Cursor | `.cursor/rules/*.mdc` | Cursor project rules generated as Agent Requested rules, plus an always-applied skill-selection rule. |

Claude remains the default for backwards compatibility. Use `--agent all` to install all supported targets.

## Install

```bash
# Claude Code only (default)
npx create-agent-starter@3.0.1

# Codex only
npx create-agent-starter@3.0.1 --agent codex

# Cursor only
npx create-agent-starter@3.0.1 --agent cursor

# Claude Code + Codex + Cursor
npx create-agent-starter@3.0.1 --agent all

# Backwards-compatible aliases still work
npx create-claude-starter@3.0.1 --agent all
```

For Claude TOON commands, add the runtime deps to your project:

```bash
npm i @toon-format/toon gpt-tokenizer
```

## Profiles

```bash
npx create-agent-starter@3.0.1 --profile web-saas --agent all
npx create-agent-starter@3.0.1 --profile fintech --agent codex,cursor
npx create-agent-starter@3.0.1 --skills stripe,copywriting-frameworks --agent cursor
```

Profiles select a skill set. Agent targets decide where that skill set is installed.

## Structure

```text
.claude/
  skills/<skill>/skill.md
  commands/
  utils/toon/cli.mjs

.codex/
  skills/<skill>/SKILL.md
AGENTS.md

.cursor/
  rules/agent-starter.mdc
  rules/<skill>.mdc
  rules/<skill>/references/
```

The package keeps one shared source of truth in `templates/.claude/skills/` and generates Codex/Cursor formats from that source during install.

## Documentation Pulls

The `docs` command is Claude-specific because external docs are stored under `.claude/skills/*/docs`.

```bash
npx create-agent-starter@3.0.1 docs pull stripe
npx create-agent-starter@3.0.1 docs status
```

## Benchmarks

Real measured token counts for representative workloads are in [`bench/`](bench/). Numbers use `gpt-tokenizer`, not a claimed heuristic.

## Requirements

- Node.js >= 18
- Claude Code, Codex, or Cursor, depending on the selected target
- Optional: `@toon-format/toon` and `gpt-tokenizer` for Claude TOON slash commands

## License

MIT. Not affiliated with Stripe, Supabase, Plaid, Expo, Anthropic, OpenAI, Cursor, or `@toon-format/toon`.
