export const AGENT_TARGETS = {
  claude: {
    id: 'claude',
    name: 'Claude Code',
    outputDir: '.claude',
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    outputDir: '.codex',
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    outputDir: '.cursor',
  },
};

const AGENT_ALIASES = {
  all: Object.keys(AGENT_TARGETS),
};

export function parseAgentTargets(value = 'claude') {
  const rawTargets = String(value)
    .split(',')
    .map((target) => target.trim().toLowerCase())
    .filter(Boolean);

  const expandedTargets = rawTargets.flatMap((target) => AGENT_ALIASES[target] || target);
  const unknownTargets = expandedTargets.filter((target) => !AGENT_TARGETS[target]);
  if (unknownTargets.length > 0) {
    throw new Error(`Unknown agent target(s): ${unknownTargets.join(', ')}`);
  }

  return [...new Set(expandedTargets.length > 0 ? expandedTargets : ['claude'])];
}

export function formatAgentTargets(targets) {
  return targets.map((target) => AGENT_TARGETS[target].name).join(', ');
}
