#!/bin/bash
# File Size Monitor Hook
# Warns when files exceed recommended size limits

set -euo pipefail

FILE_PATH="${TOOL_INPUT_FILE_PATH:-}"
SKILL_ERROR_LINE_LIMIT=900
SKILL_WARNING_LINE_LIMIT=600
COMMAND_ERROR_LINE_LIMIT=250
COMMAND_WARNING_LINE_LIMIT=200
GENERAL_WARNING_LINE_LIMIT=2000

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

  if [[ "$file" =~ \.claude/skills/.*/skill\.md$ ]]; then
    if [[ "$lines" -ge "$SKILL_ERROR_LINE_LIMIT" ]]; then
      echo "❌ Skill file exceeds $SKILL_ERROR_LINE_LIMIT line limit: $lines lines" >&2
      echo "   Consider breaking into multiple skills" >&2
      return 2
    elif [[ "$lines" -ge "$SKILL_WARNING_LINE_LIMIT" ]]; then
      echo "⚠️  Skill file approaching size limit: $lines/$SKILL_ERROR_LINE_LIMIT lines" >&2
    fi
  fi

  if [[ "$file" =~ \.claude/commands/.*\.md$ ]]; then
    if [[ "$lines" -ge "$COMMAND_ERROR_LINE_LIMIT" ]]; then
      echo "❌ Command file exceeds $COMMAND_ERROR_LINE_LIMIT line limit: $lines lines" >&2
      echo "   Consider simplifying the workflow" >&2
      return 2
    elif [[ "$lines" -ge "$COMMAND_WARNING_LINE_LIMIT" ]]; then
      echo "⚠️  Command file approaching size limit: $lines/$COMMAND_ERROR_LINE_LIMIT lines" >&2
    fi
  fi

  if [[ "$lines" -ge "$GENERAL_WARNING_LINE_LIMIT" ]]; then
    echo "⚠️  Large file detected: $lines lines" >&2
    echo "   Consider refactoring for maintainability" >&2
  fi

  return 0
}

check_size "$FILE_PATH" "$LINE_COUNT"
exit $?
