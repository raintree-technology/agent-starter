# TOON Encode

Convert a JSON file to TOON format using the canonical `@toon-format/toon` library.

**Usage:** `/toon-encode <file> [--delimiter comma|tab|pipe] [--no-key-folding]`

**Requires:** `npm i @toon-format/toon gpt-tokenizer` in your project (the wrapper auto-detects and tells you if missing).

Execute:

```bash
FILE="$1"; shift

if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  echo "Usage: /toon-encode <file> [--delimiter comma|tab|pipe] [--no-key-folding]"
  exit 1
fi

OUT="${FILE%.json}.toon"

node .claude/utils/toon/cli.mjs encode "$FILE" "$@" > "$OUT" || exit $?
echo "✓ Wrote $OUT"

node .claude/utils/toon/cli.mjs analyze "$FILE"
```

## Related

- `/toon-decode` — TOON → JSON
- `/toon-validate` — validate TOON syntax
- `/analyze-tokens` — compare JSON vs TOON token counts without writing a file
