# TOON Formatter Guide

## Table of Contents

- [Purpose](#purpose)
- [Good Fit](#good-fit)
- [Poor Fit](#poor-fit)
- [Core Shapes](#core-shapes)
- [Runtime](#runtime)
- [Validation](#validation)
- [Troubleshooting](#troubleshooting)

## Purpose

TOON (Token-Oriented Object Notation) is a compact representation for JSON-like data. It can reduce token usage for tabular data because repeated keys move into a header instead of being repeated in every object.

Do not promise a fixed savings percentage. Estimate or measure savings for the actual payload when cost or context limits matter.

## Good Fit

- Arrays with at least 5 items.
- Uniform objects with at least 60% shared fields.
- Logs, metrics, database rows, event streams, transactions, and analytics payloads.
- Payloads the agent will read but not hand-edit extensively.

## Poor Fit

- Small arrays.
- Deeply nested structures.
- Objects with many missing or unique fields.
- Prose, prompts, legal text, or instructions.
- Any payload where strict JSON compatibility is required by the next tool.

## Core Shapes

Tabular array:

```toon
[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Carol,user
```

Inline primitive array:

```toon
tags[4]: urgent,reviewed,approved,final
```

Expanded list for irregular data:

```toon
items[2]:
  - id: 1
    name: Simple
  - id: 2
    metadata:
      nested: true
```

Key folding for shallow nested objects:

```toon
server.host: localhost
server.port: 8080
```

## Runtime

Agent Starter installs a Node wrapper when Claude support files are installed:

```bash
node .claude/utils/toon/cli.mjs analyze data.json
node .claude/utils/toon/cli.mjs encode data.json
node .claude/utils/toon/cli.mjs decode data.toon
node .claude/utils/toon/cli.mjs validate data.toon
```

Slash commands may also be available in Claude installs:

```text
/analyze-tokens <file>
/toon-encode <file>
/toon-decode <file>
/toon-validate <file>
/convert-to-toon <file>
```

If the wrapper is absent, use an installed `@toon-format/toon` CLI/library or convert manually from the official spec.

## Validation

- Round-trip encode and decode before using TOON as an interchange format.
- Preserve row counts: the `[N]` count must match the number of rows or items.
- Preserve field order in tabular rows.
- Quote or escape values according to the spec when values contain delimiters, newlines, or ambiguous primitives.
- Keep original JSON available when exact fidelity matters.

## Troubleshooting

Low savings:

- Check whether objects share enough fields.
- Try tab or pipe delimiters when values contain many commas.
- Keep nested or irregular sections as JSON instead of forcing TOON.

Validation failures:

- Check indentation.
- Check row count and column count.
- Decode and compare against the original JSON.

Spec: https://github.com/toon-format/spec
