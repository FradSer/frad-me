import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Enhanced reporting
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ...(process.env.CI ? [['junit', { outputFile: 'test-results/playwright-junit.xml' }]] : []),
  ],
  
  // Global test configuration
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Global timeout settings
    actionTimeout: 10000,
    navigationTimeout: 30000,
    // Browser context options
    ignoreHTTPSErrors: true,
    colorScheme: 'light',
  },

  // Test timeout configuration
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  projects: [
    // Setup project for authentication if needed
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
    
    // Mobile browsers (optional, can be enabled when needed)
    ...(process.env.MOBILE_TESTS ? [
      {
        name: 'Mobile Chrome',
        use: { ...devices['Pixel 5'] },
        dependencies: ['setup'],
      },
      {
        name: 'Mobile Safari',
        use: { ...devices['iPhone 12'] },
        dependencies: ['setup'],
      },
    ] : []),
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test',
    },
  },
  
  // Output directory
  outputDir: 'test-results/playwright-artifacts',
})