import js from '@eslint/js';

const nodeGlobals = {
  console: 'readonly',
  process: 'readonly',
};

export default [
  {
    ignores: [
      '.agents/**',
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
