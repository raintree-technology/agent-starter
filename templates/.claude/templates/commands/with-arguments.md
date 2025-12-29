# {{COMMAND_NAME}}

{{COMMAND_DESCRIPTION}}

**Usage:** `/{{COMMAND_NAME}} {{ARGUMENT_LIST}}`

**Arguments:**
{{#each ARGUMENTS}}
- `{{name}}` ({{type}}) - {{description}}{{#if default}} (default: {{default}}){{/if}}
{{/each}}

**Options:**
{{#each OPTIONS}}
- `{{flag}}` - {{description}}
{{/each}}

## Purpose

{{PURPOSE_DESCRIPTION}}

## Workflow

### 1. Parse Arguments

```bash
# Extract and validate arguments
{{ARGUMENT_VALIDATION}}
```

### 2. Validate Input

{{VALIDATION_STEPS}}

### 3. Execute Command

{{EXECUTION_STEPS}}

### 4. Handle Results

{{RESULT_HANDLING}}

## Examples

```
# Example 1: Basic usage
/{{COMMAND_NAME}} {{EXAMPLE_ARGS_1}}

# Example 2: With options
/{{COMMAND_NAME}} {{EXAMPLE_ARGS_2}} --{{EXAMPLE_FLAG}}

# Example 3: All parameters
/{{COMMAND_NAME}} {{EXAMPLE_ARGS_3}}
```

## Validation Rules

{{VALIDATION_RULES}}

## Error Handling

{{ERROR_HANDLING}}
