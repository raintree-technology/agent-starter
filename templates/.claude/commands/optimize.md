# Optimize Recent Work

Automatically review recent changes for optimization opportunities, performance improvements, and best practices.

**Usage:** `/optimize [scope] [options]`

**Scope:**
- `last` - Review most recent change (default)
- `session` - Review all changes in current session
- `file <path>` - Review specific file
- `commit <hash>` - Review specific commit
- `branch` - Review all changes on current branch vs main

**Options:**
- `--detailed` - Deep analysis with benchmarks
- `--fix` - Apply safe optimizations automatically
- `--report` - Generate markdown report with findings
- `--categories performance,security,maintainability` - Focus on specific areas

**Examples:**
- `/optimize` - Review last change
- `/optimize session --detailed` - Deep review of current session
- `/optimize file src/api.ts` - Review specific file
- `/optimize commit abc123 --report` - Generate report for commit
- `/optimize branch --categories performance,security` - Focus on perf/security

## Workflow

### 1. Determine Scope

**Identify what to review based on scope parameter:**

```bash
# Get last change
git diff HEAD~1..HEAD

# Get session changes (since branch creation or last 10 commits)
git log --oneline -10
git diff HEAD~10..HEAD

# Get specific file current state
git show HEAD:src/api.ts

# Get specific commit
git show <commit-hash>

# Get branch changes
git diff $(git merge-base HEAD main)..HEAD
```

**Parse git output to extract:**
- Changed files (with line counts)
- Added/removed/modified functions
- New dependencies
- Configuration changes

### 2. Initial Assessment

**Show what will be reviewed:**

```
🔍 Optimization Review Scope
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files changed: 5
  • src/api/endpoints.ts (+45, -12)
  • src/utils/cache.ts (+123, -0) [NEW]
  • tests/api.test.ts (+67, -5)
  • package.json (+2, -1)
  • README.md (+15, -3)

Functions changed: 8
  • createUser() - modified
  • fetchData() - modified
  • CacheManager - new class
  • validateInput() - new

Dependencies: +1
  • Added: lru-cache@10.0.0

Starting optimization analysis...
```

### 3. Code Quality Analysis

**Run comprehensive checks on changed code:**

#### 3.1 Performance Analysis

**Check for common performance issues:**

✅ **What to check:**
- O(n²) algorithms that could be O(n) or O(log n)
- Repeated database queries (N+1 problem)
- Unnecessary re-renders (React)
- Memory leaks (event listeners, timers)
- Large bundle imports (import * from)
- Synchronous operations in async contexts
- Unoptimized regex patterns
- Large objects in loops

**Example findings:**

```typescript
// BEFORE (found in diff)
function findUser(users, id) {
  for (let user of users) {
    if (user.id === id) return user;
  }
}

// 🟡 OPTIMIZATION OPPORTUNITY
// Issue: O(n) lookup on every call
// Solution: Use Map for O(1) lookup
// Impact: 10x faster for 1000+ users
// Effort: 5 minutes

// AFTER (suggested)
const userMap = new Map(users.map(u => [u.id, u]));
function findUser(id) {
  return userMap.get(id);
}
```

#### 3.2 Security Analysis

**Check for security issues:**

✅ **What to check:**
- SQL injection vulnerabilities
- XSS vulnerabilities (unescaped user input)
- CSRF token missing
- Hardcoded secrets/credentials
- Insecure dependencies (npm audit)
- Missing input validation
- Unsafe deserialization
- Path traversal vulnerabilities
- Weak crypto (MD5, SHA1)

**Example findings:**

```javascript
// BEFORE
app.get('/user/:id', (req, res) => {
  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
  db.query(query);
});

// 🔴 CRITICAL SECURITY ISSUE
// Vulnerability: SQL Injection
// Risk: High - attackers can access/modify database
// Fix: Use parameterized queries
// Effort: 2 minutes

// AFTER
app.get('/user/:id', (req, res) => {
  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [req.params.id]);
});
```

#### 3.3 Maintainability Analysis

**Check for code maintainability:**

✅ **What to check:**
- Excessive complexity (cyclomatic complexity > 10)
- Long functions (> 50 lines)
- Deep nesting (> 3 levels)
- Duplicate code
- Magic numbers/strings
- Missing error handling
- Poor naming conventions
- Missing TypeScript types
- Inconsistent patterns

**Example findings:**

```typescript
// BEFORE
function processData(data: any) {
  if (data) {
    if (data.user) {
      if (data.user.settings) {
        if (data.user.settings.preferences) {
          return data.user.settings.preferences.theme || 'light';
        }
      }
    }
  }
  return 'light';
}

// 🟡 MAINTAINABILITY ISSUE
// Issue: Deep nesting (4 levels), missing types
// Problem: Hard to read, error-prone
// Solution: Optional chaining + proper types
// Effort: 3 minutes

// AFTER
interface UserData {
  user?: {
    settings?: {
      preferences?: {
        theme?: string;
      };
    };
  };
}

function processData(data: UserData): string {
  return data?.user?.settings?.preferences?.theme ?? 'light';
}
```

#### 3.4 Best Practices Analysis

**Check against language/framework best practices:**

**JavaScript/TypeScript:**
- Use `const`/`let` instead of `var`
- Prefer `async`/`await` over `.then()` chains
- Use strict equality (`===`)
- Avoid `any` types
- Use proper error handling

**React:**
- Use functional components + hooks
- Memoize expensive computations
- Avoid inline function definitions in JSX
- Use `useCallback`/`useMemo` appropriately
- Proper dependency arrays

**Python:**
- Use f-strings over `.format()` or `%`
- Use `pathlib` over `os.path`
- Context managers for resource handling
- Type hints for function signatures
- List comprehensions over loops

**Node.js:**
- Use `import` over `require`
- Proper error handling in async functions
- Avoid blocking operations
- Use streams for large files
- Environment variables for config

### 4. Dependency Analysis

**Analyze new/updated dependencies:**

```bash
# Check for security vulnerabilities
npm audit --json || pip-audit --format json

# Check bundle size impact
npx bundlephobia <package-name>@<version>

# Check for lighter alternatives
npx bundle-wizard
```

**Report findings:**

```
📦 Dependency Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Added: lru-cache@10.0.0
  Size: 12.5 kB (minified)
  Dependencies: 0
  Security: ✓ No known vulnerabilities
  Alternatives:
    • quick-lru (2.1 kB) - Simpler API, faster
    • tiny-lru (1.8 kB) - Minimal implementation

🟡 OPTIMIZATION OPPORTUNITY
Consider: quick-lru saves 10.4 kB
Trade-off: Fewer features, sufficient for your use case
Impact: -0.4s load time on 3G
Effort: 10 minutes to migrate
```

### 5. Test Coverage Analysis

**Check if changes are adequately tested:**

```bash
# Run coverage on changed files only
npx jest --coverage --changedSince=HEAD~1

# Or pytest for Python
pytest --cov=src --cov-report=json
```

**Assess coverage:**

```
🧪 Test Coverage Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

src/api/endpoints.ts
  Lines: 89% (40/45 lines covered)
  Branches: 75% (6/8 branches covered)
  Missing:
    • Line 67: Error handling path
    • Lines 89-91: Edge case validation

src/utils/cache.ts [NEW]
  Lines: 0% (0/123 lines covered)

🔴 CRITICAL GAP
New cache.ts has NO tests
Risk: Cache bugs could cause data corruption
Recommendation: Add tests before merging
Effort: 30-45 minutes
```

### 6. Documentation Check

**Verify documentation is updated:**

✅ **What to check:**
- JSDoc/docstrings for new functions
- README updated for new features
- CHANGELOG.md entry
- API documentation
- Type definitions exported
- Migration guide (if breaking changes)

**Example findings:**

```
📝 Documentation Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Missing documentation:
  • CacheManager class - no JSDoc
  • createUser() - parameters not documented
  • README.md - cache feature not mentioned
  • CHANGELOG.md - no entry for v1.2.0

🟡 IMPROVEMENT NEEDED
Complete documentation before release
Effort: 15 minutes
```

### 7. Performance Benchmarking (if --detailed)

**Run actual benchmarks on changed code:**

```javascript
// Auto-generate benchmark for changed functions
import { Bench } from 'tinybench';

const bench = new Bench();

// OLD implementation (from git history)
bench.add('findUser (old)', () => {
  findUserOld(users, targetId);
});

// NEW implementation (current)
bench.add('findUser (new)', () => {
  findUserNew(targetId);
});

await bench.run();
console.table(bench.table());
```

**Report results:**

```
⚡ Performance Benchmarks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

findUser():
  Old: 145,234 ops/sec
  New: 1,523,421 ops/sec
  Improvement: 10.5x faster ✓

fetchData():
  Old: 1,234 ops/sec
  New: 1,189 ops/sec
  Regression: 3.6% slower ⚠️

🟡 ATTENTION
fetchData() is slightly slower
Cause: Added validation logic
Trade-off: Security vs speed
Acceptable: < 5% regression for security
```

### 8. Generate Optimization Report

**Categorize all findings:**

```markdown
# Optimization Review Report
Generated: {timestamp}
Scope: {scope description}
Files reviewed: {count}

## Summary

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Performance | 0 | 2 | 3 | 1 |
| Security | 1 | 0 | 1 | 0 |
| Maintainability | 0 | 1 | 4 | 2 |
| Testing | 1 | 0 | 0 | 0 |
| Documentation | 0 | 0 | 3 | 1 |

**Total**: 20 opportunities identified
**Estimated improvement time**: 2-3 hours
**Potential impact**: High

## Critical Issues (must fix before merge)

### 🔴 SQL Injection in /user/:id endpoint
**File**: src/api/endpoints.ts:45
**Risk**: High - database compromise
**Fix**: Use parameterized queries
**Effort**: 2 minutes

```diff
- const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
+ const query = 'SELECT * FROM users WHERE id = ?';
+ db.query(query, [req.params.id]);
```

### 🔴 No tests for CacheManager
**File**: src/utils/cache.ts
**Risk**: High - untested critical path
**Fix**: Add unit tests
**Effort**: 30 minutes

## High Priority (should fix this week)

### 🟡 O(n²) algorithm in data processing
**File**: src/utils/process.ts:23
**Issue**: Nested loops causing slowdown
**Impact**: 10x slower for 1000+ items
**Fix**: Use hash map for lookups
**Effort**: 10 minutes

[Detailed code example...]

## Automated Fixes Available

The following can be auto-fixed with `--fix` flag:

- [ ] Convert var → const/let (5 instances)
- [ ] Add missing TypeScript types (8 functions)
- [ ] Fix imports (use named imports) (3 files)
- [ ] Remove unused variables (12 instances)
- [ ] Format code consistently (2 files)

Run: `/optimize --fix`

## Recommendations

### Performance
1. Cache user lookups (10x speedup)
2. Lazy-load large dependencies (save 200KB)
3. Debounce search input (reduce API calls)

### Security
1. Add input validation (prevent injection)
2. Update dependencies (2 vulnerabilities)
3. Add rate limiting (prevent abuse)

### Maintainability
1. Extract complex logic to utilities
2. Add JSDoc to public APIs
3. Reduce cyclomatic complexity in auth.ts

## Next Steps

1. Fix critical issues (30 minutes)
2. Add tests for new code (45 minutes)
3. Apply auto-fixes (5 minutes)
4. Review high-priority items (1 hour)

Total time to address all issues: ~2.5 hours
```

### 9. Apply Safe Fixes (if --fix)

**Only auto-fix items that are 100% safe:**

```bash
# Safe fixes
npx eslint --fix src/
npx prettier --write src/
npm run type-check --fix

# Show what was changed
git diff

# Ask for confirmation
echo "Review changes above. Apply? (y/n)"
```

✅ **Safe to auto-fix:**
- Code formatting (prettier)
- Import sorting
- Unused variable removal
- var → const/let (after analysis)
- Missing semicolons
- Trailing commas

❌ **Never auto-fix:**
- Logic changes
- Performance optimizations (need testing)
- Security fixes (need review)
- Refactoring (may break things)

### 10. Integration with Development Workflow

**Show optimization in context:**

```bash
# Check if on feature branch
BRANCH=$(git branch --show-current)

# Suggest next steps based on findings
if [[ $CRITICAL_COUNT -gt 0 ]]; then
  echo "⚠️  Cannot merge - critical issues found"
  echo "Fix issues then run: /optimize session"
elif [[ $HIGH_COUNT -gt 0 ]]; then
  echo "⚠️  Consider fixing high-priority issues before merge"
  echo "Or create follow-up ticket"
else
  echo "✓ Code looks good - ready for review"
  echo "Suggest: git push && gh pr create"
fi
```

## Optimization Categories

### Performance
- Algorithm efficiency (Big O)
- Database query optimization
- Caching opportunities
- Bundle size reduction
- Lazy loading
- Code splitting
- Memory usage
- Render optimization (React)

### Security
- Input validation
- SQL/NoSQL injection
- XSS vulnerabilities
- CSRF protection
- Authentication/authorization
- Dependency vulnerabilities
- Secure crypto
- Data exposure

### Maintainability
- Code complexity
- Duplicate code
- Function length
- Nesting depth
- Naming conventions
- Type safety
- Error handling
- Code organization

### Testing
- Coverage gaps
- Edge cases
- Integration tests
- E2E tests
- Performance tests
- Security tests

### Documentation
- Code comments
- JSDoc/docstrings
- README updates
- API documentation
- Changelog entries
- Migration guides

## Configuration

`.claude/optimize-config.json`:
```json
{
  "thresholds": {
    "complexity": 10,
    "function_length": 50,
    "nesting_depth": 3,
    "test_coverage": 80,
    "bundle_size_increase": 50
  },
  "categories": {
    "performance": true,
    "security": true,
    "maintainability": true,
    "testing": true,
    "documentation": true
  },
  "auto_fix": {
    "formatting": true,
    "imports": true,
    "types": false,
    "unused_code": false
  },
  "ignore_patterns": [
    "**/generated/**",
    "**/*.test.ts",
    "**/migrations/**"
  ],
  "custom_rules": [
    {
      "pattern": "console.log($$$)",
      "message": "Remove debug logging",
      "severity": "medium"
    }
  ]
}
```

## Output Modes

### Summary (default)
```
✅ Optimization complete - 3 opportunities found
Run '/optimize --report' for details
```

### Detailed
```
[Full analysis with code examples and benchmarks]
```

### Report
```
Saved to: optimization-report-{timestamp}.md
```

### CI Mode (--strict)
```
Exit code: 1 (critical issues found)
```

## Best Practices

1. **Run after significant changes** - Don't wait for PR review
2. **Review before committing** - Catch issues early
3. **Use --detailed for major features** - Deep analysis worth the time
4. **Auto-fix safe items** - Save manual work
5. **Track improvements over time** - Save reports
6. **Integrate with CI** - Automated quality gates
7. **Customize thresholds** - Match your team's standards

## Tips

- Run `/optimize` before every commit (make it a habit)
- Use `/optimize session` before creating PR
- Combine with `/audit-code` for comprehensive review
- Set up git hook: `hooks/pre-commit` → `/optimize last --strict`
- Review optimization reports weekly
- Share findings with team to improve practices

## Related Commands

- `/audit-code` - Find redundancy and deprecated code
- `/convert-to-toon` - Optimize data file formats
- `/analyze-tokens` - Check token efficiency

---

**Pro Tip**: Instead of asking "is this optimal?", just run `/optimize` and get a comprehensive answer with specific, actionable improvements.
