# Edit Command

Modify existing commands with validation, diff preview, and automatic registry updates.

**Usage:** `/edit-command <name> [options]`

**Arguments:**
- `name` (string) - Command name to edit

**Options:**
- `--description "<text>"` - Update description
- `--category <cat>` - Change category
- `--add-tool <tool>` - Add allowed tool
- `--remove-tool <tool>` - Remove allowed tool
- `--add-arg <name:type:desc>` - Add argument
- `--remove-arg <name>` - Remove argument
- `--model <model>` - Change model (sonnet, opus, haiku)
- `--interactive` - Interactive edit mode
- `--delete` - Delete command
- `--dry-run` - Preview changes without applying

## Purpose

Enables safe modification of existing commands with automatic validation and conflict checking. Maintains registry consistency and shows diffs before applying changes.

## Workflow

### 1. Locate Command

Find command file in registry:

```bash
# Load registry
REGISTRY=".claude/command-registry.json"

# Look up command
COMMAND_PATH=$(node -e "
  const registry = require('$REGISTRY');
  const cmd = registry.commands['$COMMAND_NAME'];
  if (!cmd) {
    console.error('Command not found: $COMMAND_NAME');
    process.exit(1);
  }
  console.log('.claude/commands/' + cmd.path);
")

# Verify file exists
if [[ ! -f "$COMMAND_PATH" ]]; then
  echo "Error: Command file not found: $COMMAND_PATH"
  exit 1
fi
```

### 2. Parse Current State

Extract current command metadata:

```bash
# Read frontmatter
FRONTMATTER=$(awk '/^---$/,/^---$/{print}' "$COMMAND_PATH" | sed '1d;$d')

# Read content
CONTENT=$(awk '/^---$/,/^---$/{next} {print}' "$COMMAND_PATH")

# Parse metadata
CURRENT_DESC=$(grep "description:" <<< "$FRONTMATTER" | cut -d'"' -f2)
CURRENT_CATEGORY=$(grep "category:" <<< "$FRONTMATTER" | awk '{print $2}')
CURRENT_MODEL=$(grep "model:" <<< "$FRONTMATTER" | awk '{print $2}')
CURRENT_TOOLS=$(grep "allowedTools:" <<< "$FRONTMATTER")
```

### 3. Apply Modifications

Make requested changes to metadata:

**Update description:**

```bash
if [[ -n "$NEW_DESCRIPTION" ]]; then
  # Validate length
  DESC_LEN=${#NEW_DESCRIPTION}
  if [[ $DESC_LEN -lt 10 || $DESC_LEN -gt 200 ]]; then
    echo "Error: Description must be 10-200 characters"
    exit 1
  fi

  # Update in frontmatter
  sed -i "s/description:.*/description: \"$NEW_DESCRIPTION\"/" "$TEMP_FILE"
fi
```

**Change category:**

```bash
VALID_CATEGORIES=("automation" "code-quality" "development" "deployment" "documentation" "git" "meta" "optimization" "testing" "workflow" "utility")

if [[ -n "$NEW_CATEGORY" ]]; then
  # Validate category
  if [[ ! " ${VALID_CATEGORIES[@]} " =~ " ${NEW_CATEGORY} " ]]; then
    echo "Error: Invalid category: $NEW_CATEGORY"
    echo "Valid categories: ${VALID_CATEGORIES[*]}"
    exit 1
  fi

  # Update in frontmatter
  sed -i "s/category:.*/category: $NEW_CATEGORY/" "$TEMP_FILE"
fi
```

**Add/remove tools:**

```bash
if [[ -n "$ADD_TOOL" ]]; then
  # Validate tool syntax
  if [[ ! "$ADD_TOOL" =~ ^(Read|Write|Edit|Bash|Glob|Grep|Task|WebFetch|WebSearch|LSP|AskUserQuestion|TodoWrite|Skill)\(.*\)$ ]]; then
    echo "Error: Invalid tool syntax: $ADD_TOOL"
    echo "Example: Bash(git:*), Read(*), Edit(*)"
    exit 1
  fi

  # Add to allowedTools array
  # ... (implementation)
fi

if [[ -n "$REMOVE_TOOL" ]]; then
  # Remove from allowedTools array
  # ... (implementation)
fi
```

**Add/remove arguments:**

```bash
if [[ -n "$ADD_ARG" ]]; then
  # Parse argument: name:type:description
  IFS=':' read -r ARG_NAME ARG_TYPE ARG_DESC <<< "$ADD_ARG"

  # Validate argument
  if [[ ! "$ARG_NAME" =~ ^[a-z][a-z0-9_]*$ ]]; then
    echo "Error: Invalid argument name: $ARG_NAME"
    exit 1
  fi

  # Add to arguments section
  # ... (implementation)
fi
```

**Change model:**

```bash
VALID_MODELS=("sonnet" "opus" "haiku")

if [[ -n "$NEW_MODEL" ]]; then
  # Validate model
  if [[ ! " ${VALID_MODELS[@]} " =~ " ${NEW_MODEL} " ]]; then
    echo "Error: Invalid model: $NEW_MODEL"
    echo "Valid models: sonnet, opus, haiku"
    exit 1
  fi

  # Update in frontmatter
  sed -i "s/model:.*/model: $NEW_MODEL/" "$TEMP_FILE"
fi
```

### 4. Validate Changes

Ensure modifications produce valid command:

```bash
# Create temporary file with changes
cp "$COMMAND_PATH" "$TEMP_FILE"

# Apply all modifications
# ... (apply changes to $TEMP_FILE)

# Validate modified command
node .claude/validators/validate-command.js "$TEMP_FILE"

if [[ $? -ne 0 ]]; then
  echo "Error: Validation failed"
  echo "Temporary file: $TEMP_FILE"
  echo "Review errors above and try again"
  exit 1
fi
```

### 5. Show Diff

Display changes before applying:

```bash
# Show colored diff
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Changes to: $COMMAND_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# Git-style diff
diff -u "$COMMAND_PATH" "$TEMP_FILE" || true

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Summary of changes
echo
echo "Summary:"
[[ "$CURRENT_DESC" != "$NEW_DESC" ]] && echo "  Description: $CURRENT_DESC → $NEW_DESC"
[[ "$CURRENT_CATEGORY" != "$NEW_CATEGORY" ]] && echo "  Category: $CURRENT_CATEGORY → $NEW_CATEGORY"
[[ "$CURRENT_MODEL" != "$NEW_MODEL" ]] && echo "  Model: $CURRENT_MODEL → $NEW_MODEL"
echo
```

### 6. Confirm and Apply

Ask for confirmation (unless --dry-run or --force):

```bash
if [[ "$DRY_RUN" == "true" ]]; then
  echo "Dry run - no changes applied"
  exit 0
fi

if [[ "$FORCE" != "true" ]]; then
  read -p "Apply these changes? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted"
    exit 0
  fi
fi

# Apply changes
mv "$TEMP_FILE" "$COMMAND_PATH"

echo "✅ Changes applied successfully"
```

### 7. Update Registry

Update command metadata in registry:

```bash
# Update registry with new metadata
node .claude/validators/update-registry.js update "$COMMAND_NAME" \
  "description=$NEW_DESC" \
  "category=$NEW_CATEGORY" \
  "model=$NEW_MODEL"

echo "✅ Registry updated"
```

## Examples

```bash
# Interactive mode
/edit-command my-command --interactive

# Update description
/edit-command deploy-staging --description "Deploy to staging with smoke tests"

# Change category
/edit-command my-tool --category optimization

# Add tool permission
/edit-command deploy-prod --add-tool "Bash(ssh:*)"

# Change model
/edit-command expensive-command --model haiku

# Add argument
/edit-command generate-component --add-arg "style:string:Component style (css/scss/styled)"

# Preview changes
/edit-command my-command --description "New desc" --dry-run

# Delete command
/edit-command old-command --delete
```

## Interactive Mode

When using `--interactive`, presents menu-driven interface:

```
Editing command: deploy-staging
Current state:
  Description: Deploy code to staging environment
  Category: deployment
  Model: sonnet
  Tools: Bash(git:*), Bash(npm:*)
  Arguments: branch (string)

What would you like to edit?
  1. Description
  2. Category
  3. Model
  4. Tools (add/remove)
  5. Arguments (add/remove)
  6. Delete command
  7. View full file
  8. Done
>

? Select option: 1

Current description:
  Deploy code to staging environment

? New description:
> Deploy code to staging with automated smoke tests

✅ Description updated

What would you like to edit?
  ...
```

## Delete Command

Safe command deletion with confirmation:

```bash
/edit-command old-command --delete

# Prompt:
You are about to delete: old-command
Location: .claude/commands/generated/old-command.md

This will:
  - Remove the command file
  - Update the registry
  - Remove from conflict tracking

This action cannot be undone.

? Are you sure? (y/N)
```

## Safety Features

- ✅ Validation before applying changes
- ✅ Diff preview shows exact changes
- ✅ Confirmation required (unless --force)
- ✅ Dry-run mode for testing
- ✅ Automatic backup before editing
- ✅ Registry consistency maintained
- ✅ Rollback on validation failure

## Advanced Usage

### Bulk Editing

Edit multiple commands with same change:

```bash
# Change all deployment commands to use haiku
for cmd in deploy-dev deploy-staging deploy-prod; do
  /edit-command $cmd --model haiku --force
done
```

### Template Upgrade

Migrate command to different template:

```bash
# Manually:
# 1. Note current command details
/edit-command old-command --interactive

# 2. Create new command with updated template
/create-command old-command --template new-template --force

# 3. Port over custom logic
```

### Version Control Integration

Track command changes in git:

```bash
# Before editing
git add .claude/commands/generated/my-command.md

# Edit
/edit-command my-command --description "Updated functionality"

# Review
git diff .claude/commands/generated/my-command.md

# Commit
git commit -m "Update my-command description"
```

## Troubleshooting

**Error: "Command not found"**
```
Solution: Check command name and registry
- List commands: cat .claude/command-registry.json | jq '.commands | keys'
- Check spelling
- Verify command exists
```

**Error: "Validation failed after edit"**
```
Solution: Review validation errors
- Check syntax errors
- Verify all required fields
- Ensure tools are properly formatted
- Validate argument types
```

**Error: "Registry update failed"**
```
Solution: Manually fix registry
- Check .claude/command-registry.json syntax
- Verify file permissions
- Re-run: node .claude/validators/update-registry.js
```

## Related Commands

- `/create-command` - Create new commands
- `/command-validate` - Validate command files
- `/workflow-compose` - Create workflows from commands

---

**Pro Tip:** Use `/edit-command --dry-run` to preview changes before applying them, especially when editing critical production commands.
