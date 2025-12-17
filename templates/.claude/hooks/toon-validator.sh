#!/bin/bash
# TOON Format Validator Hook
# Validates TOON syntax after writing/editing .toon files

set -euo pipefail

TOOL_NAME="${TOOL_NAME:-}"
FILE_PATH="${TOOL_INPUT_FILE_PATH:-}"

# Only validate .toon files
if [[ ! "$FILE_PATH" =~ \.toon$ ]]; then
  exit 0
fi

# Check if file exists
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Basic TOON syntax validation
validate_toon() {
  local file="$1"
  local line_num=0
  local in_header=false

  while IFS= read -r line; do
    ((line_num++))

    # Check for header pattern: [count]{field1,field2,...}:
    if [[ "$line" =~ ^\[([0-9]+)\]\{([^}]+)\}:$ ]]; then
      in_header=true
      local count="${BASH_REMATCH[1]}"
      local fields="${BASH_REMATCH[2]}"

      # Validate count is positive
      if [[ "$count" -le 0 ]]; then
        echo "Line $line_num: Invalid count '$count' (must be positive)" >&2
        return 2
      fi

      # Validate fields aren't empty
      if [[ -z "$fields" ]]; then
        echo "Line $line_num: Empty field list" >&2
        return 2
      fi

    # Check for malformed headers
    elif [[ "$line" =~ ^\[ ]] && [[ "$line" =~ \{.*\} ]]; then
      echo "Line $line_num: Malformed TOON header syntax" >&2
      return 2
    fi
  done < "$file"

  return 0
}

# Run validation
if validate_toon "$FILE_PATH"; then
  echo "✓ TOON format valid: $FILE_PATH" >&2
  exit 0
else
  echo "✗ TOON validation failed. See errors above." >&2
  exit 2
fi
