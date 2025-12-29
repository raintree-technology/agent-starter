# Workflow Debugger

Step-by-step workflow execution debugger with breakpoints and state inspection.

## Purpose

Debug YAML workflows by:
- Executing workflows step-by-step with pauses
- Inspecting state and variables at each step
- Validating workflow structure before execution
- Identifying errors in workflow logic
- Profiling execution time and resource usage

## Allowed Tools

- Read(templates/.claude/workflows/*.yml)
- Read(templates/.claude/utils/workflows/*.js)
- Bash(node)

## Model Preference

haiku

## Instructions

When this command is invoked (e.g., `/workflow-debug production-release.yml`):

### 1. Load and Validate Workflow

```bash
# Parse YAML
const workflow = yaml.load(fs.readFileSync(workflowPath));

# Validate structure
- ✓ Required fields: name, steps
- ✓ Valid step types: bash, command, parallel, manual
- ✓ Variable references: ${{ inputs.*, env.*, steps.*.* }}
- ✓ Circular dependencies in parallel steps
- ✓ Timeout values within limits
- ⚠ Warnings: Missing error handlers, no timeouts, etc.
```

**Output:**
```markdown
## Workflow Validation: production-release.yml

### Structure
✓ Name: "Production Release"
✓ Version: 1.0
✓ Inputs: version_type (string, default: patch)
✓ Environment: NODE_ENV=production
✓ Steps: 6 total (4 sequential, 2 parallel)

### Variable Analysis
Variables defined:
- inputs.version_type (string)
- inputs.skip_tests (boolean)
- env.NODE_ENV (string)

Variable usage:
- ✓ ${inputs.version_type} → Step 4 (valid)
- ✓ ${{ steps.build.exit_code }} → Step 5 (valid)
- ⚠ ${{ steps.deploy.output }} → Step 6 (undefined - deploy hasn't run yet)

### Potential Issues
⚠ Warning: Step "Deploy" has no timeout (default: 5min)
⚠ Warning: No on_failure handler for critical steps
✓ No circular dependencies detected
✓ All step references are valid

### Recommendations
1. Add timeout to "Deploy" step
2. Add on_failure handler for "Version Bump" step
3. Consider adding --dry-run option for testing
```

### 2. Interactive Debugging Mode

Provide step-by-step execution with controls:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW DEBUGGER: production-release.yml
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Workflow: Production Release
Inputs: version_type=patch, skip_tests=false
Environment: NODE_ENV=production

Steps to execute: 6
Execution mode: step-by-step

Controls:
  [n] next     - Execute next step
  [c] continue - Run to completion
  [s] skip     - Skip current step
  [i] inspect  - View current state
  [b] break    - Set breakpoint
  [q] quit     - Abort workflow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[STEP 1/6] Pre-flight Checks (parallel)
  ├─ Check git status
  └─ Check npm outdated

State before execution:
{
  "inputs": { "version_type": "patch", "skip_tests": false },
  "env": { "NODE_ENV": "production" },
  "steps": []
}

Press [n] to execute, [s] to skip, [i] to inspect: _
```

### 3. State Inspection

When user presses `[i]`, show current state:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STATE INSPECTOR (Step 3/6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Inputs
{
  "version_type": "patch",
  "skip_tests": false
}

## Environment
{
  "NODE_ENV": "production",
  "CI": "false"
}

## Step Results
{
  "0": {
    "name": "Pre-flight Checks",
    "status": "success",
    "exit_code": 0,
    "duration": 234,
    "output": "On branch main\nnothing to commit..."
  },
  "1": {
    "name": "Quality Checks",
    "status": "success",
    "exit_code": 0,
    "duration": 1523,
    "output": "✓ All checks passed"
  },
  "2": {
    "name": "Build and Test",
    "status": "running",
    "start_time": 1640000000000
  }
}

## Available Variables
Expand any expression:
- ${{ inputs.version_type }} → "patch"
- ${{ env.NODE_ENV }} → "production"
- ${{ steps.0.exit_code }} → 0
- ${{ steps.1.duration }} → 1523
- ${{ steps.2.status }} → "running"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Step Execution Details

After each step, show detailed results:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[STEP 3/6] Build and Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type: bash
Command: npm run build && npm test
Timeout: 1800000ms (30 minutes)
Fail on error: true

Variables expanded:
  (none)

Starting execution...

┌─────────────────────────────────────────────────────────────┐
│ COMMAND OUTPUT                                              │
└─────────────────────────────────────────────────────────────┘

> build
> tsc && vite build

✓ 52 modules transformed.
dist/index.js  125.4 kB

> test
> vitest run

✓ src/utils.test.ts (5 tests) 234ms
✓ src/api.test.ts (12 tests) 456ms

Test Files  2 passed (2)
     Tests  17 passed (17)
  Start at  10:15:32
  Duration  1.23s

┌─────────────────────────────────────────────────────────────┐
│ EXECUTION SUMMARY                                           │
└─────────────────────────────────────────────────────────────┘

Status: ✅ SUCCESS
Exit Code: 0
Duration: 1,523ms
Output Lines: 24
Errors: 0

Step result stored in steps[2]:
{
  "name": "Build and Test",
  "status": "success",
  "exit_code": 0,
  "duration": 1523,
  "output": "...",
  "stdout": "...",
  "stderr": ""
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Press [n] for next step, [i] to inspect state: _
```

### 5. Error Debugging

When a step fails:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[STEP 4/6] Version Bump
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ❌ FAILED
Exit Code: 1
Duration: 145ms

┌─────────────────────────────────────────────────────────────┐
│ ERROR OUTPUT                                                │
└─────────────────────────────────────────────────────────────┘

npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path /path/to/package.json
npm ERR! errno -2
npm ERR! enoent ENOENT: no such file or directory

┌─────────────────────────────────────────────────────────────┐
│ ERROR ANALYSIS                                              │
└─────────────────────────────────────────────────────────────┘

Error Type: File Not Found
Root Cause: package.json missing in current directory
Step: Version Bump (npm version patch)

Possible Solutions:
1. Check current working directory (should be project root)
2. Ensure package.json exists before running workflow
3. Add pre-flight check: test -f package.json

Workflow Context:
- This step has fail_on_error: true
- No on_failure handler defined
- Workflow will abort here unless continued manually

┌─────────────────────────────────────────────────────────────┐
│ DEBUGGING OPTIONS                                           │
└─────────────────────────────────────────────────────────────┘

[r] retry    - Re-execute this step
[s] skip     - Skip and continue (mark as succeeded)
[f] fix      - Edit workflow and retry
[i] inspect  - View full state
[q] quit     - Abort workflow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Choose action: _
```

### 6. Performance Profiling

After workflow completes, show performance report:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKFLOW EXECUTION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Workflow: Production Release
Status: ✅ SUCCESS
Total Duration: 45.3s

## Performance Profile

| Step                  | Duration  | % Total | Status  |
|-----------------------|-----------|---------|---------|
| Pre-flight Checks     |   0.2s    |  0.4%   | ✅      |
| Quality Checks        |   1.5s    |  3.3%   | ✅      |
| Build and Test        |  28.4s    | 62.7%   | ✅      | ⚠ SLOWEST
| Version Bump          |   0.1s    |  0.2%   | ✅      |
| Git Tag and Push      |   2.3s    |  5.1%   | ✅      |
| Deploy                |  12.8s    | 28.3%   | ✅      |
|-----------------------|-----------|---------|---------|
| TOTAL                 |  45.3s    | 100%    |         |

## Resource Usage

- Peak Memory: 512 MB
- CPU Time: 23.4s
- Network: 45 MB downloaded, 12 MB uploaded
- Disk I/O: 234 MB written

## Bottlenecks

⚠ Step "Build and Test" took 62.7% of total time
  Recommendations:
  - Enable build cache (vite cache, tsc incremental)
  - Run tests in parallel (--maxWorkers)
  - Consider splitting build and test into separate steps

⚠ Step "Deploy" took 28.3% of total time
  Recommendations:
  - Use incremental deployment
  - Parallelize upload if possible
  - Check network bandwidth

## Optimization Suggestions

1. Enable caching:
   Add to workflow env:
   ```yaml
   env:
     VITE_CACHE: true
     TSC_INCREMENTAL: true
   ```

2. Parallelize independent steps:
   ```yaml
   - name: "Build and Test"
     type: parallel
     steps:
       - bash: npm run build
       - bash: npm test
   ```

3. Add timeout guards:
   All steps completed well under limits, but consider adding
   timeouts to prevent hanging on failures.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 7. Command-Line Options

Support options:
- `<workflow>` - Workflow file to debug (required)
- `--input key=value` - Set input variables
- `--auto` - Auto-continue (no pauses, just show output)
- `--break <step>` - Set breakpoint at step number or name
- `--validate-only` - Only validate, don't execute
- `--profile` - Show performance profile after completion
- `--trace` - Show detailed trace of all operations

### 8. Examples

```bash
# Interactive debugging
/workflow-debug production-release.yml

# With inputs
/workflow-debug production-release.yml --input version_type=minor

# Auto-run with profiling
/workflow-debug ci-pipeline.yml --auto --profile

# Validate workflow structure
/workflow-debug hotfix.yml --validate-only

# Break at specific step
/workflow-debug production-release.yml --break "Deploy"

# Full trace output
/workflow-debug daily-maintenance.yml --trace
```

## Output Format

Clear, colorized terminal output with:
- 📊 Visual progress indicators
- 🎯 Step-by-step execution status
- 🔍 State inspection on demand
- 🐛 Error analysis and suggestions
- ⚡ Performance profiling
- 💡 Optimization recommendations

## Error Handling

- If workflow file doesn't exist, list available workflows
- If workflow has syntax errors, show YAML parse errors with line numbers
- If step fails, provide error analysis and recovery options
- If timeout occurs, show partial results and allow continuation
- If Ctrl+C pressed, ask whether to abort or pause

## Notes

- Make debugging interactive and helpful
- Provide context for every error
- Show state changes clearly
- Offer actionable recommendations
- Keep output readable (not overwhelming)
- Save full execution log to `.claude/debug/workflow-<timestamp>.log`
