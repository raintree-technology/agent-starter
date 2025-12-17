# Convert to TOON v2.0

Convert JSON data files to TOON (Token-Oriented Object Notation) format for 30-60% token savings.

**Usage:** `/convert-to-toon <file-path> [options]`

**Options:**
- `--delimiter comma|tab|pipe` - Choose delimiter (default: comma)
- `--key-folding` - Enable key folding for nested objects (default: enabled)
- `--no-key-folding` - Disable key folding
- `--strict` - Validate output in strict mode

**Examples:**
- `/convert-to-toon data/users.json`
- `/convert-to-toon data/addresses.json --delimiter tab`
- `/convert-to-toon config.json --key-folding`

## Workflow

### 1. Read and Validate Input

Read the JSON file and validate:
- ✅ File exists and is readable
- ✅ Valid JSON syntax
- ✅ Contains array data (TOON requires arrays)

If any validation fails, show clear error message and stop.

### 2. Analyze Suitability

Check if TOON is beneficial:

**Criteria:**
- Array has ≥5 items
- Objects have ≥60% field uniformity
- Structure is flat or moderately nested

**Calculate uniformity:**
1. Extract all field names from all objects
2. Find most common set of fields
3. Count how many objects have that set
4. Uniformity = (common objects / total objects) × 100

Show analysis:
```
Analysis for {file}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Items:      {count}
Uniformity: {percent}%
Recommended: {yes/no}

{reasons}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Estimate Token Savings

Calculate approximate tokens:
- **JSON tokens** ≈ `(items × fields × 4) + overhead`
- **TOON tokens** ≈ `20 + (items × fields × 2)`
- **Savings %** = `(JSON - TOON) / JSON × 100`

Show comparison:
```
Token Comparison:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JSON:  {json_tokens} tokens
TOON:  {toon_tokens} tokens
Saved: {saved} tokens ({percent}%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Convert to TOON Format

If TOON is recommended (or user confirms):

1. **Extract unique fields** from all objects (union of all keys)
2. **Build header**: `[{count}]{field1,field2,...}:`
3. **Build data rows**:
   - For each object, extract values in field order
   - Use empty string for missing fields
   - Escape commas in values with `\,`
   - Join with commas
4. **Combine** header and rows

**TOON Structure:**
```
[count]{field1,field2,field3}:
  value1,value2,value3
  value1,value2,value3
```

### 5. Save Output

Write TOON content to new file:
- Default output: replace `.json` with `.toon`
- Example: `users.json` → `users.toon`

Show success message:
```
✅ Conversion complete!

Input:  {input_file} ({json_tokens} tokens)
Output: {output_file} ({toon_tokens} tokens)
Saved:  {saved} tokens ({percent}%)
```

### 6. Verify (Optional)

To verify correctness, convert TOON back to JSON and compare:
1. Parse TOON header to get fields
2. Split each row into values
3. Build objects by mapping values to fields
4. Compare with original data

If matches: `✅ Verification successful`
If differs: `⚠️ Warning: Decoded data differs`

## Examples

### Example 1: Good Candidate

**Input:** `data/transactions.json` (250 items, 96% uniform)

```
Analysis for data/transactions.json:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Items:      250
Uniformity: 96.0%
Recommended: ✅ Yes

Token Comparison:
JSON:  4545 tokens
TOON:  2744 tokens
Saved: 1801 tokens (39.6%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Conversion complete!
Output: data/transactions.toon
```

### Example 2: Not Recommended

**Input:** `config/settings.json` (3 items)

```
Analysis for config/settings.json:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Items:      3
Uniformity: 100.0%
Recommended: ❌ No

Reasons:
  • Only 3 items (recommend ≥5 for meaningful savings)

Token Comparison:
JSON:  245 tokens
TOON:  198 tokens
Saved: 47 tokens (19.2%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ TOON not recommended for this data.
Minimal savings (19.2%). Keep as JSON for clarity.
```

## Error Handling

### File Not Found
```
❌ Error: File not found: {path}
Please check the file path and try again.
```

### Invalid JSON
```
❌ Error: Invalid JSON in {file}
{parse error details}
Please fix JSON syntax and try again.
```

### Not an Array
```
❌ Error: TOON requires array data
The file contains: {type}
Consider wrapping in an array or keeping as JSON.
```

## Related Commands

- `/analyze-tokens <file>` - Compare formats without converting
- TOON Skill - Auto-applies TOON when beneficial
- See `.claude/skills/toon-formatter/README.md` for format specification
