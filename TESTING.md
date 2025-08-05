# Testing Guide

This document provides comprehensive guidance for testing the frad-me Next.js application.

## Testing Stack

### Unit & Component Testing
- **Framework**: Jest (Next.js official recommendation)
- **Testing Library**: @testing-library/react
- **Environment**: jsdom
- **Assertion Library**: Jest built-in matchers + @testing-library/jest-dom

### End-to-End Testing
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Environment**: Real browser automation

## Quick Start

### Running Tests

```bash
# Unit tests
pnpm test              # Run Jest tests
pnpm test:watch        # Run in watch mode
pnpm test:ci           # Run with coverage for CI
pnpm test:coverage     # Run with coverage

# E2E tests
pnpm test:e2e          # Run E2E tests
pnpm test:e2e:ui       # Run with Playwright UI
pnpm test:e2e:headed   # Run in headed mode

# All tests
pnpm test:all          # Run unit + E2E tests
```

## Configuration Files

### Jest Configuration (`jest.config.js`)

Uses Next.js's built-in Jest integration for optimal compatibility:

- **Next.js Integration**: Automatic handling of Next.js features (Image, Link, etc.)
- **Path Mapping**: Supports `@/` aliases and module resolution
- **TypeScript Support**: Built-in TypeScript compilation
- **Coverage Configuration**: Comprehensive coverage reporting with thresholds

### Jest Setup (`jest.setup.js`)

Global test setup including:

- Mock configurations for Next.js components
- Global DOM APIs (matchMedia, ResizeObserver, etc.)
- Default theme and router mocks
- 3D library mocks for Three.js components

### Playwright Configuration (`playwright.config.ts`)

Multi-browser E2E testing setup:

- **Cross-browser Testing**: Chromium, Firefox, WebKit
- **Enhanced Reporting**: HTML, JSON, and JUnit reports
- **CI/CD Integration**: Optimized for continuous integration
- **Development Server**: Auto-start dev server for testing

## File Structure

```
src/
├── __tests__/
│   └── mdx.test.ts              # MDX utility tests
tests/
├── e2e/
│   ├── __utils__/
│   │   └── page-objects.ts      # Reusable page objects
│   ├── navigation.spec.ts       # Navigation functionality
│   ├── works.spec.ts           # Works page functionality
│   └── theme-responsive.spec.ts # Theme and responsive tests
jest.config.js                  # Jest configuration
jest.setup.js                   # Global test setup
playwright.config.ts            # Playwright configuration
```

## Test Categories

### Unit Tests

**MDX Utilities** (`src/__tests__/mdx.test.ts`):
- File content reading and processing
- Frontmatter parsing with gray-matter
- MDX compilation with mdx-bundler
- Error handling and edge cases

### End-to-End Tests

**Navigation** (`tests/e2e/navigation.spec.ts`):
- Homepage loading and basic structure
- Theme switching between light/dark modes
- Navigation to work detail pages
- Responsive header behavior

**Works Functionality** (`tests/e2e/works.spec.ts`):
- Work card display and interactions
- WIP (Work in Progress) item handling
- Work detail page loading and content
- Image loading and optimization

**Theme + Responsive** (`tests/e2e/theme-responsive.spec.ts`):
- Theme persistence across different viewports
- Mobile theme switching functionality
- Integration between theme and responsive behavior

## Writing Tests

### Unit Test Example

```javascript
// src/__tests__/example.test.ts
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Component from '../Component'

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    render(<Component />)
    
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### E2E Test Example

```javascript
// tests/e2e/example.spec.ts
import { test, expect } from '@playwright/test'

test('should navigate to work page', async ({ page }) => {
  await page.goto('/')
  
  const workLink = page.locator('a[href^="/works/"]').first()
  await workLink.click()
  
  await expect(page).toHaveURL(/\/works\//)
  await expect(page.locator('main')).toBeVisible()
})
```

## Best Practices

### 1. Test Organization
- Use descriptive test names that explain expected behavior
- Group related tests with `describe` blocks
- Separate unit, integration, and E2E tests clearly

### 2. Mocking Strategy
- Use Jest's built-in mocking capabilities
- Mock at the appropriate level (component vs module)
- Reset mocks between tests for isolation

### 3. Assertions
- Use specific assertions rather than generic ones
- Test both positive and negative scenarios
- Include accessibility testing where appropriate

### 4. Performance
- Use `beforeEach`/`afterEach` for test isolation
- Avoid unnecessary DOM queries in tests
- Use appropriate timeouts for async operations

## Debugging

### Unit Tests
- Use `screen.debug()` to see rendered output
- Use `--verbose` flag for detailed test output
- Check console output for warnings and errors

### E2E Tests
- Use `--headed` to see browser actions
- Use `--debug` to pause test execution
- Check screenshots/videos in `test-results/` folder

## CI/CD Integration

The testing setup supports continuous integration with:

- **Coverage Reports**: Automated coverage reporting
- **JUnit XML**: Test result integration with CI systems
- **Artifacts**: Screenshots and videos for failed E2E tests
- **Parallel Execution**: Optimized for CI performance

## Common Issues

1. **Module Resolution**: Ensure `@/` aliases are configured in `jest.config.js`
2. **Next.js Features**: Use Next.js Jest integration for proper handling
3. **Async Operations**: Use proper `await` and timeout handling
4. **Mock Issues**: Ensure mocks are reset between tests

## Contributing

When adding new tests:

1. Follow existing patterns and naming conventions
2. Use the global setup and mocks when possible
3. Ensure tests are reliable and not flaky
4. Update documentation for new test categories
5. Add appropriate error handling and cleanup

For questions or issues with the testing setup, refer to:
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Documentation](https://testing-library.com/docs/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Next.js Testing Documentation](https://nextjs.org/docs/testing)