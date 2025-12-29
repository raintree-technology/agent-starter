# Create Command

Generate a new Claude Code command from templates with full validation and automatic registry management.

**Usage:** `/create-command <name> [options]`

**Arguments:**
- `name` (string) - Command name (kebab-case, e.g., deploy-staging)

**Options:**
- `--template <type>` - Template to use (basic-prompt, with-arguments, with-bash, git-workflow, code-generator, analyzer)
- `--description "<text>"` - Command description
- `--category <cat>` - Category (automation, code-quality, development, deployment, documentation, git, meta, optimization, testing, workflow, utility)
- `--interactive` - Interactive mode with prompts (default)
- `--dry-run` - Preview without creating files
- `--force` - Overwrite existing command

## Purpose

Enables infinite extensibility by allowing users to create custom commands programmatically. Commands are generated from proven templates, automatically validated, and registered for conflict-free operation.

## Workflow

### 1. Validate Command Name

Check command name follows conventions and has no conflicts:

```bash
# Run validation
node .claude/validators/validate-command.js --name-only "$COMMAND_NAME"

# Check for conflicts
node .claude/validators/check-conflicts.js "$COMMAND_NAME"
```

**Validation rules:**
- Must be kebab-case (lowercase, hyphens only)
- 2-50 characters
- Cannot be a reserved name (help, version, init, config, settings)
- Cannot conflict with existing commands
- No consecutive hyphens
- Cannot start/end with hyphen

### 2. Select Template

Choose the appropriate template based on command purpose:

**Available Templates:**

1. **basic-prompt** - Simple text-based command
   - Best for: Q&A, analysis, recommendations
   - No bash execution
   - No file modifications
   - Example: /explain-concept, /suggest-architecture

2. **with-arguments** - Command with parameters and validation
   - Best for: Parameterized operations
   - Accepts user input
   - Validates arguments
   - Example: /generate-component <name>, /refactor-function <path>

3. **with-bash** - Execute bash commands
   - Best for: System operations, tool execution
   - Runs bash commands
   - Pre-flight checks
   - Safety features
   - Example: /install-deps, /check-disk-space

4. **git-workflow** - Git operations and workflows
   - Best for: Git automation
   - Branch management
   - Commit/push operations
   - Follows git safety protocol
   - Example: /create-pr, /sync-branch

5. **code-generator** - File/code generation
   - Best for: Creating new files
   - Follows project patterns
   - Validates generated code
   - Integrates with codebase
   - Example: /generate-test, /scaffold-api

6. **analyzer** - Code analysis and reporting
   - Best for: Auditing, linting, metrics
   - Multi-scope support
   - Detailed reporting
   - Severity levels
   - Example: /check-security, /analyze-performance

**Interactive template selection:**

```
? What type of command are you creating?
  1. Basic prompt (text-based, no execution)
  2. With arguments (accepts parameters)
  3. With bash (executes commands)
  4. Git workflow (git operations)
  5. Code generator (creates files)
  6. Analyzer (audits and reports)
>

? What will this command do? (helps determine best template)
> Deploy code to staging environment

Recommended: git-workflow
Reason: Involves git operations, deployment commands, safety checks

? Use recommended template? (Y/n)
```

### 3. Gather Requirements

Collect information needed to populate template:

**Required information:**
- **Name:** Command name (validated)
- **Description:** What the command does (10-200 characters)
- **Category:** Command category for organization

**Template-specific information:**

**For with-arguments:**
- Arguments list (name, type, description, required/optional, defaults)
- Validation rules (regex, min/max, allowed values)

**For with-bash:**
- Required tools (git, npm, docker, etc.)
- Bash commands to execute
- Pre-flight checks
- Safety warnings

**For git-workflow:**
- Git operations (checkout, commit, push, merge)
- Branch operations
- Remote sync requirements
- Rollback procedures

**For code-generator:**
- File patterns to generate
- Code templates
- Naming conventions
- Integration steps

**For analyzer:**
- Analysis scopes
- Tools to run (eslint, knip, etc.)
- Severity levels
- Report format

**Interactive prompts example:**

```
Creating command: deploy-staging
Template: git-workflow

? Short description (10-200 chars):
> Deploy code to staging environment with automated tests

? Category:
  automation
  deployment (selected)
  git

? Git operations needed (select all):
  [x] Checkout branch
  [x] Pull latest
  [ ] Create branch
  [x] Push changes
  [ ] Create PR

? Deployment steps:
> 1. Run tests
> 2. Build production bundle
> 3. Deploy to staging server
> 4. Verify deployment

? Safety level:
  (x) Require confirmation before deploy
  ( ) No confirmation needed

? Add rollback procedure? (Y/n) y
```

### 4. Generate Command File

Populate template with collected information:

```bash
# Load template
TEMPLATE_PATH=".claude/templates/commands/${TEMPLATE}.md"

# Replace placeholders
sed "s/{{COMMAND_NAME}}/$COMMAND_NAME/g" "$TEMPLATE_PATH" > command.tmp
sed -i "s/{{COMMAND_DESCRIPTION}}/$DESCRIPTION/g" command.tmp
sed -i "s/{{CATEGORY}}/$CATEGORY/g" command.tmp

# Add template-specific content
# ... (based on template type and gathered requirements)

# Save to generated commands directory
OUTPUT_PATH=".claude/commands/generated/${COMMAND_NAME}.md"
mv command.tmp "$OUTPUT_PATH"
```

**Generated file structure:**

```markdown
---
name: deploy-staging
version: 1.0.0
category: deployment
model: sonnet
allowedTools: ["Bash(git:*)", "Bash(npm:*)", "Bash(ssh:*)"]
requiredTools: ["git", "npm", "ssh"]
template:
  source: git-workflow
  generated: 2025-12-28T10:15:00Z
  generator: create-command
---

# Deploy Staging

Deploy code to staging environment with automated tests.

**Usage:** `/deploy-staging [branch]`

**Arguments:**
- `branch` (string) - Branch to deploy (default: main)

... [rest of generated content]
```

### 5. Validate Generated Command

Ensure generated command meets all standards:

```bash
# Validate against schema
node .claude/validators/validate-command.js "$OUTPUT_PATH"

# Check result
if [[ $? -ne 0 ]]; then
  echo "Validation failed! Review errors above."
  echo "Command file: $OUTPUT_PATH"
  exit 1
fi
```

**Validation checks:**
- Schema compliance
- Required sections present
- Valid frontmatter
- Proper markdown formatting
- Code block syntax
- Example usage provided

### 6. Update Registry

Register the new command:

```bash
# Add to registry
node .claude/validators/update-registry.js add "$OUTPUT_PATH"
```

**Registry entry:**

```json
{
  "commands": {
    "deploy-staging": {
      "path": "generated/deploy-staging.md",
      "type": "generated",
      "created": "2025-12-28T10:15:00Z",
      "generator": "create-command",
      "metadata": {
        "description": "Deploy code to staging environment with automated tests",
        "arguments": ["branch"],
        "tools": ["Bash(git:*)", "Bash(npm:*)", "Bash(ssh:*)"],
        "category": "deployment",
        "template": "git-workflow"
      }
    }
  }
}
```

### 7. Preview and Confirm

Show preview before finalizing (unless --force):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Command Created Successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: deploy-staging
Template: git-workflow
Category: deployment
File: .claude/commands/generated/deploy-staging.md

Usage: /deploy-staging [branch]

Description:
Deploy code to staging environment with automated tests.

Validation: ✅ PASSED
Registry: ✅ UPDATED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next steps:
1. Review the generated file
2. Test the command: /deploy-staging
3. Edit if needed: /edit-command deploy-staging
4. Share with team via git commit

Command is immediately available for use!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Examples

```bash
# Interactive mode (default)
/create-command my-deployment

# Specify template
/create-command check-performance --template analyzer

# Full specification
/create-command deploy-prod \
  --template git-workflow \
  --description "Deploy to production with safety checks" \
  --category deployment

# Preview without creating
/create-command my-command --dry-run

# Overwrite existing
/create-command existing-command --force
```

## Template Selection Guide

**Use basic-prompt when:**
- No external tools needed
- No file modifications
- Pure analysis or recommendations
- Example: "Explain this error message"

**Use with-arguments when:**
- Need user input
- Parameterized operations
- Input validation required
- Example: "Generate component with specific props"

**Use with-bash when:**
- Running system commands
- Installing dependencies
- Checking system state
- Example: "Check if Docker is running"

**Use git-workflow when:**
- Git operations
- Branch management
- Deployment via git
- Example: "Create release branch"

**Use code-generator when:**
- Creating new files
- Scaffolding code
- Following project patterns
- Example: "Generate API endpoint"

**Use analyzer when:**
- Code auditing
- Running linters
- Gathering metrics
- Example: "Find unused imports"

## Safety Features

- ✅ Automatic name validation
- ✅ Conflict detection (prevents duplicates)
- ✅ Schema validation (ensures quality)
- ✅ Template validation (only known templates)
- ✅ Dry-run mode (preview before creating)
- ✅ Force mode (explicit overwrite only)
- ✅ Registry tracking (all commands tracked)
- ✅ Rollback support (delete via /edit-command)

## Best Practices

### Command Naming

**Good names:**
- `deploy-staging`
- `check-coverage`
- `generate-api-test`
- `audit-dependencies`

**Bad names:**
- `DeployStaging` (not kebab-case)
- `deploy_staging` (use hyphens not underscores)
- `d` (too short, unclear)
- `deploy-to-staging-environment-with-tests` (too long)

### Template Selection

1. **Start simple:** Use basic-prompt for first iteration
2. **Add complexity:** Upgrade to with-arguments if needed
3. **Add execution:** Move to with-bash only if truly needed
4. **Be specific:** Use specialized templates (git-workflow, code-generator) when appropriate

### Command Design

1. **Single responsibility:** One command, one task
2. **Clear description:** Describe what, not how
3. **Good examples:** Show common use cases
4. **Safety first:** Add confirmations for destructive operations
5. **Fail gracefully:** Include error handling

## Troubleshooting

**Error: "Command name is reserved"**
```
Solution: Choose a different name. Reserved names:
help, version, init, config, settings, claude, agent, system, internal
```

**Error: "Command already exists"**
```
Solution 1: Use different name
Solution 2: Remove existing: /edit-command <name> --delete
Solution 3: Force overwrite: /create-command <name> --force
```

**Error: "Validation failed"**
```
Solution: Review validation errors and fix:
- Check command name format
- Ensure description is 10-200 characters
- Verify category is valid
- Check template exists
```

**Error: "Template not found"**
```
Solution: Use valid template name:
basic-prompt, with-arguments, with-bash, git-workflow, code-generator, analyzer
```

## Advanced Usage

### Creating Command from Workflow

Generate command from existing workflow YAML:

```bash
/workflow-compose my-workflow
/create-command my-workflow --from-workflow .claude/workflows/my-workflow.yml
```

### Batch Command Creation

Create multiple related commands:

```bash
/create-command deploy-dev --template git-workflow --category deployment
/create-command deploy-staging --template git-workflow --category deployment
/create-command deploy-prod --template git-workflow --category deployment
```

### Custom Template

Create custom template for reuse:

```bash
# 1. Create command manually
/create-command my-custom-type

# 2. Save as template
cp .claude/commands/generated/my-custom-type.md \
   .claude/templates/commands/my-template.md

# 3. Generalize with placeholders
# Edit my-template.md and replace specific values with {{PLACEHOLDERS}}

# 4. Use custom template
/create-command new-command --template my-template
```

## Related Commands

- `/edit-command` - Modify existing commands
- `/workflow-compose` - Create multi-step workflows
- `/command-validate` - Validate command files
- `/audit-code` - Check command quality

---

**Pro Tip:** Start with `/create-command --interactive` to learn the system, then use direct arguments once comfortable for faster command creation.
