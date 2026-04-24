# TOON Decode

Convert a TOON file back to JSON using `@toon-format/toon`.

**Usage:** `/toon-decode <file>`

**Requires:** `npm i @toon-format/toon` in your project.

Execute:

```bash
FILE="$1"

if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  echo "Usage: /toon-decode <file>"
  exit 1
fi

OUT="${FILE%.toon}.json"

node .claude/utils/toon/cli.mjs decode "$FILE" > "$OUT" || exit $?
echo "✓ Wrote $OUT"
```

## Notes

Round-trip is preserved for standard TOON v2 syntax. If decode fails, run `/toon-validate <file>` to pinpoint the issue.
