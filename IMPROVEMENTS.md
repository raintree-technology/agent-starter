# Claude-Starter Improvements & Future-Proofing

A comprehensive analysis of how to make this repository more extensible, maintainable, and useful.

---

## Executive Summary

**Current State:** Well-organized config template with 40 skills, TOON utilities, and good documentation.

**Key Issues:**
1. No programmatic metadata - skills are markdown-only, hard to query
2. Inconsistent skill structure - varying frontmatter, no schema validation
3. No versioning per skill - can't track which skills need updates
4. Documentation coupling - some embedded, some external (inconsistent)
5. No dependency management - skills don't declare relationships
6. No testing framework - can't verify skills work correctly
7. Binary distribution problem - TOON Zig binary is platform-specific

---

## Architecture Improvements

### 1. Skill Manifest System

**Problem:** Skills are just markdown files. No way to programmatically query, filter, or manage them.

**Solution:** Add `manifest.json` at the skill root with full metadata.

```
.claude/skills/
├── manifest.json          # NEW: Central registry of all skills
├── stripe/
│   ├── skill.md
│   └── skill.json         # NEW: Per-skill metadata
├── supabase/
│   ├── skill.md
│   └── skill.json
```

**`manifest.json` (central registry):**
```json
{
  "$schema": "./schemas/manifest.schema.json",
  "version": "2.0.0",
  "skills": [
    {
      "id": "stripe",
      "path": "stripe/skill.md",
      "version": "1.2.0",
      "category": "payments",
      "tags": ["api", "payments", "subscriptions"],
      "dependencies": [],
      "docsRequired": true,
      "docsUrl": "https://docs.stripe.com",
      "docsSize": "33MB"
    },
    {
      "id": "shelby-sdk",
      "path": "aptos/shelby/sdk-developer/skill.md",
      "version": "1.0.0",
      "category": "blockchain",
      "tags": ["aptos", "storage", "sdk"],
      "dependencies": ["aptos", "shelby"],
      "docsRequired": false
    }
  ],
  "categories": {
    "payments": { "description": "Payment processing", "icon": "credit-card" },
    "blockchain": { "description": "Blockchain & Web3", "icon": "link" },
    "backend": { "description": "Backend services", "icon": "server" },
    "mobile": { "description": "Mobile development", "icon": "smartphone" },
    "ai": { "description": "AI & ML", "icon": "brain" }
  }
}
```

**Per-skill `skill.json`:**
```json
{
  "id": "stripe",
  "name": "Stripe Expert",
  "version": "1.2.0",
  "description": "Payment processing, subscriptions, webhooks",
  "category": "payments",
  "keywords": ["stripe", "payments", "subscriptions", "billing", "checkout"],
  "author": "raintree",
  "license": "MIT",
  "dependencies": [],
  "peerDependencies": [],
  "docs": {
    "required": true,
    "source": "https://docs.stripe.com",
    "count": 3253,
    "size": "33MB",
    "lastPulled": null
  },
  "config": {
    "model": "sonnet",
    "tools": ["Read", "Write", "Edit", "Grep", "Glob", "Bash", "WebFetch"]
  },
  "compatibility": {
    "claudeCode": ">=1.0.0"
  }
}
```

**Benefits:**
- Query skills programmatically (`jq '.skills[] | select(.category == "payments")'`)
- Track versions independently
- Enable dependency resolution
- Power CLI commands (`npx claude-starter list --category payments`)
- Enable skill marketplace publishing

---

### 2. JSON Schema Validation

**Problem:** No validation for skill frontmatter or structure. Easy to create malformed skills.

**Solution:** Add JSON schemas for all configuration types.

```
.claude/schemas/
├── skill.schema.json       # Validates skill.md frontmatter + skill.json
├── command.schema.json     # Validates command files
├── hook.schema.json        # Validates hook configuration
├── settings.schema.json    # Validates settings.json
└── manifest.schema.json    # Validates manifest.json
```

**`skill.schema.json`:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "version", "description", "category", "keywords"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "Unique skill identifier (lowercase, hyphens)"
    },
    "name": {
      "type": "string",
      "maxLength": 50
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "description": {
      "type": "string",
      "maxLength": 200
    },
    "category": {
      "enum": ["payments", "blockchain", "backend", "mobile", "ai", "data", "devtools"]
    },
    "keywords": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 3,
      "maxItems": 20
    },
    "dependencies": {
      "type": "array",
      "items": { "type": "string" }
    },
    "config": {
      "type": "object",
      "properties": {
        "model": { "enum": ["sonnet", "opus", "haiku"] },
        "tools": {
          "type": "array",
          "items": { "enum": ["Read", "Write", "Edit", "Grep", "Glob", "Bash", "WebFetch", "Task"] }
        }
      }
    }
  }
}
```

**Validation hook:**
```bash
# .claude/hooks/validate-skill.sh
#!/bin/bash
# Validate skill.json against schema before committing

npx ajv validate -s .claude/schemas/skill.schema.json -d "$FILE_PATH"
```

---

### 3. Dependency Resolution

**Problem:** Shelby depends on Aptos, but there's no way to express or enforce this.

**Solution:** Add dependency graph with resolution.

**In `skill.json`:**
```json
{
  "id": "shelby-sdk",
  "dependencies": ["aptos"],           // Required skills
  "peerDependencies": ["shelby"],      // Recommended skills
  "conflicts": ["old-shelby"]          // Incompatible skills
}
```

**CLI enforcement:**
```bash
# When installing shelby-sdk, also install aptos
npx claude-starter add shelby-sdk
# Output: Installing shelby-sdk (requires: aptos)
# Installing aptos...
# Installing shelby-sdk...
```

**Hierarchy visualization:**
```
aptos (base)
├── move-language
├── move-testing
├── framework
├── shelby (base)
│   ├── shelby-sdk
│   ├── shelby-cli
│   └── shelby-contracts
└── decibel
```

---

### 4. Skill Versioning & Updates

**Problem:** Can't track which skills are outdated or need updates.

**Solution:** Semantic versioning with update checking.

**Version tracking:**
```json
{
  "id": "stripe",
  "version": "1.2.0",
  "changelog": [
    { "version": "1.2.0", "date": "2025-01-15", "changes": ["Added Agentic Commerce section"] },
    { "version": "1.1.0", "date": "2024-12-01", "changes": ["Updated API version to 2024-11-20"] },
    { "version": "1.0.0", "date": "2024-10-15", "changes": ["Initial release"] }
  ],
  "docsVersion": "2024-11-20.acacia"
}
```

**Update command:**
```bash
npx claude-starter outdated
# Output:
# Skill          Current  Latest   Docs Stale
# stripe         1.2.0    1.3.0    Yes (30 days)
# supabase       1.0.0    1.0.0    No
# expo           1.1.0    1.2.0    Yes (7 days)

npx claude-starter update stripe
```

---

### 5. Documentation Strategy

**Problem:** Inconsistent approach - Shelby/Aptos docs are embedded, others require `docpull`.

**Solution:** Standardize on external docs with optional embedding for core skills.

**Three-tier documentation:**

| Tier | Description | Example |
|------|-------------|---------|
| **Core** | Essential, always bundled | Claude Code skill builder templates |
| **Recommended** | Pull on install, small | Anthropic API basics (199 files, 3MB) |
| **External** | Pull on demand, large | Stripe (3,253 files, 33MB) |

**In `skill.json`:**
```json
{
  "docs": {
    "tier": "external",
    "source": "https://docs.stripe.com",
    "pullCommand": "docpull https://docs.stripe.com -o .claude/skills/stripe/docs",
    "size": "33MB",
    "required": false,
    "embedded": []
  }
}
```

**CLI integration:**
```bash
npx claude-starter add stripe --with-docs
# Runs docpull automatically

npx claude-starter docs pull stripe
# Pull docs for already-installed skill
```

---

### 6. Testing Framework

**Problem:** No way to verify skills work correctly or catch regressions.

**Solution:** Add test infrastructure.

```
.claude/
├── tests/
│   ├── skills/
│   │   ├── stripe.test.md       # Test cases for Stripe skill
│   │   └── toon-formatter.test.md
│   ├── commands/
│   │   └── toon-encode.test.sh
│   └── hooks/
│       └── toon-validator.test.sh
├── test-runner.js               # Node-based test runner
└── fixtures/
    ├── sample-api-response.json
    └── sample-transactions.toon
```

**Skill test format (`stripe.test.md`):**
```markdown
# Stripe Skill Tests

## Test: Payment Intent Creation
**Input:** "How do I create a payment intent in Node.js?"
**Expected:** Contains `stripe.paymentIntents.create`
**Expected:** Contains `amount` and `currency` parameters
**Expected:** Shows error handling pattern

## Test: Webhook Verification
**Input:** "How do I verify Stripe webhooks?"
**Expected:** Contains `stripe.webhooks.constructEvent`
**Expected:** Mentions signature verification
**Expected:** Warns about raw body requirement

## Test: Connect Onboarding
**Input:** "How do I onboard a Stripe Connect account?"
**Expected:** Contains `stripe.accounts.create`
**Expected:** Mentions Express, Standard, or Custom account types
```

**Run tests:**
```bash
npx claude-starter test
# Or specific skill:
npx claude-starter test stripe
```

---

### 7. Plugin Architecture

**Problem:** Adding new capabilities requires modifying core files.

**Solution:** Plugin system for extensibility.

```
.claude/
├── plugins/
│   ├── docpull/              # Documentation fetching
│   │   ├── plugin.json
│   │   └── index.js
│   ├── skillsmp/             # Marketplace integration
│   │   ├── plugin.json
│   │   └── index.js
│   └── toon/                 # TOON format support
│       ├── plugin.json
│       └── index.js
```

**`plugin.json`:**
```json
{
  "id": "docpull",
  "name": "Documentation Fetcher",
  "version": "1.0.0",
  "description": "Pull official documentation from source websites",
  "commands": ["docs:pull", "docs:status", "docs:clean"],
  "hooks": [],
  "config": {
    "cacheDir": ".claude/cache/docs",
    "maxAge": "7d"
  }
}
```

**Benefits:**
- Third parties can add functionality
- Core stays minimal
- Easy to enable/disable features

---

### 8. Configuration Profiles

**Problem:** Different projects need different skill combinations.

**Solution:** Named profiles for common setups.

**`profiles.json`:**
```json
{
  "profiles": {
    "web-saas": {
      "description": "Full-stack SaaS with payments",
      "skills": ["stripe", "supabase", "expo"],
      "commands": ["convert-to-toon", "analyze-tokens"],
      "hooks": ["secret-scanner"]
    },
    "blockchain": {
      "description": "Aptos blockchain development",
      "skills": ["aptos", "shelby", "decibel"],
      "commands": [],
      "hooks": []
    },
    "minimal": {
      "description": "Just the essentials",
      "skills": ["toon-formatter"],
      "commands": ["toon-encode", "toon-decode"],
      "hooks": []
    }
  }
}
```

**Usage:**
```bash
npx claude-starter init --profile web-saas
npx claude-starter init --profile blockchain
```

---

### 9. Binary Distribution

**Problem:** TOON Zig binary is darwin-arm64 only. Won't work on Linux or Intel Macs.

**Solution:** Multi-platform binary distribution.

**Option A: Pre-built binaries (recommended)**
```
.claude/utils/toon/bin/
├── toon-darwin-arm64
├── toon-darwin-x64
├── toon-linux-x64
├── toon-linux-arm64
└── toon-windows-x64.exe
```

**Platform detection in CLI:**
```javascript
// bin/cli.js
const os = require('os');
const path = require('path');

function getToonBinary() {
  const platform = os.platform();  // darwin, linux, win32
  const arch = os.arch();          // arm64, x64
  
  const binaryName = `toon-${platform}-${arch}${platform === 'win32' ? '.exe' : ''}`;
  return path.join(__dirname, '../templates/.claude/utils/toon/bin', binaryName);
}
```

**Option B: WASM fallback**
```javascript
// If native binary unavailable, use WASM
const toon = await import('./toon.wasm');
toon.encode(jsonString);
```

**Option C: JS fallback (slower but universal)**
```javascript
// Pure JS implementation as last resort
const { encode, decode } = require('./toon-js');
```

---

### 10. Skill Quality Tiers

**Problem:** All skills treated equally, but quality varies.

**Solution:** Quality tier system with badges.

**Tiers:**
| Tier | Requirements | Badge |
|------|--------------|-------|
| **Verified** | Official docs, tests pass, maintained | `[VERIFIED]` |
| **Community** | Works, some tests, community maintained | `[COMMUNITY]` |
| **Experimental** | New, untested, use with caution | `[EXPERIMENTAL]` |

**In `skill.json`:**
```json
{
  "quality": {
    "tier": "verified",
    "testsPass": true,
    "lastVerified": "2025-01-15",
    "maintainer": "raintree"
  }
}
```

**Display in CLI:**
```bash
npx claude-starter list

[VERIFIED]     stripe         Payment processing (3,253 docs)
[VERIFIED]     supabase       Backend as a service (2,616 docs)
[COMMUNITY]    shopify        E-commerce platform (25 docs)
[EXPERIMENTAL] custom-skill   User-created skill
```

---

## Breaking Changes to Consider

### 1. Skill Frontmatter Standardization

**Current (inconsistent):**
```yaml
---
name: stripe-expert
description: ...
allowed-tools: Read, Write, Edit
model: sonnet
---
```

**Proposed (standardized):**
```yaml
---
$schema: "../schemas/skill-frontmatter.schema.json"
id: stripe
name: Stripe Expert
version: 1.2.0
description: ...
tools: [Read, Write, Edit, Grep, Glob, Bash, WebFetch]
model: sonnet
category: payments
keywords: [stripe, payments, subscriptions]
---
```

**Migration:** Provide `npx claude-starter migrate` command.

---

### 2. Directory Restructure

**Current:**
```
.claude/skills/aptos/shelby/sdk-developer/skill.md
```

**Proposed (flatter):**
```
.claude/skills/aptos/skill.md
.claude/skills/aptos-shelby/skill.md
.claude/skills/aptos-shelby-sdk/skill.md
```

**Or keep hierarchy but add aliases:**
```json
{
  "aliases": {
    "shelby": "aptos/shelby/skill.md",
    "shelby-sdk": "aptos/shelby/sdk-developer/skill.md"
  }
}
```

---

## Implementation Priority

### Phase 1: Foundation (Before NPM Publish)
1. Add `skill.json` to all 40 skills
2. Create `manifest.json` registry
3. Add JSON schemas
4. Multi-platform TOON binaries

### Phase 2: CLI & Packaging
5. Build CLI (`bin/cli.js`)
6. Add `init`, `add`, `list`, `update` commands
7. Profile support
8. NPM publish

### Phase 3: Quality & Testing
9. Add test framework
10. Quality tiers
11. Dependency resolution
12. Update checking

### Phase 4: Ecosystem
13. Plugin architecture
14. SkillsMP publishing integration
15. Documentation sync automation
16. Community contribution workflow

---

## File Changes Summary

### New Files
```
.claude/
├── manifest.json                    # Skill registry
├── profiles.json                    # Named profiles
├── schemas/
│   ├── skill.schema.json
│   ├── command.schema.json
│   ├── hook.schema.json
│   ├── settings.schema.json
│   └── manifest.schema.json
├── tests/
│   └── ... (test files)
└── utils/toon/bin/
    ├── toon-darwin-arm64
    ├── toon-darwin-x64
    ├── toon-linux-x64
    └── toon-linux-arm64

# Per skill:
.claude/skills/*/skill.json          # 40 new files
```

### Modified Files
```
.claude/skills/*/skill.md            # Standardized frontmatter (40 files)
.claude/settings.json                # Add $schema reference
```

### Package Files (root)
```
package.json
bin/cli.js
src/commands/*.js
templates/                           # Move .claude/ here
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Time to first use | ~5 min (manual copy) | <30 sec (`npx`) |
| Skill discoverability | Read DIRECTORY.md | `list --search` |
| Update friction | Manual | `update` command |
| Cross-platform | darwin-arm64 only | All major platforms |
| Quality assurance | None | Test suite + CI |
| Community contribution | Clone + PR | `npx claude-starter publish` |

---

## Questions to Resolve

1. **Package name:** `claude-starter` vs `create-claude-starter` vs `@raintree/claude-starter`?
2. **Skill ID format:** `stripe` vs `stripe-expert` vs `raintree/stripe`?
3. **Doc embedding:** Bundle core docs or always external?
4. **Hierarchy:** Keep nested skills or flatten?
5. **Breaking changes:** How to handle migration from current structure?

---

## Next Steps

1. Review this document and decide on key architectural choices
2. Create JSON schemas first (enables validation immediately)
3. Add `skill.json` to 3-5 skills as proof of concept
4. Build minimal CLI with `init` and `list`
5. Test NPM publish with beta version
6. Iterate based on feedback
