export const HCI_SKILLS = [
  'human-processor-model',
  'goms-klm-analysis',
];

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
  { id: 'anthropic', category: 'ai', name: 'Anthropic & Claude Code meta-tooling' },
  { id: 'copywriting-frameworks', category: 'marketing', name: 'Copywriting frameworks' },
  { id: 'cleanup-all', category: 'quality', name: 'Full cleanup pipeline' },
  { id: 'cleanup-cycles', category: 'quality', name: 'Circular dependency cleanup' },
  { id: 'cleanup-dedupe', category: 'quality', name: 'Duplicate code cleanup' },
  { id: 'cleanup-defensive', category: 'quality', name: 'Defensive code cleanup' },
  { id: 'cleanup-legacy', category: 'quality', name: 'Legacy code cleanup' },
  { id: 'cleanup-slop', category: 'quality', name: 'Comment slop cleanup' },
  { id: 'cleanup-types', category: 'quality', name: 'Type consolidation cleanup' },
  { id: 'cleanup-unused', category: 'quality', name: 'Unused code cleanup' },
  { id: 'cleanup-weak-types', category: 'quality', name: 'Weak type cleanup' },
  { id: 'expo', category: 'mobile', name: 'Expo / React Native' },
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
  { id: 'plaid', category: 'banking', name: 'Plaid' },
  { id: 'stripe', category: 'payments', name: 'Stripe' },
  { id: 'supabase', category: 'backend', name: 'Supabase' },
  { id: 'toon-formatter', category: 'utilities', name: 'TOON formatter' },
];

export const profiles = {
  all: {
    name: 'All skills',
    description: 'Every shipped skill',
    skills: SKILLS.map((s) => s.id),
    toon: true,
    hooks: false,
    commands: ['analyze-tokens', 'convert-to-toon', 'toon-decode', 'toon-encode', 'toon-validate'],
  },

  'web-saas': {
    name: 'Web SaaS',
    description: 'Stripe + Supabase + Expo + copywriting + TOON — common SaaS stack',
    skills: ['stripe', 'supabase', 'expo', 'copywriting-frameworks', 'toon-formatter'],
    toon: true,
    hooks: false,
    commands: ['analyze-tokens', 'convert-to-toon', 'toon-decode', 'toon-encode'],
  },

  fintech: {
    name: 'Fintech',
    description: 'Stripe + Plaid + Supabase',
    skills: ['stripe', 'plaid', 'supabase', 'toon-formatter'],
    toon: true,
    hooks: false,
    commands: ['convert-to-toon'],
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
};

export function getProfiles() {
  return profiles;
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

export function skillIdToPath(skillId) {
  return skillId;
}
