# NPM Package Scaffold TODO

## Package Structure

```
claude-starter/
├── package.json
├── bin/
│   └── cli.js                    # npx entry point
├── src/
│   ├── commands/
│   │   ├── init.js               # Initialize new project
│   │   ├── add.js                # Add skills to existing project
│   │   ├── list.js               # List available skills
│   │   └── update.js             # Update installed skills
│   ├── utils/
│   │   ├── copy.js               # File copy with conflict handling
│   │   ├── merge.js              # Merge .claude/ directories
│   │   └── prompts.js            # Interactive prompts
│   └── index.js                  # Main export
├── templates/
│   └── .claude/                  # Current .claude/ contents (moved here)
├── docs/                         # Keep as-is
├── README.md
├── LICENSE
└── CHANGELOG.md
```

---

## Phase 1: Basic Package Setup

- [ ] Create `package.json` with proper metadata
  - name: `create-claude-starter` or `claude-starter`
  - bin entry pointing to `bin/cli.js`
  - files array specifying what to publish
  - keywords for discoverability

- [ ] Move `.claude/` to `templates/.claude/`
  - Update any relative paths if needed
  - Keep TOON binary in templates

- [ ] Create `bin/cli.js`
  - Parse command line args (use `commander` or `yargs`)
  - Route to appropriate command handler
  - Handle `--help` and `--version`

---

## Phase 2: Core Commands

### `npx claude-starter` (default/init)
- [ ] Detect if `.claude/` already exists
- [ ] Prompt for conflict resolution (overwrite/merge/skip)
- [ ] Copy `templates/.claude/` to target directory
- [ ] Print success message with next steps

### `npx claude-starter add <skills...>`
- [ ] Parse skill names from args
- [ ] Validate skill names exist in templates
- [ ] Copy only selected skill directories
- [ ] Handle dependencies (e.g., Shelby requires Aptos base)

### `npx claude-starter list`
- [ ] Read skill directories from templates
- [ ] Display formatted list with descriptions
- [ ] Group by category

### `npx claude-starter update`
- [ ] Compare installed vs template versions
- [ ] Prompt before overwriting
- [ ] Preserve user customizations (merge strategy)

---

## Phase 3: CLI Options

```
Usage: claude-starter [command] [options]

Commands:
  init [dir]           Initialize claude-starter in directory (default: .)
  add <skills...>      Add specific skills to existing setup
  list                 List all available skills
  update               Update installed skills to latest

Options:
  -y, --yes            Skip confirmation prompts
  -f, --force          Overwrite existing files without asking
  --no-toon            Skip TOON utilities
  --no-hooks           Skip hook scripts
  --skills <list>      Comma-separated skills to install
  -v, --version        Show version
  -h, --help           Show help
```

---

## Phase 4: Dependencies

```json
{
  "dependencies": {
    "commander": "^12.0.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0",
    "inquirer": "^9.0.0",
    "fs-extra": "^11.0.0"
  }
}
```

---

## Phase 5: TOON Binary Handling

Options (pick one):

### Option A: Include Pre-compiled Binaries
- [ ] Include `toon-darwin-arm64`, `toon-darwin-x64`, `toon-linux-x64`
- [ ] Detect platform on install, symlink correct binary
- Pros: Works immediately, no build step
- Cons: Larger package size (~1MB per platform)

### Option B: Compile on Postinstall
- [ ] Check if Zig is installed
- [ ] Run `zig build` in postinstall script
- [ ] Fall back to JS implementation if Zig unavailable
- Pros: Smaller package, always fresh build
- Cons: Requires Zig, slower install

### Option C: Optional Binary (Recommended)
- [ ] Ship without binary by default
- [ ] Provide `npx claude-starter build-toon` command
- [ ] JS fallback works out of box
- Pros: Balance of size and functionality
- Cons: Extra step for best performance

---

## Phase 6: Skill Metadata

Add `skill.json` to each skill for programmatic access:

```json
{
  "name": "stripe",
  "description": "Stripe payment processing expert",
  "category": "payments",
  "keywords": ["stripe", "payments", "subscriptions"],
  "dependencies": [],
  "docsUrl": "https://docs.stripe.com",
  "docsSize": "33MB"
}
```

- [ ] Create `skill.json` for all 40 skills
- [ ] Update `list` command to read metadata
- [ ] Enable filtering by category/keyword

---

## Phase 7: Documentation Integration

- [ ] Add `npx claude-starter docs <skill>` command
- [ ] Prompt to install `docpull` if not present
- [ ] Run appropriate docpull command for skill
- [ ] Track which docs are installed locally

---

## Phase 8: Testing

- [ ] Unit tests for copy/merge utilities
- [ ] Integration tests for CLI commands
- [ ] Test on fresh directory
- [ ] Test merge with existing `.claude/`
- [ ] Test on macOS, Linux, Windows

---

## Phase 9: Publishing

- [ ] Create npm account if needed
- [ ] Choose package name (check availability)
  - `claude-starter`
  - `create-claude-starter`
  - `@raintree/claude-starter`
- [ ] Add `.npmignore` or use `files` in package.json
- [ ] Test with `npm pack` and local install
- [ ] Publish: `npm publish`
- [ ] Add GitHub Actions for auto-publish on tag

---

## Phase 10: Post-Launch

- [ ] Add to README: `npx claude-starter` usage
- [ ] Submit to SkillsMP as featured starter
- [ ] Create GitHub release
- [ ] Announce on relevant channels

---

## File Checklist

### New Files to Create
- [ ] `package.json`
- [ ] `bin/cli.js`
- [ ] `src/commands/init.js`
- [ ] `src/commands/add.js`
- [ ] `src/commands/list.js`
- [ ] `src/commands/update.js`
- [ ] `src/utils/copy.js`
- [ ] `src/utils/merge.js`
- [ ] `src/utils/prompts.js`
- [ ] `src/index.js`
- [ ] `.npmignore`
- [ ] `CHANGELOG.md`

### Files to Move
- [ ] `.claude/` -> `templates/.claude/`

### Files to Update
- [ ] `README.md` - Add npm install instructions
- [ ] `CLAUDE.md` - Note package structure change

---

## Example package.json

```json
{
  "name": "create-claude-starter",
  "version": "1.0.0",
  "description": "Production-ready Claude Code configuration with 40+ skills",
  "main": "src/index.js",
  "bin": {
    "claude-starter": "bin/cli.js",
    "create-claude-starter": "bin/cli.js"
  },
  "files": [
    "bin/",
    "src/",
    "templates/",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "claude",
    "claude-code",
    "ai",
    "llm",
    "anthropic",
    "skills",
    "starter",
    "template"
  ],
  "author": "Raintree",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/raintree/claude-starter.git"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "chalk": "^5.3.0",
    "fs-extra": "^11.2.0",
    "inquirer": "^9.2.0",
    "ora": "^8.0.0"
  }
}
```

---

## Quick Start (Minimal Viable Package)

For fastest path to npm:

1. Create `package.json` with bin entry
2. Create `bin/cli.js` that copies `templates/.claude/` to cwd
3. Move `.claude/` to `templates/.claude/`
4. Publish

Everything else can be added incrementally.

---

## Pre-NPM Improvements (See IMPROVEMENTS.md)

Before publishing, consider these architectural improvements:

### Priority 1: Skill Manifest System
- [ ] Add `manifest.json` - central registry of all skills
- [ ] Add `skill.json` to each skill (40 files)
- [ ] Enables programmatic querying, filtering, dependencies

### Priority 2: JSON Schema Validation
- [ ] Create `.claude/schemas/` directory
- [ ] `skill.schema.json` - validate skill structure
- [ ] `command.schema.json` - validate commands
- [ ] `settings.schema.json` - validate settings
- [ ] Add `$schema` references to all JSON files

### Priority 3: Multi-Platform Binaries
- [ ] Compile TOON for darwin-arm64, darwin-x64, linux-x64, linux-arm64
- [ ] Add platform detection in CLI
- [ ] Consider WASM or JS fallback

### Priority 4: Standardize Skill Frontmatter
- [ ] Audit all 40 skills for consistent structure
- [ ] Add `id`, `version`, `category`, `keywords` to all
- [ ] Create migration script for future updates

### Priority 5: Configuration Profiles
- [ ] Create `profiles.json` with preset combinations
- [ ] `web-saas`: stripe, supabase, expo
- [ ] `blockchain`: aptos, shelby, decibel
- [ ] `minimal`: toon-formatter only

---

## Recommended Implementation Order

```
Phase 0: Pre-work (before any npm code)
├── Add skill.json to 5 skills as proof of concept
├── Create manifest.json
├── Add JSON schemas
└── Compile multi-platform TOON binaries

Phase 1: Basic CLI
├── package.json
├── bin/cli.js (minimal)
├── init command (copy all)
└── list command (read manifest.json)

Phase 2: Smart Features
├── add command with dependency resolution
├── Profile support (--profile web-saas)
├── Selective install (--skills stripe,supabase)
└── Conflict handling (merge/overwrite/skip)

Phase 3: Ecosystem
├── update command
├── docs command (docpull integration)
├── outdated command
└── publish command (for community skills)

Phase 4: Polish
├── Test suite
├── GitHub Actions CI/CD
├── Auto-publish on tag
└── Documentation site
```

---

## Decision Log

Track key decisions here:

| Decision | Options | Chosen | Rationale |
|----------|---------|--------|-----------|
| Package name | `claude-starter`, `create-claude-starter`, `@raintree/claude-starter` | TBD | |
| Skill ID format | `stripe`, `stripe-expert`, `raintree/stripe` | TBD | |
| Hierarchy | Keep nested, flatten, or aliases | TBD | |
| TOON binary | Pre-built, compile on install, optional | TBD | |
| Doc embedding | Always external, tier system | TBD | |

---

## Resources

- **IMPROVEMENTS.md** - Full architectural analysis
- **CLAUDE.md** - Current project documentation
- **.claude/DIRECTORY.md** - Complete structure reference
- **docs/creating-components.md** - How to build skills/commands
