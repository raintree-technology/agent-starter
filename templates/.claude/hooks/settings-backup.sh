#!/bin/bash
# Settings Backup Hook
# Creates timestamped backups of critical config files before edits

set -euo pipefail

FILE_PATH="${TOOL_INPUT_FILE_PATH:-}"

# Only backup critical config files
if [[ ! "$FILE_PATH" =~ (settings\.json|CLAUDE\.md|\.claude/.*\.md)$ ]]; then
  exit 0
fi

# Skip if file doesn't exist yet (new file)
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Create backups directory
BACKUP_DIR="$(dirname "$FILE_PATH")/.backups"
mkdir -p "$BACKUP_DIR"

# Create timestamped backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BASENAME=$(basename "$FILE_PATH")
BACKUP_PATH="$BACKUP_DIR/${BASENAME}.${TIMESTAMP}.bak"

cp "$FILE_PATH" "$BACKUP_PATH"
echo "✓ Backed up: $BACKUP_PATH" >&2

# Keep only last 10 backups per file
ls -t "$BACKUP_DIR/${BASENAME}".*.bak 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true

exit 0
