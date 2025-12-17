# Discover Skills

Browse and search the Claude Skills Marketplace (SkillsMP) for additional skills to enhance your Claude Code setup.

**Usage:** `/discover-skills [search-term]`

**Examples:**
- `/discover-skills` - General guidance on browsing SkillsMP
- `/discover-skills stripe` - Find Stripe-related skills
- `/discover-skills database` - Find database-related skills

## What is SkillsMP?

**SkillsMP** (https://skillsmp.com) is an independent community marketplace aggregating **13,000+ Claude Code skills** from GitHub repositories.

**Key Features:**
- 🔍 AI-powered semantic search
- 📁 13 categories (Development, Tools, Data & AI, DevOps, Business, etc.)
- ⭐ Quality filtering (minimum 2 GitHub stars)
- 🔄 Regular GitHub syncing
- 📊 Repository stats and last-update timestamps

**Note:** SkillsMP is not affiliated with Anthropic - it's a community-driven platform.

## How Skills Work

**Skills are model-invoked** - Claude automatically activates them based on:
- Your request content
- The skill's description and keywords
- The current context

This is different from slash commands which require explicit `/command` invocation.

## Installation Methods

Skills can be installed three ways:

### 1. Personal (~/.claude/skills/)
**Global skills available across all projects**
```bash
# Create directory if needed
mkdir -p ~/.claude/skills

# Download skill
curl -o ~/.claude/skills/skill-name.md \
  https://raw.githubusercontent.com/user/repo/main/skill.md
```

### 2. Project (.claude/skills/)
**Project-specific skills**
```bash
# In your project root
mkdir -p .claude/skills

# Download skill
curl -o .claude/skills/skill-name.md \
  https://raw.githubusercontent.com/user/repo/main/skill.md
```

### 3. Plugin-based
**Coming soon** - Install via Claude Code plugins

## Workflow

### 1. Browse the Marketplace

Visit **https://skillsmp.com** and explore:

**By Category:**
- Development (frameworks, languages, tools)
- Data & AI (ML, data processing, analytics)
- DevOps (CI/CD, Docker, Kubernetes)
- Business (productivity, documentation)
- Tools (utilities, automation)

**By Search:**
- Use semantic search: "payment processing"
- Use keywords: "api testing"
- Filter by popularity, recent updates

### 2. Evaluate Skills

When considering a skill, check:

✅ **GitHub Stats:**
- Star count (quality indicator)
- Recent updates (maintenance status)
- Repository activity

✅ **Description:**
- Clear purpose and use cases
- Keywords that trigger activation
- Examples of when it activates

✅ **Code Review:**
- **Always review skill code before installing**
- Check for security issues
- Verify it matches your needs

### 3. Install the Skill

Use the `/install-skill <url>` command for guided installation, or:

**Quick Install:**
```bash
# Personal (all projects)
curl -o ~/.claude/skills/skill-name.md <github-raw-url>

# Project-specific
curl -o .claude/skills/skill-name.md <github-raw-url>
```

**GitHub Raw URL Format:**
```
https://raw.githubusercontent.com/user/repo/main/path/to/skill.md
```

### 4. Verify Installation

After installing, verify the skill is available:

1. **Check file exists:**
   ```bash
   ls ~/.claude/skills/skill-name.md
   # or
   ls .claude/skills/skill-name.md
   ```

2. **Test activation:**
   - Ask Claude about the skill's domain
   - The skill should auto-activate
   - Check Claude's response mentions the skill

### 5. Manage Your Skills

**List installed skills:**
```bash
# Personal
ls ~/.claude/skills/

# Project
ls .claude/skills/
```

**Update a skill:**
```bash
# Re-download from GitHub
curl -o ~/.claude/skills/skill-name.md <github-raw-url>
```

**Remove a skill:**
```bash
rm ~/.claude/skills/skill-name.md
```

## Search Examples

### Example 1: Find API Skills

**Search:** "API integration payment"

**Potential Results:**
- Stripe API skills
- PayPal integration
- REST API helpers
- OpenAPI/Swagger tools

### Example 2: Find Data Skills

**Search:** "database SQL"

**Potential Results:**
- PostgreSQL skills
- MySQL helpers
- SQL query optimization
- Database migration tools

### Example 3: Find DevOps Skills

**Search:** "Docker Kubernetes deployment"

**Potential Results:**
- Docker Compose helpers
- Kubernetes manifests
- CI/CD pipeline skills
- Infrastructure as Code

## Current claude-starter Skills

This template already includes **40 skills** across 8 domains:

**AI & Claude Code (7):** Anthropic, Claude Code, MCP Expert, Skill/Command/Hook Builders, Settings
**Banking API (5):** Plaid (Auth, Transactions, Identity, Accounts, Base)
**Payments (1):** Stripe
**E-commerce (2):** Shopify, Whop
**Backend (1):** Supabase
**Blockchain (18):** Aptos (10 base skills), Shelby Protocol (8 sub-skills)
**Frontend (5):** Expo (4 sub-skills), iOS
**Data (1):** TOON formatter

See `.claude/DIRECTORY.md` for complete list.

## Tips for Discovery

**1. Start with your stack:**
- Search for frameworks you use (React, Next.js, etc.)
- Look for APIs you integrate (Stripe, Twilio, etc.)
- Find tools you work with (Docker, Git, etc.)

**2. Explore complementary skills:**
- Testing frameworks for your language
- Documentation generators
- Code quality tools

**3. Community favorites:**
- Sort by popularity (star count)
- Check recently updated skills
- Read skill descriptions for activation triggers

**4. Security first:**
- Always review code before installing
- Check repository reputation
- Verify maintainer activity

## Related Commands

- `/install-skill <url>` - Install a skill from GitHub URL
- See `.claude/DIRECTORY.md` - View all installed skills

## Resources

- **SkillsMP:** https://skillsmp.com
- **Claude Code Docs:** https://code.claude.com/docs
- **Skill Creation:** `.claude/skills/ai/skill-builder.md`
