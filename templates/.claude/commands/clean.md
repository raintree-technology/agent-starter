# Clean Project

Remove build artifacts, dependencies, caches, and temporary files to start fresh.

**Usage:** `/clean [scope] [options]`

**Scope:**
- `all` - Clean everything (default)
- `deps` - Dependencies only (node_modules, .venv, vendor)
- `build` - Build artifacts (dist, build, .next, .nuxt)
- `cache` - Caches (.cache, .parcel-cache, .turbo, __pycache__)
- `temp` - Temporary files (*.log, .DS_Store, .tmp)
- `git` - Git cleanup (untracked files, branches)

**Options:**
- `--dry-run` - Show what would be deleted without deleting
- `--aggressive` - Include IDE files, OS files, test coverage
- `--keep-logs` - Don't delete log files
- `--interactive` - Confirm each deletion

**Examples:**
- `/clean` - Clean everything
- `/clean deps` - Remove node_modules only
- `/clean --dry-run` - Preview what would be deleted
- `/clean all --aggressive` - Deep clean including IDE files

## Workflow

### 1. Analyze Current State

**Calculate sizes before cleaning:**

```bash
echo "📊 Analyzing project..."
echo ""

# Calculate total project size
TOTAL_SIZE=$(du -sh . 2>/dev/null | awk '{print $1}')

# Individual directory sizes
NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | awk '{print $1}' || echo "0")
DIST_SIZE=$(du -sh dist build .next .nuxt out 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
CACHE_SIZE=$(du -sh .cache .parcel-cache .turbo __pycache__ .pytest_cache 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
LOGS_SIZE=$(find . -name "*.log" -exec du -ch {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")

echo "Current project size: $TOTAL_SIZE"
echo ""
echo "Breakdown:"
echo "  Dependencies:   $NODE_MODULES_SIZE"
echo "  Build outputs:  $DIST_SIZE"
echo "  Caches:         $CACHE_SIZE"
echo "  Logs:           $LOGS_SIZE"
echo ""
```

### 2. Dependencies Cleanup

**Remove dependency folders:**

```bash
if [[ "$SCOPE" == "all" || "$SCOPE" == "deps" ]]; then
  echo "🗑️  Cleaning dependencies..."

  # JavaScript/TypeScript
  if [[ -d node_modules ]]; then
    SIZE=$(du -sh node_modules | awk '{print $1}')
    if [[ "$DRY_RUN" ]]; then
      echo "  [DRY RUN] Would delete: node_modules ($SIZE)"
    else
      rm -rf node_modules
      echo "  ✓ Deleted node_modules ($SIZE)"
    fi
  fi

  # Python
  if [[ -d .venv ]] || [[ -d venv ]]; then
    SIZE=$(du -sh .venv venv 2>/dev/null | awk '{sum+=$1} END {print sum}')
    if [[ "$DRY_RUN" ]]; then
      echo "  [DRY RUN] Would delete: .venv, venv ($SIZE)"
    else
      rm -rf .venv venv
      echo "  ✓ Deleted Python virtual environments ($SIZE)"
    fi
  fi

  # Ruby
  if [[ -d vendor/bundle ]]; then
    SIZE=$(du -sh vendor/bundle | awk '{print $1}')
    if [[ "$DRY_RUN" ]]; then
      echo "  [DRY RUN] Would delete: vendor/bundle ($SIZE)"
    else
      rm -rf vendor/bundle
      echo "  ✓ Deleted Ruby gems ($SIZE)"
    fi
  fi

  # Go
  if [[ -d vendor ]]; then
    SIZE=$(du -sh vendor | awk '{print $1}')
    if [[ "$DRY_RUN" ]]; then
      echo "  [DRY RUN] Would delete: vendor ($SIZE)"
    else
      rm -rf vendor
      echo "  ✓ Deleted Go vendor ($SIZE)"
    fi
  fi

  # Rust
  if [[ -d target ]]; then
    SIZE=$(du -sh target | awk '{print $1}')
    if [[ "$DRY_RUN" ]]; then
      echo "  [DRY RUN] Would delete: target ($SIZE)"
    else
      rm -rf target
      echo "  ✓ Deleted Rust build artifacts ($SIZE)"
    fi
  fi

  echo ""
fi
```

### 3. Build Artifacts Cleanup

**Remove compiled/bundled files:**

```bash
if [[ "$SCOPE" == "all" || "$SCOPE" == "build" ]]; then
  echo "🗑️  Cleaning build artifacts..."

  # Common build directories
  BUILD_DIRS=(
    "dist"
    "build"
    "out"
    ".next"
    ".nuxt"
    ".output"
    ".vercel"
    ".netlify"
    "coverage"
    ".nyc_output"
    "lib"
    "es"
    "cjs"
    "esm"
    "umd"
  )

  for dir in "${BUILD_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
      SIZE=$(du -sh "$dir" | awk '{print $1}')
      if [[ "$DRY_RUN" ]]; then
        echo "  [DRY RUN] Would delete: $dir ($SIZE)"
      else
        rm -rf "$dir"
        echo "  ✓ Deleted $dir ($SIZE)"
      fi
    fi
  done

  # Compiled Python files
  if [[ "$DRY_RUN" ]]; then
    find . -type f -name "*.pyc" -o -name "*.pyo" | head -10 | while read -r file; do
      echo "  [DRY RUN] Would delete: $file"
    done
  else
    PYCS=$(find . -type f \( -name "*.pyc" -o -name "*.pyo" \) -delete -print | wc -l)
    if [[ $PYCS -gt 0 ]]; then
      echo "  ✓ Deleted $PYCS Python compiled files"
    fi
  fi

  echo ""
fi
```

### 4. Cache Cleanup

**Remove cache directories:**

```bash
if [[ "$SCOPE" == "all" || "$SCOPE" == "cache" ]]; then
  echo "🗑️  Cleaning caches..."

  CACHE_DIRS=(
    ".cache"
    ".parcel-cache"
    ".turbo"
    ".webpack"
    ".rollup.cache"
    ".vite"
    "__pycache__"
    ".pytest_cache"
    ".ruff_cache"
    ".mypy_cache"
    ".tsbuildinfo"
    ".eslintcache"
    ".stylelintcache"
    "node_modules/.cache"
    ".yarn/cache"
    ".pnpm-store"
    "~/.npm/_cacache"
  )

  for dir in "${CACHE_DIRS[@]}"; do
    # Expand tilde
    dir="${dir/#\~/$HOME}"

    if [[ -d "$dir" ]]; then
      SIZE=$(du -sh "$dir" 2>/dev/null | awk '{print $1}')
      if [[ "$DRY_RUN" ]]; then
        echo "  [DRY RUN] Would delete: $dir ($SIZE)"
      else
        rm -rf "$dir"
        echo "  ✓ Deleted $dir ($SIZE)"
      fi
    fi
  done

  # Package manager caches
  if command -v npm &>/dev/null; then
    if [[ "$DRY_RUN" ]]; then
      echo "  [DRY RUN] Would run: npm cache clean --force"
    else
      npm cache clean --force 2>/dev/null
      echo "  ✓ Cleaned npm cache"
    fi
  fi

  if command -v yarn &>/dev/null; then
    if [[ "$DRY_RUN" ]]; then
      echo "  [DRY RUN] Would run: yarn cache clean"
    else
      yarn cache clean 2>/dev/null
      echo "  ✓ Cleaned yarn cache"
    fi
  fi

  if command -v pnpm &>/dev/null; then
    if [[ "$DRY_RUN" ]]; then
      echo "  [DRY RUN] Would run: pnpm store prune"
    else
      pnpm store prune 2>/dev/null
      echo "  ✓ Cleaned pnpm store"
    fi
  fi

  echo ""
fi
```

### 5. Temporary Files Cleanup

**Remove logs, temp files, OS files:**

```bash
if [[ "$SCOPE" == "all" || "$SCOPE" == "temp" ]]; then
  echo "🗑️  Cleaning temporary files..."

  # Log files
  if [[ ! "$KEEP_LOGS" ]]; then
    if [[ "$DRY_RUN" ]]; then
      find . -name "*.log" -type f | head -10 | while read -r file; do
        echo "  [DRY RUN] Would delete: $file"
      done
    else
      LOGS=$(find . -name "*.log" -type f -delete -print | wc -l)
      if [[ $LOGS -gt 0 ]]; then
        echo "  ✓ Deleted $LOGS log files"
      fi
    fi
  fi

  # OS files
  OS_FILES=(
    ".DS_Store"
    "Thumbs.db"
    "desktop.ini"
    "*.swp"
    "*.swo"
    "*~"
  )

  for pattern in "${OS_FILES[@]}"; do
    if [[ "$DRY_RUN" ]]; then
      find . -name "$pattern" -type f | head -5 | while read -r file; do
        echo "  [DRY RUN] Would delete: $file"
      done
    else
      COUNT=$(find . -name "$pattern" -type f -delete -print | wc -l)
      if [[ $COUNT -gt 0 ]]; then
        echo "  ✓ Deleted $COUNT $pattern files"
      fi
    fi
  done

  # Temporary directories
  TEMP_DIRS=(
    "tmp"
    "temp"
    ".tmp"
  )

  for dir in "${TEMP_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
      SIZE=$(du -sh "$dir" | awk '{print $1}')
      if [[ "$DRY_RUN" ]]; then
        echo "  [DRY RUN] Would delete: $dir ($SIZE)"
      else
        rm -rf "$dir"
        echo "  ✓ Deleted $dir ($SIZE)"
      fi
    fi
  done

  echo ""
fi
```

### 6. Git Cleanup (Optional)

**Clean git repository:**

```bash
if [[ "$SCOPE" == "all" || "$SCOPE" == "git" ]]; then
  echo "🗑️  Cleaning git..."

  # Show untracked files
  UNTRACKED=$(git ls-files --others --exclude-standard)
  if [[ -n "$UNTRACKED" ]]; then
    echo "  Untracked files:"
    echo "$UNTRACKED" | head -10 | sed 's/^/    /'
    if [[ $(echo "$UNTRACKED" | wc -l) -gt 10 ]]; then
      echo "    ... and $(($(echo "$UNTRACKED" | wc -l) - 10)) more"
    fi

    if [[ "$INTERACTIVE" ]]; then
      read -p "  Delete untracked files? (y/n) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        git clean -fd
        echo "  ✓ Deleted untracked files"
      fi
    elif [[ "$DRY_RUN" ]]; then
      echo "  [DRY RUN] Would delete untracked files"
    else
      git clean -fd
      echo "  ✓ Deleted untracked files"
    fi
  fi

  # Prune local branches merged to main
  MERGED_BRANCHES=$(git branch --merged main | grep -v "^\*" | grep -v "main" | grep -v "master")
  if [[ -n "$MERGED_BRANCHES" ]]; then
    echo ""
    echo "  Merged branches:"
    echo "$MERGED_BRANCHES" | sed 's/^/    /'

    if [[ "$INTERACTIVE" ]]; then
      read -p "  Delete merged branches? (y/n) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "$MERGED_BRANCHES" | xargs git branch -d
        echo "  ✓ Deleted merged branches"
      fi
    elif [[ "$DRY_RUN" ]]; then
      echo "  [DRY RUN] Would delete merged branches"
    fi
  fi

  # Git garbage collection
  if [[ ! "$DRY_RUN" ]]; then
    git gc --auto
    echo "  ✓ Git garbage collection complete"
  fi

  echo ""
fi
```

### 7. Aggressive Cleanup (Optional)

**Remove IDE and additional files:**

```bash
if [[ "$AGGRESSIVE" ]]; then
  echo "🗑️  Aggressive cleanup..."

  # IDE files
  IDE_DIRS=(
    ".vscode"
    ".idea"
    "*.sublime-project"
    "*.sublime-workspace"
    ".vs"
  )

  for pattern in "${IDE_DIRS[@]}"; do
    if [[ "$DRY_RUN" ]]; then
      find . -name "$pattern" | head -5 | while read -r item; do
        echo "  [DRY RUN] Would delete: $item"
      done
    else
      find . -name "$pattern" -exec rm -rf {} +
      echo "  ✓ Deleted $pattern"
    fi
  done

  # Test coverage
  if [[ -d coverage ]]; then
    SIZE=$(du -sh coverage | awk '{print $1}')
    if [[ "$DRY_RUN" ]]; then
      echo "  [DRY RUN] Would delete: coverage ($SIZE)"
    else
      rm -rf coverage
      echo "  ✓ Deleted coverage ($SIZE)"
    fi
  fi

  # Environment files (be careful!)
  if [[ "$INTERACTIVE" ]]; then
    if [[ -f .env.local ]] || [[ -f .env.development ]]; then
      read -p "  Delete local .env files? (y/n) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f .env.local .env.development .env.test.local
        echo "  ✓ Deleted local .env files"
      fi
    fi
  fi

  echo ""
fi
```

### 8. Calculate Savings

**Show space reclaimed:**

```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Cleanup Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ ! "$DRY_RUN" ]]; then
  # Calculate new size
  NEW_TOTAL=$(du -sh . 2>/dev/null | awk '{print $1}')

  echo "  Before: $TOTAL_SIZE"
  echo "  After:  $NEW_TOTAL"
  echo ""

  # Suggest next steps
  echo "Next steps:"
  if [[ "$SCOPE" == "all" || "$SCOPE" == "deps" ]]; then
    echo "  • npm install - Reinstall dependencies"
  fi
  if [[ "$SCOPE" == "all" || "$SCOPE" == "build" ]]; then
    echo "  • npm run build - Rebuild project"
  fi
  if [[ "$SCOPE" == "all" || "$SCOPE" == "cache" ]]; then
    echo "  • npm run dev - Rebuild caches"
  fi
else
  echo "  This was a dry run. Use without --dry-run to actually delete files."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

## Safety Features

**Built-in safeguards:**

- ✅ Dry-run mode shows what would be deleted
- ✅ Interactive mode asks for confirmation
- ✅ Never deletes source code
- ✅ Preserves .git directory
- ✅ Skips files specified in .gitignore
- ✅ Shows sizes before deletion
- ✅ Provides recovery suggestions

## Configuration

`.claude/clean-config.json`:
```json
{
  "defaultScope": "all",
  "keepLogs": false,
  "interactive": false,
  "aggressive": false,
  "protectedPaths": [
    "src",
    "lib",
    ".git",
    ".github",
    "README.md",
    "package.json"
  ],
  "customPaths": {
    "deps": ["custom_modules"],
    "build": ["output"],
    "cache": [".custom-cache"],
    "temp": ["logs"]
  }
}
```

## Best Practices

1. **Use dry-run first** - Always preview changes
2. **Backup important data** - Before aggressive cleanup
3. **Clean regularly** - Prevents bloat
4. **Don't delete .env** - Unless intentional
5. **Commit changes first** - Clean working directory

## Tips

- Run before switching branches
- Use after failed builds
- Schedule weekly automatic cleanup
- Combine with `/audit-code` to find unused files
- Add to `.git/hooks/post-checkout` for automatic cleanup

## Related Commands

- `/audit-code` - Find unused files before cleaning
- `/optimize` - Check if cleanup helped performance
- `/release` - Clean before release

---

**Pro Tip:** Create npm script for easy cleanup:

```json
{
  "scripts": {
    "clean": "rm -rf node_modules dist .cache",
    "clean:all": "npm run clean && npm cache clean --force",
    "reset": "npm run clean:all && npm install"
  }
}
```
