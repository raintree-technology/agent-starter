import { absoluteUrl, siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const body = `# ${siteConfig.name}

${siteConfig.description}

## Primary URLs

- Site: ${siteConfig.url}
- Repository: ${siteConfig.repoUrl}
- Sitemap: ${absoluteUrl("/sitemap.xml")}
- Security contact: ${absoluteUrl(siteConfig.securityPath)}

## What this project is

agent-starter is a multi-agent skill pack and project-level agent config manager. An agent.json manifest at the project root — the package.json for agent environments — declares profile, targets, skills, and MCP servers. \`npx agent-starter sync\` writes each agent's native config from it; skills are generated for Claude Code, Codex, and Cursor from one shared skill source.

## agent.json and sync

- agent.json is checked into git; every contributor runs \`npx agent-starter sync\` and gets identical native config: skills plus .mcp.json (Claude Code), .codex/config.toml + AGENTS.md (Codex), .cursor/mcp.json + rules (Cursor).
- Sync is idempotent: generated sections are fenced with markers, manual edits outside them survive, and MCP entries agent-starter did not write are never touched.
- Secrets are referenced as \${VAR} and resolved by each agent at runtime — never written to generated files.
- \`npx agent-starter status\` diffs agent.json against native configs and exits 1 on drift.
- \`npx agent-starter add mcp <name>\` (catalog: github, neon, stripe, resend, posthog) and \`npx agent-starter add skill <name>\` update the manifest and re-sync.

## Stack profiles

Stack profiles bundle skills and MCP servers for a project type; \`init\` auto-detects from package.json.

- next-saas: finish-setup + cleanup + copywriting skills; neon, stripe, resend, posthog, github MCPs. The finish-setup skill provisions a freshly scaffolded SaaS project: Stripe products matching billing plans, database migration checks, email-domain DNS, analytics.
- next: cleanup skills; github MCP.
- node: cleanup skills; github MCP.
- base: cleanup-unused only; no MCPs.

Skill-set profiles (all, apple-hig, design-hci, minimal) select skills without MCPs.

## Install examples

\`\`\`bash
npx create-agent-starter@latest --agent all
npx agent-starter sync
npx create-agent-starter@latest --agent codex,cursor --profile apple-hig
npx create-agent-starter@latest --agent codex,cursor --skills copywriting-frameworks,cleanup-unused
\`\`\`

## Agent targets

- Claude Code: .claude skills, commands, settings, hooks, TOON utilities, and .mcp.json MCP servers.
- Codex: root AGENTS.md plus .codex/skills/<skill-id>/SKILL.md and .codex/config.toml MCP servers.
- Cursor: .cursor/rules/*.mdc plus .cursor/mcp.json MCP servers.

## Licensing

Code is MIT licensed. The package is not affiliated with Anthropic, Apple, OpenAI, Cursor, or @toon-format/toon.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
