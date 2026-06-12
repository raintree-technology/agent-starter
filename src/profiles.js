import { getCatalogMcp } from './mcps.js';

export const HCI_SKILLS = ['human-processor-model', 'goms-klm-analysis'];

export const HIG_SKILLS = [
  'hig-doctor-audit',
  'hig-project-context',
  'hig-foundations',
  'hig-platforms',
  'hig-patterns',
  'hig-inputs',
  'hig-technologies',
  'hig-components-content',
  'hig-components-layout',
  'hig-components-menus',
  'hig-components-search',
  'hig-components-dialogs',
  'hig-components-controls',
  'hig-components-status',
  'hig-components-system',
];

export const SKILLS = [
  { id: 'copywriting-frameworks', category: 'marketing', name: 'Copywriting frameworks' },
  { id: 'finish-setup', category: 'workflow', name: 'SaaS provisioning via MCPs' },
  { id: 'cleanup-all', category: 'quality', name: 'Full cleanup pipeline' },
  { id: 'cleanup-cycles', category: 'quality', name: 'Circular dependency cleanup' },
  { id: 'cleanup-dedupe', category: 'quality', name: 'Duplicate code cleanup' },
  { id: 'cleanup-defensive', category: 'quality', name: 'Defensive code cleanup' },
  { id: 'cleanup-legacy', category: 'quality', name: 'Legacy code cleanup' },
  { id: 'cleanup-slop', category: 'quality', name: 'Comment slop cleanup' },
  { id: 'cleanup-types', category: 'quality', name: 'Type consolidation cleanup' },
  { id: 'cleanup-unused', category: 'quality', name: 'Unused code cleanup' },
  { id: 'cleanup-weak-types', category: 'quality', name: 'Weak type cleanup' },
  { id: 'goms-klm-analysis', category: 'design', name: 'GOMS / KLM analysis' },
  { id: 'hig-components-content', category: 'design', name: 'Apple HIG content components' },
  { id: 'hig-components-controls', category: 'design', name: 'Apple HIG controls' },
  { id: 'hig-components-dialogs', category: 'design', name: 'Apple HIG dialogs' },
  { id: 'hig-components-layout', category: 'design', name: 'Apple HIG layout' },
  { id: 'hig-components-menus', category: 'design', name: 'Apple HIG menus and actions' },
  { id: 'hig-components-search', category: 'design', name: 'Apple HIG search and navigation' },
  { id: 'hig-components-status', category: 'design', name: 'Apple HIG status and progress' },
  { id: 'hig-components-system', category: 'design', name: 'Apple HIG system experiences' },
  { id: 'hig-doctor-audit', category: 'design', name: 'HIG Doctor audit' },
  { id: 'hig-foundations', category: 'design', name: 'Apple HIG foundations' },
  { id: 'hig-inputs', category: 'design', name: 'Apple HIG inputs' },
  { id: 'hig-patterns', category: 'design', name: 'Apple HIG patterns' },
  { id: 'hig-platforms', category: 'design', name: 'Apple HIG platforms' },
  { id: 'hig-project-context', category: 'design', name: 'Apple HIG project context' },
  { id: 'hig-technologies', category: 'design', name: 'Apple HIG technologies' },
  { id: 'human-processor-model', category: 'design', name: 'Human Processor Model' },
  { id: 'toon-formatter', category: 'utilities', name: 'TOON formatter' },
];

function catalogMcps(...names) {
  return names.map((name) => {
    const entry = getCatalogMcp(name);
    if (!entry) {
      throw new Error(`Unknown catalog MCP referenced by profile: ${name}`);
    }
    return entry;
  });
}

export const profiles = {
  all: {
    name: 'All skills',
    description: 'Every shipped skill',
    skills: SKILLS.map((s) => s.id),
    toon: true,
    hooks: false,
    commands: ['analyze-tokens', 'convert-to-toon', 'toon-decode', 'toon-encode', 'toon-validate'],
  },

  'apple-hig': {
    name: 'Apple HIG Doctor',
    description: 'HIG Doctor audit workflow plus the 14 Apple HIG reference skills',
    skills: HIG_SKILLS,
    toon: false,
    hooks: false,
    commands: [],
  },

  'design-hci': {
    name: 'Design + HCI',
    description: 'Human Processor Model + GOMS/KLM + Apple HIG Doctor',
    skills: [...HCI_SKILLS, ...HIG_SKILLS],
    toon: false,
    hooks: false,
    commands: [],
  },

  minimal: {
    name: 'Minimal (TOON only)',
    description: 'Just TOON token-optimization utilities',
    skills: ['toon-formatter'],
    toon: true,
    hooks: false,
    commands: ['analyze-tokens', 'convert-to-toon', 'toon-decode', 'toon-encode', 'toon-validate'],
  },

  custom: {
    name: 'Custom',
    description: 'Pick skills interactively',
    skills: [],
    toon: true,
    hooks: false,
    commands: [],
  },

  'next-saas': {
    name: 'Next.js SaaS',
    description:
      'Stack-aware profile for Next.js SaaS apps (next-starter): cleanup + copywriting skills, finish-setup provisioning, and Neon/Stripe/Resend/PostHog/GitHub MCPs',
    skills: [
      'finish-setup',
      'cleanup-unused',
      'cleanup-types',
      'cleanup-slop',
      'copywriting-frameworks',
    ],
    mcps: catalogMcps('neon', 'stripe', 'resend', 'posthog', 'github'),
    toon: false,
    hooks: false,
    commands: [],
  },

  next: {
    name: 'Next.js',
    description: 'Generic Next.js projects: cleanup skills plus the GitHub MCP',
    skills: ['cleanup-unused', 'cleanup-types'],
    mcps: catalogMcps('github'),
    toon: false,
    hooks: false,
    commands: [],
  },

  node: {
    name: 'Node.js',
    description: 'Generic Node.js projects: cleanup skills plus the GitHub MCP',
    skills: ['cleanup-unused', 'cleanup-types'],
    mcps: catalogMcps('github'),
    toon: false,
    hooks: false,
    commands: [],
  },

  base: {
    name: 'Base',
    description: 'Minimal stack-agnostic profile: unused-code cleanup only, no MCPs',
    skills: ['cleanup-unused'],
    mcps: [],
    toon: false,
    hooks: false,
    commands: [],
  },
};

const STACK_PROFILE_IDS = ['next-saas', 'next', 'node', 'base'];

/**
 * Infer the best stack profile from a project's package.json.
 * Returns a profile id, or null when the directory has no package.json
 * (callers should fall back to 'base').
 */
export function detectStackProfile(packageJson) {
  if (!packageJson || typeof packageJson !== 'object') {
    return null;
  }
  const deps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };
  if (
    deps.next &&
    (deps['drizzle-orm'] || deps['better-auth'] || deps['@neondatabase/serverless'])
  ) {
    return 'next-saas';
  }
  if (deps.next) {
    return 'next';
  }
  return 'node';
}

export function isStackProfile(id) {
  return STACK_PROFILE_IDS.includes(id);
}

export function getProfile(id) {
  return profiles[id];
}

export function getProfileChoices() {
  return Object.entries(profiles).map(([id, profile]) => ({
    name: `${profile.name} — ${profile.description}`,
    value: id,
    short: profile.name,
  }));
}

export function getSkillChoices() {
  return SKILLS.map((s) => ({
    name: `${s.id} — ${s.name}`,
    value: s.id,
    short: s.id,
  }));
}
