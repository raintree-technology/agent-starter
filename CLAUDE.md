# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## What This Repository Is

**agent-starter** is a small, depth-focused multi-agent skill pack. It ships one shared set of skills and generates native project files for:

- Claude Code: `.claude/`
- Codex: `AGENTS.md` plus `.codex/skills/*/SKILL.md`
- Cursor: `.cursor/rules/*.mdc`

Users run `npx create-agent-starter` and choose targets with `--agent claude`, `--agent codex`, `--agent cursor`, or `--agent all`.

This is configuration, not an app framework. Avoid adding runtime orchestration, semantic matching engines, YAML workflow DSLs, or placeholder command frameworks.

## Current Structure

```text
agent-starter/
├── bin/cli.js
├── src/
│   ├── agents.js
│   ├── commands/
│   └── utils/
├── templates/
│   ├── .claude/
│   ├── codex/
│   └── cursor/
├── test/
└── site/
```

The shared skill source is still `templates/.claude/skills/`. Codex and Cursor outputs are generated from those source files at install time.

## Skills

The shipped profile skills are defined in `src/profiles.js`:

- `stripe`
- `supabase`
- `plaid`
- `expo`
- `copywriting-frameworks`
- `anthropic`
- `toon-formatter`

When adding a skill, update the shared source in `templates/.claude/skills/`, register it in `src/profiles.js`, add regression coverage for all relevant agent targets, and update README/site copy.

## Agent Target Rules

- Claude output owns `.claude/`, settings generation, commands, hooks, and TOON utility setup.
- Codex output owns `.codex/skills/*/SKILL.md` and root `AGENTS.md`.
- Cursor output owns `.cursor/rules/*.mdc`.
- Keep Claude as the default install target for backwards compatibility.
- Keep `claude-starter` and `create-claude-starter` CLI aliases unless there is a migration plan.

## Testing

```bash
npm test
npm run lint
cd site && npm run typecheck
cd site && npm run lint
```

Use focused tests for installer behavior. The important invariant is that a selected skill set installs cleanly into every requested agent target without emitting unrelated target directories.
