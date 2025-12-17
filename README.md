# claude-starter

Production-ready Claude Code configuration with 40+ skills, TOON format support, and skill marketplace integration.

[![npm version](https://img.shields.io/npm/v/create-claude-starter.svg)](https://www.npmjs.com/package/create-claude-starter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is this?

A `.claude/` configuration directory for [Claude Code](https://code.claude.com) that provides:

- **40 Skills** - Auto-activating expertise (Stripe, Supabase, Aptos, Expo, Plaid, Whop, Shopify, iOS)
- **TOON Format** - 30-60% token savings for tabular data
- **7 Commands** - TOON conversion, skill installation, token analysis
- **Templates** - Build your own skills and commands

This is configuration, not code. No library, no framework, no runtime dependencies.

## Installation

```bash
# Install to current project
npx create-claude-starter

# Install specific skills
npx create-claude-starter --skills stripe,supabase,expo

# Install with profile
npx create-claude-starter --profile web-saas
```

Or copy manually:

```bash
git clone https://github.com/raintree-technology/claude-starter.git
cp -r claude-starter/.claude your-project/.claude
```

## Usage

Skills auto-activate based on context:

```
You: "How do I create a Stripe subscription?"
Claude: [Activates Stripe skill and provides implementation]

You: "Build a Whop membership backend"
Claude: [Activates Whop and provides code]
```

### Optional: Pull Documentation

Skills work immediately with built-in knowledge. Optionally pull comprehensive API docs:

```bash
# Install docpull
brew install pipx && pipx install docpull

# Pull documentation
docpull https://docs.stripe.com -o .claude/skills/stripe/docs
docpull https://supabase.com/docs -o .claude/skills/supabase/docs
```

### TOON Format

Compress JSON/data files by 30-60%:

```bash
/convert-to-toon api-response.json
/analyze-tokens data.json
```

## What's Included

| Category | Skills | Documentation |
|----------|--------|---------------|
| **Payments** | Stripe, Whop, Shopify | 3,490 files |
| **Backend** | Supabase | 2,616 files |
| **Banking** | Plaid (+ 4 sub-skills) | 659 files |
| **Blockchain** | Aptos, Shelby, Decibel | 246 files |
| **Mobile** | Expo (+ 3 sub-skills), iOS | 814 files |
| **AI** | Anthropic API, Claude Code (+ 5 sub-skills) | 400 files |
| **Data** | TOON Formatter | Tools + spec |

**Total:** 40 skills, 8,225 documentation files (pulled separately)

## CLI Commands

```bash
# Manage installation
npx claude-starter list                    # List available skills
npx claude-starter add expo ios            # Add skills
npx claude-starter update                  # Update installed skills

# Manage documentation
npx claude-starter docs pull stripe        # Pull specific docs
npx claude-starter docs pull               # Pull all docs
npx claude-starter docs status             # Check status
npx claude-starter docs update             # Update stale docs
```

## Installation Profiles

```bash
npx create-claude-starter --profile web-saas      # stripe, supabase, expo
npx create-claude-starter --profile blockchain    # aptos, shelby, decibel
npx create-claude-starter --profile minimal       # toon-formatter only
```

## Structure

```
.claude/
├── skills/          # 40 auto-activating skills
├── commands/        # 7 slash commands
├── hooks/           # 5 automation hooks (disabled by default)
├── utils/toon/      # TOON encoder/decoder (Zig binary + source)
└── settings.json    # Configuration
```

## Building Custom Skills

```markdown
<!-- .claude/skills/my-api/skill.md -->
# My Company API

Auto-activates when: user mentions "my-api"

## Endpoints
- POST /api/v1/users - Create user
- GET /api/v1/users/:id - Get user
```

See [docs/creating-components.md](docs/creating-components.md) for templates.

## Documentation

- [Quick Start](.claude/README.md)
- [Complete Reference](.claude/DIRECTORY.md)
- [Building Skills](docs/creating-components.md)
- [Examples](docs/examples.md)
- [FAQ](docs/FAQ.md)

## Requirements

- **Node.js** >= 18.0.0
- **Claude Code** >= 1.0.0
- **docpull** (optional) - For pulling documentation

## Security

See [SECURITY.md](SECURITY.md) for vulnerability disclosure and security measures.

## Legal

All third-party trademarks are property of their respective owners. See [TRADEMARKS.md](TRADEMARKS.md).

Not affiliated with or endorsed by Stripe, Anthropic, Supabase, Expo, Plaid, Shopify, or Whop.

## License

MIT - See [LICENSE](LICENSE)

## Resources

- [Claude Code Documentation](https://code.claude.com/docs)
- [TOON Format Specification](https://toonformat.dev)
- [Skills Marketplace](https://skillsmp.com)
