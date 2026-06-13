# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## What This Repository Is

**agent-starter** is a small, depth-focused multi-agent skill pack. It ships one shared set of skills and generates native project files for:

- Claude Code: `.claude/`
- Codex: `AGENTS.md` plus `.codex/skills/*/SKILL.md`
- Cursor: `.cursor/rules/*.mdc`

Users run `npx create-agent-starter@latest` and choose targets with `--agent claude`, `--agent codex`, `--agent cursor`, or `--agent all`.

This is configuration, not an app framework. Avoid adding runtime orchestration, semantic matching engines, YAML workflow DSLs, or placeholder command frameworks.

Since v4 the package is also a project-level agent config manager: an `agent.json` manifest at the project root declares profile, targets, skills, and MCP servers; `npx create-agent-starter@latest sync` writes each agent's native config from it (`.mcp.json`, `.codex/config.toml`, `.cursor/mcp.json`, managed blocks in CLAUDE.md/AGENTS.md). The optional global CLI (`npm i -g create-agent-starter`) exposes the shorter `agent-starter sync/status/add` commands for repeated use. Core modules: `src/manifest.js` (load/validate/resolve), `src/mcps.js` (MCP catalog + per-target rendering), `src/commands/{sync,status,add}.js`, `src/utils/managed-block.js` (fenced-marker editing). See SPEC.md for the full design.

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

The shipped profile skills are defined in `src/profiles.js`. Current groups are:

- HCI usability modeling: `human-processor-model`, `goms-klm-analysis`
- Apple HIG Doctor and reference skills: `hig-*`
- Cleanup skills: `cleanup-*`
- Growth and utility skills: `copywriting-frameworks`, `toon-formatter`

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
