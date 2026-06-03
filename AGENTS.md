# AGENTS.md

This file provides guidance to Codex when working with this repository.

## What This Repository Is

**agent-starter** is a multi-agent skill starter. It generates project-local guidance for Claude Code, Codex, and Cursor from one shared skill source.

This is not an application framework. Keep changes focused on installable configuration, skill content, CLI behavior, docs, tests, and the marketing site.

## Agent Targets

The installer supports:

- `--agent claude`: writes `.claude/` with Claude Code skills, commands, settings, hooks, and TOON utilities.
- `--agent codex`: writes root `AGENTS.md` plus `.codex/skills/<skill-id>/SKILL.md`.
- `--agent cursor`: writes `.cursor/rules/*.mdc`.
- `--agent all`: writes all supported target outputs.

Claude is the default target for backwards compatibility.

## Shared Skill Source

The canonical skill source is `templates/.claude/skills/`. Codex and Cursor target files are generated from that source by adapter logic in `src/utils/copy.js`.

Do not maintain separate hand-written copies of every skill for Codex or Cursor. Add shared source once, then adapt it programmatically.

## Important Files

- `src/agents.js`: supported agent target definitions and parsing.
- `src/commands/init.js`: CLI install flow.
- `src/utils/copy.js`: target copy and generated adapter logic.
- `src/profiles.js`: skill registry and profile definitions.
- `templates/.claude/`: Claude source template and shared skills.
- `templates/codex/`: static Codex README template.
- `templates/cursor/`: static Cursor README template.
- `test/install-regression.test.js`: installer and target regression tests.

## Validation

Run:

```bash
npm test
npm run lint
cd site && npm run typecheck
cd site && npm run lint
```

Before calling the work done, verify Codex and Cursor installs with real CLI output in a temp directory, not just helper-level tests.
