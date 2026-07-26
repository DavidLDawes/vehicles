module.exports = {
  testEnvironment: '<rootDir>/jest-environment-jsdom-with-structuredclone.js',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/**/*.d.ts',
  ],
};
