const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test environment
  testEnvironment: 'jest-environment-jsdom',

  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@mcp-b/global$': '<rootDir>/test/__mocks__/mcp-b-global.js',
  },

  // Test file patterns
  testMatch: ['<rootDir>/**/*.(test|spec).(ts|tsx|js)'],

  // Coverage configuration
  collectCoverageFrom: [
    'components/**/*.(ts|tsx)',
    'utils/**/*.(ts|tsx)',
    'hooks/**/*.(ts|tsx)',
    'app/**/*.(ts|tsx)',
    'contexts/**/*.(ts|tsx)',
    '!**/*.d.ts',
    '!**/__tests__/**',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
