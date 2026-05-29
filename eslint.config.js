import js from '@eslint/js';

const nodeGlobals = {
  Buffer: 'readonly',
  URL: 'readonly',
  console: 'readonly',
  process: 'readonly',
  setTimeout: 'readonly',
};

export default [
  {
    ignores: [
      '.agents/**',
      '.claude/skills/**/docs/**',
      'node_modules/**',
      'site/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'test/**/*.js', 'bin/**/*.js', 'bench/**/*.mjs', 'templates/.claude/utils/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: nodeGlobals,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
