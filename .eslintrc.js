'use strict';

module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'commonjs',
  },
  rules: {
    // ── Error prevention ─────────────────────────────
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_|^next$' }],
    'no-console': 'off',          // we use winston; console is OK in scripts
    'no-process-exit': 'off',     // allowed in seeder/startup

    // ── Code style ───────────────────────────────────
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-body-style': ['error', 'as-needed'],

    // ── Async/await ──────────────────────────────────
    'no-return-await': 'error',
    'require-await': 'warn',
  },
};
