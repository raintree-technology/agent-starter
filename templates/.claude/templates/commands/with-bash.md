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

### 1. Pre-flight Checks

Verify prerequisites before execution:

```bash
# Check required tools
{{#each REQUIRED_TOOLS}}
if ! command -v {{name}} &>/dev/null; then
  echo "Error: {{name}} is not installed"
  echo "Install with: {{install_command}}"
  exit 1
fi
{{/each}}

# Check environment
{{ENVIRONMENT_CHECKS}}
```

### 2. Main Execution

```bash
{{BASH_COMMANDS}}
```

### 3. Validation

```bash
# Verify results
{{VALIDATION_COMMANDS}}
```

### 4. Cleanup

```bash
# Clean up temporary files
{{CLEANUP_COMMANDS}}
```

## Examples

```
# Example 1: Basic usage
/{{COMMAND_NAME}}

# Example 2: With options
/{{COMMAND_NAME}} --{{EXAMPLE_FLAG}}

# Example 3: Verbose mode
/{{COMMAND_NAME}} --verbose
```

## Exit Codes

- `0` - Success
- `1` - General error
- `2` - Invalid arguments
- `3` - Prerequisites not met
{{CUSTOM_EXIT_CODES}}

## Safety Features

{{SAFETY_FEATURES}}

## Troubleshooting

{{TROUBLESHOOTING_STEPS}}
