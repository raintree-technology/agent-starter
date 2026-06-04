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

agent-starter is a multi-agent skill starter. It generates project-local guidance for Claude Code, Codex, and Cursor from one shared skill source.

## Install examples

\`\`\`bash
npx create-agent-starter@latest --agent all
npx create-agent-starter@latest --agent codex,cursor --profile apple-hig
npx create-agent-starter@latest --agent codex,cursor --skills copywriting-frameworks,cleanup-unused
\`\`\`

## Agent targets

- Claude Code: .claude skills, commands, settings, hooks, and TOON utilities.
- Codex: root AGENTS.md plus .codex/skills/<skill-id>/SKILL.md.
- Cursor: .cursor/rules/*.mdc.

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
