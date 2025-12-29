#!/bin/bash
# Auto-Optimize Hook
# Automatically suggests running /optimize after significant code changes

set -euo pipefail

FILE_PATH="${TOOL_INPUT_FILE_PATH:-}"
TOOL_NAME="${TOOL_NAME:-}"

# Skip if no file path (shouldn't happen but be safe)
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Only trigger on actual code files (not config, docs, tests)
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx|py|go|rs|java|cpp|c|rb|php|swift)$ ]]; then
  exit 0
fi

# Skip test files (they don't need optimization checks)
if [[ "$FILE_PATH" =~ \.(test|spec)\.(ts|tsx|js|jsx|py)$ ]]; then
  exit 0
fi

# Skip generated files and vendor code
if [[ "$FILE_PATH" =~ (node_modules|vendor|generated|dist|build|\.next|\.nuxt)/  ]]; then
  exit 0
fi

# Track changes in temp file to avoid spamming
TRACK_FILE="/tmp/claude-optimize-suggestions.txt"
SESSION_FILE="/tmp/claude-session-changes.txt"

# Initialize tracking files if they don't exist
touch "$TRACK_FILE" "$SESSION_FILE"

# Check if this file was already suggested in last 10 minutes
if grep -q "^${FILE_PATH}$" "$TRACK_FILE" 2>/dev/null; then
  LAST_SUGGEST=$(stat -f%m "$TRACK_FILE" 2>/dev/null || stat -c%Y "$TRACK_FILE" 2>/dev/null || echo 0)
  NOW=$(date +%s)
  DIFF=$((NOW - LAST_SUGGEST))

  # If suggested less than 10 minutes ago, skip
  if [[ $DIFF -lt 600 ]]; then
    exit 0
  fi
fi

# Count total changes in this session
CHANGE_COUNT=$(wc -l < "$SESSION_FILE" | tr -d ' ')

# Get file size to determine if change is significant
if [[ -f "$FILE_PATH" ]]; then
  LINE_COUNT=$(wc -l < "$FILE_PATH" | tr -d ' ')
else
  LINE_COUNT=0
fi

# Add to session changes
echo "$FILE_PATH" >> "$SESSION_FILE"

# Determine if we should suggest optimization based on:
# 1. File size (larger files = more important to optimize)
# 2. Number of changes in session (many changes = time to review)
SHOULD_SUGGEST=false

# Suggest for large files (100+ lines)
if [[ $LINE_COUNT -ge 100 ]]; then
  SHOULD_SUGGEST=true
fi

# Suggest after every 5 file changes in session
if [[ $((CHANGE_COUNT % 5)) -eq 0 ]]; then
  SHOULD_SUGGEST=true
fi

# Don't suggest on first few changes (let user work)
if [[ $CHANGE_COUNT -lt 3 ]]; then
  SHOULD_SUGGEST=false
fi

# If we should suggest, output helpful message
if [[ "$SHOULD_SUGGEST" = true ]]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "💡 Optimization Suggestion"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "You've made $CHANGE_COUNT code changes this session."
  echo "Consider running: /optimize session"
  echo ""
  echo "This will check for:"
  echo "  • Performance issues"
  echo "  • Security vulnerabilities"
  echo "  • Code maintainability"
  echo "  • Missing tests"
  echo ""
  echo "Or run '/audit-code' to check for redundancy"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Record that we suggested for this file
  echo "$FILE_PATH" > "$TRACK_FILE"
fi

# Clean up old session file if too large (keep last 100 changes)
if [[ $CHANGE_COUNT -gt 100 ]]; then
  tail -100 "$SESSION_FILE" > "${SESSION_FILE}.tmp"
  mv "${SESSION_FILE}.tmp" "$SESSION_FILE"
fi

# Non-blocking - always succeed
exit 0
