# Workflow Compose

Create YAML-based workflow automation with command generation.

**Usage:** `/workflow-compose <name> [options]`

**Arguments:**
- `name` (string) - Workflow name (kebab-case)

**Options:**
- `--interactive` - Interactive workflow builder (default)
- `--from-commands "<cmd1> <cmd2>..."` - Build from existing commands
- `--template <type>` - Workflow template (ci-pipeline, release, deployment, maintenance)
- `--generate-command` - Auto-generate command wrapper
- `--dry-run` - Preview without creating files

## Purpose

Enables complex automation by composing multiple commands into reusable YAML workflows. Workflows support sequential and parallel execution, conditional logic, variable substitution, and error handling.

## Workflow

### 1. Define Workflow Structure

Specify workflow metadata and configuration:

**Interactive prompts:**

```
Creating workflow: production-release

? Workflow description:
> Complete production release with quality checks and deployment

? Workflow pattern:
  1. Sequential - Steps run one after another
  2. Parallel - Steps run simultaneously
  3. Hierarchical - Parent task with sub-tasks
  4. Mixed - Combination of above
> 4

? Require inputs from user?
> yes

? Input parameters (comma-separated):
> version_type, skip_tests

? Environment variables needed?
> NODE_ENV=production, CI=true
```

### 2. Add Workflow Steps

Build step-by-step workflow:

**Step types:**
- `command` - Execute Claude Code command
- `bash` - Run bash command
- `parallel` - Run multiple steps concurrently
- `sequential` - Explicit sequential steps
- `manual` - Wait for user input

**Interactive step builder:**

```
Step 1: What type of step?
  1. Command (/audit-code, /optimize, etc.)
  2. Bash (npm test, git push, etc.)
  3. Parallel steps
  4. Manual checkpoint
> 1

? Which command?
> /audit-code --strict

? Step name:
> Quality Checks

? Continue on error?
> no

✅ Step 1 added: Quality Checks (/audit-code --strict)

Add another step? (Y/n) y

Step 2: What type of step?
> 2

? Bash command:
> npm run build && npm test

? Step name:
> Build and Test

? Timeout (milliseconds):
> 1800000

? Continue on error?
> no

✅ Step 2 added: Build and Test

Add another step? (Y/n) y

Step 3: What type of step?
> 1

? Which command?
> /release ${inputs.version_type}

? Step name:
> Release

? Require confirmation?
> yes

✅ Step 3 added: Release

Add another step? (Y/n) y

Step 4: What type of step?
> 2

? Bash command:
> npm run deploy:production

? Step name:
> Deploy

? When to run this step?
  1. Always
  2. Only if previous step succeeded
  3. Only if previous step failed
  4. Custom condition
> 2

? Condition:
> steps.release.exit_code == 0

✅ Step 4 added: Deploy (conditional)

Add another step? (Y/n) n
```

### 3. Add Error Handling

Define failure and success handlers:

```
? What should happen on failure?
  1. Rollback changes
  2. Send notification
  3. Run cleanup command
  4. Custom steps
  5. Nothing (default)
> 1

? Rollback steps:
> /clean build
> git reset --hard HEAD

✅ Failure handler added

? What should happen on success?
  1. Send notification
  2. Run command
  3. Custom message
  4. Nothing
> 3

? Success message:
> Production release complete! Version: ${inputs.version_type}

✅ Success handler added
```

### 4. Generate Workflow YAML

Create YAML file from specifications:

```yaml
# File: .claude/workflows/production-release.yml
name: "Production Release"
version: "1.0"
description: "Complete production release with quality checks and deployment"

inputs:
  version_type:
    type: string
    default: patch
    allowed: [patch, minor, major]
    description: "Version bump type"

  skip_tests:
    type: boolean
    default: false
    description: "Skip test suite"

env:
  NODE_ENV: production
  CI: true

steps:
  - name: "Quality Checks"
    command: /audit-code --strict
    fail_on_error: true

  - name: "Build and Test"
    bash: npm run build && npm test
    timeout: 1800000
    fail_on_error: true
    when: ${{ inputs.skip_tests == false }}

  - name: "Release"
    command: /release ${inputs.version_type}
    confirm: true
    fail_on_error: true

  - name: "Deploy"
    when: ${{ steps.release.exit_code == 0 }}
    bash: npm run deploy:production
    fail_on_error: true

on_failure:
  - command: /clean build
  - bash: git reset --hard HEAD
  - message: "Release failed - changes rolled back"

on_success:
  - message: "Production release complete! Version: ${inputs.version_type}"

metadata:
  created: "2025-12-28T10:15:00Z"
  generator: "workflow-compose"
  category: "deployment"
```

### 5. Validate Workflow

Ensure workflow is valid:

```bash
# Validate YAML syntax
node -e "
  const yaml = require('js-yaml');
  const fs = require('fs');
  try {
    const doc = yaml.load(fs.readFileSync('.claude/workflows/production-release.yml', 'utf8'));
    console.log('✅ YAML syntax valid');
  } catch (e) {
    console.error('❌ YAML syntax error:', e.message);
    process.exit(1);
  }
"

# Validate workflow schema
node .claude/utils/workflows/validator.js .claude/workflows/production-release.yml

# Check referenced commands exist
for cmd in audit-code release clean; do
  if ! grep -q "\"$cmd\"" .claude/command-registry.json; then
    echo "Warning: Command /$cmd not found in registry"
  fi
done
```

### 6. Generate Command Wrapper (Optional)

Auto-generate command to run workflow:

```bash
if [[ "$GENERATE_COMMAND" == "true" ]]; then
  # Create command that executes workflow
  /create-command "production-release" --template with-arguments --force

  # Populate with workflow execution
  cat > .claude/commands/generated/production-release.md <<'EOF'
# Production Release

Run production release workflow.

**Usage:** `/production-release [version_type] [options]`

**Arguments:**
- `version_type` (string) - Version bump type: patch, minor, major (default: patch)

**Options:**
- `--skip-tests` - Skip test suite
- `--dry-run` - Preview workflow without execution

## Purpose

Executes production release workflow defined in .claude/workflows/production-release.yml

## Workflow

### 1. Execute Workflow

Run workflow with parameters:

\`\`\`bash
node .claude/utils/workflows/engine.js \
  .claude/workflows/production-release.yml \
  --input version_type=${VERSION_TYPE} \
  --input skip_tests=${SKIP_TESTS}
\`\`\`

## Examples

\`\`\`bash
# Patch release
/production-release

# Minor release
/production-release minor

# Major release, skip tests
/production-release major --skip-tests

# Preview
/production-release --dry-run
\`\`\`
EOF

  echo "✅ Command wrapper created: /production-release"
fi
```

### 7. Preview and Save

Show summary and save workflow:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Workflow Created Successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: production-release
Description: Complete production release with quality checks and deployment

File: .claude/workflows/production-release.yml
Command: /production-release (auto-generated)

Inputs:
  - version_type (string): Version bump type [patch|minor|major]
  - skip_tests (boolean): Skip test suite

Steps: 4
  1. Quality Checks (/audit-code --strict)
  2. Build and Test (npm run build && npm test)
  3. Release (/release ${inputs.version_type})
  4. Deploy (npm run deploy:production) [conditional]

Error Handling:
  On Failure: Rollback + cleanup
  On Success: Success message

Validation: ✅ PASSED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next steps:
1. Review workflow: cat .claude/workflows/production-release.yml
2. Test workflow: /workflow production-release --dry-run
3. Run workflow: /production-release patch

Workflow is ready to use!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Examples

### Simple Sequential Workflow

```bash
/workflow-compose daily-checks

# Interactive prompts:
Steps:
1. /audit-code
2. /optimize session
3. npm outdated

Result: .claude/workflows/daily-checks.yml
```

### Parallel Execution Workflow

```bash
/workflow-compose ci-pipeline --template ci-pipeline

# Generated YAML:
steps:
  - name: "Lint and Test"
    type: parallel
    steps:
      - bash: npm run lint
      - bash: npm run type-check
      - bash: npm test
```

### From Existing Commands

```bash
/workflow-compose my-process --from-commands "/audit-code /optimize /clean"

# Automatically creates workflow with those commands in sequence
```

## Workflow Templates

### CI Pipeline Template

```yaml
name: "CI Pipeline"
steps:
  - bash: npm ci
  - type: parallel
    steps:
      - bash: npm run lint
      - bash: npm run type-check
      - command: /audit-code
  - bash: npm test -- --coverage
  - bash: npm run build
```

### Release Template

```yaml
name: "Release"
inputs:
  version_type:
    type: string
    allowed: [patch, minor, major]
steps:
  - command: /audit-code --strict
  - bash: npm test
  - command: /release ${inputs.version_type}
  - bash: git push origin main --tags
```

### Deployment Template

```yaml
name: "Deploy"
inputs:
  environment:
    type: string
    allowed: [dev, staging, production]
steps:
  - bash: npm run build
  - bash: npm run deploy:${inputs.environment}
  - bash: curl -f https://${inputs.environment}.example.com/health
```

### Maintenance Template

```yaml
name: "Daily Maintenance"
schedule:
  cron: "0 9 * * *"
steps:
  - bash: npm update
  - command: /clean cache temp
  - command: /audit-code --report
```

## Workflow DSL Reference

### Input Types

```yaml
inputs:
  string_input:
    type: string
    default: "value"
    allowed: [option1, option2]  # Optional

  number_input:
    type: number
    default: 10
    min: 0
    max: 100

  boolean_input:
    type: boolean
    default: false

  choice_input:
    type: choice
    choices: [a, b, c]
```

### Conditional Logic

```yaml
steps:
  - name: "Conditional Step"
    when: ${{ inputs.env == 'production' }}
    bash: npm run deploy:prod

  - name: "Based on Previous Step"
    when: ${{ steps.build.exit_code == 0 }}
    bash: echo "Build succeeded"
```

### Variable Substitution

```yaml
env:
  APP_NAME: myapp
  VERSION: 1.0.0

steps:
  - bash: echo "Deploying ${env.APP_NAME} v${env.VERSION}"
  - bash: deploy --version ${inputs.version}
  - bash: echo "Result: ${steps.deploy.output}"
```

### Error Handling

```yaml
on_failure:
  - command: /clean build
  - bash: git reset --hard HEAD
  - message: "Workflow failed - rolled back"

on_success:
  - message: "Workflow complete!"
  - bash: echo "Success" >> workflow.log
```

## Advanced Features

### Nested Workflows

```yaml
steps:
  - name: "Run Another Workflow"
    workflow: .claude/workflows/sub-workflow.yml
    inputs:
      param: value
```

### Retry Logic

```yaml
steps:
  - name: "Flaky Test"
    bash: npm test
    retry:
      attempts: 3
      delay: 1000
      on_exit_codes: [1, 2]
```

### Timeout

```yaml
steps:
  - name: "Long Running Task"
    bash: npm run heavy-task
    timeout: 3600000  # 1 hour in ms
```

### Manual Checkpoints

```yaml
steps:
  - name: "Build"
    bash: npm run build

  - name: "Review Build"
    manual: "Review build output before deploying. Press Enter to continue."

  - name: "Deploy"
    bash: npm run deploy
```

## Safety Features

- ✅ YAML validation
- ✅ Step dependency checking
- ✅ Command existence validation
- ✅ Dry-run mode
- ✅ Automatic rollback on failure
- ✅ Timeout protection
- ✅ Confirmation for destructive steps

## Best Practices

1. **Name steps clearly:** Use descriptive names
2. **Add error handling:** Always define on_failure
3. **Use timeouts:** Prevent infinite hangs
4. **Test with --dry-run:** Preview before running
5. **Version control:** Commit workflows to git
6. **Keep workflows focused:** One workflow, one purpose
7. **Document inputs:** Clear descriptions for all inputs

## Troubleshooting

**Error: "Invalid YAML syntax"**
```
Solution: Check YAML formatting
- Ensure proper indentation (2 spaces)
- Quote strings with special characters
- Validate at yamllint.com
```

**Error: "Command not found"**
```
Solution: Ensure referenced commands exist
- Check command registry
- Create missing commands first
- Use full command names (include /prefix in workflow)
```

**Error: "Workflow validation failed"**
```
Solution: Review validation errors
- Check all required fields present
- Verify step types are valid
- Ensure conditional syntax is correct
```

## Related Commands

- `/workflow` - Execute workflows
- `/create-command` - Create individual commands
- `/edit-command` - Modify commands

---

**Pro Tip:** Start with simple sequential workflows, then add parallel execution and conditional logic as needed. Use templates for common patterns.
