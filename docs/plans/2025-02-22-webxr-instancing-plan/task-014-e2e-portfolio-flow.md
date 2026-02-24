# Task 014: E2E Portfolio Flow Test

**Priority**: P0
**Estimated Effort**: 1 day
**Phase**: 7 - Integration

## Description

Create end-to-end tests that verify the complete portfolio user flow using Playwright.

## Verification (Test-First)

### Red - Create Failing Tests

### tests/e2e/webxr/portfolio-flow.spec.ts

```typescript
import { test, expect } from '@playwright/test';

test.describe('WebXR Portfolio Flow', () => {
  test('complete user journey', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/');

    // 2. Click enter WebXR button
    await page.click('[data-testid=enter-webxr]');

    // 3. Verify home view loads with Hero Text
    await expect(page.locator('text=Frad')).toBeVisible();

    // 4. Click work button
    await page.click('[data-testid=nav-work]');

    // 5. Verify work cards appear
    await expect(page.locator('[data-testid=work-card]')).toHaveCount(5);

    // 6. Hover over first card
    await page.hover('[data-testid=work-card-0]');

    // 7. Verify hover effect (scale up)
    // 8. Click card
    await page.click('[data-testid=work-card-0]');

    // 9. Verify navigation to work detail
    await expect(page.url()).toContain('/works/');
  });

  test('view transition timing', async ({ page }) => {
    // Measure transition time
    // Assert < 800ms
  });

  test('hover response time', async ({ page }) => {
    // Measure hover response
    // Assert < 16ms
  });

  test('reduced motion', async ({ page }) => {
    // Set reduced motion preference
    // Verify reduced animations
  });
});
```

## Verification Steps

1. Run `pnpm test:e2e tests/e2e/webxr/portfolio-flow.spec.ts`
2. Verify E2E tests pass

## Acceptance Criteria

- Complete flow test passes
- Transition timing < 800ms verified
- Hover timing < 16ms verified

## Dependencies

**depends-on**: [Task 003: Configure Jest for WebXR](./task-003-configure-jest-webxr.md)
