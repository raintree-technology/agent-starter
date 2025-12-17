# Claude Code Hooks

This directory contains production-ready hooks for your Claude Code setup.

## Available Hooks

### 1. **TOON Validator** (`toon-validator.sh`)
Validates TOON format syntax after writing/editing `.toon` files.

- **Event**: `PostToolUse`
- **Triggers**: Edit, Write operations on `*.toon` files
- **Validates**: Header syntax, count validity, field lists
- **Action**: Blocks invalid TOON files

**Example error:**
```
Line 5: Invalid count '0' (must be positive)
✗ TOON validation failed
```

### 2. **Markdown Formatter** (`markdown-formatter.sh`)
Auto-formats markdown files for consistency.

- **Event**: `PostToolUse`
- **Triggers**: Edit, Write operations on `*.md` files
- **Features**:
  - Removes trailing whitespace
  - Ensures proper heading spacing
  - Fixes blank line inconsistencies
  - Ensures files end with newline
- **Action**: Auto-formats (non-blocking)

### 3. **Secret Scanner** (`secret-scanner.sh`)
Prevents accidentally committing sensitive data.

- **Event**: `PreToolUse` (recommended) or `PostToolUse`
- **Triggers**: Edit, Write operations on all files
- **Detects**:
  - AWS Access Keys
  - OpenAI API Keys
  - Google API Keys
  - GitHub Tokens
  - Slack Tokens
  - Private Keys
  - Email:Password combinations
- **Action**: Blocks with warning (can be overridden)

**Example warning:**
```
⚠️  SECURITY WARNING: Potential secrets detected in config.json

  Pattern matched: AKIA[0-9A-Z]{16}...
  Line 42: [REDACTED]

Please review the file and remove any sensitive data.
```

### 4. **File Size Monitor** (`file-size-monitor.sh`)
Enforces size guidelines from CLAUDE.md.

- **Event**: `PostToolUse`
- **Triggers**: Edit, Write operations
- **Limits**:
  - Skills: 900 lines (warning at 600)
  - Commands: 250 lines (warning at 200)
  - General files: warning at 2000 lines
- **Action**: Blocks if over limit, warns if approaching

### 5. **Settings Backup** (`settings-backup.sh`)
Creates timestamped backups of critical config files.

- **Event**: `PreToolUse`
- **Triggers**: Edit operations on:
  - `settings.json`
  - `CLAUDE.md`
  - Any `.claude/**/*.md` file
- **Features**:
  - Timestamped backups: `.backups/filename.20241116_143022.bak`
  - Keeps last 10 backups per file
  - Auto-cleanup of old backups
- **Action**: Non-blocking backup

## Configuration

### Option 1: Enable All Hooks

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/settings-backup.sh"
          },
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/secret-scanner.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/toon-validator.sh"
          },
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/markdown-formatter.sh"
          },
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/file-size-monitor.sh"
          }
        ]
      }
    ]
  }
}
```

### Option 2: Interactive Setup

Use the `/hooks` command to configure hooks interactively.

### Option 3: User-Level Hooks

Add to `~/.claude/settings.json` to apply across all projects.

## Hook Execution Order

**PreToolUse** (before edit/write):
1. Settings Backup - backs up critical files
2. Secret Scanner - prevents sensitive data

**PostToolUse** (after edit/write):
1. TOON Validator - validates TOON syntax
2. Markdown Formatter - formats markdown
3. File Size Monitor - checks size limits

## Customization

Each hook is a standalone bash script. Customize by editing:

**Add secret patterns** (`secret-scanner.sh`):
```bash
declare -a PATTERNS=(
  "AKIA[0-9A-Z]{16}"
  "YOUR_CUSTOM_PATTERN_HERE"
)
```

**Adjust size limits** (`file-size-monitor.sh`):
```bash
if [[ "$lines" -ge 900 ]]; then  # Change to 1200
```

**Add file types** (`markdown-formatter.sh`):
```bash
if [[ ! "$FILE_PATH" =~ \.(md|markdown|mdx)$ ]]; then
```

## Testing

Test hooks manually:

```bash
# Set environment variables
export TOOL_NAME="Edit"
export TOOL_INPUT_FILE_PATH="/path/to/test/file.md"

# Run hook
./.claude/hooks/markdown-formatter.sh
```

## Security

⚠️ **All hooks execute with your credentials**. Review carefully before enabling.

- Input validation: All variables are properly quoted
- Path safety: Uses absolute paths via `$CLAUDE_PROJECT_DIR`
- Exit codes: Proper error handling throughout
- Temp files: Cleaned up with traps

## Troubleshooting

**Hook not running:**
- Check file permissions: `ls -l .claude/hooks/*.sh`
- Verify configuration in settings.json
- Check matcher patterns match your tool usage

**Hook blocking unexpectedly:**
- Check exit code 2 in stderr output
- Review hook logic for your use case
- Consider making hook non-blocking (allow false positives)

**Performance issues:**
- Hooks run synchronously - keep them fast
- Consider running expensive checks only on specific file types
- Use `PostToolUse` instead of `PreToolUse` when possible

## Environment Variables

Available in all hooks:

- `$TOOL_NAME` - Tool being used (Edit, Write, Read, etc.)
- `$TOOL_INPUT_FILE_PATH` - File being operated on
- `$CLAUDE_PROJECT_DIR` - Project root directory
- `$TOOL_INPUT_*` - Other tool-specific inputs

See [hooks documentation](https://code.claude.com/docs/en/hooks.md) for complete list.

## Examples

**Disable specific hook temporarily:**
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [
        // Comment out or remove to disable
        // {
        //   "type": "command",
        //   "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/markdown-formatter.sh"
        // }
      ]
    }]
  }
}
```

**Run hook on specific tool only:**
```json
{
  "matcher": "Write",  // Only on Write, not Edit
  "hooks": [{ ... }]
}
```

**Add custom hook:**
1. Create script in `.claude/hooks/`
2. Make executable: `chmod +x`
3. Add to settings.json
4. Test thoroughly

## Resources

- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide.md)
- [Hooks Reference](https://code.claude.com/docs/en/hooks.md)
- [This Project's CLAUDE.md](../../CLAUDE.md)
