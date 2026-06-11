const MCP_NAME_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const ENV_REFERENCE_PATTERN = /\$\{([A-Z][A-Z0-9_]*)\}/g;

/**
 * Known MCP servers installable by name with `agent-starter add mcp <name>`.
 * Package coordinates are defaults; anything here can be overridden per
 * project by editing the entry in agent.json.
 */
export const MCP_CATALOG = {
  github: {
    name: 'github',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: { GITHUB_PERSONAL_ACCESS_TOKEN: '${GITHUB_PERSONAL_ACCESS_TOKEN}' },
  },
  neon: {
    name: 'neon',
    command: 'npx',
    args: ['-y', '@neondatabase/mcp-server-neon', 'start'],
    env: { NEON_API_KEY: '${NEON_API_KEY}' },
  },
  stripe: {
    name: 'stripe',
    command: 'npx',
    args: ['-y', '@stripe/mcp', '--tools=all'],
    env: { STRIPE_SECRET_KEY: '${STRIPE_SECRET_KEY}' },
  },
  resend: {
    name: 'resend',
    command: 'npx',
    args: ['-y', 'mcp-send-email'],
    env: { RESEND_API_KEY: '${RESEND_API_KEY}' },
  },
  posthog: {
    name: 'posthog',
    url: 'https://mcp.posthog.com/mcp',
    headers: { Authorization: 'Bearer ${POSTHOG_PERSONAL_API_KEY}' },
  },
};

export function getCatalogMcp(name) {
  const entry = MCP_CATALOG[name];
  return entry ? JSON.parse(JSON.stringify(entry)) : null;
}

export function validateMcpEntry(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new Error('MCP entry must be an object');
  }
  if (typeof entry.name !== 'string' || !MCP_NAME_PATTERN.test(entry.name)) {
    throw new Error(`Invalid MCP name: ${JSON.stringify(entry.name)}`);
  }

  const isStdio = typeof entry.command === 'string' && entry.command.length > 0;
  const isRemote = typeof entry.url === 'string' && /^https:\/\//.test(entry.url);
  if (isStdio === isRemote) {
    throw new Error(`MCP "${entry.name}" must have exactly one of "command" or an https "url"`);
  }

  if (entry.args !== undefined) {
    if (!Array.isArray(entry.args) || entry.args.some((arg) => typeof arg !== 'string')) {
      throw new Error(`MCP "${entry.name}": args must be an array of strings`);
    }
  }
  for (const key of ['env', 'headers']) {
    if (entry[key] !== undefined) {
      const value = entry[key];
      if (typeof value !== 'object' || value === null || Array.isArray(value)
        || Object.values(value).some((v) => typeof v !== 'string')) {
        throw new Error(`MCP "${entry.name}": ${key} must be an object of string values`);
      }
    }
  }

  return entry;
}

/**
 * Collect `${VAR}` references from an MCP entry so sync can warn about
 * unset variables and document them in .env.example.
 */
export function collectEnvReferences(mcps) {
  const vars = new Set();
  for (const entry of mcps) {
    const haystacks = [
      ...(entry.args || []),
      ...Object.values(entry.env || {}),
      ...Object.values(entry.headers || {}),
      entry.url || '',
    ];
    for (const value of haystacks) {
      for (const match of value.matchAll(ENV_REFERENCE_PATTERN)) {
        vars.add(match[1]);
      }
    }
  }
  return [...vars].sort();
}

function toClientServerShape(entry) {
  if (entry.url) {
    const server = { type: 'http', url: entry.url };
    if (entry.headers) server.headers = entry.headers;
    return server;
  }
  const server = { command: entry.command };
  if (entry.args?.length) server.args = entry.args;
  if (entry.env && Object.keys(entry.env).length > 0) server.env = entry.env;
  return server;
}

/**
 * Build the `mcpServers` map used by both Claude Code (.mcp.json) and
 * Cursor (.cursor/mcp.json).
 */
export function buildMcpServersMap(mcps) {
  const servers = {};
  for (const entry of mcps) {
    servers[entry.name] = toClientServerShape(entry);
  }
  return servers;
}

function tomlString(value) {
  return JSON.stringify(value);
}

/**
 * Render Codex `[mcp_servers.*]` TOML tables for the managed block in
 * .codex/config.toml.
 */
export function buildCodexMcpToml(mcps) {
  const sections = [];
  for (const entry of mcps) {
    const lines = [`[mcp_servers.${entry.name}]`];
    if (entry.url) {
      lines.push(`url = ${tomlString(entry.url)}`);
      if (entry.headers && Object.keys(entry.headers).length > 0) {
        lines.push('', `[mcp_servers.${entry.name}.http_headers]`);
        for (const [key, value] of Object.entries(entry.headers)) {
          lines.push(`${tomlString(key)} = ${tomlString(value)}`);
        }
      }
    } else {
      lines.push(`command = ${tomlString(entry.command)}`);
      if (entry.args?.length) {
        lines.push(`args = [${entry.args.map(tomlString).join(', ')}]`);
      }
      if (entry.env && Object.keys(entry.env).length > 0) {
        lines.push('', `[mcp_servers.${entry.name}.env]`);
        for (const [key, value] of Object.entries(entry.env)) {
          lines.push(`${tomlString(key)} = ${tomlString(value)}`);
        }
      }
    }
    sections.push(lines.join('\n'));
  }
  return sections.join('\n\n');
}
