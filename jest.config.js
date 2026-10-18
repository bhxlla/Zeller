/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Only *.test files are suites; __tests__/support holds shared helpers.
  testMatch: ['<rootDir>/__tests__/**/*.test.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/ios/', '/android/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
