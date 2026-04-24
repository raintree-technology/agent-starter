---
name: toon-formatter
description: Guidance on when and how to use TOON (Token-Oriented Object Notation) — a compact JSON alternative that typically cuts input tokens 30-50% on tabular data. Use when the user is about to paste or serialize a large JSON array into a prompt, has a payload with ≥5 uniform objects, or is optimizing an LLM pipeline for cost/context. Knows the format shapes (tabular `[N]{a,b}:` rows, inline `[N]: ...`, expanded), when TOON helps vs hurts, and how to invoke `/convert-to-toon`, `/analyze-tokens`, and the `.claude/utils/toon/cli.mjs` wrapper. Example queries — "convert this API response to TOON", "will this JSON benefit from TOON", "how does TOON handle nested objects".
allowed-tools: Read, Write, Edit, Bash
model: sonnet
---

# TOON v2.0 Formatter

**AGGRESSIVELY** apply TOON format to save 30-60% tokens on structured data.

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

## Binary Encoder (20x faster)

```bash
# Encode JSON to TOON
.claude/skills/toon-formatter/bin/toon encode data.json

# With options
.claude/skills/toon-formatter/bin/toon encode data.json --delimiter tab --key-folding

# Check if TOON recommended
.claude/skills/toon-formatter/bin/toon check data.json

# Decode TOON to JSON
.claude/skills/toon-formatter/bin/toon decode data.toon
```

## Commands

- `/toon-encode <file>` - JSON to TOON
- `/toon-decode <file>` - TOON to JSON  
- `/toon-validate <file>` - Validate TOON
- `/analyze-tokens <file>` - Compare savings
- `/convert-to-toon <file>` - Full conversion workflow

## Documentation

- **Complete Guide:** `docs/toon-guide.md`
- **Build Instructions:** `docs/INSTALL.md`
- **Source Code:** `src/toon.zig`
- **Spec:** https://github.com/toon-format/spec
