# {{COMMAND_NAME}}

{{COMMAND_DESCRIPTION}}

**Usage:** `/{{COMMAND_NAME}} {{ARGUMENTS}} [options]`

**Arguments:**
{{#each ARGUMENTS}}
- `{{name}}` ({{type}}) - {{description}}
{{/each}}

**Options:**
{{#each OPTIONS}}
- `{{flag}}` - {{description}}
{{/each}}

## Purpose

{{PURPOSE_DESCRIPTION}}

## Workflow

### 1. Analyze Requirements

Gather information needed to generate code:

{{REQUIREMENTS_GATHERING}}

### 2. Check Existing Patterns

Explore codebase for existing patterns to follow:

```bash
# Find similar files
{{PATTERN_SEARCH_COMMANDS}}
```

### 3. Generate Code

Create the requested files following project conventions:

{{CODE_GENERATION_LOGIC}}

### 4. Validation

Validate generated code:

```bash
# Syntax validation
{{SYNTAX_VALIDATION}}

# Linting
{{LINTING_COMMANDS}}

# Type checking
{{TYPE_CHECKING}}
```

### 5. Integration

Ensure generated code integrates with existing codebase:

{{INTEGRATION_STEPS}}

## Code Generation Strategy

### File Structure

```
{{GENERATED_FILE_STRUCTURE}}
```

### Code Template

```{{LANGUAGE}}
{{CODE_TEMPLATE}}
```

### Imports/Dependencies

{{DEPENDENCY_MANAGEMENT}}

### Naming Conventions

{{NAMING_CONVENTIONS}}

## Examples

```
# Example 1: Basic generation
/{{COMMAND_NAME}} {{EXAMPLE_ARGS_1}}

# Example 2: With options
/{{COMMAND_NAME}} {{EXAMPLE_ARGS_2}} --{{EXAMPLE_FLAG}}

# Example 3: Complex generation
/{{COMMAND_NAME}} {{EXAMPLE_ARGS_3}}
```

## Quality Checks

### Code Quality
- Follows project style guide
- Uses consistent naming
- Includes proper error handling
- Has appropriate comments

### Security
- No hardcoded secrets
- Input validation
- No SQL injection vulnerabilities
- No XSS vulnerabilities

### Performance
- Efficient algorithms
- No unnecessary computations
- Proper resource management

## Post-generation Steps

{{POST_GENERATION_STEPS}}
