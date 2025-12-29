# {{COMMAND_NAME}}

{{COMMAND_DESCRIPTION}}

**Usage:** `/{{COMMAND_NAME}} [options]`

**Options:**
{{#each OPTIONS}}
- `{{flag}}` - {{description}}
{{/each}}

## Purpose

{{PURPOSE_DESCRIPTION}}

## Workflow

### 1. Git Status Check

```bash
# Verify git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Error: Not a git repository"
  exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
  echo "Warning: Uncommitted changes detected"
  git status --short
  {{UNCOMMITTED_HANDLING}}
fi

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"
```

### 2. Branch Operations

```bash
{{BRANCH_OPERATIONS}}
```

### 3. Git Operations

```bash
{{GIT_OPERATIONS}}
```

### 4. Remote Sync

```bash
# Sync with remote
{{REMOTE_SYNC_COMMANDS}}
```

### 5. Verification

```bash
# Verify git state
{{VERIFICATION_COMMANDS}}
```

## Examples

```
# Example 1: Basic workflow
/{{COMMAND_NAME}}

# Example 2: Specific branch
/{{COMMAND_NAME}} --branch {{EXAMPLE_BRANCH}}

# Example 3: Force mode
/{{COMMAND_NAME}} --force
```

## Git Safety Protocol

- Never update git config
- Never run destructive commands without confirmation
- Never skip hooks unless explicitly requested
- Never force push to main/master without warning
- Always verify branch before operations

## Pre-flight Checks

{{PREFLIGHT_CHECKS}}

## Post-execution Validation

{{POST_VALIDATION}}

## Rollback Procedure

{{ROLLBACK_STEPS}}
