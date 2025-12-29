# Claude Starter Plugin Marketplace

This directory contains the plugin marketplace configuration for claude-starter, making it easy for users to install the entire collection of 40+ skills, commands, and workflows with a single command.

## For Users: Installation

### Install Everything
```bash
/plugin marketplace add raintree-technology/claude-starter
```

### Install Specific Categories
```bash
# Just payment skills
/plugin marketplace add raintree-technology/claude-starter/stripe-payments

# Just mobile development
/plugin marketplace add raintree-technology/claude-starter/expo-mobile

# Just blockchain/Aptos
/plugin marketplace add raintree-technology/claude-starter/aptos-blockchain

# Just automation tools
/plugin marketplace add raintree-technology/claude-starter/meta-commands
/plugin marketplace add raintree-technology/claude-starter/workflows
```

## What's Included

### Skills (40 total across 10 categories)
- **AI & Claude Code** (7 skills): claude-code, skill-builder, command-builder, hook-builder, settings-expert, mcp-expert
- **Payments**: Stripe
- **Backend**: Supabase
- **Banking**: Plaid (5 skills)
- **Mobile**: Expo (4 skills), iOS
- **Blockchain**: Aptos (17 skills including Shelby Protocol)
- **E-commerce**: Shopify, Whop
- **Optimization**: TOON Formatter

### Commands (14 total)
- 5 TOON format commands
- 2 marketplace commands
- 3 meta-commands
- 4 debugging commands

### Workflows (4 total)
- production-release
- ci-pipeline
- daily-maintenance
- hotfix

### Systems
- Orchestration engine
- Validation system
- Command registry

## For Developers: Publishing

This plugin marketplace configuration makes claude-starter discoverable in multiple ways:

### 1. Via Claude Code Plugin System
Users can install with `/plugin marketplace add`

### 2. Via SkillsMP
- Automatically indexed when GitHub repo has 2+ stars
- Each skill appears individually in search
- Users discover via `/discover-skills`

### 3. Via NPX
```bash
npx create-claude-starter@latest
```

## Structure

```
.claude-plugin/
├── marketplace.json    # Plugin marketplace configuration
└── README.md          # This file
```

## Marketplace Metadata

The `marketplace.json` file defines:
- 14 installable plugin units
- Complete metadata (name, description, category)
- Source paths to skill directories
- Keywords for discovery

## Updates

When skills are updated in the main repository, the plugin marketplace automatically reflects the changes. No separate publication step needed.

## Learn More

- [Claude Code Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces.md)
- [Agent Skills Specification](https://agentskills.io/)
- [SkillsMP](https://skillsmp.com/)
