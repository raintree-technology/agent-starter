#!/bin/bash
# Settings Backup Hook
# Creates timestamped backups of critical config files before edits

set -euo pipefail

FILE_PATH="${TOOL_INPUT_FILE_PATH:-}"
MAX_BACKUPS_PER_FILE=10

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

TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
BASENAME=$(basename "$FILE_PATH")
BACKUP_PATH="$BACKUP_DIR/${BASENAME}.${TIMESTAMP}.bak"

cp "$FILE_PATH" "$BACKUP_PATH"
echo "✓ Backed up: $BACKUP_PATH" >&2

mapfile -t BACKUPS < <(
  find "$BACKUP_DIR" -maxdepth 1 -type f -name "${BASENAME}.*.bak" -print | sort -r
)

if (( ${#BACKUPS[@]} > MAX_BACKUPS_PER_FILE )); then
  for ((index = MAX_BACKUPS_PER_FILE; index < ${#BACKUPS[@]}; index += 1)); do
    rm -f -- "${BACKUPS[$index]}"
  done
fi

exit 0
