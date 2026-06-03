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
