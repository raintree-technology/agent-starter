# claude-starter

An opinionated [Claude Code](https://code.claude.com) skill pack for fintech devs and Anthropic power-users. Six deep, handwritten skills plus a thin CLI for [TOON](https://toonformat.dev) — a JSON compression format that typically cuts input tokens 40–60% on tabular data.

No orchestration framework. No aspirational YAML. Just skills that activate when you need them.

[![npm version](https://img.shields.io/npm/v/create-claude-starter.svg)](https://www.npmjs.com/package/create-claude-starter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What you get

**6 top-level skills** — auto-activate on keywords:

| Skill | Covers |
|---|---|
| **stripe** | Checkout, Payment Intents, subscriptions, Connect/marketplace, Terminal, Radar, Treasury, Issuing, webhooks (signature + idempotency) — 2,100+ lines of real patterns |
| **supabase** | Postgres + RLS, Auth (OAuth + SSR cookies), Realtime, Storage, Edge Functions, pgvector |
| **plaid** | Link flow, Auth (ACH routing/account numbers), Transactions sync, Identity (KYC), Accounts + balance |
| **expo** | EAS Build (`eas.json`, credentials, CI), EAS Update (OTA, channels, staged rollouts), Expo Router (file-based routing, dynamic segments, layout groups) |
| **anthropic** | Anthropic Claude API — Messages API, prompt caching, tool use, vision, model migration. Includes 6 Claude Code meta-tooling sub-skills: skill-builder, command-builder, hook-builder, mcp-expert, settings-expert, claude-code |
| **toon-formatter** | When TOON helps, when it doesn't, how to wire the commands |

**5 slash commands** for TOON:
- `/convert-to-toon <file>` — encode + report measured savings
- `/analyze-tokens <file>` — compare JSON vs TOON token counts without writing a file
- `/toon-encode <file>`, `/toon-decode <file>`, `/toon-validate <file>`

All TOON commands shell out to the canonical [`@toon-format/toon`](https://www.npmjs.com/package/@toon-format/toon) npm library via a 90-line wrapper at `.claude/utils/toon/cli.mjs`, and use [`gpt-tokenizer`](https://www.npmjs.com/package/gpt-tokenizer) for real token counts (OpenAI BPE — directionally accurate proxy for Claude; for exact counts use Anthropic's `/v1/messages/count_tokens` endpoint).

## Install

```bash
# Into current project
npx create-claude-starter@latest

# Into a specific dir, no prompts
npx create-claude-starter@latest ./my-app --yes
```

For TOON commands, add the runtime deps to your project:
```bash
npm i @toon-format/toon gpt-tokenizer
```

## Use

Skills auto-activate on context:

```
User: How do I verify a Stripe webhook signature?
Claude: [stripe-expert activates] Use stripe.webhooks.constructEvent...

User: Convert api-response.json to TOON
Claude: [runs /convert-to-toon api-response.json]
  ✓ Wrote api-response.toon
  Tokenizer: gpt-tokenizer (OpenAI BPE — approximate proxy for Claude)
  JSON:      4,587 tokens (12,840 bytes)
  TOON:      2,759 tokens (7,128 bytes)
  Saved:     1,828 tokens (39.8%)
```

## Why this exists

The Claude Code skill market is fragmented: Anthropic ships 17 general-purpose skills and nothing for fintech or platform integrations. Community mega-packs (`awesome-claude-code-toolkit`, `antigravity-awesome-skills`) compete on volume — 1,400+ skills with razor-thin depth.

This pack goes the other way: **6 skills, hand-maintained, each genuinely better than what's out there.** The Stripe skill alone is 2,100+ lines of tested integration patterns. If you're building a fintech app or extending Claude itself, this is the starting point.

## Not in this repo (and why)

- **Orchestration / semantic matching / multi-skill workflows** — removed. Claude Code selects skills natively via frontmatter `description`; the previous TypeScript orchestration engine was placeholder code.
- **YAML workflow engine** — removed. Out of scope for a skill pack.
- **Meta-commands / command registry / validators** — removed. Claude Code's built-in `/skill` and plugin system handle this.
- **Native Zig TOON binary** — removed. The canonical `@toon-format/toon` npm package (1.8M downloads/month) ships pure JS, cross-platform.
- **Blockchain / iOS / Shopify / Whop skills** — removed. Niche or thin; if you need them, spin a focused pack.
- **Duplicated code-quality skills** — removed. Anthropic already ships `cleanup-unused`, `cleanup-slop`, etc. natively.

## Structure

```
.claude/
├── skills/
│   ├── stripe/        # 2,100+ lines
│   ├── supabase/
│   ├── plaid/         # consolidated: Link + Auth + Transactions + Identity + Accounts
│   ├── expo/          # consolidated: core + EAS Build + EAS Update + Expo Router
│   ├── anthropic/     # 1 main skill + 6 Claude Code meta-tooling sub-skills
│   └── toon-formatter/
├── commands/
│   ├── convert-to-toon.md
│   ├── analyze-tokens.md
│   ├── toon-{encode,decode,validate}.md
│   └── {discover,install}-skills.md
└── utils/toon/cli.mjs # 90-line wrapper around @toon-format/toon + gpt-tokenizer
```

## Benchmarks

Real measured token counts for a handful of representative workloads are in [`bench/`](bench/). Numbers use `gpt-tokenizer`, not a claimed heuristic.

## Requirements

- Node.js ≥ 18
- Claude Code ≥ 1.0
- (Optional) `@toon-format/toon` and `gpt-tokenizer` in your project for TOON commands

## License

MIT. Not affiliated with Stripe, Supabase, Plaid, Expo, or Anthropic.
