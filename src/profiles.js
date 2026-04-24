export const SKILLS = [
  { id: 'anthropic', category: 'ai', name: 'Anthropic & Claude Code meta-tooling' },
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
    description: 'Stripe + Supabase + Expo + TOON — common SaaS stack',
    skills: ['stripe', 'supabase', 'expo', 'toon-formatter'],
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
  return `skills/${skillId}`;
}
