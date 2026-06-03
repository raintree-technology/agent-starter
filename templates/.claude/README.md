# Claude Code configuration

This directory is dropped into your project by `npx create-agent-starter --agent claude` or `--agent all`. It gives Claude Code seven deep skills plus a thin TOON (Token-Oriented Object Notation) command layer.

## What's here

| Path | Purpose |
|---|---|
| `skills/stripe/` | Stripe integration patterns (2,100+ lines): Checkout, Payment Intents, subscriptions, Connect, webhooks. |
| `skills/supabase/` | Postgres + RLS, Auth, Realtime, Storage, Edge Functions, pgvector. |
| `skills/plaid/` | Link flow + Auth + Transactions + Identity + Accounts (single consolidated skill). |
| `skills/expo/` | Core Expo + EAS Build + EAS Update + Expo Router (single consolidated skill). |
| `skills/copywriting-frameworks/` | Direct-response copywriting for headlines, ads, landing pages, emails, CTAs, and critiques. |
| `skills/anthropic/` | Anthropic API expert + 6 Claude Code meta-tooling sub-skills (skill/command/hook/MCP/settings builders). |
| `skills/toon-formatter/` | When to reach for TOON; how to invoke the commands. |
| `commands/convert-to-toon.md` etc. | 5 TOON slash commands + `/discover-skills` + `/install-skill`. |
| `utils/toon/cli.mjs` | 90-line wrapper around `@toon-format/toon` and `gpt-tokenizer`. |
| `hooks/` | Optional post-tool automation. Disabled by default in `settings.json`. |
| `settings.json` | Shared defaults (fail-closed). Put local trust overrides in `settings.local.json`. |

## Using the TOON commands

The TOON commands shell out to a small Node wrapper. Install the runtime deps in your project:

```bash
npm i @toon-format/toon gpt-tokenizer
```

Then:

```
/convert-to-toon api-response.json       # encode + report measured savings
/analyze-tokens api-response.json        # compare without writing
/toon-encode data.json
/toon-decode data.toon
/toon-validate data.toon
```

Without `gpt-tokenizer`, commands fall back to a `bytes/4` heuristic and warn visibly. Without `@toon-format/toon` they fail with an install hint.

## Extending

Add new skills to `skills/<name>/skill.md`. The frontmatter that drives activation:

```markdown
---
name: <name>-expert
description: One-sentence coverage. Invoke when user mentions X, Y, Z. Example queries — "...", "...", "...".
allowed-tools: Read, Grep, Glob
model: sonnet
---
```

Strong descriptions with concrete example queries improve activation substantially (per Anthropic's own best-practice docs). When in doubt, mimic the frontmatters of the skills already in `skills/`.

Do **not** add orchestration, workflow, or meta-command frameworks back in. Those were removed because they duplicated Claude Code's native behavior with non-working placeholder code.

## What was removed

See the project root's `CLAUDE.md` for the full list. Summary: orchestration engine, workflow YAML DSL, meta-commands, native Zig TOON binary, and a set of niche/duplicated skills.
