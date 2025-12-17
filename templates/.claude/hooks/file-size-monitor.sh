#!/bin/bash
# File Size Monitor Hook
# Warns when files exceed recommended size limits

set -euo pipefail

FILE_PATH="${TOOL_INPUT_FILE_PATH:-}"

# Skip if file doesn't exist
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Get line count
LINE_COUNT=$(wc -l < "$FILE_PATH" | tr -d ' ')

# Check against limits from CLAUDE.md
check_size() {
  local file="$1"
  local lines="$2"

  # Skills should be < 900 lines (warning at 600)
  if [[ "$file" =~ \.claude/skills/.*/skill\.md$ ]]; then
    if [[ "$lines" -ge 900 ]]; then
      echo "❌ Skill file exceeds 900 line limit: $lines lines" >&2
      echo "   Consider breaking into multiple skills" >&2
      return 2
    elif [[ "$lines" -ge 600 ]]; then
      echo "⚠️  Skill file approaching size limit: $lines/900 lines" >&2
    fi
  fi

  # Commands should be < 250 lines
  if [[ "$file" =~ \.claude/commands/.*\.md$ ]]; then
    if [[ "$lines" -ge 250 ]]; then
      echo "❌ Command file exceeds 250 line limit: $lines lines" >&2
      echo "   Consider simplifying the workflow" >&2
      return 2
    elif [[ "$lines" -ge 200 ]]; then
      echo "⚠️  Command file approaching size limit: $lines/250 lines" >&2
    fi
  fi

  # General warning for very large files
  if [[ "$lines" -ge 2000 ]]; then
    echo "⚠️  Large file detected: $lines lines" >&2
    echo "   Consider refactoring for maintainability" >&2
  fi

  return 0
}

check_size "$FILE_PATH" "$LINE_COUNT"
exit $?
