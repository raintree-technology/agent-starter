# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## What this repository is

**claude-starter** — a deliberately small, depth-focused Claude Code skill pack. Distributed via npm (`create-claude-starter`). Users run `npx create-claude-starter` and it drops a `.claude/` directory into their project.

This is **configuration**, not code. The ships-as-config philosophy:
- No runtime dependencies on the user's machine beyond Claude Code itself.
- Optional npm deps (`@toon-format/toon`, `gpt-tokenizer`) are needed only for the TOON slash commands.
- Everything else is markdown that Claude Code loads when relevant.

## What is **not** here (and why)

These were previously scaffolded and have been removed:

- **Skill orchestration engine** (`.claude/orchestration/`) — mock TypeScript with placeholder embedding functions. Claude Code selects skills natively via frontmatter descriptions; this engine was never invoked.
- **Workflow DSL + YAML engine** (`.claude/workflows/`, `.claude/utils/workflows/`) — aspirational. Out of scope for a skill pack.
- **Meta-commands** (`/create-command`, `/edit-command`, `/workflow-compose`) and command registry / validators — redundant with Claude Code's built-in skill and plugin system.
- **Native Zig TOON implementation** — removed in favor of the canonical `@toon-format/toon` npm library (1.8M downloads/month, MIT, pure JS, cross-platform). A 90-line wrapper at `templates/.claude/utils/toon/cli.mjs` shells into it.
- **Blockchain / iOS / Shopify / Whop / Helius skills** — too niche for this pack's target audience.
- **Code-quality skills** (`cleanup-*`) — these were forks of Anthropic's official skills with swapped frontmatter. Deleted to avoid conflicts.

If you are tempted to rebuild any of these, check whether Claude Code already solves it natively first.

## Directory structure

```
claude-starter/
├── README.md                       # User-facing pitch
├── CLAUDE.md                       # This file
├── package.json                    # npm distribution (create-claude-starter)
├── bin/cli.js                      # CLI entry
├── src/                            # init/add/list/update/docs commands
├── templates/.claude/              # Copied into user's project on install
│   ├── skills/                     # 6 top-level skills (see below)
│   ├── commands/                   # TOON + skill-marketplace commands
│   ├── hooks/                      # Post-tool automation (disabled by default)
│   ├── utils/toon/cli.mjs          # TOON wrapper
│   └── settings.json
├── test/                           # Security + template tests (node --test)
└── bench/                          # Real measured TOON vs JSON token counts
```

## The 6 skills

| Skill | Why it's here |
|---|---|
| `stripe/` | 2,100+ lines of real integration patterns. Anthropic's own `stripe-best-practices` is 38 lines of guidance — this is complementary, not redundant. |
| `supabase/` | Postgres + RLS + Auth + Realtime + Edge Functions + pgvector. No first-party Anthropic skill. |
| `plaid/` | Consolidated single skill covering Link, Auth, Transactions, Identity, Accounts. Previously split 4 ways; merged for better activation and maintenance. |
| `expo/` | Consolidated: core Expo + EAS Build + EAS Update + Expo Router. Previously split 4 ways. |
| `anthropic/` | Real differentiator. Main skill + 6 Claude Code meta-tooling sub-skills (skill-builder, command-builder, hook-builder, mcp-expert, settings-expert, claude-code). Anthropic doesn't ship an equivalent. |
| `toon-formatter/` | Tells Claude **when** to reach for TOON and how to invoke the commands. |

## TOON integration

`@toon-format/toon` is a JSON-alternative format by Johann Schopplich (Oct 2025, 24k stars, 1.8M weekly downloads) that cuts input tokens 30-50% on tabular data. We do not own the format; we just wrap it.

The wrapper at `templates/.claude/utils/toon/cli.mjs` exposes `encode | decode | validate | count | analyze`. Token counts use `gpt-tokenizer` (OpenAI BPE) as a proxy for Claude's tokenizer — directionally accurate within a few percentage points.

For exact Claude token counts, users can call Anthropic's `/v1/messages/count_tokens` endpoint. We don't wrap that because it requires an API key and a network round-trip; the local tokenizer is plenty accurate for "should I use TOON here" decisions.

## Working with this repo

**Prefer editing existing skill files** over creating new ones. Each skill is a single `skill.md` plus optional `docs/` (gitignored, pulled by `docpull`).

**Skill activation quality** matters more than skill count. Per Anthropic's best-practice docs, a strong `description` with concrete example queries lifts activation from ~20% to ~50%, and from 72% to 90% when examples are included. When editing a skill's frontmatter, keep the pattern:
- One-sentence coverage statement (what it knows)
- Trigger keywords ("Invoke when user mentions...")
- 3-4 concrete example queries ("Example queries — ...")

**Do not** add aspirational features back. If a feature would be cool but doesn't work yet, leave it out of the repo. The previous maintenance burden from placeholder orchestration code was significant.

**Do not** inflate the skill count by splitting one domain into multiple sub-skills. The old Plaid split (4 sub-skills) and Expo split (3 sub-skills) consolidated into single skills with better descriptions perform better on activation tests.

## Testing

```bash
npm test         # node --test; runs test/*.test.js
npm run lint     # eslint src/ test/
```

Tests cover: security utilities (`src/utils/security.js`), template settings fail-closed posture, installed-manifest validation, and skill-install doc hygiene (commit-pinned artifacts, SHA-256 mention).

## License

MIT. Not affiliated with Stripe, Supabase, Plaid, Expo, Anthropic, or `@toon-format/toon`.
