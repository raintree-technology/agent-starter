#!/bin/bash
# Check all skill files for proper frontmatter structure

cd /Users/zach/Documents/raintree/claude-starter

echo "Checking all skill files..."
echo "=================================="
echo ""

find .claude/skills -name "skill.md" -type f | sort | while IFS= read -r file; do
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
