# Convert to TOON

Convert a JSON file to TOON and report measured token savings in one step.

**Usage:** `/convert-to-toon <file> [--delimiter comma|tab|pipe] [--no-key-folding]`

**Requires:** `npm i @toon-format/toon gpt-tokenizer` in your project.

Execute:

```bash
FILE="$1"; shift

if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  echo "Usage: /convert-to-toon <file> [--delimiter comma|tab|pipe] [--no-key-folding]"
  exit 1
fi

OUT="${FILE%.json}.toon"

node .claude/utils/toon/cli.mjs encode "$FILE" "$@" > "$OUT" || exit $?
echo "✓ Wrote $OUT"
echo
node .claude/utils/toon/cli.mjs analyze "$FILE"
echo
node .claude/utils/toon/cli.mjs validate "$OUT"
```

## When TOON helps

- Arrays of ≥5 uniform objects (same keys) — biggest wins, 30-50% typical.
- Logs, metrics, API responses, database result sets — table-shaped data.

## When TOON hurts

- Small arrays (<5 items) — overhead wins.
- Deeply nested, irregular objects — JSON is denser.
- Data with long string values — the savings are from key elision, not value compression.
