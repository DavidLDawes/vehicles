const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = [
  { ignores: ['dist/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs['flat/recommended'],
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  { files: ['src/**/*.{ts,tsx}'], ...react.configs.flat.recommended },
  { files: ['src/**/*.{ts,tsx}'], ...react.configs.flat['jsx-runtime'] },
  { files: ['src/**/*.{ts,tsx}'], ...reactHooks.configs['recommended-latest'] },
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*.ts'],
    languageOptions: {
      globals: { ...globals.jest },
    },
  },
  {
    settings: { react: { version: 'detect' } },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
      'react/prop-types': 'off', // TypeScript already validates prop shapes
    },
  },
];
