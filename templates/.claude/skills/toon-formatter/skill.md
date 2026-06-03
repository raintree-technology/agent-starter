---
name: toon-formatter
description: Guidance on when and how to use TOON (Token-Oriented Object Notation) — a compact JSON alternative that typically cuts input tokens 30-50% on tabular data. Use when the user is about to paste or serialize a large JSON array into a prompt, has a payload with ≥5 uniform objects, or is optimizing an LLM pipeline for cost/context. Knows the format shapes (tabular `[N]{a,b}:` rows, inline `[N]: ...`, expanded), when TOON helps vs hurts, and how to invoke installed TOON commands or wrappers when available. Example queries — "convert this API response to TOON", "will this JSON benefit from TOON", "how does TOON handle nested objects".
allowed-tools: Read, Write, Edit, Bash
model: sonnet
---

# TOON v2.0 Formatter

Use TOON when it materially reduces prompt size without making the payload harder to inspect or validate. It is strongest for large, mostly uniform arrays and weakest for small, nested, or irregular data.

## When to Use

**YES - Use automatically:**
- Arrays with ≥5 similar items
- Tables, logs, events, transactions, analytics
- API responses with ≥60% field uniformity
- Database results, metrics, benchmarks

**NO - Keep as JSON:**
- Small arrays (<5 items)
- Deeply nested or non-uniform data
- Narrative text, instructions

## Quick Reference

**Tabular** (uniform objects):
```
[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Carol,user
```

**Inline** (primitives ≤10):
```
tags[4]: js,react,node,api
```

**Delimiters:** comma (default), tab `[N\t]`, pipe `[N|]`

**Key folding** (nested objects):
```
server.host: localhost
server.port: 8080
```

## Runtime Options

```bash
# Claude installs include slash commands that call this wrapper:
node .claude/utils/toon/cli.mjs encode data.json

# With options:
node .claude/utils/toon/cli.mjs encode data.json --delimiter tab --no-key-folding

# Compare token savings:
node .claude/utils/toon/cli.mjs analyze data.json

# Decode TOON to JSON:
node .claude/utils/toon/cli.mjs decode data.toon
```

If the wrapper or slash commands are not installed in the target project, use an available `@toon-format/toon` CLI/library or convert manually from the spec and validate the result.

## Commands

- `/toon-encode <file>` - JSON to TOON
- `/toon-decode <file>` - TOON to JSON  
- `/toon-validate <file>` - Validate TOON
- `/analyze-tokens <file>` - Compare savings
- `/convert-to-toon <file>` - Full conversion workflow

## Documentation

- **Guide:** `references/toon-guide.md`
- **Spec:** https://github.com/toon-format/spec
