#!/bin/bash
# Check all skill files for proper frontmatter structure

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd -- "$SCRIPT_DIR/../.." && pwd)}"
SKILLS_DIR="$PROJECT_DIR/.claude/skills"

if [[ ! -d "$SKILLS_DIR" ]]; then
    echo "ERROR: Skills directory not found: $SKILLS_DIR" >&2
    exit 2
fi

echo "Checking all skill files..."
echo "=================================="
echo ""

find "$SKILLS_DIR" \( -name "skill.md" -o -name "SKILL.md" \) -type f | sort | while IFS= read -r file; do
    echo "File: $file"

    # Extract name and description
    name=$(grep "^name:" "$file" | head -1)
    desc=$(grep "^description:" "$file" | head -1)

    echo "  $name"
    echo "  $desc"

    # Check for issues
    if [ -z "$name" ]; then
        echo "  ❌ ERROR: Missing 'name' field"
    fi

    if [ -z "$desc" ]; then
        echo "  ❌ ERROR: Missing 'description' field"
    fi

    # Check name format (lowercase, hyphens only)
    name_value=$(echo "$name" | sed 's/^name: *//')
    if echo "$name_value" | grep -q "[A-Z_]"; then
        echo "  ⚠️  WARNING: Name contains uppercase or underscores: $name_value"
    fi

    echo ""
done

echo "=================================="
echo "Check complete"
