# Audit Code Quality

Run comprehensive code quality audit using knip, vulture, and ast-grep to find redundancy and deprecated code.

**Usage:** `/audit-code [options]`

**Options:**
- `--tools knip,vulture,ast-grep` - Select specific tools (default: all)
- `--fix` - Automatically fix safe issues
- `--report` - Generate detailed markdown report
- `--strict` - Fail on any findings (CI mode)

**Examples:**
- `/audit-code` - Run all tools with default settings
- `/audit-code --tools knip,vulture` - Run only knip and vulture
- `/audit-code --fix --report` - Fix issues and generate report
- `/audit-code --strict` - CI mode (fails if issues found)

## Workflow

### 1. Pre-flight Checks

Verify all required tools are installed:

```bash
# Check knip
which knip || npm list -g knip || echo "⚠️  knip not found"

# Check vulture
which vulture || pip show vulture || echo "⚠️  vulture not found"

# Check ast-grep
which ast-grep || sg --version || echo "⚠️  ast-grep not found"
```

**If any tool is missing:**
- Show installation instructions
- Ask user if they want to continue with available tools only
- Offer to install missing tools

**Installation commands:**
```bash
# knip (JavaScript/TypeScript)
npm install -g knip

# vulture (Python)
pip install vulture

# ast-grep (multi-language)
brew install ast-grep  # macOS
# or
cargo install ast-grep-cli
```

### 2. Run Knip (JavaScript/TypeScript)

Detect unused files, dependencies, exports, and types.

```bash
# Run knip with comprehensive config
npx knip --include files,dependencies,exports,types,nsTypes,nsExports \
  --exclude-exports-used-in-file \
  --include-entry-exports \
  --reporter json > knip-report.json

# Also get human-readable output
npx knip
```

**Parse results and categorize:**

| Category | Description | Severity |
|----------|-------------|----------|
| Unused files | Files not imported anywhere | HIGH |
| Unused dependencies | npm packages installed but never imported | MEDIUM |
| Unused exports | Exported but never imported | MEDIUM |
| Unused types | TypeScript types/interfaces not used | LOW |
| Duplicate exports | Same export from multiple files | MEDIUM |

**For each finding:**
1. Show file path and line number
2. Show context (surrounding code)
3. Suggest action (delete, move, consolidate)
4. If `--fix` flag: Ask permission then remove safe items

### 3. Run Vulture (Python)

Find dead code in Python files.

```bash
# Run vulture on all Python files
vulture . --min-confidence 80 --sort-by-size > vulture-report.txt

# Also run with JSON output for parsing
vulture . --min-confidence 80 --sort-by-size --json > vulture-report.json
```

**Parse results and categorize:**

| Category | Confidence | Action |
|----------|------------|--------|
| Unused functions | 80-100% | Review for removal |
| Unused classes | 80-100% | Review for removal |
| Unused variables | 80-100% | Remove if local scope |
| Unused imports | 90-100% | Safe to remove |
| Unused attributes | 60-80% | Review (may be dynamic) |

**For each finding:**
1. Show file, line number, and code snippet
2. Show confidence score
3. Check if item is in public API (keep if yes)
4. If `--fix` flag and confidence ≥90%: Remove unused imports only

**Whitelist patterns to ignore:**
- `__init__.py` - May have imports for public API
- `**/test_*.py` - Test fixtures may appear unused
- `conftest.py` - pytest fixtures
- Migration files, alembic, Django migrations

### 4. Run ast-grep (Multi-language)

Find deprecated patterns and anti-patterns.

**Create rule set for common issues:**

```yaml
# .ast-grep-rules.yml
rules:
  # Deprecated patterns
  - id: deprecated-api
    pattern: $OLD_API($$$)
    message: "Use $NEW_API instead of deprecated $OLD_API"
    severity: warning

  # Security issues
  - id: eval-usage
    pattern: eval($$$)
    message: "Avoid eval() - security risk"
    severity: error

  # Performance issues
  - id: inefficient-loop
    pattern: |
      for $VAR in $LIST:
        $$$
        $LIST.append($$$)
    message: "Appending to list being iterated - use list comprehension"
    severity: warning

  # Code smells
  - id: too-many-args
    pattern: |
      def $FUNC($A, $B, $C, $D, $E, $F, $$$):
        $$$
    message: "Function has 6+ parameters - consider refactoring"
    severity: info
```

**Run ast-grep with rules:**

```bash
# Scan for patterns
sg scan --rule .ast-grep-rules.yml --json > ast-grep-report.json

# Also show human-readable
sg scan --rule .ast-grep-rules.yml
```

**Common patterns to search for:**

**JavaScript/TypeScript:**
- `var` declarations → use `const`/`let`
- `require()` → use ES6 `import`
- `== null` → use `=== null` or `?? null`
- Deprecated React patterns (componentWillMount, etc.)
- Unused PropTypes after TypeScript migration

**Python:**
- `os.path` → use `pathlib`
- `%` string formatting → use f-strings
- `dict.has_key()` → use `in` operator
- Python 2 patterns (`print` statements, old division)

**General:**
- TODO/FIXME comments older than 30 days
- Commented-out code blocks
- Duplicate code (similar AST patterns)

### 5. Aggregate and Prioritize Results

**Combine findings from all three tools:**

```
Code Quality Audit Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL (must fix)
  - {count} security issues (eval, unsafe practices)
  - {count} deprecated APIs that will break

🟡 HIGH PRIORITY (should fix soon)
  - {count} unused files (waste space, confusing)
  - {count} unused dependencies (slow installs)
  - {count} deprecated patterns (future compatibility)

🟢 MEDIUM PRIORITY (improve gradually)
  - {count} unused exports (internal APIs)
  - {count} code smells (refactoring opportunities)
  - {count} dead code (Python functions/classes)

⚪ LOW PRIORITY (optional)
  - {count} unused types (TypeScript only)
  - {count} style improvements
  - {count} TODO comments

Total issues: {total}
Estimated cleanup time: {hours} hours
Potential benefits:
  - Reduce bundle size: ~{mb}MB
  - Remove dependencies: {count} packages
  - Simplify codebase: -{loc} lines of code
```

### 6. Generate Actionable Recommendations

**For each category, provide specific next steps:**

```markdown
## Recommended Actions

### Immediate (< 1 hour)
1. Remove unused imports (knip + vulture): {count} files
   - Run: npm run lint -- --fix
   - Files: src/utils/legacy.ts, src/components/old-button.tsx

2. Delete unused dependencies: {count} packages
   - npm uninstall {package-list}
   - Saves {mb}MB in node_modules

### This Week (2-4 hours)
3. Remove dead code files: {count} files
   - Files not imported anywhere
   - Move to archive/ before deleting

4. Replace deprecated patterns: {count} instances
   - var → const/let
   - require() → import
   - Files: {list}

### This Month (planning required)
5. Refactor duplicated code: {count} duplicates
   - Extract common utilities
   - Create shared components

6. Migrate from deprecated APIs: {count} uses
   - Plan migration strategy
   - Update dependencies first
```

### 7. Auto-fix Safe Issues (if --fix flag)

**ONLY fix items that are 100% safe:**

✅ Safe to auto-fix:
- Unused imports (JavaScript, Python)
- Trailing whitespace in dead code
- Convert `var` to `const`/`let` (after scope analysis)

❌ Never auto-fix (require human review):
- Deleting files
- Removing functions/classes
- Changing function signatures
- Modifying logic

**Auto-fix workflow:**
1. Show what will be changed
2. Ask for confirmation
3. Create git commit with changes
4. Run tests to verify nothing broke

```bash
# Example auto-fix
git checkout -b audit/auto-fix-$(date +%Y%m%d)

# Fix imports
npx eslint --fix src/

# Fix Python imports
autoflake --remove-all-unused-imports --in-place **/*.py

# Commit
git add .
git commit -m "chore: remove unused imports (automated)"

# Run tests
npm test || pytest
```

### 8. Generate Report (if --report flag)

Create `code-audit-report.md`:

```markdown
# Code Quality Audit Report
Generated: {timestamp}
Tools: knip v{version}, vulture v{version}, ast-grep v{version}

## Executive Summary
- **Total Issues**: {count}
- **Critical**: {count}
- **High Priority**: {count}
- **Estimated Cleanup Time**: {hours} hours
- **Potential Savings**: {mb}MB bundle size, {count} dependencies

## Detailed Findings

### Knip Results
[Table of unused files, dependencies, exports]

### Vulture Results
[Table of dead Python code]

### ast-grep Results
[Table of deprecated patterns]

## Recommendations
[Prioritized action items]

## Appendix
- Full tool outputs attached
- Configuration files used
- Whitelist/ignore patterns
```

### 9. Integration with Git

**Show git-aware insights:**

```bash
# Find unused code that hasn't been touched in 6+ months
git log --all --pretty=format: --name-only --since="6 months ago" \
  | sort -u > recent-files.txt

# Compare with knip unused files
# Files both unused AND untouched = safe to delete
```

**Suggest cleanup branches:**
```bash
# Create cleanup branch
git checkout -b cleanup/audit-$(date +%Y%m%d)

# Stage findings report
git add code-audit-report.md

# Commit
git commit -m "docs: add code quality audit report"
```

## Error Handling

**Handle common issues:**

1. **No package.json / pyproject.toml found**
   - Inform user which tools can't run
   - Continue with available tools

2. **Tool exits with errors**
   - Capture stderr
   - Show which files caused issues
   - Continue with remaining tools

3. **Large codebase (> 10k files)**
   - Warn about runtime (may take 5-10 min)
   - Offer to run in background
   - Show progress indicators

4. **Permission errors**
   - Check file permissions
   - Suggest running with appropriate access

## Configuration

**Support config files:**

`.claude/audit-config.json`:
```json
{
  "knip": {
    "enabled": true,
    "ignore": ["**/generated/**", "**/*.test.ts"],
    "entry": ["src/index.ts"]
  },
  "vulture": {
    "enabled": true,
    "min_confidence": 80,
    "ignore": ["migrations/", "alembic/"]
  },
  "ast_grep": {
    "enabled": true,
    "rules": ".ast-grep-rules.yml",
    "custom_patterns": [
      {
        "pattern": "console.log($$$)",
        "message": "Remove debug console.log"
      }
    ]
  },
  "auto_fix": {
    "unused_imports": true,
    "style_issues": false,
    "deprecated_patterns": false
  }
}
```

## Output Format

**Show progress during execution:**

```
🔍 Running Code Quality Audit...

[1/4] Checking tools installation... ✓
[2/4] Running knip (JavaScript/TypeScript)... ✓
      Found: 12 unused files, 5 unused deps, 23 unused exports
[3/4] Running vulture (Python)... ✓
      Found: 8 unused functions, 3 unused classes, 15 unused variables
[4/4] Running ast-grep (deprecated patterns)... ✓
      Found: 7 deprecated APIs, 4 security issues, 11 code smells

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 AUDIT COMPLETE

Total Issues: 88
  🔴 Critical: 4
  🟡 High: 17
  🟢 Medium: 41
  ⚪ Low: 26

Estimated cleanup time: 6-8 hours
Potential savings: 3.2MB bundle, 5 dependencies

Run '/audit-code --report' to generate detailed report
Run '/audit-code --fix' to auto-fix safe issues
```

## Best Practices

1. **Run before major releases** - Catch issues early
2. **Integrate with CI** - Use `--strict` flag
3. **Review findings regularly** - Don't let technical debt pile up
4. **Start with high-priority items** - Quick wins first
5. **Create follow-up tasks** - Add issues to backlog
6. **Document patterns to avoid** - Update ast-grep rules

## Tips

- Run after dependency updates to catch breaking changes
- Use `--tools knip` for quick checks (fastest tool)
- Combine with `/optimize` command for comprehensive review
- Save reports to track progress over time
- Whitelist intentional patterns (public APIs, test fixtures)

---

**Related Commands:**
- `/optimize` - Review recent changes for improvements
- `/convert-to-toon` - Optimize data file token usage
- `/analyze-tokens` - Check token efficiency
