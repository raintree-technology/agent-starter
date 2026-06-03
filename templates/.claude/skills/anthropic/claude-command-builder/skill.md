---
name: claude-command-builder
description: Interactive slash command creator for Claude Code. Triggers when user mentions creating commands, slash commands, command templates, command arguments, or wants to build a new command workflow.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
model: sonnet
---

# Claude Code Command Builder

Create maintainable Claude Code slash commands with clear argument handling, scoped behavior, and validation guidance.

## Fast Workflow

1. Clarify the command name, user-facing trigger, arguments, expected side effects, and whether it belongs in project or user scope.
2. Keep the command body task-focused; put reusable examples or long references outside the command when they are not needed every run.
3. Validate command names, frontmatter, argument hints, and file placement before claiming the command is ready.
4. Give the user the installed path and one realistic invocation example.

## Detailed Reference

Read `references/full-guide.md` when you need complete slash-command templates, argument patterns, examples, anti-patterns, and troubleshooting notes. Keep this entrypoint loaded first, then load only the reference sections relevant to the task.

## Documentation

Read current Claude Code command docs when behavior depends on the installed Claude Code version.

## Output

Give concrete file paths, commands, validation steps, and any restart/reload requirement. Avoid broad rewrites when a small generated file or setting is enough.
