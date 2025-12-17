# Claude Code Configuration

This directory contains the complete Claude Code configuration for the **claude-starter** template - a production-ready toolkit with 40 skills, 7 commands, TOON format support, and SkillsMP integration.

---

## 1. What is this?

This **`.claude/`** directory is a drop-in configuration that gives Claude Code:

- **40 auto-activating skills** (Stripe, Supabase, Aptos, Expo, Plaid, etc.)
- **7 slash commands** (TOON format tools + skill marketplace)
- **TOON format support** (30-60% token savings on tabular data)
- **Access to 13,000+ community skills** (via SkillsMP)
- **Documentation pulling** (via docpull from official sources)

**It is not** an application - it's pure configuration that makes Claude smarter about your domain.

---

## 2. Quick Start

### Copy to your project

```bash
# Copy entire .claude/ directory
cp -r claude-starter/.claude /your-project/.claude
cd /your-project

# Pull documentation (optional)
pipx install docpull
docpull https://docs.stripe.com -o .claude/skills/stripe/docs
```

### Try it immediately

```bash
# Convert JSON to TOON (saves 30-60% tokens)
/convert-to-toon data.json

# Analyze token savings without converting
/analyze-tokens api-response.json

# Browse 13,000+ community skills
/discover-skills

# Mention what you need - skills auto-activate:
"How do I integrate Stripe payments?"    # Stripe skill activates
"Build an Expo app with Supabase"        # Expo + Supabase skills activate
"Write an Aptos smart contract"          # Aptos skills activate
```

---

## 3. What's included?

| Component | Count | Details |
|-----------|-------|---------|
| **Skills** | 40 | Auto-activating expertise across 8 domains |
| **Commands** | 7 | TOON tools (5) + marketplace tools (2) |
| **Hooks** | 5 | Optional automation (disabled by default) |
| **Utilities** | 2 | Native Zig TOON encoder/decoder binaries |

### Documentation (pulled separately)

Install docpull and pull what you need:
```bash
pipx install docpull

# Pull documentation for specific skills
docpull https://docs.stripe.com -o .claude/skills/stripe/docs
docpull https://supabase.com/docs -o .claude/skills/supabase/docs
docpull https://docs.expo.dev -o .claude/skills/expo/docs
# See README.md for complete list
```

**Available:**
- **Stripe**: 3,253 files (33MB)
- **Supabase**: 2,616 files (111MB)
- **Expo**: 810 files (11MB)
- **Plaid**: 659 files (15MB)
- **Whop**: 212 files (2.3MB)
- **Claude Code**: 201 files (3.0MB)
- **Anthropic API**: 199 files (3.4MB)
- **Shopify**: 25 files (280KB)

---

## 4. Skills (40 auto-activating)

### How skills work

Skills activate based on conversation keywords:

| Keyword | Skill | Documentation |
|---------|-------|---------------|
| "Stripe API" | Stripe | 3,253 docs on payments |
| "Supabase auth" | Supabase | 2,616 docs on backend |
| "Aptos Move" | Aptos | 150+ docs on blockchain |
| "Expo app" | Expo | 810 docs on React Native |
| "Plaid banking" | Plaid | 659 docs on bank APIs |
| "Whop memberships" | Whop | 212 docs on digital products |
| "convert this data" | TOON | Token optimization tools |

No manual invocation needed. Skills activate based on conversation context.

### Skills by category

**AI & Claude Code (7 skills)**
- Anthropic API, Claude Code CLI, Command Builder, Hook Builder, MCP Expert, Settings Expert, Skill Builder

**Payments & Commerce (3 skills)**
- Stripe (3,253 docs), Whop (212 docs), Shopify (25 docs)

**Banking (5 skills)**
- Plaid (659 docs), Plaid Auth, Plaid Transactions, Plaid Identity, Plaid Accounts

**Blockchain (18 skills)**
- Aptos (150 docs) + 8 sub-skills
- Shelby Protocol (52 docs) + 7 sub-skills
- Decibel (44 docs)

**Backend (1 skill)**
- Supabase (2,616 docs)

**Mobile (5 skills)**
- Expo (810 docs) + 3 sub-skills (EAS Build, EAS Update, Expo Router)
- iOS (4 docs)

**Data (1 skill)**
- TOON Formatter

---

## 5. Commands (7 slash commands)

### TOON Format Tools (5 commands)

```bash
/convert-to-toon <file>    # Full conversion workflow
/toon-encode <file>        # JSON → TOON (fast Zig encoder)
/toon-decode <file>        # TOON → JSON (fast Zig decoder)
/toon-validate <file>      # Check TOON syntax
/analyze-tokens <file>     # Compare JSON vs TOON savings
```

### Skill Marketplace (2 commands)

```bash
/discover-skills [query]         # Browse SkillsMP (13,000+ skills)
/install-skill <url> [--personal] # Install from GitHub
```

**Example workflow:**
```bash
# Find what you need
/discover-skills react testing

# Install it
/install-skill https://github.com/user/repo/blob/main/skill.md

# Use it (auto-activates based on context)
"How do I test React components?"
```

---

## 6. TOON Format

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
- Arrays with **5+ items**
- Objects with **60%+ field uniformity**
- API responses, logs, metrics, benchmarks

**Don't use TOON for:**
- Small arrays (<5 items)
- Non-uniform data (<60% same fields)

### Tools

- **Native Zig binaries** (357KB, 20x faster than JS)
- **5 slash commands** (see section 5)
- **Complete spec** in `skills/toon-formatter/docs/toon-guide.md`

---

## 7. Customization

### Add your own skills

**Option 1: Use SkillsMP**
```bash
/discover-skills [topic]
/install-skill <url>
```

**Option 2: Use the Skill Builder**
```bash
"Create a skill for [your domain]"
# The Skill Builder skill auto-activates
```

**Option 3: Manual creation**
```bash
# Project-level
touch .claude/skills/your-domain/skill.md

# Personal (all projects)
touch ~/.claude/skills/your-skill.md
```

### Add your own commands

**Use the Command Builder:**
```bash
"Create a slash command for [your workflow]"
# The Command Builder skill auto-activates
```

**Or create manually:**
```bash
touch .claude/commands/your-command.md
# Test it:
/your-command [arguments]
```

### Enable hooks (optional)

**Edit `settings.json`:**
```json
{
  "hooks": {
    "enabled": true,
    "allowedHooks": ["file-size-monitor", "security-scanner"]
  }
}
```

**Review hook scripts first:**
- `hooks/file-size-monitor.sh` - Warns about large files
- `hooks/markdown-formatter.sh` - Auto-formats markdown
- `hooks/pre-commit-validator.sh` - Validates before commits
- `hooks/security-scanner.sh` - Scans for security issues
- `hooks/test-runner.sh` - Runs tests after changes

---

## 8. Configuration

### Settings files

```
settings.json           # Active configuration
settings.json.example   # Template
settings.local.json     # Local overrides (gitignored)
```

### Common settings

```json
{
  "defaultModel": "sonnet",        // Default model selection
  "toonMode": "aggressive",        // TOON auto-conversion behavior
  "hooks": {
    "enabled": false               // Enable automation hooks
  }
}
```

### Ask the Settings Expert

```bash
"How do I configure [setting]?"
# The Settings Expert skill auto-activates
```

---

## 9. Security

### Skill installation

**Always review before installing:**
1. Check repository reputation
2. Verify maintainer identity
3. Inspect skill content
4. Test in isolation first

### Hooks

**Disabled by default** for safety:
- Review hook scripts in `hooks/`
- Test behavior before enabling
- Monitor hook output for issues

### Documentation

**Pre-downloaded and local:**
- No external API calls required
- Verified and curated content
- Works completely offline

---

## 10. Resources

### Complete Documentation

**[DIRECTORY.md](./DIRECTORY.md)** - Complete reference for all 40 skills, 7 commands, 5 hooks, and utilities

**[../docs/](../docs/)** - Template usage guides:
- `README.md` - How to use this template
- `creating-components.md` - Build skills, commands, hooks
- `examples.md` - Copy-paste templates
- `FAQ.md` - Common questions

### External Resources

**Claude Code**
- Documentation: https://code.claude.com/docs
- Skills Guide: https://code.claude.com/docs/skills
- Commands Guide: https://code.claude.com/docs/commands

**SkillsMP**
- Website: https://skillsmp.com
- Browse: 13,000+ community skills
- Categories: Development, Tools, Data & AI, DevOps, Business

**TOON Format**
- Website: https://toonformat.dev
- Specification: https://github.com/toon-format/spec
- Local Docs: `skills/toon-formatter/docs/toon-guide.md`

### Getting Help

**Need help with:**
- **Claude Code** → Ask the Claude Code Expert skill
- **Skills** → Ask the Skill Builder skill
- **Commands** → Ask the Command Builder skill
- **Hooks** → Ask the Hook Builder skill
- **Settings** → Ask the Settings Expert skill
- **TOON** → See `skills/toon-formatter/docs/toon-guide.md`

**Report issues:**
- Claude Code: https://github.com/anthropics/claude-code/issues
- This template: Create issue in your fork/repo

---

## Summary

**This `.claude/` directory provides domain expertise for Claude Code.**

| What | Why |
|------|-----|
| **40 skills** | Auto-activating domain knowledge |
| **Doc script** | Pull latest from official sources |
| **7 commands** | TOON tools + marketplace access |
| **TOON format** | 30-60% token savings |
| **13,000+ skills** | Community marketplace |

Copy the directory to add expertise to any project. Pull docs separately as needed.

---

