#!/bin/bash
# Markdown Formatter Hook
# Auto-formats markdown files and ensures proper structure

set -euo pipefail

FILE_PATH="${TOOL_INPUT_FILE_PATH:-}"

# Only process markdown files
if [[ ! "$FILE_PATH" =~ \.(md|markdown)$ ]]; then
  exit 0
fi

# Skip if file doesn't exist
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Create temp file
TEMP_FILE=$(mktemp)
trap 'rm -f "$TEMP_FILE"' EXIT

# Format markdown:
# - Remove trailing whitespace
# - Ensure single blank line between sections
# - Fix heading spacing
# - Ensure file ends with newline

awk '
  # Remove trailing whitespace
  { gsub(/[ \t]+$/, "") }

  # Track previous line
  {
    if (NR > 1) {
      # Ensure blank line before headings (except after another heading)
      if ($0 ~ /^#/ && prev !~ /^#/ && prev != "") {
        if (blank_count == 0) print ""
      }

      # Print previous line
      print prev

      # Track blank lines
      if (prev == "") {
        blank_count++
      } else {
        blank_count = 0
      }
    }
    prev = $0
  }

  # Print last line
  END {
    if (prev != "") print prev
  }
' "$FILE_PATH" > "$TEMP_FILE"

# Only update if changes were made
if ! diff -q "$FILE_PATH" "$TEMP_FILE" > /dev/null 2>&1; then
  cp "$TEMP_FILE" "$FILE_PATH"
  echo "✓ Formatted markdown: $FILE_PATH" >&2
fi

exit 0
