# TOON Validate

Validate TOON syntax by round-tripping through `@toon-format/toon` decode.

**Usage:** `/toon-validate <file>`

**Requires:** `npm i @toon-format/toon` in your project.

Execute:

```bash
FILE="$1"

if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  echo "Usage: /toon-validate <file>"
  exit 1
fi

node .claude/utils/toon/cli.mjs validate "$FILE"
```

Exit code is `0` on valid, `1` on invalid — safe to use in CI or precommit hooks.
