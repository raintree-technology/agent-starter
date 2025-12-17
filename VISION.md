# Claude-Starter Vision: Automated Skill Factory

## Core Idea

Transform from **40 manually curated skills** into an **automated system** that can generate Claude skills for **250+ technologies** by pulling their documentation and applying templates.

---

## Architecture

### 1. Technology Registry (`registry.json`)

Central database of 250+ technologies with metadata:

```json
{
  "version": "2.0.0",
  "lastUpdated": "2025-01-15",
  "technologies": [
    {
      "id": "stripe",
      "name": "Stripe",
      "category": "payments",
      "description": "Payment processing and billing platform",
      "docsUrl": "https://docs.stripe.com",
      "docsPullCommand": "docpull https://docs.stripe.com -o {{outputDir}}",
      "keywords": ["payments", "billing", "subscriptions", "checkout"],
      "skillTemplate": "api-docs",
      "estimatedSize": "33MB",
      "fileCount": 3253,
      "popularity": "high",
      "verified": true
    }
  ],
  "categories": {
    "payments": ["stripe", "whop", "paddle", "lemonsqueezy"],
    "backend": ["supabase", "firebase", "planetscale", "railway"],
    "frontend": ["react", "vue", "svelte", "solid"],
    "mobile": ["expo", "react-native", "flutter", "swift"],
    "blockchain": ["aptos", "ethereum", "solana", "polkadot"],
    "ai": ["anthropic", "openai", "langchain", "llamaindex"]
  }
}
```

### 2. Skill Templates

Reusable templates for different documentation types:

```
templates/skill-types/
├── api-docs.md         # REST API documentation (Stripe, Supabase)
├── framework-docs.md   # Frontend frameworks (React, Vue)
├── library-docs.md     # JS/Python libraries (Axios, Pandas)
├── language-docs.md    # Programming languages (Python, Rust)
├── platform-docs.md    # Cloud platforms (AWS, Vercel)
└── cli-docs.md         # CLI tools (npm, docker)
```

Each template has placeholders:
- `{{name}}` - Technology name
- `{{description}}` - Short description
- `{{keywords}}` - Comma-separated keywords
- `{{docsPath}}` - Path to pulled documentation
- `{{category}}` - Category (payments, backend, etc.)

### 3. Automated Workflow

```bash
# User installs a skill
$ claude-starter install stripe

# Behind the scenes:
1. Look up "stripe" in registry.json
2. Check if docs exist at ~/.claude-starter/docs/stripe/
3. If not, run: docpull https://docs.stripe.com -o ~/.claude-starter/docs/stripe
4. Load template: templates/skill-types/api-docs.md
5. Replace placeholders with registry metadata
6. Write to: .claude/skills/stripe/skill.md
7. Symlink docs: .claude/skills/stripe/docs -> ~/.claude-starter/docs/stripe
8. Done!
```

---

## Key Benefits

### Current (Manual)
- ❌ 40 skills, manually written
- ❌ Docs embedded or external (inconsistent)
- ❌ Hard to maintain and update
- ❌ Limited coverage

### Automated (Vision)
- ✅ 250+ skills, auto-generated
- ✅ Docs always external (cached globally)
- ✅ Easy to maintain (update registry, regenerate)
- ✅ Comprehensive coverage
- ✅ Community can add new techs (just add to registry)

---

## Storage Strategy

### Global Docs Cache
```
~/.claude-starter/
├── docs/
│   ├── stripe/           # 33MB, 3,253 files
│   ├── supabase/         # 111MB, 2,616 files
│   ├── react/            # 5MB, 234 files
│   └── ...               # (pulled once, shared across projects)
└── cache.json            # Track what's pulled, when, versions
```

### Project Skills
```
.claude/
└── skills/
    ├── stripe/
    │   ├── skill.md      # Auto-generated from template
    │   └── docs/         # Symlink to ~/.claude-starter/docs/stripe
    └── supabase/
        ├── skill.md
        └── docs/         # Symlink to ~/.claude-starter/docs/supabase
```

**Benefits:**
- Pull docs once, use in multiple projects
- Update docs globally (run `claude-starter update-docs`)
- Save disk space (no duplication)
- Faster project setup (docs already local)

---

## CLI Commands

### Installation
```bash
# Install single skill
claude-starter install stripe

# Install multiple
claude-starter install stripe supabase react

# Install by category
claude-starter install --category payments
# → Installs: stripe, whop, paddle, lemonsqueezy

# Install by keyword
claude-starter install --keyword "database"
# → Installs: supabase, planetscale, mongodb, postgres

# Install popular top 10
claude-starter install --top 10

# Install with profile
claude-starter install --profile web-saas
# → Predefined: stripe, supabase, react, nextjs, tailwind
```

### Browsing
```bash
# List all 250 technologies
claude-starter browse

# Filter by category
claude-starter browse --category frontend

# Search by keyword
claude-starter browse --search "payment"

# Show details
claude-starter info stripe
# Output:
# Stripe - Payment processing platform
# Category: payments
# Docs: https://docs.stripe.com (33MB, 3,253 files)
# Keywords: payments, billing, subscriptions, checkout
# Status: Not installed
```

### Documentation Management
```bash
# Pull docs for installed skills
claude-starter pull-docs

# Pull docs for specific skill
claude-starter pull-docs stripe

# Update stale docs (>7 days old)
claude-starter update-docs

# Clean docs cache
claude-starter clean-docs
# Removes docs not used by any project

# Check docs status
claude-starter docs-status
# Output:
# Stripe: 33MB, pulled 2 days ago
# Supabase: 111MB, pulled 5 days ago
# React: 5MB, never pulled
```

### Maintenance
```bash
# Update registry to latest
claude-starter update-registry

# Regenerate skills from templates
claude-starter regenerate
# (Useful after registry/template updates)

# Check for outdated skills
claude-starter outdated
```

---

## Registry Schema

### Technology Entry
```json
{
  "id": "stripe",                    // Unique identifier
  "name": "Stripe",                  // Display name
  "category": "payments",            // Primary category
  "subcategories": ["api", "saas"],  // Optional tags
  "description": "Payment processing and billing platform",
  "docsUrl": "https://docs.stripe.com",
  "docsPullCommand": "docpull https://docs.stripe.com -o {{outputDir}}",
  "alternateDocUrls": [              // Fallback sources
    "https://stripe.com/docs"
  ],
  "keywords": [
    "payments", "billing", "subscriptions",
    "checkout", "invoices", "webhooks"
  ],
  "skillTemplate": "api-docs",       // Which template to use
  "estimatedSize": "33MB",
  "fileCount": 3253,
  "popularity": "high",              // high, medium, low
  "verified": true,                  // Manually verified to work
  "lastVerified": "2025-01-15",
  "maintainer": "raintree",
  "homepage": "https://stripe.com",
  "github": "https://github.com/stripe",
  "npmPackage": "stripe",            // If applicable
  "pypiPackage": null,
  "language": ["javascript", "python", "ruby", "go"],
  "platforms": ["web", "mobile", "server"],
  "license": "proprietary",
  "relatedTechnologies": ["whop", "paddle"],  // Show alongside
  "dependencies": [],                // Required skills
  "conflicts": []                    // Incompatible skills
}
```

---

## Template System

### Template Types

**1. API Documentation Template** (`api-docs.md`)
For: REST APIs, SDKs with endpoints
Examples: Stripe, Supabase, Plaid, Twilio

**2. Framework Template** (`framework-docs.md`)
For: Frontend/backend frameworks
Examples: React, Next.js, Django, Rails

**3. Library Template** (`library-docs.md`)
For: JavaScript/Python libraries
Examples: Axios, Lodash, Pandas, NumPy

**4. Language Template** (`language-docs.md`)
For: Programming languages
Examples: Python, Rust, Go, Swift

**5. Platform Template** (`platform-docs.md`)
For: Cloud platforms, hosting
Examples: AWS, Vercel, Railway, Render

**6. CLI Template** (`cli-docs.md`)
For: Command-line tools
Examples: npm, docker, kubectl, git

### Template Structure

```markdown
---
name: {{name}}-expert
description: {{description}}
keywords: {{keywords}}
category: {{category}}
model: sonnet
tools: [Read, Write, Edit, Grep, Glob, Bash, WebFetch]
docs-path: {{docsPath}}
docs-url: {{docsUrl}}
---

# {{name}} Expert

I am a specialized assistant for {{name}}, a {{category}} technology.

{{description}}

## Documentation Access

I have access to the complete official documentation at:
`{{docsPath}}`

Source: {{docsUrl}}

## What I Can Help With

{{#if api-docs}}
- API endpoints and authentication
- Request/response formats
- SDK usage and code examples
- Webhooks and event handling
- Best practices and design patterns
- Troubleshooting and debugging
- Rate limits and optimization
{{/if}}

{{#if framework-docs}}
- Component architecture
- Routing and navigation
- State management
- Data fetching patterns
- Build and deployment
- Performance optimization
- Common patterns and best practices
{{/if}}

{{#if library-docs}}
- API reference
- Common use cases
- Integration patterns
- Best practices
- Troubleshooting
{{/if}}

## Usage

Ask me anything about {{name}}. I'll reference the official documentation to provide accurate, up-to-date guidance.

**Keywords:** {{keywords}}
```

---

## Registry Population Strategy

### Phase 1: Top 50 (Immediate)
Most requested technologies:
- **Payments:** Stripe, Whop, Paddle, LemonSqueezy
- **Backend:** Supabase, Firebase, Planetscale, Railway
- **Frontend:** React, Vue, Svelte, Solid, Angular
- **Mobile:** Expo, React Native, Flutter, Swift
- **Blockchain:** Aptos, Ethereum, Solana
- **AI:** Anthropic, OpenAI, Langchain, LlamaIndex
- **Platforms:** Vercel, AWS, GCP, Azure
- **Databases:** Postgres, MySQL, MongoDB, Redis

### Phase 2: Top 150 (Next)
Common but less critical:
- Testing frameworks (Jest, Vitest, Playwright)
- CSS frameworks (Tailwind, Bootstrap, Chakra)
- Backend frameworks (Express, Fastify, Hono)
- DevOps (Docker, Kubernetes, Terraform)
- Monitoring (Sentry, Datadog, New Relic)

### Phase 3: Long Tail 250+ (Community-Driven)
- Allow users to submit PRs adding to registry
- Automated validation of docsUrl
- Community voting on priority

---

## Migration Path

### From Current 40 Skills → Automated System

**Step 1:** Create registry from existing skills
```bash
# Script to convert current skills to registry entries
npm run migrate-to-registry
```

**Step 2:** Create skill templates from patterns
```bash
# Analyze existing skill.md files, extract common patterns
npm run extract-templates
```

**Step 3:** Regenerate skills from templates
```bash
# Verify generated skills match originals
npm run regenerate-all
```

**Step 4:** Extend registry to 250 technologies
```bash
# Add 210 new entries to registry.json
```

---

## Technical Implementation

### Directory Structure
```
claude-starter/
├── package.json
├── bin/
│   └── cli.js                      # Main CLI entry
├── src/
│   ├── commands/
│   │   ├── install.js              # Install skills
│   │   ├── browse.js               # Browse registry
│   │   ├── info.js                 # Show tech details
│   │   ├── pull-docs.js            # Pull documentation
│   │   ├── update-docs.js          # Update stale docs
│   │   └── regenerate.js           # Regenerate from templates
│   ├── utils/
│   │   ├── registry.js             # Load/query registry
│   │   ├── docpull.js              # Wrapper for docpull
│   │   ├── template-engine.js      # Process templates
│   │   └── cache.js                # Manage global cache
│   └── index.js
├── registry.json                   # 250+ technology definitions
├── templates/
│   └── skill-types/
│       ├── api-docs.md
│       ├── framework-docs.md
│       ├── library-docs.md
│       ├── language-docs.md
│       ├── platform-docs.md
│       └── cli-docs.md
└── README.md
```

### Key Files

**`registry.json`** - Single source of truth
**`templates/skill-types/`** - Reusable skill templates
**`src/utils/template-engine.js`** - Mustache/Handlebars-like engine
**`src/utils/docpull.js`** - Spawn docpull, track progress

---

## Example: Installing Stripe

```bash
$ claude-starter install stripe
```

**Output:**
```
🔍 Looking up stripe in registry...
✓ Found: Stripe (payments) - 33MB, 3,253 files

📦 Checking documentation cache...
✗ Not found in ~/.claude-starter/docs/stripe

📥 Pulling documentation (this may take a minute)...
  ⠋ Running: docpull https://docs.stripe.com -o ~/.claude-starter/docs/stripe
  ✓ Pulled 3,253 files (33MB)

🔨 Generating skill from template...
  ✓ Loaded template: api-docs.md
  ✓ Applied metadata from registry
  ✓ Written to: .claude/skills/stripe/skill.md
  ✓ Created symlink: .claude/skills/stripe/docs -> ~/.claude-starter/docs/stripe

✅ Stripe skill installed!

Next steps:
  - Use skill: Just mention "Stripe" in your conversation with Claude
  - View docs: ls .claude/skills/stripe/docs
  - Update docs: claude-starter update-docs stripe
```

---

## Community Contribution

### Adding New Technology

**Option 1: Via CLI**
```bash
claude-starter add-tech --interactive
# Prompts for: name, category, docsUrl, keywords, etc.
# Validates docsUrl is accessible
# Adds to registry.json
# Opens PR to main repo
```

**Option 2: Manual PR**
Edit `registry.json`:
```json
{
  "id": "new-tech",
  "name": "NewTech",
  "category": "backend",
  "description": "...",
  "docsUrl": "https://newtec.com/docs",
  "keywords": ["..."],
  "skillTemplate": "api-docs"
}
```

### Registry Validation
```bash
# Run before PR
npm run validate-registry
# Checks:
# - All required fields present
# - docsUrl is accessible
# - No duplicate IDs
# - Categories are valid
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Technologies | 40 | 250+ |
| Maintenance | Manual per skill | Update registry only |
| Community contribution | Clone + write skill.md | Add to registry.json |
| Setup time | 5 min (copy files) | 30 sec (auto-install) |
| Disk usage | 200MB per project | Shared cache (pull once) |
| Update frequency | Manual per skill | One-command update all |

---

## Open Questions

1. **Should we host a docs cache CDN?**
   - Pro: Faster installs (no docpull needed)
   - Con: Bandwidth costs, staleness

2. **How to handle documentation requiring auth?**
   - Some docs (AWS, GCP) need API keys
   - Store credentials in ~/.claude-starter/config.json?

3. **How to version registry?**
   - Registry v2.0.0 might have different schema than v1.0.0
   - How do old CLI versions handle new registry?

4. **Should we support custom registries?**
   - Let companies host internal registries
   - `claude-starter install --registry https://internal.company.com/registry.json stripe`

5. **How to handle multiple doc versions?**
   - Stripe API versions (2023-10-16, 2024-11-20)
   - Allow: `claude-starter install stripe@2024-11-20`?

---

## Next Steps

1. ✅ Document vision (this file)
2. ⬜ Create proof-of-concept registry with 10 technologies
3. ⬜ Build template engine (Mustache/Handlebars)
4. ⬜ Implement `install` command with auto-generation
5. ⬜ Test with Stripe, Supabase, React
6. ⬜ Expand registry to 50 technologies
7. ⬜ Add community contribution workflow
8. ⬜ Scale to 250+ technologies

---

**This approach transforms claude-starter from a static template pack into a dynamic, community-driven skill factory.**
