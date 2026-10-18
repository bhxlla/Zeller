// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');
const globals = require('globals');

module.exports = defineConfig([
  {
    ignores: ['ios/*', 'android/*', '.expo/*', 'coverage/*'],
  },
  expoConfig,
  {
    files: ['__tests__/**', 'jest.setup.ts'],
    languageOptions: { globals: globals.jest },
  },
  // Keep last: turns off stylistic rules that would conflict with Prettier.
  prettierConfig,
]);
