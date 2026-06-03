---
name: cleanup-legacy
description: "Find and remove deprecated, legacy, and fallback code paths with zero callers. Verifies callers via repo grep + LSP before deletion. Removes unreachable fallback branches. Use when the user asks to remove deprecated code, clean up legacy paths, drop fallbacks, or simplify code branches. Example queries — \"remove the deprecated API\", \"drop the v1 fallback\", \"this code is marked legacy, kill it\", \"simplify these branches\"."
argument-hint: "[scope (optional path or glob)]"
user-invocable: true
---

Find code marked deprecated/legacy/old/v1 and verify it's truly unused before deletion. Also find unreachable fallback branches (e.g., feature flag defaults that have flipped, version checks for unsupported runtimes).

## Preflight

1. **Language detect** — applies to all.
2. **Git state**: refuse on dirty tree.
3. **Report dir**: ensure exists.
4. **Read deprecation markers** the project uses. Common ones:
   - `@deprecated` JSDoc/TSDoc
   - `# deprecated` Python comments, `warnings.warn(DeprecationWarning)`
   - `// Deprecated:` Go convention
   - `#[deprecated]` Rust attribute
   - File/dir naming: `legacy/`, `old/`, `v1/`, `_old.ts`
5. **Read feature flag config** if present — flags that are 100% on with no opposite tests can have their `else` branches deleted.

## Detect

### Marker grep (multi-language)
```bash
grep -rn --include="*.ts" --include="*.tsx" --include="*.js" --include="*.py" --include="*.go" --include="*.rs" \
  -E "(@deprecated|# ?deprecated|// ?Deprecated|#\[deprecated|warnings\.warn.*Deprecation|TODO.*remove|FIXME.*legacy)" \
  --exclude-dir=node_modules --exclude-dir=dist . > /tmp/deprecated.txt

# Files/dirs with legacy naming
find . -type d \( -name "legacy" -o -name "old" -o -name "v1" -o -name "_archive" \) -not -path "*/node_modules/*" > /tmp/legacy-dirs.txt
find . -type f \( -name "*_old.*" -o -name "*-legacy.*" -o -name "*.deprecated.*" \) > /tmp/legacy-files.txt
```

### Caller verification (TS/JS)
For each deprecated symbol, count references using ts-server / LSP if available, fall back to grep:
```bash
# For function `oldFn` exported from `lib/old.ts`:
grep -rn "oldFn" --include="*.ts" --include="*.tsx" . | grep -v "lib/old.ts" | wc -l
```

### Caller verification (Python)
```bash
grep -rn "from .*old_mod import\|import old_mod" --include="*.py" .
```

### Fallback branches
Look for patterns:
- `if (process.env.NEW_FEATURE === 'true') { /* new */ } else { /* old */ }` — if env always true in all configs, old branch is dead.
- `if version >= 2: /* new */ else: /* old */` — if min version bumped past threshold.
- Browser/runtime checks for unsupported environments (`if (typeof window === 'undefined')` in a browser-only package).

## Assess

Write `.claude/cleanup-reports/cleanup-legacy-{YYYY-MM-DD}.md`:

```markdown
# Legacy Code Assessment — YYYY-MM-DD

## Summary
- Deprecated symbols found: N
  - HIGH (zero callers): X — safe to delete
  - MEDIUM (1-5 callers): Y — needs migration
  - LOW (heavy use): Z — deprecated in name but actively used
- Legacy directories: M
- Dead fallback branches: K

## Findings

### HIGH — `packages/utils/src/format-old.ts`
- Marked `@deprecated` in an older commit and unused by current callers.
- Exports: `formatV1`, `parseV1`. Repo grep shows zero usages outside the file.
- Action: delete file.

### HIGH — `apps/app/lib/feature-flags.ts:45-60`
- Branch: `if (NEW_DASHBOARD_ENABLED) { ... } else { renderOldDashboard() }`.
- Flag is `true` in all envs (`.env`, `.env.staging`, `.env.production`) and has been for 6+ months per git log.
- Action: remove the else branch + the flag check + the `renderOldDashboard` function (cascade).

### MEDIUM — `domains/billing/legacy.ts`
- 8 callers across 3 packages.
- Marked deprecated 3 months ago. Migration path documented in inline comment to use `domains/billing/v2`.
- Recommendation: do NOT delete. Provide a migration list to the human; this needs sequencing.

### LOW — `lib/utils/oldHelper.ts`
- Marked `@deprecated` but has 47 active callers.
- Either the deprecation is aspirational with no migration plan, or it was incorrectly marked. Flag for human review of the deprecation.

## Critical Assessment
[2-3 paragraphs: what's the pattern of deprecation in this codebase? Are deprecations followed by deletion? Are there feature flags that should have been cleaned up months ago? Are "legacy" directories accumulating but not draining?]
```

## Apply

**Auto-delete HIGH only.**

### Confidence rubric

**HIGH (auto-delete):**
- Marked deprecated AND zero references in the repo (verified by grep across all relevant extensions, NOT just the file's own).
- Fallback branch where the condition is provably always-true or always-false in all environments AND has been so for 90+ days (per git blame on the env file).
- Files in `legacy/` or `_archive/` directories with zero references in non-legacy code.

**MEDIUM (report only):**
- Deprecated with 1-N callers — needs migration plan.
- Fallback branch where condition varies by env or is recent.
- Symbols deprecated <30 days ago — give consumers time.

**LOW (note only):**
- Symbols marked deprecated but heavily used — the deprecation itself is suspect.
- Fallback branches handling user-input/runtime conditions (not feature flags) — these aren't dead code, they're real branches.

### Execution (HIGH only)

1. Delete file or remove block.
2. Cascade: if the deleted code was the only consumer of an internal helper, that helper is now also dead — re-run the caller check on it. Iterate until stable.
3. Remove the feature flag declaration if its branch was deleted (env var, config entry, flag service definition).
4. Single commit: `chore(cleanup): cleanup-legacy — removed N deprecated symbols and M dead branches`.

## Verify

```bash
bun run check 2>&1 || npx tsc --noEmit && npx eslint .
bun test 2>&1
pytest 2>&1
go test ./... 2>&1
cargo test 2>&1

# If knip is installed, run it — newly-orphaned exports may surface
bunx knip 2>&1 || true
```

If verify fails: revert and downgrade. The cascade step is the most likely failure source — a "dead" helper might have been used by something the initial grep missed.

## Output

- "Removed N deprecated items, M dead branches. K items deferred for migration planning."
- Report path.
- Verify status.

## NEVER

- Delete a `@deprecated` symbol while it has any callers, even if the migration looks "obvious."
- Remove a feature flag branch without checking ALL config environments (`.env*`, `config/*.json`, flag service settings).
- Delete files in `legacy/` directories that other production code still imports — verify first.
- Remove version-check branches in libraries that support multiple runtime versions (e.g., a polyfill).
- Delete migration files, even if they're "old."
- Remove a fallback branch protecting against runtime conditions (network failure, missing env, etc.) — those aren't dead code.
- Auto-remove a feature flag definition while CI/CD or infrastructure references it (check Terraform, GitHub Actions, deployment scripts).
