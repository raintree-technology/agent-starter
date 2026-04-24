# Release Management

Automate version bumping, changelog generation, git tagging, and npm publishing.

**Usage:** `/release [version] [options]`

**Version:**
- `patch` - Bug fixes (1.0.0 → 1.0.1) - Default
- `minor` - New features (1.0.0 → 1.1.0)
- `major` - Breaking changes (1.0.0 → 2.0.0)
- `<semver>` - Explicit version (e.g., 2.1.3)

**Options:**
- `--dry-run` - Show what would happen without executing
- `--skip-tests` - Skip running tests (not recommended)
- `--skip-build` - Skip building project
- `--skip-publish` - Create release but don't publish to npm
- `--tag <name>` - Custom npm tag (default: latest)
- `--message <msg>` - Custom commit message

**Examples:**
- `/release` - Patch release (1.0.0 → 1.0.1)
- `/release minor` - Minor release (1.0.0 → 1.1.0)
- `/release major --dry-run` - Preview major release
- `/release 2.0.0-beta.1 --tag beta` - Pre-release

## Workflow

### 1. Pre-Flight Checks

**Verify repository state:**

```bash
# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
  echo "⚠️  Error: Uncommitted changes detected"
  echo "Please commit or stash changes before releasing"
  git status --short
  exit 1
fi

# Check current branch
BRANCH=$(git branch --show-current)
if [[ "$BRANCH" != "main" && "$BRANCH" != "master" ]]; then
  echo "⚠️  Warning: Not on main/master branch (current: $BRANCH)"
  read -p "Continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Check if branch is up to date with remote
git fetch origin "$BRANCH"
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [[ "$LOCAL" != "$REMOTE" ]]; then
  echo "⚠️  Error: Local branch is not up to date with remote"
  echo "Run: git pull origin $BRANCH"
  exit 1
fi

# Check npm credentials (if publishing)
if [[ ! "$SKIP_PUBLISH" ]]; then
  npm whoami &>/dev/null || {
    echo "⚠️  Error: Not logged in to npm"
    echo "Run: npm login"
    exit 1
  }
fi
```

### 2. Run Quality Checks

**Run comprehensive quality checks:**

```bash
echo "🔍 Running quality checks..."

# Run tests
if [[ ! "$SKIP_TESTS" ]]; then
  echo "  [1/4] Running tests..."
  npm test || {
    echo "❌ Tests failed"
    exit 1
  }
  echo "  ✓ Tests passed"
fi

# Run linter
if command -v eslint &>/dev/null || [[ -f node_modules/.bin/eslint ]]; then
  echo "  [2/4] Running linter..."
  npm run lint --if-present || {
    echo "❌ Linting failed"
    exit 1
  }
  echo "  ✓ Linting passed"
fi

# Type check (if TypeScript project)
if [[ -f tsconfig.json ]]; then
  echo "  [3/4] Type checking..."
  npx tsc --noEmit || {
    echo "❌ Type check failed"
    exit 1
  }
  echo "  ✓ Type check passed"
fi

# Build project
if [[ ! "$SKIP_BUILD" ]]; then
  echo "  [4/4] Building project..."
  npm run build --if-present || {
    echo "❌ Build failed"
    exit 1
  }
  echo "  ✓ Build succeeded"
fi

echo "✅ All quality checks passed"
```

### 3. Determine Version

**Calculate new version:**

```bash
# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")

# Calculate new version based on type
case "$VERSION_TYPE" in
  patch)
    NEW_VERSION=$(npx semver -i patch "$CURRENT_VERSION")
    ;;
  minor)
    NEW_VERSION=$(npx semver -i minor "$CURRENT_VERSION")
    ;;
  major)
    NEW_VERSION=$(npx semver -i major "$CURRENT_VERSION")
    ;;
  [0-9]*)
    # Explicit version provided
    NEW_VERSION="$VERSION_TYPE"
    ;;
  *)
    echo "❌ Invalid version type: $VERSION_TYPE"
    echo "Use: patch, minor, major, or explicit version (e.g., 2.1.3)"
    exit 1
    ;;
esac

# Validate version format
if ! npx semver "$NEW_VERSION" &>/dev/null; then
  echo "❌ Invalid semver version: $NEW_VERSION"
  exit 1
fi

# Show version change
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Release Version"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Current:  $CURRENT_VERSION"
echo "  New:      $NEW_VERSION"
echo "  Type:     $VERSION_TYPE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Confirm if not dry-run
if [[ ! "$DRY_RUN" ]]; then
  read -p "Continue with release? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Release cancelled"
    exit 0
  fi
fi
```

### 4. Generate Changelog

**Auto-generate changelog from commits:**

```bash
echo "📝 Generating changelog..."

# Get commits since last tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [[ -z "$LAST_TAG" ]]; then
  # No previous tags, get all commits
  COMMITS=$(git log --pretty=format:"%h %s" --no-merges)
else
  COMMITS=$(git log "$LAST_TAG"..HEAD --pretty=format:"%h %s" --no-merges)
fi

# Categorize commits
BREAKING=()
FEATURES=()
FIXES=()
DOCS=()
CHORES=()
PERF=()
REFACTOR=()
TESTS=()

while IFS= read -r commit; do
  HASH=$(echo "$commit" | awk '{print $1}')
  MSG=$(echo "$commit" | cut -d' ' -f2-)

  case "$MSG" in
    "BREAKING CHANGE"*|"!"*)
      BREAKING+=("- $MSG ($HASH)")
      ;;
    feat*|"add "*|"implement "*)
      FEATURES+=("- $MSG ($HASH)")
      ;;
    fix*|"resolve "*|"patch "*)
      FIXES+=("- $MSG ($HASH)")
      ;;
    docs*|"update README"*|"add documentation"*)
      DOCS+=("- $MSG ($HASH)")
      ;;
    perf*|"optimize "*|"improve performance"*)
      PERF+=("- $MSG ($HASH)")
      ;;
    refactor*|"restructure "*|"cleanup "*)
      REFACTOR+=("- $MSG ($HASH)")
      ;;
    test*|"add tests"*)
      TESTS+=("- $MSG ($HASH)")
      ;;
    *)
      CHORES+=("- $MSG ($HASH)")
      ;;
  esac
done <<< "$COMMITS"

# Build changelog entry
CHANGELOG_ENTRY="# v$NEW_VERSION ($(date +%Y-%m-%d))

"

if [[ ${#BREAKING[@]} -gt 0 ]]; then
  CHANGELOG_ENTRY+="## ⚠️  BREAKING CHANGES

${BREAKING[*]}

"
fi

if [[ ${#FEATURES[@]} -gt 0 ]]; then
  CHANGELOG_ENTRY+="## ✨ Features

${FEATURES[*]}

"
fi

if [[ ${#FIXES[@]} -gt 0 ]]; then
  CHANGELOG_ENTRY+="## 🐛 Bug Fixes

${FIXES[*]}

"
fi

if [[ ${#PERF[@]} -gt 0 ]]; then
  CHANGELOG_ENTRY+="## ⚡ Performance

${PERF[*]}

"
fi

if [[ ${#REFACTOR[@]} -gt 0 ]]; then
  CHANGELOG_ENTRY+="## ♻️  Refactoring

${REFACTOR[*]}

"
fi

if [[ ${#DOCS[@]} -gt 0 ]]; then
  CHANGELOG_ENTRY+="## 📚 Documentation

${DOCS[*]}

"
fi

if [[ ${#TESTS[@]} -gt 0 ]]; then
  CHANGELOG_ENTRY+="## 🧪 Tests

${TESTS[*]}

"
fi

if [[ ${#CHORES[@]} -gt 0 ]]; then
  CHANGELOG_ENTRY+="## 🔧 Chores

${CHORES[*]}

"
fi

# Prepend to CHANGELOG.md
if [[ -f CHANGELOG.md ]]; then
  # Insert after header (line 1)
  {
    head -n 1 CHANGELOG.md
    echo ""
    echo "$CHANGELOG_ENTRY"
    tail -n +2 CHANGELOG.md
  } > CHANGELOG.md.tmp
  mv CHANGELOG.md.tmp CHANGELOG.md
else
  # Create new CHANGELOG.md
  echo "# Changelog

All notable changes to this project will be documented in this file.

$CHANGELOG_ENTRY" > CHANGELOG.md
fi

echo "✓ Changelog updated"
```

### 5. Update Version

**Bump version in all files:**

```bash
echo "📦 Updating version to $NEW_VERSION..."

# Update package.json
npm version "$NEW_VERSION" --no-git-tag-version

# Update version in other files if they exist
if [[ -f package-lock.json ]]; then
  # Update lockfile version
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
    pkg.version = '$NEW_VERSION';
    fs.writeFileSync('package-lock.json', JSON.stringify(pkg, null, 2) + '\n');
  "
fi

# Update version in README badges if present
if grep -q "version-.*-blue.svg" README.md 2>/dev/null; then
  sed -i.bak "s/version-[0-9.]*-blue/version-$NEW_VERSION-blue/g" README.md
  rm README.md.bak
fi

echo "✓ Version updated in all files"
```

### 6. Create Git Tag and Commit

**Commit changes and create tag:**

```bash
if [[ "$DRY_RUN" ]]; then
  echo ""
  echo "🔍 DRY RUN - Would execute:"
  echo "  git add package.json package-lock.json CHANGELOG.md README.md"
  echo "  git commit -m 'chore(release): v$NEW_VERSION'"
  echo "  git tag -a v$NEW_VERSION -m 'Release v$NEW_VERSION'"
  echo "  git push origin $BRANCH --tags"
  exit 0
fi

echo "📝 Committing changes..."

# Stage files
git add package.json package-lock.json CHANGELOG.md README.md

# Create commit
if [[ -n "$CUSTOM_MESSAGE" ]]; then
  COMMIT_MSG="$CUSTOM_MESSAGE"
else
  COMMIT_MSG="chore(release): v$NEW_VERSION"
fi

git commit -m "$COMMIT_MSG"

# Create annotated tag
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

echo "✓ Changes committed and tagged"

# Push to remote
echo "📤 Pushing to remote..."
git push origin "$BRANCH" --tags

echo "✓ Pushed to remote"
```

### 7. Publish to npm (Optional)

**Publish package:**

```bash
if [[ "$SKIP_PUBLISH" ]]; then
  echo ""
  echo "⏭️  Skipping npm publish (--skip-publish)"
  echo ""
  echo "To publish manually:"
  echo "  npm publish --tag ${NPM_TAG:-latest}"
  exit 0
fi

echo "📦 Publishing to npm..."

# Publish with specified tag
if [[ -n "$NPM_TAG" ]]; then
  npm publish --tag "$NPM_TAG"
else
  npm publish
fi

echo "✓ Published to npm"
```

### 8. Create GitHub Release (Optional)

**Create GitHub release with changelog:**

```bash
if command -v gh &>/dev/null; then
  echo "🚀 Creating GitHub release..."

  # Extract changelog for this version
  RELEASE_NOTES=$(echo "$CHANGELOG_ENTRY" | sed '1d') # Remove version header

  # Create release
  gh release create "v$NEW_VERSION" \
    --title "v$NEW_VERSION" \
    --notes "$RELEASE_NOTES"

  echo "✓ GitHub release created"
else
  echo "⏭️  Skipping GitHub release (gh CLI not installed)"
  echo "Install: brew install gh"
fi
```

### 9. Post-Release Tasks

**Optional post-release automation:**

```bash
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Release Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Version:    v$NEW_VERSION"
echo "  Tag:        v$NEW_VERSION"
echo "  Branch:     $BRANCH"
if [[ ! "$SKIP_PUBLISH" ]]; then
  echo "  npm:        https://npmjs.com/package/$(node -p 'require("./package.json").name')/v/$NEW_VERSION"
fi
if command -v gh &>/dev/null; then
  REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
  echo "  GitHub:     https://github.com/$REPO/releases/tag/v$NEW_VERSION"
fi
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Suggest next steps
echo "Next steps:"
echo "  • Announce release to users"
echo "  • Update documentation site"
echo "  • Monitor for issues"
echo ""
```

## Error Handling

**Handle common issues:**

```bash
# Network failures
trap 'handle_error $? $LINENO' ERR

handle_error() {
  local exit_code=$1
  local line_number=$2

  echo ""
  echo "❌ Release failed at line $line_number (exit code: $exit_code)"
  echo ""
  echo "Recovery steps:"
  echo "  1. Check error above"
  echo "  2. Fix the issue"
  echo "  3. If git tag was created: git tag -d v$NEW_VERSION"
  echo "  4. If commit was created: git reset HEAD~1"
  echo "  5. Re-run release command"
  echo ""

  exit "$exit_code"
}
```

## Configuration

`.claude/release-config.json`:
```json
{
  "defaultBranch": "main",
  "requireCleanWorkingDirectory": true,
  "requireUpToDate": true,
  "runTests": true,
  "runLint": true,
  "runBuild": true,
  "updateChangelog": true,
  "createGitTag": true,
  "pushToRemote": true,
  "publishToNpm": true,
  "createGitHubRelease": true,
  "npmTag": "latest",
  "commitMessage": "chore(release): v${version}",
  "tagMessage": "Release v${version}",
  "changelogFile": "CHANGELOG.md",
  "versionFiles": [
    "package.json",
    "package-lock.json",
    "README.md"
  ],
  "postReleaseHooks": [
    "npm run docs:build",
    "npm run deploy:docs"
  ]
}
```

## Safeguards

**Built-in safety checks:**

- ✅ Requires clean working directory
- ✅ Requires up-to-date branch
- ✅ Runs tests before release
- ✅ Validates semver format
- ✅ Confirms version bump
- ✅ Dry-run mode available
- ✅ Detailed error recovery instructions

## Best Practices

1. **Always use semver** - Follow semantic versioning
2. **Write good commit messages** - Changelog auto-generation depends on it
3. **Test before releasing** - Never skip tests
4. **Use dry-run first** - Preview changes
5. **Tag in CI** - Automate releases via CI/CD
6. **Document breaking changes** - Use `BREAKING CHANGE:` prefix

## Tips

- Use conventional commits for better changelogs
- Run `/release --dry-run` to preview
- Use pre-release versions for testing (2.0.0-beta.1)
- Keep CHANGELOG.md up to date
- Automate with CI/CD (GitHub Actions, etc.)

## Related Commands

- `/audit-code` - Check for issues before release
- `/optimize` - Ensure code quality before release
- `/convert-to-toon` - Optimize data files

---

**Pro Tip:** Set up GitHub Actions to auto-release on version tags:

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test
      - run: npm publish
```
