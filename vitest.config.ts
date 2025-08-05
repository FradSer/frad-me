import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    css: true,
    // Performance optimizations
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        'src/__tests__/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'vitest.config.ts',
        'playwright.config.ts',
      ],
    },
    // Test file patterns
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/', 'dist/', '.next/', 'tests/e2e/'],
    // Timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    // Reporter configuration
    reporter: process.env.CI ? ['verbose', 'junit'] : ['verbose'],
    outputFile: {
      junit: './test-results/junit.xml',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './components'),
      '@/utils': resolve(__dirname, './utils'),
      '@/hooks': resolve(__dirname, './hooks'),
      '@/contexts': resolve(__dirname, './contexts'),
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['@testing-library/react', '@testing-library/jest-dom'],
  },
})