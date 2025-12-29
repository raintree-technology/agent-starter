# Command Validator

Validate generated commands against schema and best practices.

## Purpose

Ensure command quality by:
- Validating structure against JSON schema
- Checking for required sections and metadata
- Verifying frontmatter format
- Testing argument parsing logic
- Detecting security issues
- Enforcing Claude Code best practices

## Allowed Tools

- Read(templates/.claude/commands/**/*.md)
- Read(templates/.claude/validators/command-schema.json)
- Bash(node templates/.claude/validators/validate-command.js)

## Model Preference

haiku

## Instructions

When this command is invoked (e.g., `/command-validate deploy-staging.md`):

### 1. Load Command File

Parse the command markdown file:
- Extract frontmatter (if present)
- Parse markdown sections
- Identify command structure (instructions, examples, options)

### 2. Schema Validation

Validate against `command-schema.json`:

```json
Required fields:
✓ name (matches filename, lowercase-with-dashes)
✓ description (50-200 chars, clear purpose)
✓ category (valid enum value)

Optional but recommended:
⚠ allowedTools (specific tool patterns, not *)
⚠ modelPreference (sonnet/haiku/opus based on complexity)
⚠ arguments (if command takes parameters)

Validation rules:
✓ name: ^[a-z][a-z0-9-]*$ (2-50 chars)
✓ category: one of [automation, code-quality, development, ...]
✓ allowedTools: pattern ^(Read|Write|Edit|Bash|...)\\(.*\\)$
✓ arguments: array of {name, type, required, description}
```

### 3. Structure Validation

Check markdown sections:

```markdown
Required sections:
✓ # Command Title (H1, matches name)
✓ ## Purpose (clear 1-2 sentence description)
✓ ## Instructions (step-by-step execution logic)

Recommended sections:
⚠ ## Allowed Tools (explicit tool permissions)
⚠ ## Model Preference (haiku for simple, sonnet for complex)
⚠ ## Examples (usage examples with outputs)
⚠ ## Error Handling (how to handle failures)

Best practices:
✓ Clear, actionable instructions
✓ No ambiguous language
✓ Specific tool patterns (not wildcards)
✓ Error cases covered
✓ Examples with expected outputs
```

### 4. Security Validation

Check for security issues:

```
High-severity issues:
❌ Bash(*) - Unrestricted bash access
❌ eval() or exec() - Code injection risk
❌ Unvalidated user input - Injection vulnerabilities
❌ Hardcoded secrets - API keys, tokens, passwords

Medium-severity issues:
⚠ Write(*) - Unrestricted file writes
⚠ No input validation - Potential for malformed data
⚠ Missing error handling - Could expose sensitive info
⚠ Overly broad tool permissions - Violates least privilege

Best practices:
✓ Use specific tool patterns: Bash(git:*) not Bash(*)
✓ Validate all arguments before use
✓ Use environment variables for secrets
✓ Sanitize user input in bash commands
✓ Limit file access to specific directories
```

### 5. Quality Checks

Assess command quality:

#### A. Clarity Score
```
Instructions clarity: 8/10
✓ Step-by-step format
✓ Clear action verbs (create, validate, execute)
⚠ Some ambiguous references ("the file" - which file?)

Examples quality: 7/10
✓ Multiple examples provided
✓ Shows expected outputs
⚠ Missing edge cases (empty input, errors)

Documentation: 9/10
✓ Purpose is clear
✓ All options documented
✓ Error handling explained
```

#### B. Completeness Score
```
Metadata: 80%
✓ name, description, category
✓ allowedTools
⚠ Missing modelPreference
❌ No arguments schema (but command accepts arguments)

Sections: 75%
✓ Purpose, Instructions, Examples
⚠ No "Error Handling" section
⚠ No "Output Format" section
❌ Missing "Notes" or "Caveats"

Error handling: 60%
⚠ Basic error cases covered
⚠ Missing validation for edge cases
❌ No rollback/cleanup logic for failures
```

#### C. Best Practices Score
```
Claude Code conventions: 90%
✓ Follows markdown command format
✓ Clear instructions for Claude
✓ Uses allowed tools appropriately
⚠ Could benefit from more specific tool patterns

Usability: 85%
✓ Easy to understand
✓ Good examples
✓ Clear purpose
⚠ Could add more usage tips
⚠ Missing common pitfalls section
```

### 6. Argument Validation

If command accepts arguments, validate parsing logic:

```markdown
## Defined Arguments
{
  "name": "environment",
  "type": "string",
  "required": true,
  "allowed": ["staging", "production"],
  "description": "Deployment target"
}

## Instructions Validation
✓ Argument is mentioned in instructions
✓ Validation logic present (check allowed values)
✓ Error message for invalid values
⚠ No default value (but not required - OK)
⚠ No example showing argument usage

## Recommendations
1. Add default value: "default": "staging"
2. Show argument in examples: /command --environment production
3. Add validation early in instructions
```

### 7. Generate Validation Report

Output comprehensive report:

```markdown
# Command Validation Report

**Command:** deploy-staging.md
**Category:** deployment
**Validated:** 2025-12-28 10:15:32

---

## Summary

Overall Score: **78/100** (Good - needs improvements)

| Category        | Score | Status |
|-----------------|-------|--------|
| Schema          | 85%   | ✅ PASS |
| Structure       | 75%   | ⚠ WARN  |
| Security        | 90%   | ✅ PASS |
| Clarity         | 80%   | ✅ PASS |
| Completeness    | 70%   | ⚠ WARN  |
| Best Practices  | 88%   | ✅ PASS |

---

## Issues Found

### High Priority (2)

❌ **Missing argument schema**
- Command accepts `--environment` but no argument metadata in frontmatter
- Fix: Add arguments array to frontmatter
- Impact: CLI validation won't work, no auto-completion

❌ **No error handling section**
- Instructions don't cover failure scenarios
- Fix: Add "## Error Handling" section with rollback logic
- Impact: Users won't know how to recover from failures

### Medium Priority (3)

⚠ **Overly broad tool permissions**
- Location: allowedTools: ["Bash(*)"]
- Issue: Unrestricted bash access
- Fix: Use specific patterns: ["Bash(git:*)", "Bash(npm:*)"]
- Impact: Security risk, violates least privilege

⚠ **Missing model preference**
- Issue: No modelPreference specified
- Fix: Add "haiku" for simple commands, "sonnet" for complex
- Impact: May use slower/more expensive model than needed

⚠ **Incomplete examples**
- Issue: Examples don't show error cases
- Fix: Add example with invalid input and expected error
- Impact: Users won't know how command handles errors

### Low Priority (5)

ℹ️ No "Output Format" section (recommended for commands with output)
ℹ️ No "Notes" section (good for caveats and tips)
ℹ️ Argument examples missing from "Examples" section
ℹ️ No cleanup/rollback logic mentioned
ℹ️ Could benefit from "Common Pitfalls" section

---

## Recommendations

### Immediate Fixes (Required for quality)

1. **Add argument schema to frontmatter:**
```yaml
---
arguments:
  - name: environment
    type: string
    required: true
    allowed: [staging, production]
    description: Deployment target environment
---
```

2. **Add error handling section:**
```markdown
## Error Handling

If deployment fails:
1. Check error logs: `.claude/logs/deploy-<timestamp>.log`
2. Rollback: `git reset --hard HEAD`
3. Clean build artifacts: `rm -rf dist/`
4. Retry with --verbose flag for details
```

3. **Restrict tool permissions:**
```markdown
## Allowed Tools

- Bash(git:*)
- Bash(npm:*)
- Bash(ssh:*)
- Read(package.json)
- Read(.env.*)
```

### Suggested Improvements (Quality enhancements)

4. **Add model preference:**
```markdown
## Model Preference

sonnet (complex deployment logic requires capable model)
```

5. **Expand examples with error cases:**
```markdown
## Examples

Success case:
```bash
/deploy-staging --environment staging
✓ Deployed to staging
```

Error case:
```bash
/deploy-staging --environment invalid
❌ Error: Invalid environment. Must be 'staging' or 'production'
```
```

6. **Add output format section:**
```markdown
## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deployment to staging
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Building... ✓
Testing... ✓
Deploying... ✓

URL: https://staging.example.com
Version: v1.2.3-staging
Time: 2m 34s
```
```

---

## Security Analysis

✅ No hardcoded secrets detected
✅ No dangerous eval/exec patterns
⚠ Bash(*) - Recommendation: Use specific patterns
✅ Input validation present
✅ No XSS/injection vulnerabilities detected

**Security Score: 8/10** (Good, but could be more restrictive)

---

## Compliance Check

Claude Code Best Practices:
✅ Uses markdown format
✅ Clear instructions for Claude
✅ Follows frontmatter schema
⚠ Tool permissions could be more specific
✅ No anti-patterns detected
✅ Appropriate for automation

**Compliance Score: 9/10** (Excellent)

---

## Next Steps

1. ✅ Fix high-priority issues (argument schema, error handling)
2. ⚠ Address medium-priority warnings (tool permissions, model preference)
3. ℹ️ Consider low-priority improvements (examples, documentation)

After fixes, re-run validation:
```bash
/command-validate deploy-staging.md
```

Or auto-fix common issues:
```bash
/command-validate deploy-staging.md --auto-fix
```

---

**Validation completed in 234ms**
**Report saved to:** `.claude/debug/validation-deploy-staging-20251228-101532.md`
```

### 8. Auto-Fix Mode

Support automatic fixes for common issues:

```bash
/command-validate deploy-staging.md --auto-fix
```

Auto-fixable issues:
- Missing model preference (infer from complexity)
- Missing frontmatter (generate from content)
- Overly broad tool permissions (suggest restrictions)
- Missing sections (add templates)
- Formatting issues (fix markdown)

Show diff before applying:
```diff
--- deploy-staging.md (original)
+++ deploy-staging.md (auto-fixed)
@@ -1,3 +1,10 @@
+---
+category: deployment
+modelPreference: sonnet
+allowedTools:
+  - Bash(git:*)
+  - Bash(npm:*)
+---
 # Deploy to Staging

 Deploy application to staging environment.
```

### 9. Command-Line Options

- `<command>` - Command file to validate (required)
- `--strict` - Fail on warnings (not just errors)
- `--auto-fix` - Automatically fix common issues
- `--output <file>` - Save report to file
- `--json` - Output as JSON (for tooling)
- `--category <cat>` - Validate only specific category
- `--batch` - Validate all commands in directory

### 10. Examples

```bash
# Validate single command
/command-validate deploy-staging.md

# Strict mode (fail on warnings)
/command-validate deploy-staging.md --strict

# Auto-fix issues
/command-validate deploy-staging.md --auto-fix

# Batch validate all commands
/command-validate --batch templates/.claude/commands/

# JSON output for CI/CD
/command-validate deploy-staging.md --json > validation.json
```

## Error Handling

- If command file doesn't exist, list available commands
- If schema file missing, use built-in defaults
- If auto-fix conflicts with user intent, show options
- If batch mode, continue on errors and summarize at end

## Notes

- Focus on actionable feedback (how to fix, not just what's wrong)
- Provide examples of fixes in the report
- Balance strictness with practicality
- Save reports for tracking improvement over time
- Integrate with /create-command to validate at creation time
