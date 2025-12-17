/**
 * Predefined skill profiles for quick installation
 */

export const profiles = {
  all: {
    name: 'All Skills',
    description: 'Complete collection - 40+ skills across all categories',
    skills: ['*'], // wildcard = copy everything
    toon: true,
    hooks: false,
    commands: [
      'analyze-tokens',
      'convert-to-toon',
      'toon-decode',
      'toon-encode',
      'toon-validate',
      'discover-skills',
      'install-skill'
    ]
  },

  'web-saas': {
    name: 'Web SaaS Starter',
    description: 'Payments + Backend + Mobile - perfect for SaaS applications',
    skills: [
      'stripe',
      'whop',
      'supabase',
      'expo',
      'toon-formatter'
    ],
    toon: true,
    hooks: false,
    commands: [
      'analyze-tokens',
      'convert-to-toon',
      'toon-decode',
      'toon-encode'
    ]
  },

  blockchain: {
    name: 'Blockchain Developer',
    description: 'Aptos, Move language, Shelby protocol, Decibel trading',
    skills: [
      'aptos',
      'aptos/framework',
      'aptos/move-language',
      'aptos/move-testing',
      'aptos/gas-optimization',
      'aptos/object-model',
      'aptos/token-standards',
      'aptos/dapp-integration',
      'aptos/shelby',
      'aptos/shelby/protocol-expert',
      'aptos/shelby/sdk-developer',
      'aptos/shelby/cli-assistant',
      'aptos/shelby/smart-contracts',
      'aptos/shelby/storage-integration',
      'aptos/shelby/network-rpc',
      'aptos/shelby/dapp-builder',
      'aptos/decibel',
      'toon-formatter'
    ],
    toon: true,
    hooks: false,
    commands: ['convert-to-toon']
  },

  'mobile-dev': {
    name: 'Mobile Developer',
    description: 'Expo, React Native, iOS development',
    skills: [
      'expo',
      'expo/eas-build',
      'expo/eas-update',
      'expo/expo-router',
      'ios',
      'supabase',
      'toon-formatter'
    ],
    toon: true,
    hooks: false,
    commands: ['convert-to-toon']
  },

  'fintech': {
    name: 'Fintech Stack',
    description: 'Payments, banking APIs, financial infrastructure',
    skills: [
      'stripe',
      'plaid',
      'plaid/auth',
      'plaid/transactions',
      'plaid/identity',
      'plaid/accounts',
      'supabase',
      'toon-formatter'
    ],
    toon: true,
    hooks: false,
    commands: ['convert-to-toon']
  },

  minimal: {
    name: 'Minimal (TOON Only)',
    description: 'Just token optimization utilities - no skills',
    skills: ['toon-formatter'],
    toon: true,
    hooks: false,
    commands: [
      'analyze-tokens',
      'convert-to-toon',
      'toon-decode',
      'toon-encode',
      'toon-validate'
    ]
  },

  custom: {
    name: 'Custom Selection',
    description: 'Interactively pick which skills you want',
    skills: [], // Will prompt user
    toon: true,
    hooks: false,
    commands: []
  }
};

/**
 * Get all available profiles
 */
export function getProfiles() {
  return profiles;
}

/**
 * Get a specific profile by ID
 */
export function getProfile(id) {
  return profiles[id];
}

/**
 * Get profile names for display
 */
export function getProfileChoices() {
  return Object.entries(profiles).map(([id, profile]) => ({
    name: `${profile.name} - ${profile.description}`,
    value: id,
    short: profile.name
  }));
}

/**
 * Skill categories for custom selection
 */
export const skillCategories = {
  'Payments & Commerce': [
    'stripe',
    'whop',
    'shopify'
  ],
  'Backend & Databases': [
    'supabase'
  ],
  'Banking': [
    'plaid',
    'plaid/auth',
    'plaid/transactions',
    'plaid/identity',
    'plaid/accounts'
  ],
  'Blockchain': [
    'aptos',
    'aptos/framework',
    'aptos/move-language',
    'aptos/move-testing',
    'aptos/move-prover',
    'aptos/gas-optimization',
    'aptos/object-model',
    'aptos/token-standards',
    'aptos/dapp-integration',
    'aptos/shelby',
    'aptos/shelby/protocol-expert',
    'aptos/shelby/sdk-developer',
    'aptos/shelby/cli-assistant',
    'aptos/shelby/smart-contracts',
    'aptos/shelby/storage-integration',
    'aptos/shelby/network-rpc',
    'aptos/shelby/dapp-builder',
    'aptos/decibel'
  ],
  'Mobile': [
    'expo',
    'expo/eas-build',
    'expo/eas-update',
    'expo/expo-router',
    'ios'
  ],
  'Utilities': [
    'toon-formatter'
  ]
};

/**
 * Get skill choices grouped by category for interactive selection
 */
export function getSkillChoices() {
  const choices = [];

  Object.entries(skillCategories).forEach(([category, skills]) => {
    choices.push({ type: 'separator', line: `─── ${category} ───` });

    skills.forEach(skillId => {
      const parts = skillId.split('/');
      const indent = '  '.repeat(parts.length - 1);
      choices.push({
        name: `${indent}${parts[parts.length - 1]}`,
        value: skillId,
        short: skillId
      });
    });
  });

  return choices;
}
