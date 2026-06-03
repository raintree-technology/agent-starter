---
name: claude-hook-builder
description: Interactive hook creator for Claude Code. Triggers when user mentions creating hooks, PreToolUse, PostToolUse, hook validation, hook configuration, settings.json hooks, or wants to automate tool execution workflows.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
model: sonnet
---

# Claude Code Hook Builder

Create Claude Code hooks that are narrow, testable, and fail safely around tool-use or session events.

## Fast Workflow

1. Clarify the hook event, matcher, intended decision, expected side effects, and failure behavior before writing code.
2. Prefer small deterministic scripts over broad prompt-based checks for security-sensitive validation.
3. Keep hooks scoped to the project unless the user explicitly wants user-wide behavior.
4. Test hook scripts directly with representative JSON payloads before wiring them into settings.

## Detailed Reference

Read `references/full-guide.md` when you need hook event payloads, matcher examples, validation scripts, settings snippets, and troubleshooting guidance. Keep this entrypoint loaded first, then load only the reference sections relevant to the task.

## Documentation

Read current Claude Code hook docs when event payload or permission semantics matter.

## Output

Give concrete file paths, commands, validation steps, and any restart/reload requirement. Avoid broad rewrites when a small generated file or setting is enough.
