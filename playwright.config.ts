import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Enhanced reporting
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/playwright-results.json' }],
        ['junit', { outputFile: 'test-results/playwright-junit.xml' }],
      ]
    : [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/playwright-results.json' }],
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
      testMatch: '**/*.setup.ts',
    },

    // Desktop browsers - optimized for WebXR testing
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Enhanced permissions for WebXR testing
        permissions: ['camera', 'microphone'],
        // Allow insecure contexts for testing
        ignoreHTTPSErrors: true,
        // Increase timeouts for 3D rendering
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Firefox-specific WebXR limitations
        ignoreHTTPSErrors: true,
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        // Safari-specific settings (no WebXR support)
        ignoreHTTPSErrors: true,
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
      dependencies: ['setup'],
    },

    // WebXR-specific browser testing (Chromium only)
    ...(process.env.WEBXR_TESTS
      ? [
          {
            name: 'chromium-webxr',
            use: {
              ...devices['Desktop Chrome'],
              // WebXR-optimized settings
              permissions: [
                'camera',
                'microphone',
                'accelerometer',
                'gyroscope',
                'magnetometer',
              ],
              ignoreHTTPSErrors: true,
              launchOptions: {
                args: [
                  '--enable-webxr',
                  '--enable-features=WebXR',
                  '--disable-features=WebXROrientationSensorDevice',
                  '--enable-unsafe-webgpu',
                  '--enable-webgl-developer-extensions',
                  '--disable-web-security', // For testing only
                  '--allow-running-insecure-content',
                  '--autoplay-policy=no-user-gesture-required',
                ],
              },
              actionTimeout: 20000,
              navigationTimeout: 60000,
            },
            dependencies: ['setup'],
            testMatch: ['**/webxr-*.spec.ts'],
          },
        ]
      : []),

    // Mobile browsers (optional, can be enabled when needed)
    ...(process.env.MOBILE_TESTS
      ? [
          {
            name: 'Mobile Chrome',
            use: {
              ...devices['Pixel 5'],
              // Mobile-specific WebXR settings
              permissions: ['camera', 'microphone'],
              ignoreHTTPSErrors: true,
              actionTimeout: 20000,
              navigationTimeout: 45000,
            },
            dependencies: ['setup'],
          },
          {
            name: 'Mobile Safari',
            use: {
              ...devices['iPhone 12'],
              // iOS Safari WebXR limitations
              ignoreHTTPSErrors: true,
              actionTimeout: 20000,
              navigationTimeout: 45000,
            },
            dependencies: ['setup'],
          },
        ]
      : []),

    // Performance testing project with specific settings
    ...(process.env.PERFORMANCE_TESTS
      ? [
          {
            name: 'performance-testing',
            use: {
              ...devices['Desktop Chrome'],
              // Performance testing optimizations
              launchOptions: {
                args: [
                  '--enable-precise-memory-info',
                  '--enable-gpu-benchmarking',
                  '--enable-logging=stderr',
                  '--v=1',
                  '--force-gpu-mem-available-mb=1024',
                  '--enable-webgl-developer-extensions',
                ],
              },
              actionTimeout: 30000,
              navigationTimeout: 60000,
            },
            dependencies: ['setup'],
            testMatch: ['**/webxr-performance.spec.ts'],
          },
        ]
      : []),
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
});
