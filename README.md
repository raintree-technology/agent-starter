# agent-starter

An opinionated multi-agent skill pack for Claude Code, Codex, and Cursor. Deep, handwritten skills for HCI usability modeling, Apple HIG Doctor guidance, copywriting, code cleanup, and TOON token savings.

No orchestration framework. No aspirational YAML. Just agent-native project files generated from one shared skill source.

[![npm version](https://img.shields.io/npm/v/create-agent-starter.svg)](https://www.npmjs.com/package/create-agent-starter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Star History

<a href="https://star-history.com/#raintree-technology/agent-starter&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=raintree-technology/agent-starter&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=raintree-technology/agent-starter&type=Date" />
    <img alt="Star history chart for raintree-technology/agent-starter" src="https://api.star-history.com/svg?repos=raintree-technology/agent-starter&type=Date" />
  </picture>
</a>

## What you get

**29 shipped skills**:

| Skill | Covers |
|---|---|
| **human-processor-model** | Estimates task time, cognitive load, memory burden, and perceptual/motor bottlenecks in product flows. |
| **goms-klm-analysis** | Decomposes workflows into GOMS/KLM goals, operators, methods, selection rules, waits, and interaction-cost comparisons. |
| **hig-doctor-audit** | Runs the HIG Doctor verification loop with `npx hig-doctor`, severity gates, exported reports, and category-to-skill routing. |
| **hig-project-context** | Creates shared Apple design context so HIG skills tailor guidance without repetitive questions. |
| **hig-foundations** | Apple HIG foundations: color, typography, SF Symbols, dark mode, accessibility, layout, materials, motion, privacy, writing. |
| **hig-platforms** | Platform-specific HIG guidance for iOS, iPadOS, macOS, tvOS, visionOS, watchOS, and games. |
| **hig-patterns** | Apple UX patterns for onboarding, launch, loading, permissions, feedback, undo, settings, sharing, and collaboration. |
| **hig-inputs** | Apple input guidance for gestures, keyboards, pointers, Apple Pencil, Digital Crown, focus, remotes, and spatial input. |
| **hig-technologies** | Apple technology guidance for Siri, Apple Pay, HealthKit, ARKit, iCloud, Sign in with Apple, SharePlay, Wallet, and more. |
| **hig-components-content** | HIG content display components: charts, collections, image views, web views, color wells, lockups, share sheets. |
| **hig-components-layout** | HIG layout and organization: sidebars, split views, tab bars, scroll views, windows, panels, lists, and tables. |
| **hig-components-menus** | HIG menus and actions: buttons, context menus, toolbars, menu bar, pop-up buttons, and disclosure controls. |
| **hig-components-search** | HIG search and navigation components: search fields, page controls, and path controls. |
| **hig-components-dialogs** | HIG dialogs and overlays: alerts, action sheets, popovers, sheets, and digit entry views. |
| **hig-components-controls** | HIG controls: pickers, toggles, sliders, steppers, segmented controls, text fields, labels, and validation. |
| **hig-components-status** | HIG status and progress UI: progress indicators, status bars, loading states, and activity rings. |
| **hig-components-system** | HIG system experiences: widgets, Live Activities, notifications, complications, App Clips, shortcuts, and watch faces. |
| **copywriting-frameworks** | Headlines, landing pages, ads, emails, CTAs, AIDA, objections, proof placeholders, critiques. |
| **finish-setup** | Provisions a freshly scaffolded SaaS project through the wired MCPs: Stripe products, database migrations, email DNS, analytics, GitHub. |
| **toon-formatter** | When TOON helps, when it does not, and how to invoke the TOON commands. |
| **cleanup-all** | Orchestrates the full cleanup pipeline. |
| **cleanup-unused** | Detects and removes high-confidence dead code, exports, files, and dependencies. |
| **cleanup-cycles** | Detects and untangles circular dependencies. |
| **cleanup-dedupe** | Extracts high-confidence duplicate code into shared utilities. |
| **cleanup-types** | Consolidates duplicated or fragmented type definitions. |
| **cleanup-weak-types** | Replaces weak types with stronger inferred or validated types. |
| **cleanup-defensive** | Removes pointless try/catch blocks and guards that hide errors. |
| **cleanup-legacy** | Removes zero-caller deprecated, legacy, and fallback paths. |
| **cleanup-slop** | Removes unhelpful narration comments while preserving useful WHY comments. |

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
npx create-agent-starter@latest

# Codex only
npx create-agent-starter@latest --agent codex

# Cursor only
npx create-agent-starter@latest --agent cursor

# Claude Code + Codex + Cursor
npx create-agent-starter@latest --agent all

# Backwards-compatible aliases still work
npx create-claude-starter@3.0.1 --agent all
```

For Claude TOON commands, add the runtime deps to your project:

```bash
npm i @toon-format/toon gpt-tokenizer
```

## Profiles

```bash
npx create-agent-starter@latest --profile all --agent all
npx create-agent-starter@latest --profile apple-hig --agent codex,cursor
npx create-agent-starter@latest --profile design-hci --agent codex
npx create-agent-starter@latest --skills copywriting-frameworks,cleanup-unused --agent cursor
```

Profiles select a skill set. Agent targets decide where that skill set is installed.

Stack profiles (`next-saas`, `next`, `node`, `base`) additionally bundle MCP servers for the stack. `init` auto-detects the right one from `package.json`.

## agent.json

`init` writes an `agent.json` manifest at the project root — the single declaration of the project's agent environment (profile, targets, skills, MCP servers). Check it into git; every contributor then runs:

```bash
npx agent-starter sync
```

and gets identical native config for whichever agent they use: skills plus `.mcp.json` (Claude Code), `.codex/config.toml` + `AGENTS.md` (Codex), and `.cursor/mcp.json` + rules (Cursor). Sync is idempotent — generated sections are fenced with markers, manual edits outside them survive, and MCP entries agent-starter didn't write are never touched.

```bash
npx agent-starter status            # diff agent.json vs native configs; exits 1 on drift
npx agent-starter add mcp neon      # catalog: github, neon, stripe, resend, posthog
npx agent-starter add mcp internal --command ./bin/mcp --env API_KEY='${API_KEY}'
npx agent-starter add skill cleanup-types
```

Secrets are referenced as `${VAR}` and resolved by each agent at runtime — never written to the generated files. Sync appends missing vars to `.env.example` and warns when they're unset.

The `next-saas` profile is the flagship: cleanup + copywriting skills, the `finish-setup` provisioning skill, and Neon/Stripe/Resend/PostHog/GitHub MCPs — designed as the companion to a Next.js SaaS template. After scaffolding, open your agent and say "finish setup": the agent creates Stripe products to match your billing plans, verifies migrations, and walks email DNS via the wired MCPs.

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

The Apple HIG skills are vendored from [HIG Doctor](https://apple.raintree.technology), including the progressive-disclosure `references/` corpus with canonical Apple source links and attribution. The `hig-doctor-audit` skill points agents at HIG Doctor's published audit CLI and verification workflow.

## Benchmarks

Real measured token counts for representative workloads are in [`bench/`](bench/). Numbers use `gpt-tokenizer`, not a claimed heuristic.

## Requirements

- Node.js >= 18
- Claude Code, Codex, or Cursor, depending on the selected target
- Optional: `@toon-format/toon` and `gpt-tokenizer` for Claude TOON slash commands

## License

MIT. Not affiliated with Anthropic, Apple, OpenAI, Cursor, or `@toon-format/toon`.
