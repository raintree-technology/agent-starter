# TOON vs JSON: measured input-token savings across 6 realistic workloads

*A reproducible benchmark, not a claim.*

## TL;DR

Across six representative JSON payloads — API responses, transaction rows, structured logs, time-series metrics, and some adversarial edge cases — encoding in [TOON (Token-Oriented Object Notation)](https://toonformat.dev) instead of JSON reduced input tokens by **48–66%**, with an aggregate saving of **58%** across ~37,000 JSON tokens. Real tokenizer, deterministic seeded workloads, code in [`bench/`](https://github.com/raintree-technology/claude-starter/tree/main/bench).

## Why we ran this

The TOON spec ([Schopplich, Oct 2025](https://github.com/toon-format/toon)) claims 30–60% token reduction on tabular data. The [`@toon-format/toon`](https://www.npmjs.com/package/@toon-format/toon) npm package has >1.8M monthly downloads. And yet, nearly every benchmark in circulation — including the spec's own — counts tokens with `bytes / 4` or cites figures sourced from the author. That's fine for intuition; it's not fine for "should I actually change my pipeline."

So we wrote a real one.

## Method

- **Tokenizer:** [`gpt-tokenizer@3.x`](https://www.npmjs.com/package/gpt-tokenizer) (OpenAI BPE, cl100k_base). Claude's tokenizer is not public; OpenAI BPE tracks it within a few percentage points on English text.
- **Encoder:** `@toon-format/toon@2.1.0` with default options (comma delimiter, key folding on).
- **Workloads:** Generated from a seeded PRNG — same shape and values every run. See [`bench/generate-workloads.mjs`](https://github.com/raintree-technology/claude-starter/blob/main/bench/generate-workloads.mjs).
- **Runner:** [`bench/run.mjs`](https://github.com/raintree-technology/claude-starter/blob/main/bench/run.mjs). Reads each JSON file, encodes to TOON, counts tokens both ways, emits a markdown table.

Full code is ~60 lines. Run `node bench/run.mjs` to reproduce.

## Results

| Workload | JSON bytes | TOON bytes | JSON tokens | TOON tokens | Δ | Savings |
|---|---:|---:|---:|---:|---:|---:|
| `api-response-users.json` (50 user records) | 10,424 | 4,576 | 4,133 | 2,128 | 2,005 | **48.5%** |
| `db-transactions.json` (100 transaction records) | 15,721 | 4,972 | 5,708 | 2,252 | 3,456 | **60.5%** |
| `irregular-nested.json` (deeply nested mixed) | 437 | 247 | 135 | 80 | 55 | **40.7%** |
| `logs-events.json` (200 log events) | 32,853 | 11,505 | 13,052 | 6,266 | 6,786 | **52.0%** |
| `metrics-series.json` (288 time-series points) | 27,780 | 7,649 | 13,537 | 4,622 | 8,915 | **65.9%** |
| `small-array.json` (3 items) | 131 | 46 | 62 | 27 | 35 | **56.5%** |
| **Aggregate** | **87,346** | **28,995** | **36,627** | **15,375** | **21,252** | **58.0%** |

## What we expected vs. what we found

**Expected:** tabular arrays would win 30–50%; small arrays would lose because of TOON's `[N]{fields}:` header overhead; irregular nested objects would barely move.

**Actual:**
- **Tabular wins held up and then some** — 48.5% to 65.9%, beating the spec's claimed range.
- **The small-array hypothesis was wrong.** Three uniform items still saved 56.5%. The header cost amortizes at even very small array sizes, as long as the shape is uniform.
- **Irregular nested still saved 40.7%** — better than expected. TOON's key elision on nested objects (`a.b.c: value`) pulls its weight.

The clean conclusion: **if the data has any repeated object shape, TOON probably wins.** The reliable loss case is very small, deeply irregular blobs — and even there it was roughly even.

## How we wired it into Claude Code

We ship a 90-line Node wrapper at [`.claude/utils/toon/cli.mjs`](https://github.com/raintree-technology/claude-starter/blob/main/templates/.claude/utils/toon/cli.mjs) that exposes `encode | decode | validate | count | analyze` on top of `@toon-format/toon` and `gpt-tokenizer`. Five slash commands (`/convert-to-toon`, `/analyze-tokens`, `/toon-encode`, `/toon-decode`, `/toon-validate`) shell into it.

Running `/analyze-tokens api-response.json` inside Claude Code now shows you real measured savings before you decide to convert — not a `bytes/4` estimate.

## Caveats

- **Input-token savings only.** Output tokens are unaffected.
- **Tokenizer mismatch.** We used OpenAI BPE. Claude's tokenizer will differ slightly — usually within a few percentage points, occasionally more. For exact counts, call the provider-specific token count endpoint.
- **Six workloads is six workloads.** Your data might be weirder. The seeded-PRNG workloads are designed to be reproducible and fair, not to cover every edge case. Run the benchmark on *your* payloads.
- **TOON is one person's project.** Johann Schopplich has ~260 commits; the next contributor has 6. The spec is at RFC v4.0 as of April 2026 and actively evolving. If you adopt it, track upstream.

## Takeaway

If you're sending repeated-shape JSON into an LLM prompt and paying for input tokens, TOON is worth wiring into your pipeline. Not because of a marketing-deck claim — because the measurements are easy to reproduce, and they keep landing in the 40–60% range.

**Code:** [github.com/raintree-technology/claude-starter](https://github.com/raintree-technology/claude-starter) — see `bench/` for the benchmark, `templates/.claude/utils/toon/cli.mjs` for the 90-line wrapper, and `templates/.claude/commands/` for the slash commands.
