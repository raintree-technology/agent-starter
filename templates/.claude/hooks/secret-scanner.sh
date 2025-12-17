#!/bin/bash
# Secret Scanner Hook
# Prevents accidentally writing sensitive data to files

set -euo pipefail

FILE_PATH="${TOOL_INPUT_FILE_PATH:-}"

# Skip if file doesn't exist
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Patterns to detect (basic set - expand as needed)
declare -a PATTERNS=(
  "AKIA[0-9A-Z]{16}"                    # AWS Access Key
  "AIza[0-9A-Za-z\\-_]{35}"             # Google API Key
  "sk-[A-Za-z0-9]{48}"                  # OpenAI API Key
  "xox[baprs]-[0-9a-zA-Z-]+"            # Slack Token
  "ghp_[A-Za-z0-9]{36}"                 # GitHub Personal Access Token
  "-----BEGIN.*PRIVATE KEY-----"         # Private Keys
  "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\s*:\s*.{8,}" # Email:Password
)

FOUND_SECRETS=false

for pattern in "${PATTERNS[@]}"; do
  if grep -qE "$pattern" "$FILE_PATH" 2>/dev/null; then
    if [[ "$FOUND_SECRETS" == "false" ]]; then
      echo "⚠️  SECURITY WARNING: Potential secrets detected in $FILE_PATH" >&2
      echo "" >&2
      FOUND_SECRETS=true
    fi

    # Show context without revealing full secret
    echo "  Pattern matched: ${pattern:0:30}..." >&2
    grep -nE "$pattern" "$FILE_PATH" | head -n 1 | sed 's/:.*/: [REDACTED]/' >&2
  fi
done

if [[ "$FOUND_SECRETS" == "true" ]]; then
  echo "" >&2
  echo "Please review the file and remove any sensitive data." >&2
  echo "If this is a false positive, you can proceed." >&2
  exit 2
fi

exit 0
