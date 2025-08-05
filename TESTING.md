# Testing Infrastructure Documentation

This document describes the optimized testing infrastructure for the Next.js portfolio website.

## Overview

The testing infrastructure has been completely refactored to follow DRY principles, improve maintainability, and enhance reliability. The key improvements include:

- **Centralized mocks and utilities** to eliminate duplication
- **Reusable page objects** for E2E tests
- **Comprehensive test fixtures** for consistent data
- **Better error handling** and retry mechanisms
- **Performance-optimized configurations**

## Structure

```
src/
├── __tests__/
│   ├── __utils__/                    # Centralized testing utilities
│   │   ├── mocks.ts                 # Mock factory functions
│   │   ├── fixtures.ts              # Test data fixtures
│   │   └── test-helpers.ts          # Helper functions
│   ├── components/                   # Component tests
│   │   ├── ThemeSwitcher.test.tsx   # Theme switching component
│   │   ├── WorkCard.test.tsx        # Work card component
│   │   └── ResponsiveLayout.test.tsx # Responsive behavior
│   └── mdx.test.ts                  # MDX utility tests
├── test-setup.ts                    # Global test setup
tests/
├── e2e/
│   ├── __utils__/
│   │   └── page-objects.ts          # Reusable page objects
│   ├── navigation.spec.ts           # Navigation tests
│   ├── works.spec.ts               # Works functionality
│   └── theme-responsive.spec.ts     # Theme + responsive tests
```

## Test Configurations

### Vitest Configuration

The Vitest configuration (`vitest.config.ts`) includes:

- **Performance optimizations**: Multi-threading, coverage reporting
- **Better path resolution**: Comprehensive alias mapping
- **CI/CD integration**: JUnit reporting for CI systems
- **Timeout management**: Reasonable timeouts for different scenarios

### Playwright Configuration

The Playwright configuration (`playwright.config.ts`) features:

- **Enhanced reporting**: HTML, JSON, and JUnit reports
- **Improved reliability**: Screenshots and videos on failure
- **Browser matrix**: Desktop and optional mobile testing
- **Network conditions**: Timeout and environment handling

## Key Features

### 1. Centralized Mocks (`src/__tests__/__utils__/mocks.ts`)

Factory functions for creating consistent mocks:

```typescript
// Create theme mock with custom overrides
const themeState = createMockTheme({ theme: 'dark' })

// Setup all Next.js mocks at once
setupNextJsMocks()
```

**Benefits:**
- Eliminates mock duplication across test files
- Provides consistent mock behavior
- Easy to update mocks globally
- Supports custom overrides when needed

### 2. Test Fixtures (`src/__tests__/__utils__/fixtures.ts`)

Predefined test data for consistent testing:

```typescript
// Consistent work card props
const workCard = mockWorkCardProps.fullScreenWork

// Theme states for all scenarios
const darkTheme = themeStates.dark
```

**Benefits:**
- Consistent test data across all tests
- Easy to modify test scenarios
- Reduces setup code in individual tests
- Supports complex data structures

### 3. Page Objects (`tests/e2e/__utils__/page-objects.ts`)

Reusable page objects for E2E tests:

```typescript
const homePage = new HomePage(page)
await homePage.goto('/')
await homePage.performCompleteUITest()
```

**Benefits:**
- Eliminates selector duplication
- Provides high-level test operations
- Better test maintenance
- Improved test readability

### 4. Enhanced Test Helpers (`src/__tests__/__utils__/test-helpers.ts`)

Utility functions for common test operations:

```typescript
// Render with multiple providers
renderWithProviders(<Component />, { withTheme: true })

// Trigger responsive behavior
triggerResize(800, 600)

// Retry flaky assertions
await retryAssertion(() => expectSomething())
```

**Benefits:**
- Reduces boilerplate code
- Handles complex setup scenarios
- Provides retry mechanisms for flaky tests
- Includes accessibility helpers

## Test Categories

### Unit Tests

**MDX Utilities** (`src/__tests__/mdx.test.ts`):
- File content reading with error handling
- Post compilation with various frontmatter structures
- Error scenarios and edge cases
- Performance considerations

**Theme Switcher** (`src/__tests__/components/ThemeSwitcher.test.tsx`):
- Theme switching between light/dark/system modes
- Error handling for invalid states
- Accessibility attributes
- Multiple click scenarios

**Work Cards** (`src/__tests__/components/WorkCard.test.tsx`):
- Rendering with different props
- Link vs WIP behavior
- Background color variations
- Mouse interactions
- Accessibility features

**Responsive Layout** (`src/__tests__/components/ResponsiveLayout.test.tsx`):
- Viewport detection
- Media query handling
- Grid system behavior
- Performance with frequent changes

### End-to-End Tests

**Navigation** (`tests/e2e/navigation.spec.ts`):
- Homepage loading and structure
- Theme switching functionality
- Work page navigation
- Responsive header behavior
- Keyboard navigation
- Network condition handling

**Works Functionality** (`tests/e2e/works.spec.ts`):
- Work card display and interaction
- WIP item handling
- Work detail page loading
- Image loading and optimization
- Responsive layout testing
- Performance benchmarks

**Theme + Responsive Integration** (`tests/e2e/theme-responsive.spec.ts`):
- Theme persistence across viewports
- Mobile theme switching
- Visual consistency testing
- System preference handling
- Performance with rapid changes
- Accessibility compliance

## Running Tests

### Unit and Component Tests

```bash
# Run all unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch

# Run specific test file
pnpm test ThemeSwitcher

# Verbose output
VERBOSE_TESTS=true pnpm test
```

### End-to-End Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific browser
pnpm test:e2e --project=chromium

# Run with mobile tests
MOBILE_TESTS=true pnpm test:e2e

# Debug mode
pnpm test:e2e --debug

# Headed mode
pnpm test:e2e --headed
```

## Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names that explain the expected behavior
- Separate unit, integration, and E2E tests
- Use fixtures for consistent test data

### 2. Mock Strategy

- Use centralized mocks for consistency
- Mock at the appropriate level (component vs module vs network)
- Provide meaningful mock data that reflects real usage
- Reset mocks between tests

### 3. Assertions

- Use specific assertions rather than generic ones
- Test both positive and negative scenarios
- Include accessibility assertions
- Use retry mechanisms for flaky assertions

### 4. Performance

- Use `beforeEach` and `afterEach` for test isolation
- Avoid unnecessary DOM queries
- Use page objects to reduce selector duplication
- Implement timeouts appropriate to the test type

### 5. Maintenance

- Keep test data in fixtures for easy updates
- Use helper functions for common operations
- Document complex test scenarios
- Regular cleanup of obsolete tests

## Troubleshooting

### Common Issues

1. **Flaky Tests**: Use retry mechanisms and stable selectors
2. **Slow Tests**: Optimize network conditions and use appropriate timeouts
3. **Mock Issues**: Ensure mocks are properly reset between tests
4. **Selector Problems**: Use data-testid attributes for reliable selection

### Debugging

- Use `screen.debug()` in component tests to see rendered output
- Enable verbose console output with `VERBOSE_TESTS=true`
- Use Playwright's debug mode for E2E test issues
- Check test artifacts in `test-results/` directory

## CI/CD Integration

The testing infrastructure supports CI/CD with:

- JUnit XML reports for test result integration
- HTML reports for detailed test analysis
- Screenshot and video capture for failed E2E tests
- Coverage reports in multiple formats
- Optimized performance for CI environments

## Future Enhancements

Potential improvements to consider:

1. **Visual Regression Testing**: Add screenshot comparison tests
2. **API Testing**: Include tests for API endpoints
3. **Performance Monitoring**: Add Core Web Vitals testing
4. **Cross-browser Testing**: Expand browser matrix
5. **Accessibility Automation**: Integrate axe-core for automated a11y testing

## Contributing

When adding new tests:

1. Use existing fixtures and mocks when possible
2. Follow the established patterns and conventions
3. Update documentation for new test categories
4. Ensure tests are reliable and maintainable
5. Add appropriate error handling and cleanup