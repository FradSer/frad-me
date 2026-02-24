# Task 015: Visual Regression Validation

**Priority**: P1
**Estimated Effort**: 0.5 day
**Phase**: 7 - Integration

## Description

Validate visual quality by comparing current implementation against baseline screenshots.

## Verification

### Visual Test Setup

Use Playwright screenshot comparison:

```typescript
// tests/e2e/webxr/visual-regression.spec.ts

test('home view matches baseline', async ({ page }) => {
  await page.goto('/webxr');
  const screenshot = await page.screenshot();
  expect(screenshot).toMatchSnapshot('webxr-home.png', {
    threshold: 0.05, // 5% difference allowed
  });
});

test('work view matches baseline', async ({ page }) => {
  await page.goto('/webxr');
  await page.click('[data-testid=nav-work]');
  await page.waitForTimeout(1000); // Wait for transition
  const screenshot = await page.screenshot();
  expect(screenshot).toMatchSnapshot('webxr-work.png', {
    threshold: 0.05,
  });
});

test('hover state matches baseline', async ({ page }) => {
  await page.goto('/webxr');
  await page.click('[data-testid=nav-work]');
  await page.hover('[data-testid=work-card-0]');
  const screenshot = await page.screenshot();
  expect(screenshot).toMatchSnapshot('webxr-hover.png', {
    threshold: 0.05,
  });
});
```

## SSIM Validation

For more accurate visual comparison, use SSIM (Structural Similarity):

```bash
# Install visual regression tool
pnpm add -D @percy/ember
# or
pnpm add -D playwright-visual-regression
```

## Verification Steps

1. Generate baseline screenshots:
   ```bash
   pnpm test:e2e -- --update-snapshots
   ```

2. Run visual regression tests:
   ```bash
   pnpm test:e2e tests/e2e/webxr/visual-regression.spec.ts
   ```

3. Verify SSIM >= 0.95

## Acceptance Criteria

- All snapshots created
- SSIM >= 0.95 for all states
- No visual regressions detected

## Dependencies

**depends-on**: [Task 014: E2E portfolio flow test](./task-014-e2e-portfolio-flow.md)
