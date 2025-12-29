# {{COMMAND_NAME}}

{{COMMAND_DESCRIPTION}}

**Usage:** `/{{COMMAND_NAME}} [scope] [options]`

**Scope:**
{{#each SCOPES}}
- `{{name}}` - {{description}}
{{/each}}

**Options:**
{{#each OPTIONS}}
- `{{flag}}` - {{description}}
{{/each}}

## Purpose

{{PURPOSE_DESCRIPTION}}

## Workflow

### 1. Scope Determination

Determine what to analyze:

```bash
{{SCOPE_DETECTION}}
```

### 2. Data Collection

Gather information for analysis:

```bash
{{DATA_COLLECTION_COMMANDS}}
```

### 3. Analysis Execution

Run analysis tools and algorithms:

{{ANALYSIS_EXECUTION}}

### 4. Results Aggregation

Combine and prioritize findings:

{{RESULTS_AGGREGATION}}

### 5. Report Generation

Generate comprehensive report:

{{REPORT_GENERATION}}

## Analysis Categories

### {{CATEGORY_1}}

{{CATEGORY_1_DESCRIPTION}}

**Checks:**
{{#each CATEGORY_1_CHECKS}}
- {{check}}
{{/each}}

### {{CATEGORY_2}}

{{CATEGORY_2_DESCRIPTION}}

**Checks:**
{{#each CATEGORY_2_CHECKS}}
- {{check}}
{{/each}}

### {{CATEGORY_3}}

{{CATEGORY_3_DESCRIPTION}}

**Checks:**
{{#each CATEGORY_3_CHECKS}}
- {{check}}
{{/each}}

## Examples

```
# Example 1: Analyze everything
/{{COMMAND_NAME}}

# Example 2: Specific scope
/{{COMMAND_NAME}} {{EXAMPLE_SCOPE}}

# Example 3: With report
/{{COMMAND_NAME}} --report
```

## Severity Levels

- **Critical** - Must fix immediately
- **High** - Fix before deployment
- **Medium** - Should fix soon
- **Low** - Nice to fix
- **Info** - Informational only

## Output Format

### Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analysis Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Scope: {{SCOPE}}
Files Analyzed: {{FILE_COUNT}}
Issues Found: {{ISSUE_COUNT}}

Breakdown:
  Critical: {{CRITICAL_COUNT}}
  High: {{HIGH_COUNT}}
  Medium: {{MEDIUM_COUNT}}
  Low: {{LOW_COUNT}}
```

### Detailed Findings

{{DETAILED_FINDINGS_FORMAT}}

## Auto-fix Capability

{{AUTO_FIX_DESCRIPTION}}

## Integration

Works with:
{{#each INTEGRATIONS}}
- {{integration}}
{{/each}}
