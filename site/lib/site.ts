export const siteConfig = {
  name: "agent-starter",
  title: "agent-starter - agent.json, skills, and MCPs for Claude Code, Codex, and Cursor",
  shortTitle: "agent-starter",
  description:
    "Declarative agent config for Claude Code, Codex, and Cursor. Declare skills, MCP servers, and a stack profile in agent.json — sync writes each agent's native config, plus 29 hand-maintained skills.",
  url: "https://claude.raintree.technology",
  repoUrl: "https://github.com/raintree-technology/claude-starter",
  docpullUrl: "https://docpull.raintree.technology",
  ogImagePath: "/opengraph-image",
  manifestPath: "/manifest.webmanifest",
  llmsPath: "/llms.txt",
  securityPath: "/.well-known/security.txt",
  lastModified: "2026-06-11T00:00:00.000-07:00",
  themeColor: "#0a0a0a",
  keywords: [
    "agent-starter",
    "agent.json",
    "MCP servers",
    "Claude Code skills",
    "Codex skills",
    "Cursor rules",
    "AI agent tooling",
    "developer tools",
  ],
  organization: {
    name: "Raintree",
    url: "https://github.com/raintree-technology",
  },
  securityContact: "security@raintree.ai",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function canonicalUrl(pathname: string, search = "") {
  const url = new URL(siteConfig.url);
  url.pathname = pathname;
  url.search = search;
  return url;
}
