# claude-starter

A starter pack for Claude Code.

Drop it into any project to get 40+ skills, TOON tools, and a clean pattern for extending Claude Code.

[![npm version](https://img.shields.io/npm/v/create-claude-starter.svg)](https://www.npmjs.com/package/create-claude-starter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-%3E%3D1.0.0-blue)](https://claude.com/claude-code)
[![TOON v2.0](https://img.shields.io/badge/TOON-v2.0-brightgreen)](https://toonformat.dev)

---

## Quick Install (NPM)

```bash
# Install to current project
npx create-claude-starter

# Or with specific skills
npx create-claude-starter --skills stripe,supabase

# Or with a profile
npx create-claude-starter --profile web-saas
```

Then pull documentation:
```bash
npx claude-starter docs pull stripe
```

---

## 1. What is this?

**claude-starter** is a pre-configured `.claude/` directory you can copy into any repo to give Claude:

- **40+ expert skills** (Stripe, Whop, Supabase, Aptos, Expo, Shopify, Plaid, etc.)
- **TOON format utilities** (30–60% token savings)
- **Useful commands** (`/convert-to-toon`, `/install-skill`, etc.)
- **A clean template** for building your own skills + commands

**It is not** a library, framework, or application — it's purely configuration for Claude Code.

### Think of it like:

- **`create-next-app`**, but for Claude Code config
- **VS Code extension pack**, but for Claude expertise
- **dotfiles**, but for AI assistance

---

## 2. What can you do with it?

### A) Drop it into any existing project

```bash
cp -r claude-starter/.claude my-app/.claude
cd my-app
```

Adds 40 skills, TOON tools, and commands to Claude.

Skills work immediately with built-in knowledge:
- Mention "Stripe API" → Stripe skill activates
- Mention "Whop memberships" → Whop skill activates
- Mention "convert this" → TOON tools activate

**Optional:** Pull full documentation for comprehensive API reference:
```bash
pipx install docpull
docpull https://docs.stripe.com -o .claude/skills/stripe/docs  # 3,253 files
```

Skills activate based on context without manual invocation.

### B) Use auto-activated skills while coding

Skills activate based on conversation context:

```
You: "How do I create a Stripe subscription?"
Claude: [Activates Stripe skill with built-in knowledge]

You: "Build a Whop membership backend."
Claude: [Activates Whop skill and provides implementation details]
```

**Want comprehensive API docs?** Pull them separately (optional):
```bash
pipx install docpull
docpull https://docs.stripe.com -o .claude/skills/stripe/docs  # 3,253 files
docpull https://supabase.com/docs -o .claude/skills/supabase/docs  # 2,616 files
```

Skills work immediately without docs, but pulling them gives Claude access to complete API references.

### C) Save tokens using TOON format (30–60%)

Built-in commands:
- `/convert-to-toon` - Full conversion workflow
- `/toon-encode` - JSON → TOON
- `/toon-decode` - TOON → JSON
- `/analyze-tokens` - Compare JSON vs TOON savings
- `/toon-validate` - Check syntax

Convert large JSON files, API responses, logs, and configs to compressed TOON format that preserves semantics while using fewer tokens.

Example:
```bash
# Original: 500 lines of JSON
cat api-response.json

# Converted: 200 lines in TOON format (60% fewer tokens)
/convert-to-toon api-response.json
```

### D) Install community skills (13,000+)

Browse or install skills:

```bash
/discover-skills
/install-skill https://github.com/user/skill
```

Add React, Python, databases, security, testing, and more.

### E) Build your own skills & commands

Templates included in `/docs` so you can create:

**Custom Skill**
```bash
# .claude/skills/my-company/skill.md
# Add internal API docs, deployment procedures, company knowledge
```

**Custom Command**
```bash
# .claude/commands/deploy.md
# Automate your deployment workflow
```

Use these to encode internal APIs, deployment workflows, compliance rules, or anything your team frequently uses.

---

## 3. Real-world examples

### Example: Building a membership platform

```bash
cp -r claude-starter/.claude/skills/{stripe,whop,supabase} my-app/.claude/skills/
```

Then ask Claude:
```
"Set up Whop memberships with Stripe payments and a Supabase backend."
```

Claude activates:
- **Whop** - Memberships, payments, courses
- **Stripe** - Payment processing, subscriptions
- **Supabase** - Database, auth, realtime

**Works immediately.** Optionally pull 6,081 documentation files for comprehensive API reference.

### Example: Building on Aptos blockchain

```bash
cp -r claude-starter/.claude/skills/aptos my-app/.claude/skills/
```

Includes:
- **18 Aptos skills** - Move language, smart contracts, dApps
- Built-in knowledge works immediately
- Optional: Pull 150 Aptos docs, 52 Shelby docs, 44 Decibel docs

### Example: Mobile app development

```bash
cp -r claude-starter/.claude/skills/{expo,ios} my-app/.claude/skills/
```

Includes:
- **Expo** (4 skills) - React Native, EAS Build, Update, Router
- **iOS** - Swift, SwiftUI, UIKit
- Built-in knowledge works immediately
- Optional: Pull 810 Expo docs

### Example: Just TOON optimization

```bash
cp -r claude-starter/.claude/utils/toon my-app/.claude/utils/
cp -r claude-starter/.claude/commands/toon* my-app/.claude/commands/
cp -r claude-starter/.claude/skills/toon-formatter my-app/.claude/skills/
```

Token compression tools without the skills.

---

## 4. What's included?

### You get:

| Feature | Details |
|---------|---------|
| **40+ Skills** | Auto-activating expertise across AI, APIs, blockchain, trading, backend, frontend |
| **8,224 Docs** | Stripe (3,253), Supabase (2,616), Expo (810), Plaid (659), Whop (212), and more |
| **TOON Tools** | Native Zig encoder/decoder (357KB binary, 20x faster) |
| **7 Commands** | TOON conversion, skill installation, token analysis |
| **5 Hooks** | Optional automation (disabled by default) |
| **Templates** | Learn how to build your own skills/commands |
| **Marketplace** | Access to 13,000+ community skills |

### You don't get:

- An application to run
- A framework or library
- Code to import

Configuration files, not application code.

---

## 5. Quick Start

### Option 1: NPM (Recommended)

```bash
# Install everything
npx create-claude-starter

# Install with specific skills only
npx create-claude-starter --skills stripe,supabase,expo

# Install with a preset profile
npx create-claude-starter --profile web-saas     # stripe, supabase, expo
npx create-claude-starter --profile blockchain   # aptos, shelby, decibel
npx create-claude-starter --profile minimal      # toon-formatter only
```

**Manage documentation:**
```bash
# Pull docs for specific skills
npx claude-starter docs pull stripe

# Pull all documentation
npx claude-starter docs pull

# Check documentation status
npx claude-starter docs status

# Update stale docs (>7 days old)
npx claude-starter docs update
```

**Other commands:**
```bash
# List all available skills
npx claude-starter list

# Add skills to existing setup
npx claude-starter add expo ios

# Update installed skills
npx claude-starter update
```

### Option 2: Git clone

```bash
git clone https://github.com/yourusername/claude-starter.git
cd claude-starter

# Skills work immediately - just start using Claude
# Ask about Stripe, Whop, Aptos, Supabase - skills auto-activate
```

### Option 3: Copy manually

```bash
cp -r claude-starter/.claude /path/to/your-project/
cd /path/to/your-project

# Skills work immediately - start using Claude
```

### Option 4: Pick what you need

```bash
# Just payment processing
cp -r claude-starter/.claude/skills/{stripe,whop} my-app/.claude/skills/

# Just blockchain
cp -r claude-starter/.claude/skills/aptos my-app/.claude/skills/

# Just TOON optimization
cp -r claude-starter/.claude/utils/toon my-app/.claude/utils/
cp -r claude-starter/.claude/commands/toon* my-app/.claude/commands/
```

---

## 6. How skills work

Skills **auto-activate** based on what you mention:

| Keyword | Skill | Built-in Knowledge |
|---------|-------|-------------------|
| "Stripe API" | Stripe | Payments, subscriptions, webhooks, best practices |
| "Whop memberships" | Whop | Memberships, courses, communities, integrations |
| "Supabase auth" | Supabase | PostgreSQL, auth, realtime, storage, edge functions |
| "Aptos Move" | Aptos | Blockchain, smart contracts, Move language |
| "Expo app" | Expo | React Native, EAS Build, Router, workflows |
| "Plaid bank" | Plaid | Banking APIs, transactions, auth, webhooks |
| "convert this" | TOON | Token optimization tools and format guide |

Skills work immediately with built-in knowledge. **Optional:** Pull full API docs (3,253 Stripe files, 2,616 Supabase files, etc.) using `docpull` for comprehensive reference.

---

## 7. Directory structure

```
claude-starter/
├── docs/                          # Template usage guides
│   ├── README.md                  # How to use this template
│   ├── creating-components.md     # Build skills, commands, hooks
│   ├── examples.md                # Copy-paste templates
│   └── FAQ.md                     # Common questions
│
├── .claude/                       # Claude Code configuration
│   ├── skills/                    # 40 auto-activating skills
│   │   ├── anthropic/            # AI & Claude Code (7 skills)
│   │   ├── aptos/                # Blockchain (17 skills)
│   │   ├── decibel/              # On-chain trading (1 skill)
│   │   ├── plaid/                # Banking API (5 skills)
│   │   ├── shopify/              # E-commerce (1 skill)
│   │   ├── stripe/               # Payments (1 skill)
│   │   ├── supabase/             # Backend (1 skill)
│   │   ├── whop/                 # Digital products (1 skill)
│   │   ├── expo/                 # React Native (4 skills)
│   │   ├── ios/                  # iOS development (1 skill)
│   │   └── toon-formatter/       # Token optimization (1 skill)
│   │
│   ├── commands/                  # 7 slash commands
│   │   ├── analyze-tokens.md
│   │   ├── convert-to-toon.md
│   │   ├── toon-encode.md
│   │   ├── toon-decode.md
│   │   ├── toon-validate.md
│   │   ├── discover-skills.md
│   │   └── install-skill.md
│   │
│   ├── hooks/                     # 5 automation hooks (disabled)
│   │   ├── toon-validator.sh
│   │   ├── markdown-formatter.sh
│   │   ├── secret-scanner.sh
│   │   ├── file-size-monitor.sh
│   │   └── settings-backup.sh
│   │
│   ├── utils/toon/                # TOON v2.0 implementation
│   │   ├── toon-encode           # Pre-built binary (357KB)
│   │   ├── toon-decode           # Pre-built binary
│   │   ├── toon.zig              # Source (601 lines)
│   │   ├── toon-guide.md         # Complete specification
│   │   ├── examples/             # 9 examples
│   │   ├── guides/               # 4 guides
│   │   └── references/           # 4 references
│   │
│   ├── README.md                  # .claude/ quick start
│   ├── DIRECTORY.md               # Complete reference
│   └── settings.json              # Configuration
│
├── CLAUDE.md                      # Instructions for Claude
├── README.md                      # This file
└── LICENSE                        # MIT License
```

---

## 8. Skills by category

### AI & Claude Code (7 skills)
- **Anthropic API** (199 docs) - Messages API, embeddings, prompt caching
- **Claude Code CLI** (201 docs) - Commands, hooks, skills, MCP
- **Command Builder** - Create slash commands
- **Hook Builder** - Create automation hooks
- **MCP Expert** - Model Context Protocol
- **Settings Expert** - Configuration
- **Skill Builder** - Create new skills

### Payments & Commerce (3 skills)
- **Stripe** (3,253 docs) - Payments, subscriptions, webhooks, Connect
- **Whop** (212 docs) - Memberships, courses, communities, payments
- **Shopify** (25 docs) - E-commerce, apps, themes, APIs

### Banking (5 skills)
- **Plaid** (659 docs) - Bank connections, transactions, auth
- **Plaid Auth** - ACH transfers, account verification
- **Plaid Transactions** - Transaction history, sync
- **Plaid Identity** - KYC, identity verification
- **Plaid Accounts** - Account data, balances

### Blockchain (18 skills)
- **Aptos** (150 docs) + 9 sub-skills - Move language, smart contracts, dApps
- **Shelby Protocol** (52 docs) + 7 sub-skills - Decentralized blob storage on Aptos
- **Decibel** (44 docs) - Perpetual futures trading

### Backend (1 skill)
- **Supabase** (2,616 docs) - PostgreSQL, auth, realtime, storage, edge functions

### Mobile (5 skills)
- **Expo** (810 docs) + 3 sub-skills - React Native, EAS Build, EAS Update, Router
- **iOS** (4 docs) - Swift, SwiftUI, UIKit

### Data (1 skill)
- **TOON Formatter** - Token optimization, format detection

---

## 9. TOON Format (Token Optimization)

### What is TOON?

**TOON** (Token-Oriented Object Notation) reduces token consumption by **30-60%** for tabular data.

### Example

```javascript
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

### When to use

**Use TOON for:**
- Arrays with 5+ items
- Objects with 60%+ field uniformity
- API responses, logs, metrics, benchmarks

**Don't use TOON for:**
- Small arrays (<5 items)
- Non-uniform data (<60% same fields)

### Built-in tools

- **Native Zig encoder/decoder** (357KB binary, 20x faster than JS)
- **5 slash commands** (convert, encode, decode, validate, analyze)
- **Complete specification** in `.claude/utils/toon/toon-guide.md`
- **13 passing tests** included

---

## 10. Documentation

- **Quick Start:** `.claude/README.md`
- **Complete Reference:** `.claude/DIRECTORY.md`
- **Build Your Own:** `docs/creating-components.md`
- **Examples:** `docs/examples.md`
- **FAQ:** `docs/FAQ.md`
- **TOON Spec:** `.claude/utils/toon/toon-guide.md`

### Documentation Setup (Optional)

**Skills work immediately without documentation.** They use built-in knowledge to provide guidance, examples, and best practices.

**Want comprehensive API reference?** Pull official docs for detailed endpoint documentation:

**Prerequisites:**
```bash
brew install pipx
pipx install docpull
```

**Pull documentation:**
```bash
# Stripe (3,253 files, 33MB)
docpull https://docs.stripe.com -o .claude/skills/stripe/docs

# Supabase (2,616 files, 111MB)
docpull https://supabase.com/docs -o .claude/skills/supabase/docs

# Expo (810 files, 11MB)
docpull https://docs.expo.dev -o .claude/skills/expo/docs

# Plaid (659 files, 15MB)
docpull https://plaid.com/docs -o .claude/skills/plaid/docs

# Whop (212 files, 2.3MB)
docpull https://docs.whop.com -o .claude/skills/whop/docs

# Claude Code (201 files, 3.0MB)
docpull https://code.claude.com/docs -o .claude/skills/anthropic/claude-code/docs

# Anthropic API (199 files, 3.4MB)
docpull https://docs.anthropic.com -o .claude/skills/anthropic/docs

# Shopify (25 files, 280KB)
docpull https://shopify.dev/docs -o .claude/skills/shopify/docs
```

**Why separate and optional?**
- Skills work immediately with built-in knowledge
- Keeps repo size small (1.7MB vs 200MB)
- Always get latest documentation from official sources
- No copyright/licensing issues
- Pull only what you need

---

## Summary

**claude-starter provides configuration-based expertise for Claude Code.**

It gives your project:

| What | Why |
|------|-----|
| **Expert knowledge** | 40 skills, 8,224 docs |
| **Token compression** | TOON format (30-60% savings) |
| **Workflow automation** | Commands for common tasks |
| **Extensibility** | Build your own skills/commands |
| **Marketplace access** | 13,000+ community skills |

Copy the `.claude/` directory to add domain expertise to any project.

---

## Contributing

Contributions welcome! See [DIRECTORY.md](.claude/DIRECTORY.md) for complete documentation of the structure.

## Trademarks

All third-party trademarks, service marks, and company names referenced in this package are the property of their respective owners. See [TRADEMARKS.md](./TRADEMARKS.md) for details.

This package is not affiliated with, endorsed by, or sponsored by Stripe, Anthropic, Supabase, Expo, Plaid, Shopify, Whop, or any other referenced service provider.

## License

MIT - See [LICENSE](./LICENSE) for details.

---

**Resources:**
- **Claude Code:** https://code.claude.com/docs
- **TOON Format:** https://toonformat.dev
- **SkillsMP:** https://skillsmp.com
