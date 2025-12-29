# Run Workflow

Execute YAML-defined workflows with automatic orchestration and state management.

**Usage:** `/workflow <name> [options]`

**Arguments:**
- `name` (string) - Workflow name (without .yml extension)

**Options:**
- `--list` - Show available workflows
- `--dry-run` - Preview without execution
- `--input <key=value>` - Pass input parameter (can be used multiple times)
- `--verbose` - Show detailed output

## Purpose

Executes complex automation workflows defined in YAML files. Workflows support sequential and parallel execution, conditional logic, variable substitution, error handling, and rollback mechanisms.

## Workflow

### 1. Locate Workflow File

Find workflow in `.claude/workflows/` directory:

```bash
WORKFLOW_DIR=".claude/workflows"
WORKFLOW_FILE="${WORKFLOW_DIR}/${WORKFLOW_NAME}.yml"

if [[ ! -f "$WORKFLOW_FILE" ]]; then
  echo "Workflow not found: $WORKFLOW_NAME"
  echo
  echo "Available workflows:"
  node .claude/utils/workflows/engine.js --list
  exit 1
fi
```

### 2. Parse Input Parameters

Extract input parameters from command line:

```bash
# Parse --input flags
INPUTS=()

for arg in "$@"; do
  if [[ "$arg" == --input ]]; then
    NEXT_IS_INPUT=true
  elif [[ "$NEXT_IS_INPUT" == true ]]; then
    INPUTS+=("--input" "$arg")
    NEXT_IS_INPUT=false
  fi
done
```

### 3. Execute Workflow

Run workflow engine with parameters:

```bash
# Build command
CMD=(
  "node"
  ".claude/utils/workflows/engine.js"
  "$WORKFLOW_FILE"
)

# Add inputs
for input in "${INPUTS[@]}"; do
  CMD+=("$input")
done

# Add flags
[[ "$DRY_RUN" == "true" ]] && CMD+=("--dry-run")
[[ "$VERBOSE" == "true" ]] && CMD+=("--verbose")

# Execute
"${CMD[@]}"
```

### 4. Handle Results

Process workflow execution results:

```bash
EXIT_CODE=$?

if [[ $EXIT_CODE -eq 0 ]]; then
  echo
  echo "✅ Workflow completed successfully"
else
  echo
  echo "❌ Workflow failed with exit code: $EXIT_CODE"
  echo
  echo "Check workflow logs for details:"
  echo "  ls -lt .claude/logs/workflows/"
fi

exit $EXIT_CODE
```

## Examples

```bash
# List available workflows
/workflow --list

# Run production release workflow
/workflow production-release

# Run with input parameters
/workflow production-release --input version_type=minor

# Multiple inputs
/workflow deploy --input environment=staging --input branch=develop

# Preview without executing
/workflow production-release --dry-run

# Verbose output
/workflow ci-pipeline --verbose

# Combined options
/workflow deploy --input env=prod --dry-run --verbose
```

## Available Workflows

### production-release.yml

Complete production release workflow with quality checks, testing, versioning, and deployment.

**Inputs:**
- `version_type` (string): patch, minor, or major (default: patch)
- `skip_tests` (boolean): Skip test suite (default: false)

**Steps:**
1. Quality checks (/audit-code --strict)
2. Build and test (npm run build && npm test)
3. Release (/release ${version_type})
4. Deploy (npm run deploy:production)

**Usage:**
```bash
/workflow production-release --input version_type=minor
```

### ci-pipeline.yml

Continuous integration pipeline for automated testing and validation.

**Inputs:** None

**Steps:**
1. Install dependencies (npm ci)
2. Parallel: Lint, type-check, audit-code
3. Run tests with coverage
4. Build project

**Usage:**
```bash
/workflow ci-pipeline
```

### daily-maintenance.yml

Daily automated maintenance tasks.

**Inputs:** None

**Steps:**
1. Update dependencies (npm update)
2. Clean caches (/clean cache temp)
3. Generate code quality report (/audit-code --report)

**Usage:**
```bash
/workflow daily-maintenance
```

### hotfix.yml

Emergency hotfix workflow for production issues.

**Inputs:**
- `issue_number` (string, required): Issue tracking number

**Steps:**
1. Create hotfix branch
2. Manual: Apply fix
3. Test with --bail
4. Release patch
5. Deploy to production

**Usage:**
```bash
/workflow hotfix --input issue_number=ISSUE-123
```

## Workflow Features

### Sequential Execution

Steps run one after another:

```yaml
steps:
  - name: "Build"
    bash: npm run build

  - name: "Test"
    bash: npm test

  - name: "Deploy"
    bash: npm run deploy
```

### Parallel Execution

Steps run simultaneously:

```yaml
steps:
  - name: "Quality Checks"
    type: parallel
    steps:
      - bash: npm run lint
      - bash: npm run type-check
      - command: /audit-code
```

### Conditional Logic

Steps run only if condition is met:

```yaml
steps:
  - name: "Deploy"
    when: ${{ steps.build.exit_code == 0 }}
    bash: npm run deploy
```

### Variable Substitution

Use inputs, environment variables, and step outputs:

```yaml
inputs:
  environment:
    type: string
    allowed: [dev, staging, production]

steps:
  - name: "Deploy"
    bash: npm run deploy:${inputs.environment}
```

### Error Handling

Automatic rollback on failure:

```yaml
on_failure:
  - command: /clean build
  - bash: git reset --hard HEAD
  - message: "Deployment failed - changes rolled back"

on_success:
  - message: "Deployment successful!"
```

### Timeouts

Prevent workflows from hanging:

```yaml
steps:
  - name: "Long Running Task"
    bash: npm run heavy-process
    timeout: 1800000  # 30 minutes
```

### Manual Checkpoints

Pause for user confirmation:

```yaml
steps:
  - name: "Review Build"
    manual: "Review build output before deploying. Press Enter to continue."

  - name: "Deploy"
    bash: npm run deploy
```

## Debugging Workflows

### Dry Run Mode

Preview workflow without executing:

```bash
/workflow production-release --dry-run

# Output:
[DRY RUN] Workflow would execute with:
  Name: Production Release
  Steps: 4
  Inputs: { version_type: 'patch' }
```

### Verbose Mode

See detailed execution logs:

```bash
/workflow ci-pipeline --verbose

# Shows:
- Full command output
- Variable substitutions
- Step timing
- State changes
```

### Workflow Logs

Check execution logs:

```bash
# Find recent workflow logs
ls -lt .claude/logs/workflows/

# View specific log
cat .claude/logs/workflows/production-release-1234567890.log
```

### Validate Workflow

Check workflow syntax before running:

```bash
node .claude/utils/workflows/parser.js .claude/workflows/my-workflow.yml
```

## Creating Custom Workflows

Use `/workflow-compose` to create new workflows:

```bash
/workflow-compose my-custom-workflow

# Or copy existing workflow
cp .claude/workflows/ci-pipeline.yml .claude/workflows/my-pipeline.yml
# Edit my-pipeline.yml
```

## Best Practices

1. **Use dry-run first** - Always preview before running
2. **Add error handlers** - Define on_failure steps
3. **Set timeouts** - Prevent infinite hangs
4. **Use manual checkpoints** - For critical operations
5. **Test incrementally** - Build workflows step by step
6. **Version control** - Commit workflows to git
7. **Document inputs** - Clear descriptions for all parameters

## Safety Features

- ✅ YAML syntax validation
- ✅ Input validation with type checking
- ✅ Automatic rollback on failure
- ✅ Timeout protection
- ✅ Dry-run mode
- ✅ Step-by-step execution logging
- ✅ Confirmation for destructive operations

## Troubleshooting

**Error: "Workflow not found"**
```
Solution: List available workflows
/workflow --list

Or create new workflow:
/workflow-compose workflow-name
```

**Error: "Required input not provided"**
```
Solution: Provide required inputs
/workflow hotfix --input issue_number=ISSUE-123
```

**Error: "Workflow validation failed"**
```
Solution: Check YAML syntax
- Ensure proper indentation (2 spaces)
- Quote strings with special characters
- Verify all step types are valid
```

**Error: "Step timeout"**
```
Solution: Increase timeout
steps:
  - bash: long-command
    timeout: 3600000  # Increase to 1 hour
```

## Related Commands

- `/workflow-compose` - Create new workflows
- `/audit-code` - Run code quality checks
- `/optimize` - Optimize code
- `/release` - Create releases
- `/clean` - Clean project

---

**Pro Tip:** Combine workflows with hooks for automatic execution. Example: Run ci-pipeline on every commit using a pre-commit hook.
