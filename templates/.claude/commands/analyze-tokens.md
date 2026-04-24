# Analyze Tokens

Compare real token counts of a JSON file against its TOON-encoded form. Uses `gpt-tokenizer` (OpenAI BPE) as a proxy for Claude's tokenizer — directionally accurate, not exact.

**Usage:** `/analyze-tokens <file>`

**Requires:** `npm i @toon-format/toon gpt-tokenizer` in your project. Without `gpt-tokenizer` the command falls back to a bytes/4 heuristic and prints a warning.

Execute:

```bash
FILE="$1"

if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  echo "Usage: /analyze-tokens <file>"
  exit 1
fi

node .claude/utils/toon/cli.mjs analyze "$FILE"
```

## Interpretation

- **Savings ≥ 30%** — good candidate for TOON (tabular data, uniform objects).
- **Savings 10–30%** — marginal; only worth it if the payload is hot (appears in every prompt).
- **Savings < 10% or negative** — keep as JSON; TOON overhead isn't worth it for small or irregular data.

## Notes

Claude's tokenizer is not public; `gpt-tokenizer` is the closest open-source approximation. Expect Claude's actual token deltas to track within a few percentage points. For exact counts, use Anthropic's `/v1/messages/count_tokens` endpoint.
