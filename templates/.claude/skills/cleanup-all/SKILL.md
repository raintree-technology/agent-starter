---
name: cleanup-all
description: "Run all 8 cleanup skills in sequence: unused → cycles → dedupe → types → weak-types → defensive → legacy → slop. Each step verifies before the next runs; halts on first failure. Produces one consolidated report. Use when the user asks to clean up the whole codebase, run all cleanup skills, do a full code-quality pass, or sweep the repo. Example queries — \"clean up the whole codebase\", \"run a full code-quality pass\", \"sweep this repo\", \"do all the cleanups in order\"."
argument-hint: "[scope (optional path or glob)]"
user-invocable: true
---

Orchestrate the full cleanup pipeline. Runs each of the 8 cleanup skills in a deliberate order chosen so each step shrinks the surface for the next. Halts on first verify failure so you can investigate before the cascade continues.

## Preflight

1. **Confirm intent**: this will produce up to 8 separate commits and may touch many files. Show the user the planned order and ask confirmation if the working tree has any commits ahead of the upstream branch (might compound with their unpushed work).
2. **Git state**: refuse on dirty working tree. Each child skill needs a clean baseline for its verify step.
3. **Create master report**: `.claude/cleanup-reports/cleanup-all-{YYYY-MM-DD}.md` — child skill reports will be linked from this.
4. **Estimate baseline**: capture LOC, file count, dependency count, knip findings, madge cycles count, weak-type count. Used for before/after comparison at the end.

## Execution Order

Each child workflow is run by loading the matching local skill instructions for the current agent target. After each, run that skill's verify step. **Halt the pipeline on any verify failure** — do not proceed to the next step.

1. **`cleanup-unused`** — delete dead code first. Less for everything downstream to scan.
2. **`cleanup-cycles`** — fix the dependency graph next. Other refactors are safer in an acyclic graph.
3. **`cleanup-dedupe`** — extract duplicates. Now that dead code is gone and graph is clean, real duplicates surface.
4. **`cleanup-types`** — consolidate types. Often dedupe surfaces type duplication too.
5. **`cleanup-weak-types`** — strengthen types. Easier with consolidated type modules in place.
6. **`cleanup-defensive`** — remove pointless try/catch. Type strengthening sometimes makes catches obviously wrong.
7. **`cleanup-legacy`** — remove deprecated/fallback. Type changes may have already revealed dead branches.
8. **`cleanup-slop`** — strip unhelpful comments last. Cosmetic, no logic change.

### Why this order

- **Destructive then constructive then cosmetic**. Deletion first reduces what later skills consider.
- **Structure before contents**. Cycles and unused are graph-level; dedupe and types are content-level; slop is line-level.
- **Riskiest reversible-changes early** when the diff is small and the human can review faster. Slop last because it's safest and produces the largest comment diff.
- Each step's commit is a clean revert point if the user wants to undo a single phase.

### Per-step protocol

For each skill in order:
1. Print: `▶ Running cleanup-X (step Y/8)…`
2. Load and run the matching cleanup skill instructions with the same scope arg (if any).
3. Wait for the skill to finish — it produces its own commit and verify result.
4. If the skill's verify failed: HALT, print `✗ cleanup-X verify failed — halting pipeline. See report at <path>.`
5. If verify passed: append findings count + LOC delta to master report, continue.

## Master Report

Write `.claude/cleanup-reports/cleanup-all-{YYYY-MM-DD}.md`:

```markdown
# Full Cleanup — YYYY-MM-DD

## Baseline
- LOC: N
- Files: M
- Dependencies: K
- Cycles (madge): C
- Weak types: W
- Knip-flagged unused: U

## Pipeline Run

| # | Skill | Status | Items removed | LOC delta | Commit | Report |
|---|-------|--------|---------------|-----------|--------|--------|
| 1 | cleanup-unused | pass | 12 (3 files, 8 exports, 1 dep) | -340 | `<commit>` | `[link]` |
| 2 | cleanup-cycles | pass | 3 cycles broken | +12 (extracted leaves) | `<commit>` | `[link]` |
| 3 | cleanup-dedupe | ✓ | 5 utils extracted | -180 | ... | ... |
| 4 | cleanup-types | ✓ | 4 types consolidated | -60 | ... | ... |
| 5 | cleanup-weak-types | ✓ | 22 weak types strengthened | 0 | ... | ... |
| 6 | cleanup-defensive | halted | unsafe pattern requires review | - | - | `[link]` |
| 7 | cleanup-legacy | (not run — pipeline halted at step 6) | | | | |
| 8 | cleanup-slop | (not run) | | | | |

## After (steps 1-5 only)
- LOC: N - 568
- Files: M - 3
- Dependencies: K - 1
- Cycles: 0
- Weak types: W - 22

## Halt Reason
- Step 6 (`cleanup-defensive`) verify failed: 3 tests broke when removing 2 swallow-and-return-null catches in `services/payment.ts`. The hidden errors were real bugs. See child report for details.

## Next Steps
1. Review halted step's report. Decide whether the surfaced bugs need fixing now.
2. Re-run pipeline starting from the halted step: `/cleanup-defensive` then `/cleanup-legacy` then `/cleanup-slop`.

## Deferred Items
[Aggregated MEDIUM/LOW findings across all run steps — N items requiring human review.]
```

## After Completion (or Halt)

End-of-turn message:
- Steps completed: X / 8
- Total items removed: N
- Total LOC delta: -M
- Halt reason (if any) — quote first 2 lines from halted skill's verify failure.
- Path to master report.
- Next-step suggestion: either "all steps green — review master report" or "halted at step X — see report and decide next action."

## NEVER

- Continue past a verify failure — the next skill might compound the breakage.
- Squash the per-skill commits — they're the rollback granularity.
- Auto-fix the halted skill's failure — that's a human decision (the failure may be a real bug worth investigating).
- Run on a dirty working tree — refuse and ask user to commit/stash.
- Run when the repo is mid-rebase, mid-merge, or mid-cherry-pick — git state will confuse the per-step commits.
- Skip the baseline measurement — without it, the master report has no before/after delta.
