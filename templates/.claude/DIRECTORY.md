# .claude Directory Structure

Complete documentation of all components in the `.claude` directory.

**Last Updated:** 2025-12-28

**Quick Start:** See [README.md](./README.md) for installation and usage guide

---

## Table of Contents

1. [Overview](#overview)
2. [Advanced Features](#advanced-features) ⭐ NEW
3. [Skills](#skills)
4. [Commands](#commands)
5. [Hooks](#hooks)
6. [Utils](#utils)
7. [Workflows](#workflows) ⭐ NEW
8. [Orchestration](#orchestration) ⭐ NEW
9. [Docs](#docs)
10. [Configuration](#configuration)

---

## Overview

The `.claude` directory contains all Claude Code configuration, skills, commands, hooks, utilities, and documentation for the **claude-starter** repository.

**Purpose:** Production-ready template for building your own Claude Code toolkit with built-in TOON format support for 30-60% token optimization on tabular data.

**Directory Tree:**
```
.claude/
├── README.md              # Quick start and overview
├── DIRECTORY.md           # This file - complete documentation
├── commands/              # Slash commands (manual invocation)
│   ├── meta/              # ⭐ Meta-commands (create commands)
│   └── generated/         # ⭐ User-generated commands
├── docs/                  # Documentation and guides
├── hooks/                 # Auto-run scripts on tool use
├── orchestration/         # ⭐ Skill orchestration engine
├── skills/                # Auto-invoked knowledge domains
├── templates/             # ⭐ Command templates
│   └── commands/          # ⭐ 6 command templates
├── utils/                 # Utilities and helpers
│   ├── toon/              # TOON format tools
│   └── workflows/         # ⭐ Workflow execution engine
├── validators/            # ⭐ Command validation system
├── workflows/             # ⭐ YAML workflow definitions
├── command-registry.json  # ⭐ Command metadata registry
├── settings.json          # Active configuration
├── settings.json.example  # Example settings
└── settings.local.json    # Local overrides
```

**Total Statistics:**
- **Skills:** 40 (across 10 categories)
- **Commands:** 14 (11 standard + 3 meta-commands)
- **Hooks:** 6 automation hooks
- **Workflows:** 4 example workflows
- **Templates:** 6 command templates
- **Orchestration Files:** 8 TypeScript modules

---

## Advanced Features

This section documents the three transformative features that make claude-starter the most advanced AI-powered development framework:

### 1. Meta-Command System

**Purpose:** Infinite extensibility - create custom commands from templates

**Location:** `.claude/commands/meta/`

**Features:**
- ✨ Generate commands from 6 proven templates
- ✨ Automatic validation and conflict detection
- ✨ Command registry management
- ✨ Template-based workflow composition

**Meta-Commands:**
1. **/create-command** - Generate new commands interactively
2. **/edit-command** - Modify existing commands
3. **/workflow-compose** - Build YAML workflows

**Templates Available:**
- `basic-prompt.md` - Text-based commands
- `with-arguments.md` - Parameterized commands
- `with-bash.md` - System operations
- `git-workflow.md` - Git automation
- `code-generator.md` - File generation
- `analyzer.md` - Code analysis

**Validation System:**
- JSON schema validation
- Conflict detection
- Reserved name checking
- Automatic registry updates

**Example:**
```bash
# Create custom deployment command
/create-command deploy-staging --template git-workflow

# Edit existing command
/edit-command deploy-staging --description "Deploy to staging with tests"

# Compose workflow from commands
/workflow-compose release-pipeline
```

### 2. Skill Orchestration Layer

**Purpose:** Multi-skill coordination with semantic matching

**Location:** `.claude/orchestration/`

**Features:**
- ✨ Semantic skill matching with embeddings
- ✨ Multi-factor ranking algorithm
- ✨ Automatic workflow planning
- ✨ Inter-skill communication
- ✨ Shared context management

**Components:**
1. **engine.ts** - Main orchestration controller
2. **semantic-matcher.ts** - Embedding-based matching
3. **ranker.ts** - Multi-factor scoring (5 factors)
4. **workflow-planner.ts** - Pattern detection
5. **message-bus.ts** - Inter-skill messaging
6. **context-store.ts** - Shared state
7. **dependency-resolver.ts** - Dependency graph

**Ranking Factors:**
- Semantic match: 35% (embedding similarity)
- Keyword match: 25% (keyword overlap)
- Context relevance: 20% (recent usage)
- User history: 10% (success rates)
- Skill priority: 10% (skill metadata)

**Workflow Patterns:**
- **Sequential** - A → B → C
- **Parallel** - [A, B, C] → merge
- **Hierarchical** - Parent → [Children]
- **Iterative** - A → check → B → check

**Enhanced Skill Metadata:**
```json
{
  "semanticTags": {
    "primary": ["payment_processing"],
    "secondary": ["webhooks"],
    "domains": ["fintech", "saas"]
  },
  "capabilities": {
    "inputs": ["payment_intent"],
    "outputs": ["payment_confirmation"],
    "actions": ["process_payment"]
  },
  "orchestration": {
    "priority": 8,
    "parallelizable": true,
    "estimatedTokens": 5000
  },
  "collaboration": {
    "canProvideDataTo": ["supabase"],
    "canConsumeDataFrom": ["expo"],
    "sharedContext": ["user_id"]
  }
}
```

**Example:**
```
Query: "Build a SaaS app with Stripe payments and Supabase backend"

Orchestrator:
1. Selects: Stripe (0.92), Supabase (0.89), Expo (0.85)
2. Plans: Hierarchical workflow
3. Executes: Database → Payments → Integration
4. Output: Complete integrated codebase
```

### 3. Workflow Composition System

**Purpose:** YAML-based automation workflows

**Location:** `.claude/workflows/`

**Features:**
- ✨ YAML DSL inspired by GitHub Actions
- ✨ Sequential and parallel execution
- ✨ Conditional logic
- ✨ Variable substitution
- ✨ Error handling and rollback
- ✨ Manual checkpoints

**Workflow Engine:**
- `engine.js` - Main executor
- `parser.js` - YAML parser with validation
- `step-runner.js` - Step execution
- `state-manager.js` - Variable substitution
- `logger.js` - Formatted output

**Example Workflows:**

1. **production-release.yml** - Complete release automation
2. **ci-pipeline.yml** - Continuous integration
3. **daily-maintenance.yml** - Automated maintenance
4. **hotfix.yml** - Emergency hotfix workflow

**YAML Features:**
```yaml
# Input parameters
inputs:
  version_type:
    type: string
    allowed: [patch, minor, major]

# Sequential steps
steps:
  - name: "Build"
    bash: npm run build

  - name: "Test"
    bash: npm test

# Parallel execution
  - type: parallel
    steps:
      - bash: npm run lint
      - bash: npm run type-check

# Conditional logic
  - name: "Deploy"
    when: ${{ steps.build.exit_code == 0 }}
    bash: npm run deploy

# Error handling
on_failure:
  - command: /clean build
  - message: "Rollback complete"
```

**Usage:**
```bash
# List workflows
/workflow --list

# Run workflow
/workflow production-release --input version_type=minor

# Preview
/workflow ci-pipeline --dry-run
```

---

## Skills

**Location:** `.claude/skills/`

Skills are auto-invoked when users mention specific keywords. Claude Code automatically activates relevant skills based on conversation context.

### Total Skills: 40

**Organization:** Skills are grouped by domain into 8 top-level categories with sub-skills organized hierarchically:
- **anthropic/** - AI & Claude Code tools (7 skills)
- **aptos/** - Blockchain & Shelby Protocol (18 skills: 10 Aptos base + 8 Shelby)
- **plaid/** - Banking API (5 skills)
- **shopify/** - E-commerce platform (1 skill)
- **stripe/** - Payments (1 skill)
- **supabase/** - Backend (1 skill)
- **whop/** - Digital products platform (1 skill)
- **expo/** - React Native (4 skills)
- **ios/** - iOS development (1 skill)
- **toon-formatter/** - Token optimization (1 skill)

---

### Anthropic & AI Skills (7)

**Path:** `skills/anthropic/`
**Documentation:** `skills/anthropic/docs/` (199 files)

#### 1. Anthropic Expert
**Path:** `skills/anthropic/skill.md`
**Triggers:** Claude API, Anthropic API, Messages API, embeddings, prompt caching
**Purpose:** Expert guidance on Anthropic Claude API integration
**Documentation:** `skills/anthropic/docs/` (199 files)

#### 2. Claude Code Expert
**Path:** `skills/anthropic/claude-code/skill.md`
**Triggers:** Claude Code, claude-code, skills, commands, hooks, MCP
**Purpose:** Expert on Claude Code CLI, configuration, and best practices
**Documentation:** `skills/anthropic/claude-code/docs/` (201 files)

#### 3. Claude Command Builder
**Path:** `skills/anthropic/claude-command-builder/skill.md`
**Triggers:** create command, slash command, build command, new workflow
**Purpose:** Build custom slash commands for Claude Code

#### 4. Claude Hook Builder
**Path:** `skills/anthropic/claude-hook-builder/skill.md`
**Triggers:** create hook, build hook, post-tool validation, hook configuration
**Purpose:** Build custom hooks for Claude Code automation

#### 5. Claude MCP Expert
**Path:** `skills/anthropic/claude-mcp-expert/skill.md`
**Triggers:** MCP, Model Context Protocol, MCP server, context server
**Purpose:** Expert on MCP for extending Claude Code capabilities

#### 6. Claude Settings Expert
**Path:** `skills/anthropic/claude-settings-expert/skill.md`
**Triggers:** settings.json, configuration, Claude Code config, customize
**Purpose:** Expert on Claude Code configuration and settings

#### 7. Claude Skill Builder
**Path:** `skills/anthropic/claude-skill-builder/skill.md`
**Triggers:** create skill, build skill, new skill, skill development
**Purpose:** Build custom skills for Claude Code

### API Skills (7)

#### 8. Plaid Expert
**Path:** `skills/plaid/skill.md`
**Triggers:** Plaid API, bank connection, financial data, transactions
**Purpose:** Expert on Plaid API for financial data integration
**Documentation:** `skills/plaid/docs/` (659 files)

##### Plaid Sub-Skills (4)
- **Plaid Auth** - `skills/plaid/auth/skill.md` - Account verification, ACH transfers
- **Plaid Transactions** - `skills/plaid/transactions/skill.md` - Transaction history, sync
- **Plaid Identity** - `skills/plaid/identity/skill.md` - KYC, identity verification
- **Plaid Accounts** - `skills/plaid/accounts/skill.md` - Account data, balances

#### 9. Stripe Expert
**Path:** `skills/stripe/skill.md`
**Triggers:** Stripe API, payments, subscriptions, checkout
**Purpose:** Expert on Stripe payment processing and subscriptions
**Documentation:** `skills/stripe/docs/` (3,253 files)

#### 10. Shopify Expert
**Path:** `skills/shopify/skill.md`
**Triggers:** Shopify, e-commerce, online store, GraphQL Admin API, Storefront API, Liquid, Hydrogen, checkout, themes
**Purpose:** Comprehensive Shopify development expert for apps, themes, and integrations
**Documentation:** `skills/shopify/docs/` (25 files)

#### 11. Whop Expert
**Path:** `skills/whop/skill.md`
**Name:** `whop-expert`
**Triggers:** Whop, digital products, memberships, courses, communities, membership platform
**Purpose:** Comprehensive Whop platform expert for memberships, payments, courses, and communities
**Documentation:** `skills/whop/docs/` (212 files)

### Backend Skills (1)

#### 12. Supabase Expert
**Path:** `skills/supabase/skill.md`
**Triggers:** Supabase, PostgreSQL, auth, realtime, storage
**Purpose:** Expert on Supabase backend-as-a-service platform
**Documentation:** `skills/supabase/docs/` (2,616 files)

### Blockchain Skills (18)

#### Aptos Blockchain (10)

##### 13. Aptos Expert
**Path:** `skills/aptos/skill.md`
**Triggers:** Aptos blockchain, Move language, Aptos SDK, transactions
**Purpose:** Expert on Aptos blockchain development and Move smart contracts
**Documentation:** `skills/aptos/docs_aptos/` (150 files)

##### 14. Aptos DApp Integration
**Path:** `skills/aptos/dapp-integration/skill.md`
**Triggers:** Aptos dApp, Petra wallet, Aptos wallet, web3 integration
**Purpose:** Building decentralized applications on Aptos

##### 15. Aptos Framework
**Path:** `skills/aptos/framework/skill.md`
**Triggers:** Aptos framework, standard library, coin module, account management
**Purpose:** Aptos standard library and framework modules

##### 16. Aptos Gas Optimization
**Path:** `skills/aptos/gas-optimization/skill.md`
**Triggers:** Aptos gas, gas optimization, transaction optimization, gas profiling
**Purpose:** Optimize gas usage in Aptos transactions

##### 17. Aptos Move Language
**Path:** `skills/aptos/move-language/skill.md`
**Triggers:** Move language, Move syntax, Move resources, Move modules
**Purpose:** Move programming language for Aptos

##### 18. Aptos Move Prover
**Path:** `skills/aptos/move-prover/skill.md`
**Triggers:** Move prover, formal verification, specifications, property testing
**Purpose:** Formal verification of Move smart contracts

##### 19. Aptos Move Testing
**Path:** `skills/aptos/move-testing/skill.md`
**Triggers:** Move testing, unit tests, integration tests, test coverage
**Purpose:** Testing Move smart contracts on Aptos

##### 20. Aptos Object Model
**Path:** `skills/aptos/object-model/skill.md`
**Triggers:** Aptos objects, resources, ownership, transferability
**Purpose:** Aptos object model and resource management

##### 21. Aptos Token Standards
**Path:** `skills/aptos/token-standards/skill.md`
**Triggers:** Aptos token, NFT, fungible asset, digital asset
**Purpose:** Token standards and asset management on Aptos

#### Shelby Protocol (8 skills)

Shelby is a decentralized blob storage protocol on Aptos blockchain.
**Path:** `skills/aptos/shelby/`
**Documentation:** `skills/aptos/shelby/docs_shelby/` (52 files)

---

##### 22. Shelby Protocol Expert
**Path:** `skills/aptos/shelby/skill.md` (base skill)
**Name:** `shelby-expert`
**Triggers:** Shelby Protocol, Shelby storage, decentralized storage, Aptos storage, blob storage
**Purpose:** Decentralized blob storage protocol architecture on Aptos blockchain - coordinates 7 specialized sub-skills

##### 22. Shelby SDK Developer
**Path:** `skills/aptos/shelby/sdk-developer/skill.md`
**Triggers:** ShelbyNodeClient, ShelbyClient, @shelby-protocol/sdk, Shelby upload, Shelby download
**Purpose:** TypeScript SDK for decentralized blob storage on Aptos
**Coverage:**
- Upload/download workflows
- Session management & micropayment channels
- Multipart uploads for large files
- Token economics (APT + ShelbyUSD)
- Error handling & best practices

##### 23. Shelby CLI Assistant
**Path:** `skills/aptos/shelby/cli-assistant/skill.md`
**Triggers:** shelby cli, shelby upload, shelby download, shelby init, shelby account
**Purpose:** Command-line tool for blob storage operations
**Coverage:**
- CLI installation & setup
- Account management (create, list, switch, delete)
- Upload/download commands with all flags
- Context switching (networks)
- Funding accounts (APT & ShelbyUSD)
- Troubleshooting common issues

##### 24. Shelby Smart Contracts
**Path:** `skills/aptos/shelby/smart-contracts/skill.md`
**Triggers:** Shelby smart contract, blob metadata, micropayment channel, Shelby auditing
**Purpose:** Smart contract layer on Aptos blockchain
**Coverage:**
- Blob metadata management
- Micropayment channels for efficient payments
- Auditing system (cryptographic proofs)
- Storage commitments
- Move smart contract patterns
- Transaction workflows

##### 25. Shelby Storage Integration
**Path:** `skills/aptos/shelby/storage-integration/skill.md`
**Triggers:** integrate Shelby, video streaming, AI training data, data analytics, migration
**Purpose:** Integrating Shelby into applications
**Coverage:**
- Use case evaluation (video streaming, AI/ML, analytics)
- Architecture patterns (direct, caching, async, hybrid)
- Migration strategies from S3/GCS
- Cost optimization techniques
- Performance tuning
- Monitoring & observability

##### 26. Shelby Network & RPC Expert
**Path:** `skills/aptos/shelby/network-rpc/skill.md`
**Triggers:** Shelby RPC, storage provider, Cavalier, tile architecture, private network
**Purpose:** Network infrastructure and performance
**Coverage:**
- RPC server architecture
- Storage provider (Cavalier) implementation in C
- Tile architecture & workspaces
- DoubleZero private fiber network
- Performance optimizations (streaming, connection pooling)
- Request hedging & scalability

##### 27. Shelby DApp Builder
**Path:** `skills/aptos/shelby/dapp-builder/skill.md`
**Triggers:** Shelby dApp, Petra wallet, React Shelby, Vue Shelby, browser storage
**Purpose:** Building decentralized applications with Shelby storage
**Coverage:**
- Wallet integration (Petra)
- Browser SDK usage
- React & Vue components
- File upload/download UIs
- Complete dApp examples (gallery, video platform, file sharing)
- Best practices for UX, performance, security

##### 28. Shelby (Legacy Base Skill)
**Path:** `skills/aptos/shelby/skill.md`
**Note:** Base Shelby skill with general protocol knowledge

### Trading & DeFi Skills (included in Blockchain)

Decibel is included in the Aptos blockchain skills count as it runs on Aptos.

#### 29. Decibel Expert
**Path:** `skills/decibel/skill.md`
**Triggers:** decibel, perpetual futures, aptos trading, on-chain trading, decibel sdk, perps, orderbook, twap, market data, trading api
**Purpose:** Expert on Decibel on-chain perpetual futures trading platform on Aptos
**Documentation:** `skills/decibel/docs/` (44 files, 180 KB)
**Coverage:**
- Perpetual futures trading
- TypeScript SDK (`@decibel/sdk`)
- REST API endpoints (user, market data, analytics, vaults)
- WebSocket real-time streams
- TWAP (Time-Weighted Average Price) orders
- Position management
- Account and subaccount operations
- Orderbook architecture
- Move smart contracts on Aptos
- Trading strategies and risk controls

### Frontend Skills (5)

#### 30. Expo Expert
**Path:** `skills/expo/skill.md`
**Triggers:** Expo, React Native, EAS, Expo Go, mobile development
**Purpose:** Expert on Expo framework for React Native development
**Documentation:** `skills/expo/docs/` (810 files)

##### Expo Sub-Skills (3)
- **EAS Build** - `skills/expo/eas-build/skill.md` - Build service for iOS/Android
- **EAS Update** - `skills/expo/eas-update/skill.md` - Over-the-air updates
- **Expo Router** - `skills/expo/expo-router/skill.md` - File-based routing

#### 31. iOS Expert
**Path:** `skills/ios/skill.md`
**Triggers:** iOS, Swift, SwiftUI, UIKit, Xcode, iOS development
**Purpose:** Expert on iOS development with Swift and SwiftUI
**Documentation:** `skills/ios/docs/` (4 files)

### Data Skills (1)

#### 32. TOON Formatter
**Path:** `skills/toon-formatter/skill.md`
**Triggers:** data, array, table, JSON, API response, log, metrics, benchmark
**Purpose:** Auto-applies TOON format for 30-60% token optimization
**Coverage:**
- Detects when TOON is beneficial (≥5 items, ≥60% uniformity)
- Shows token savings automatically
- Aggressive mode: applies by default when criteria met
- Format conversion and validation

---

## Commands

**Location:** `.claude/commands/`

Commands are slash commands that users invoke manually (e.g., `/convert-to-toon`).

### Total Commands: 11 (7 TOON + 2 marketplace + 2 workflow + 2 quality)

#### 1. `/analyze-tokens`
**File:** `commands/analyze-tokens.md`
**Purpose:** Analyze and compare token usage between JSON and TOON formats
**Usage:** `/analyze-tokens <file>`
**Features:**
- Compares JSON vs TOON token counts
- Shows percentage savings
- Estimates API cost reduction
- Identifies optimization opportunities
- No file modification (analysis only)

#### 2. `/convert-to-toon`
**File:** `commands/convert-to-toon.md`
**Purpose:** Convert JSON files to TOON format with full analysis
**Usage:** `/convert-to-toon <file>`
**Features:**
- Full conversion workflow
- Token usage comparison
- Creates .toon output file
- Validates conversion
- Shows savings metrics

#### 3. `/toon-decode`
**File:** `commands/toon-decode.md`
**Purpose:** Decode TOON format back to JSON
**Usage:** `/toon-decode <file>`
**Features:**
- Converts .toon → .json
- Uses compiled Zig decoder
- Validates output
- Preserves data integrity

#### 4. `/toon-encode`
**File:** `commands/toon-encode.md`
**Purpose:** Encode JSON to TOON format
**Usage:** `/toon-encode <file>`
**Features:**
- Converts .json → .toon
- Uses compiled Zig encoder
- Optimizes for token efficiency
- Validates encoding

#### 5. `/toon-validate`
**File:** `commands/toon-validate.md`
**Purpose:** Validate TOON format syntax and structure
**Usage:** `/toon-validate <file>`
**Features:**
- Checks TOON syntax
- Validates structure
- Reports errors with line numbers
- Ensures spec compliance

#### 6. `/discover-skills`
**File:** `commands/discover-skills.md`
**Purpose:** Browse and search Claude Skills Marketplace (SkillsMP) for additional skills
**Usage:** `/discover-skills [search-term]`
**Features:**
- Guidance on browsing SkillsMP (13,000+ skills)
- Search by category or keywords
- Installation instructions (personal vs project)
- Security best practices
- Skill evaluation checklist
- Integration with `/install-skill` command

#### 7. `/install-skill`
**File:** `commands/install-skill.md`
**Purpose:** Install Claude Code skills from GitHub repositories
**Usage:** `/install-skill <github-url> [--personal|--project]`
**Features:**
- URL validation and conversion to raw format
- Skill content preview
- Security review prompts
- Guided installation to `~/.claude/skills/` or `.claude/skills/`
- Automatic filename extraction
- Conflict handling (overwrite/rename)
- Installation verification
- Post-install testing guidance

#### 8. `/audit-code`
**File:** `commands/audit-code.md`
**Purpose:** Run comprehensive code quality audit using knip, vulture, and ast-grep
**Usage:** `/audit-code [options]`
**Features:**
- Detects unused files, dependencies, exports (knip)
- Finds dead Python code (vulture)
- Identifies deprecated patterns and anti-patterns (ast-grep)
- Aggregates findings by priority (Critical, High, Medium, Low)
- Generates actionable recommendations
- Auto-fixes safe issues with `--fix` flag
- Detailed markdown reports with `--report`
- CI mode with `--strict` flag

#### 9. `/optimize`
**File:** `commands/optimize.md`
**Purpose:** Automatically review code changes for optimization opportunities
**Usage:** `/optimize [scope] [options]`
**Features:**
- Performance analysis (algorithms, N+1 queries, memory leaks)
- Security analysis (SQL injection, XSS, CSRF)
- Maintainability analysis (complexity, nesting, duplicates)
- Test coverage gaps identification
- Documentation completeness checks
- Actual benchmarks with `--detailed` flag
- Auto-apply safe fixes with `--fix`
- Review last change, session, file, commit, or branch

#### 10. `/release`
**File:** `commands/release.md`
**Purpose:** Automate version bumping, changelog generation, and npm publishing
**Usage:** `/release [version] [options]`
**Features:**
- Semantic versioning (patch, minor, major)
- Auto-generate changelog from commits
- Run quality checks (tests, lint, type check, build)
- Create git tags and commits
- Push to remote with tags
- Publish to npm with custom tags
- Create GitHub releases
- Dry-run mode to preview changes

#### 11. `/clean`
**File:** `commands/clean.md`
**Purpose:** Remove build artifacts, dependencies, caches, and temporary files
**Usage:** `/clean [scope] [options]`
**Features:**
- Clean dependencies (node_modules, .venv, vendor)
- Remove build artifacts (dist, build, .next, .nuxt)
- Clear caches (.cache, .turbo, __pycache__)
- Delete temporary files (logs, .DS_Store, .tmp)
- Git cleanup (untracked files, merged branches)
- Aggressive mode for IDE files and test coverage
- Shows space reclaimed with before/after sizes
- Dry-run mode to preview deletions

---

## Hooks

**Location:** `.claude/hooks/`

Hooks run automatically after tool use (e.g., after Edit, Write operations). Currently **disabled by default** in settings.json.

### Total Hooks: 6

#### 1. File Size Monitor
**File:** `hooks/file-size-monitor.sh`
**Type:** Post-tool validation
**Triggers on:** Edit, Write
**Purpose:** Monitor and warn about large files
**Features:**
- Checks file size after edits/writes
- Warns if file exceeds threshold (default: 1MB)
- Suggests optimization strategies
- Non-blocking (warning level)

#### 2. Markdown Formatter
**File:** `hooks/markdown-formatter.sh`
**Type:** Post-tool formatting
**Triggers on:** Write, Edit (*.md files)
**Purpose:** Auto-format markdown files
**Features:**
- Formats markdown for consistency
- Fixes common markdown issues
- Ensures proper line breaks
- Validates markdown syntax

#### 3. Secret Scanner
**File:** `hooks/secret-scanner.sh`
**Type:** Post-tool security
**Triggers on:** Write, Edit
**Purpose:** Detect accidentally committed secrets
**Features:**
- Scans for API keys, tokens, passwords
- Checks common secret patterns
- Blocks commits with detected secrets (error level)
- Protects sensitive data

#### 4. Settings Backup
**File:** `hooks/settings-backup.sh`
**Type:** Post-tool backup
**Triggers on:** Edit, Write (settings.json)
**Purpose:** Backup settings.json before changes
**Features:**
- Creates timestamped backups
- Prevents configuration loss
- Keeps last 5 backups
- Easy rollback capability

#### 5. TOON Validator
**File:** `hooks/toon-validator.sh`
**Type:** Post-tool validation
**Triggers on:** Write, Edit (*.toon files)
**Purpose:** Validate TOON format syntax
**Features:**
- Validates TOON syntax after edits
- Uses compiled Zig validator
- Reports errors with line numbers
- Ensures format compliance

#### 6. Auto-Optimize
**File:** `hooks/auto-optimize.sh`
**Type:** Post-tool suggestion
**Triggers on:** Write, Edit (source code files)
**Purpose:** Automatically suggest running optimization checks after code changes
**Features:**
- Tracks changes per session
- Suggests `/optimize` every 5 file changes
- Suggests for large files (100+ lines)
- 10-minute cooldown per file (avoids spam)
- Skips test files and generated code
- Non-blocking informational suggestions

### Hook Configuration

**Enable hooks in `settings.json`:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
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

**See:** `hooks/README.md` for detailed documentation

---

## Utils

**Location:** `.claude/utils/`

Utilities and helper tools. Currently contains TOON format implementation.

### TOON Format Tools

**Path:** `skills/toon-formatter/`

Complete TOON v2.0 implementation with Zig encoder/decoder for 30-60% token savings on tabular data.

#### Binary

**Compiled Zig Binary:**
```
skills/toon-formatter/bin/toon
```

**Commands:**
```bash
# Encode JSON to TOON
toon encode input.json -o output.toon

# Decode TOON to JSON
toon decode input.toon -o output.json

# Validate TOON file
toon validate data.toon
```

#### Documentation

**Main Files:**
- `README.md` - TOON format specification and usage
- `README_ZIG.md` - Zig implementation details
- `INSTALL.md` - Installation and build instructions
- `VERSION.md` - Version history and changelog

**Guides:** `skills/toon-formatter/guides/`
- `encoding.md` - Encoding strategies
- `configuration.md` - Configuration options
- `optimization.md` - Performance optimization
- `migration-v1-to-v2.md` - Migration guide

**Examples:** `skills/toon-formatter/examples/`
- `basic-tabular.md` - Basic tabular data
- `nested-objects.md` - Nested structures
- `inline-arrays.md` - Inline array syntax
- `expanded-lists.md` - Expanded list format
- `escape-sequences.md` - Escaping special characters
- `quoting-rules.md` - Quoting conventions
- `delimiters.md` - Custom delimiters
- `key-folding.md` - Key folding optimization
- `strict-mode.md` - Strict validation mode

**References:** `skills/toon-formatter/references/`
- `abnf-grammar.md` - Formal ABNF grammar
- `test-cases.md` - Test suite
- `compliance-matrix.md` - Spec compliance
- `v2-changelog.md` - Version 2.0 changes

#### Source Code

**Files:**
- `toon.zig` - Complete Zig implementation (encoder + decoder)
- `build.zig` - Zig build configuration
- `test-runner.sh` - Automated test runner
- `enforce-toon.sh` - Enforcement script

**Test Fixtures:** `skills/toon-formatter/test-fixtures/`
- Sample TOON and JSON files for testing

#### What is TOON?

**Token-Oriented Object Notation** reduces token consumption by 30-60% for tabular data.

**When to Use:**
- ✅ Arrays with ≥5 items
- ✅ Objects with ≥60% field uniformity
- ✅ API responses, logs, metrics, benchmarks
- ✅ Database query results

**When NOT to Use:**
- ❌ Deeply nested objects
- ❌ Small arrays (<5 items)
- ❌ Non-uniform data (<60% same fields)

**Example:**
```toon
// JSON: ~120 tokens
[
  {"method": "GET", "path": "/api/users", "auth": "required"},
  {"method": "POST", "path": "/api/users", "auth": "required"}
]

// TOON: ~70 tokens (40% savings)
[2]{method,path,auth}:
  GET,/api/users,required
  POST,/api/users,required
```

---

## Documentation

Template usage guides and references are organized in two locations:

### 1. Template Guides (`/docs/`)

**Location:** `docs/` (root directory)

Documentation for using the claude-starter template.

#### README.md
**Purpose:** Documentation hub and navigation
**Content:**
- Quick start guide
- Component overview
- TOON format introduction
- Links to all documentation

#### FAQ.md
**Purpose:** Frequently asked questions
**Content:**
- Common questions about skills, commands, hooks
- TOON format FAQ
- Troubleshooting tips
- Best practices

#### creating-components.md
**Purpose:** Guide to creating skills, commands, and hooks
**Content:**
- Component structure and templates
- Naming conventions
- Best practices
- Size guidelines
- Testing strategies

#### examples.md
**Purpose:** Copy-paste templates for components
**Content:**
- Complete skill examples (Next.js, Auth, Testing)
- Command examples (Git, Deployment)
- Hook examples (Linting, Security, Formatting)
- Ready-to-use templates

### 2. TOON Format Guide

**Location:** `.claude/skills/toon-formatter/docs/toon-guide.md`

**Purpose:** Complete TOON v2.0 format reference
**Content:**
- Format specification
- Encoding/decoding rules
- Token estimation formulas
- Use cases and examples
- Migration guide

### API Documentation (Pulled Separately)

All API documentation is pulled separately using `docpull` to keep the repository size small and ensure documentation freshness.

**Install docpull:**
```bash
brew install pipx
pipx install docpull
```

**Pull documentation:**
```bash
# Stripe (3,253 files)
docpull https://docs.stripe.com -o .claude/skills/stripe/docs

# Supabase (2,616 files)
docpull https://supabase.com/docs -o .claude/skills/supabase/docs

# Expo (810 files)
docpull https://docs.expo.dev -o .claude/skills/expo/docs

# Plaid (659 files)
docpull https://plaid.com/docs -o .claude/skills/plaid/docs

# Whop (212 files)
docpull https://docs.whop.com -o .claude/skills/whop/docs

# Claude Code (201 files)
docpull https://code.claude.com/docs -o .claude/skills/anthropic/claude-code/docs

# Anthropic API (199 files)
docpull https://docs.anthropic.com -o .claude/skills/anthropic/docs

# Shopify (25 files)
docpull https://shopify.dev/docs -o .claude/skills/shopify/docs
```

**Why separate?**
- Keeps repo size small (1.7MB vs 200MB)
- Always get latest documentation
- No copyright/licensing issues
- Pull only what you need

---

## Configuration

**Location:** `.claude/`

### settings.json
**Current active configuration**

**Default Configuration:**
```json
{
  "hooks": {
    "PostToolUse": []
  },
  "comment": "Hooks are disabled by default."
}
```

**Features:**
- Hooks disabled by default (empty array)
- Minimal configuration
- Easy to customize

### settings.json.example
**Example configuration template**

Shows how to enable hooks and configure Claude Code features.

### settings.local.json
**Local development overrides**

**Purpose:**
- Override settings for local development
- Not committed to version control
- Personal preferences

---

## Usage

### Getting Started

1. **Clone or copy `.claude/` directory:**
   ```bash
   git clone <repo-url>
   # Or copy to your project:
   cp -r .claude /your-project/
   ```

2. **Try TOON commands:**
   ```bash
   /convert-to-toon data.json
   /analyze-tokens api-response.json
   ```

3. **Let skills auto-activate:**
   - Mention "Shelby Protocol" → Shelby skills activate
   - Mention "Stripe API" → Stripe skill activates
   - Mention "data array" → TOON formatter activates

4. **Build your own:**
   - Add skills to `skills/`
   - Create commands in `commands/`
   - Enable hooks in `settings.json`

### Key Features

**✅ Auto-invoked Skills (40)**
- AI & Claude Code: 7 skills
- Banking API: 5 skills (Plaid + sub-skills)
- Payments: 1 skill (Stripe)
- E-commerce: 2 skills (Shopify, Whop)
- Backend: 1 skill (Supabase)
- Blockchain: 18 skills (Aptos 10 + Shelby 8)
- Frontend: 5 skills (Expo 4 + iOS)
- Data: 1 skill (TOON formatter)

**✅ TOON Format Integration**
- 30-60% token savings on tabular data
- Compiled Zig encoder/decoder
- 5 TOON slash commands
- Auto-detection skill
- Complete documentation

**✅ Production Ready**
- Comprehensive documentation
- Example templates
- Best practices built-in
- Tested and validated

---

## Statistics

- **Total Skills:** 40
- **Total Commands:** 11 (7 TOON + 2 marketplace + 2 workflow + 2 quality)
- **Total Hooks:** 6 (5 disabled by default + 1 auto-optimize)
- **Total Utils:** 1 (TOON format tools)
- **Documentation Files (pulled separately):**
  - Stripe: 3,253 files
  - Supabase: 2,616 files
  - Expo: 810 files
  - Plaid: 659 files
  - Whop: 212 files
  - Claude Code: 201 files
  - Anthropic: 199 files
  - Aptos: 150 files
  - Shelby: 52 files
  - Decibel: 45 files
  - Shopify: 25 files
  - iOS: 4 files

---

## Contributing

This is a starter template. Build on top:

1. **Add Skills** for your frameworks/libraries
2. **Create Commands** for your workflows
3. **Enable Hooks** for your quality standards (optional)
4. **Add Documentation** for your team
5. **Use TOON format** in your docs to save tokens

**Zero dependencies required** - everything works through instructions!

---

## Resources

### Claude Code
- **Documentation:** https://code.claude.com/docs
- **This Template:** See `docs/README.md`

### TOON Format
- **Specification:** `skills/toon-formatter/README.md`
- **Official Repo:** https://github.com/toon-format/spec
- **Website:** https://toonformat.dev

---

**Template Version:** 2.0
**Last Updated:** 2025-11-17
**Repository:** claude-starter
