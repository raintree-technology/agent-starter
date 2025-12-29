# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## 1. What is this repository?

**claude-starter** is a **template repository** - a production-ready starting point for building your own Claude Code configuration.

**Purpose:**
- Drop into any project to give Claude domain expertise
- 40+ pre-built skills across AI, APIs, blockchain, backend, frontend
- TOON format support for 30-60% token savings on large datasets
- Clean template for building your own skills and commands
- Documentation pulled separately (not included in repo)

**This is NOT:**
- An application to run
- A library or framework
- Code to import

**This IS:**
- Configuration for Claude Code
- A collection of expertise (skills)
- Token optimization tools (TOON)
- A template you can learn from and extend

---

## 2. Complete Documentation

For complete documentation, see:

- **[`.claude/README.md`](.claude/README.md)** - Quick start, installation, usage guide
- **[`.claude/DIRECTORY.md`](.claude/DIRECTORY.md)** - Complete reference documentation
- **[`/docs/`](docs/)** - How to build skills, commands, hooks

---

## 3. Directory Structure

```
claude-starter/
├── docs/                # Template usage guides
│   ├── creating-components.md
│   ├── examples.md
│   └── FAQ.md
│
├── .claude/             # Claude Code configuration
│   ├── skills/          # 40 auto-invoked skills
│   ├── commands/        # 7 slash commands
│   ├── hooks/           # 5 automation hooks
│   ├── utils/toon/      # TOON format tools
│   └── settings files
│
├── CLAUDE.md            # This file
└── README.md            # Project overview
```

---

## 4. The `.claude/` Directory

### What's in it

**40 Skills** - Auto-invoked knowledge domains organized into 10 categories:
- **anthropic/** - AI & Claude Code (7 skills)
- **aptos/** - Blockchain & Shelby Protocol (17 skills)
- **decibel/** - On-chain trading (1 skill)
- **plaid/** - Banking API (5 skills)
- **shopify/** - E-commerce platform (1 skill)
- **stripe/** - Payments (1 skill)
- **supabase/** - Backend (1 skill)
- **whop/** - Digital products platform (1 skill)
- **expo/** - React Native (4 skills)
- **ios/** - iOS development (1 skill)
- **toon-formatter/** - Token optimization (1 skill)

**Documentation** - NOT bundled in repo. Pull separately using `docpull`:
```bash
pipx install docpull
docpull <docs-url> -o .claude/skills/<skill>/docs
```
Available documentation (pull as needed):
- Helius: 200+ files - `docpull https://www.helius.dev/docs -o .claude/skills/helius/docs`
- Stripe: 3,253 files - `docpull https://docs.stripe.com -o .claude/skills/stripe/docs`
- Supabase: 2,616 files - `docpull https://supabase.com/docs -o .claude/skills/supabase/docs`
- Expo: 810 files - `docpull https://docs.expo.dev -o .claude/skills/expo/docs`
- Plaid: 659 files - `docpull https://plaid.com/docs -o .claude/skills/plaid/docs`

**7 Commands** - Slash commands (5 TOON format + 2 skill marketplace):
- `/analyze-tokens` - Compare JSON vs TOON savings
- `/convert-to-toon` - Full conversion workflow
- `/toon-decode` - TOON → JSON
- `/toon-encode` - JSON → TOON
- `/toon-validate` - Format validation
- `/discover-skills` - Browse SkillsMP marketplace
- `/install-skill` - Install skills from GitHub

**5 Hooks** - Post-tool automation scripts (disabled by default)

**TOON Utils** - Native Zig encoder/decoder (357KB binary, 20x faster)

---

## 5. How Skills Work

Skills **auto-activate** based on conversation context:

| Keyword | Skill | Documentation |
|---------|-------|---------------|
| Stripe API, payments | Stripe | 3,253 docs |
| Whop, memberships | Whop | 212 docs |
| Supabase, PostgreSQL | Supabase | 2,616 docs |
| Aptos, Move language | Aptos | 150+ docs |
| Expo, React Native | Expo | 810 docs |
| Plaid, banking | Plaid | 659 docs |
| Shopify, e-commerce | Shopify | 25 docs |
| TOON, token optimization | TOON Formatter | Tools + guide |

**Skills are hierarchically organized:**
- Shelby Protocol is nested under Aptos (decentralized blob storage on Aptos blockchain)
- Decibel is also Aptos-based but separate as a trading platform
- Plaid has 4 sub-skills (Auth, Transactions, Identity, Accounts)
- Expo has 3 sub-skills (EAS Build, EAS Update, Expo Router)

---

## 6. TOON Format

**What is it?**
TOON (Token-Oriented Object Notation) reduces token consumption by **30-60%** for tabular data.

**When to use:**
- Arrays with 5+ items
- Objects with 60%+ field uniformity
- API responses, logs, metrics, benchmarks

**Example:**
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

**Complete specification:** `.claude/utils/toon/toon-guide.md`

---

## 7. Quick Start

### Use skills automatically

Skills activate when relevant keywords are mentioned:

```
User: "How do I create a Stripe subscription?"
Stripe skill activates with 3,253 docs

User: "Build a Whop membership system"
Whop skill activates with 212 docs

User: "This JSON is too big"
TOON formatter activates with optimization tools
```

### Pull documentation (optional)

**Documentation is NOT bundled** - skills include only `skill.md` files. For local docs, use docpull:

```bash
# Install docpull
pipx install docpull

# Pull docs for any skill you need
docpull https://www.helius.dev/docs -o .claude/skills/helius/docs
docpull https://docs.stripe.com -o .claude/skills/stripe/docs
docpull https://supabase.com/docs -o .claude/skills/supabase/docs
```

Each skill's `skill.md` contains the docpull command for that skill.

### Use commands

```bash
/convert-to-toon data.json
/analyze-tokens api-response.json
/discover-skills
```

### Install more skills

```bash
/discover-skills          # Browse 13,000+ skills
/install-skill <url>      # Install from GitHub
```

### Build your own

```bash
# Add skills to .claude/skills/
# Create commands in .claude/commands/
# See /docs/creating-components.md for templates
```

---

## 8. Key Features

### TOON Format Integration
- 30-60% token savings on tabular data
- Compiled Zig encoder/decoder (357KB binary)
- 5 slash commands (convert, encode, decode, validate, analyze)
- Auto-detection skill
- Complete documentation in `.claude/utils/toon/`

### Skill Marketplace Integration
- Browse 13,000+ skills from SkillsMP
- Install skills from GitHub repositories
- 2 slash commands (`/discover-skills`, `/install-skill`)
- Guided installation with security review
- Personal and project-level installation

### Production Ready
- Documentation setup script (pulls latest from official sources)
- Example templates in `/docs`
- Best practices built-in
- Tested and validated
- Clean structure for extension
- Small repo size (no bundled docs)

---

## 9. Working with this Repository

### As a template

Users can:
1. **Use directly** - Clone and use as-is
2. **Copy to project** - `cp -r .claude/ /my-project/`
3. **Pick what they need** - Copy specific skills/commands
4. **Learn from it** - See how skills/commands are structured
5. **Extend it** - Add their own skills/commands

### As a learning resource

The structure demonstrates:
- How to organize skills hierarchically
- How to embed documentation in skills
- How to create slash commands
- How to build automation hooks
- How to integrate external tools (TOON)
- How to connect to marketplaces (SkillsMP)

### When helping users

**Avoid:**
- Creating documentation files (already comprehensive)
- Adding files unless explicitly requested
- Over-engineering solutions
- Proposing changes to code you haven't read

**Do:**
- Read existing files before suggesting modifications
- Use existing skills when they match user needs
- Suggest TOON format for large data files
- Point to `/docs` for how-to guides
- Reference `.claude/DIRECTORY.md` for structure

---

## 10. Important Notes

### Skills organization
- Each skill has its own `skill.md` file
- API documentation lives in `skills/*/docs/`
- Skills can be hierarchical (e.g., `aptos/shelby/`)
- All 40 skills are properly structured and tested

### Documentation location
- Template guides: `/docs/` (how to use claude-starter)
- TOON specification: `.claude/utils/toon/toon-guide.md`
- API docs: `.claude/skills/*/docs/` (NOT bundled - pull with docpull)
- Reference: `.claude/DIRECTORY.md` (complete structure)

### File counts (accurate as of 2025-11-20)
- **40 Skills** (total across all categories)
- **Documentation** (pulled separately via script)
- **7 Commands** (5 TOON + 2 marketplace)
- **5 Hooks** (disabled by default)
- **Documentation** (use `docpull` to pull from official sources)

---

## Resources

**Claude Code:**
- Documentation: https://code.claude.com/docs
- This Template: See `.claude/DIRECTORY.md` for complete structure

**Skills Marketplace:**
- SkillsMP: https://skillsmp.com - Browse 13,000+ community skills
- Commands: `/discover-skills` and `/install-skill <url>`
- Installation: Personal (`~/.claude/skills/`) or project (`.claude/skills/`)

**TOON Format:**
- Official Spec: https://github.com/toon-format/spec
- Website: https://toonformat.dev
- Local Guide: `.claude/utils/toon/toon-guide.md`

---

**Summary:** claude-starter is a production-ready template that gives Claude domain expertise across 40+ areas, TOON token optimization, and a clean pattern for extension. Users can copy the entire `.claude/` directory or pick specific skills they need.
