# Analyze Tokens

Compare token usage between JSON and TOON formats without converting files.

**Usage:** `/analyze-tokens <file-path>`

**Examples:**
- `/analyze-tokens data/users.json`
- `/analyze-tokens api-response.json`

## Workflow

### 1. Read and Parse File

Read the JSON file and parse the data.

Validate:
- File exists and is readable
- Valid JSON syntax
- Contains array data

### 2. Analyze Data Characteristics

Calculate key metrics:

**Item Count:**
- Total number of objects in array

**Field Analysis:**
- Extract all unique field names
- Count how many objects have each field
- Calculate field coverage percentages

**Uniformity:**
1. Find most common set of fields
2. Count objects with that set
3. Calculate: `(matching objects / total) × 100`

**Show analysis:**
```
Data Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File:       {filename}
Items:      {count}
Uniformity: {percent}%
TOON Fit:   {excellent/limited}

Field Coverage:
{list of fields with percentages}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Estimate Token Usage

**JSON tokens:**
- Approximate: `(items × fields × 4) + overhead`
- Overhead includes: brackets, braces, quotes, commas, colons

**TOON tokens:**
- Approximate: `20 (header) + (items × fields × 2)`
- Savings from: no repeated field names, no JSON syntax

**Calculate savings:**
- Token difference: `JSON tokens - TOON tokens`
- Percentage: `(difference / JSON tokens) × 100`

**Show comparison:**
```
Token Comparison:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Format   Tokens    Efficiency
──────────────────────────────
JSON     {count}   Baseline
TOON     {count}   {percent}% better

Savings:
Tokens saved:  {saved}
Reduction:     {percent}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Per-Item Analysis

Calculate token cost per item:
- **JSON per item** = `total JSON tokens / item count`
- **TOON per item** = `total TOON tokens / item count`
- **Saved per item** = difference

**Show:**
```
Per-Item Token Cost:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JSON:  {tokens} tokens/item
TOON:  {tokens} tokens/item
Saved: {tokens} tokens/item
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5. Recommendation

Provide clear recommendation based on metrics:

**STRONG RECOMMENDATION (≥30% savings, ≥70% uniformity):**
```
✅ STRONG RECOMMENDATION: Use TOON format

This data is ideal for TOON:
• {percent}% token reduction
• {percent}% field uniformity
• {count} items (well above minimum)

Convert with: /convert-to-toon {filename}
```

**RECOMMENDED (≥20% savings, ≥60% uniformity):**
```
✅ RECOMMENDED: TOON format offers benefits

• {percent}% token reduction
• Good uniformity ({percent}%)

Convert with: /convert-to-toon {filename}
```

**MARGINAL (<30% savings or <60% uniformity):**
```
⚠️ MARGINAL: Limited TOON benefits

• Only {percent}% token reduction
• Reasons: {list}

You can convert if needed, or keep as JSON for clarity.
```

**NOT RECOMMENDED (<20% savings):**
```
❌ NOT RECOMMENDED: Keep as JSON

• Minimal savings ({percent}%)
• Reasons: {list}

JSON is better for this data.
```

## Examples

### Example 1: Ideal Candidate

**Input:** `data/transactions.json` (250 items)

```
Data Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File:       data/transactions.json
Items:      250
Uniformity: 96.8%
TOON Fit:   ✅ Excellent

Field Coverage:
  id        100.0%
  date      100.0%
  amount    100.0%
  merchant  100.0%
  category  100.0%
  status     96.8%

Token Comparison:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Format   Tokens    Efficiency
──────────────────────────────
JSON     4,545     Baseline
TOON     2,744     39.6% better

Savings:
Tokens saved:  1,801
Reduction:     39.6%

Per-Item Token Cost:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JSON:  18.18 tokens/item
TOON:  10.98 tokens/item
Saved: 7.20 tokens/item

✅ STRONG RECOMMENDATION: Use TOON format

This data is ideal for TOON:
• 39.6% token reduction
• 96.8% field uniformity
• 250 items (well above minimum)

Convert with: /convert-to-toon data/transactions.json
```

### Example 2: Not Recommended

**Input:** `config/settings.json` (3 items)

```
Data Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File:       config/settings.json
Items:      3
Uniformity: 100.0%
TOON Fit:   ⚠️ Limited

Reasons:
• Only 3 items (recommend ≥5)

Token Comparison:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Format   Tokens    Efficiency
──────────────────────────────
JSON     245       Baseline
TOON     198       19.2% better

Savings:
Tokens saved:  47
Reduction:     19.2%

❌ NOT RECOMMENDED: Keep as JSON

• Minimal savings (19.2%)
• Only 3 items (recommend ≥5 for meaningful savings)

JSON is better for this data.
```

## Tips

1. **Use before converting** - Always analyze first to decide
2. **Check uniformity** - >70% uniformity = excellent TOON candidate
3. **Consider item count** - >50 items = better savings
4. **Review field coverage** - Missing fields reduce efficiency

## Related

- `/convert-to-toon <file>` - Convert JSON to TOON
- See `.claude/skills/toon-formatter/README.md` - Format specification
- TOON Skill - Auto-applies when beneficial
