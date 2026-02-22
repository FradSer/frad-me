# Task 016: Visual Regression Testing

**Priority**: P1
**Estimated Effort**: 2 days
**Phase**: 6 - Testing & Validation

## BDD Scenario Reference

- (Direct BDD scenarios not applicable, quality assurance task)

## Description

Set up and run visual regression tests to verify that the optimized implementation maintains visual quality compared to the baseline. Use screenshot comparison to detect any unintended visual changes.

## Files to Create/Modify

### New Files
- `tests/e2e/webxr/visual-regression.spec.ts` - Playwright visual tests
- `tests/e2e/webxr/screenshots/` - Screenshot storage
- `utils/webxr/visualRegressionUtils.ts` - Screenshot comparison utility

### Modified Files
- `playwright.config.ts` - Configure for visual regression
- `app/webxr/page.tsx` - May need test-specific configurations

## Implementation Requirements

### Visual Regression Tests

Create Playwright E2E tests that:

#### Key State Screenshots
Capture screenshots of key states:
1. **Home View**: HeroText visible, no work cards
2. **Work View**: All 5 work cards visible
3. **Hover State**: Card hovered with glow effect
4. **WIP Badge**: Card with WIP badge visible
5. **View Transition**: Mid-transition state
6. **Reduced Motion**: Reduced motion enabled
7. **Loading**: Loading spinner visible

#### Screenshot Capture
- Use `page.screenshot()` in Playwright
- Capture full viewport
- Use consistent viewport size
- Use consistent timing (wait for animations to complete)
- Use specific selectors for component screenshots

#### Comparison Method
- Pixel-by-pixel comparison
- SSIM calculation (structural similarity)
- Threshold for differences (allow minor rendering differences)
- Ignore anti-aliasing differences
- Ignore timing differences (animations in progress)

#### Baseline Screenshots
- Store baseline screenshots in `tests/e2e/webxr/screenshots/baseline/`
- Commit baseline to git
- Update baseline when intentional visual changes occur

### Visual Regression Utils

Create utility that:
- Loads screenshots from baseline and current runs
- Compares screenshots using SSIM algorithm
- Highlights differences in diff image
- Returns comparison result with metrics

### Test Configuration
- Configure Playwright for WebXR testing (if possible)
- Use headless mode for CI/CD
- Use headed mode for local verification
- Set viewport to standard size (e.g., 1920x1080)
- Wait for animations before capturing screenshots

### CI/CD Integration
- Run visual tests in CI/CD pipeline
- Fail test if difference exceeds threshold
- Upload diff images for review
- Provide option to update baseline

## Verification Steps

### Test Execution
1. Run `npm run test:e2e tests/e2e/webxr/visual-regression.spec.ts`
2. Verify all visual tests pass
3. Verify no significant differences detected

### Visual Inspection
1. Review baseline screenshots manually
2. Review current screenshots manually
3. Review diff images for unintended changes
4. Verify visual quality is maintained

### Threshold Tuning
1. Adjust SSIM threshold if needed
2. Tune comparison to avoid false positives
3. Ensure meaningful differences are caught

### Device Testing
1. Test on multiple browsers (Chrome, Firefox, Safari)
2. Test on different viewports
3. Test on Vision Pro (if available)

## Acceptance Criteria

- All visual regression tests pass
- SSIM ≥ 0.95 for all screenshots
- No unintended visual changes detected
- Key states captured and verified
- Baseline screenshots stored and versioned
- Diff images generated when differences found
- CI/CD pipeline runs visual tests
- False positives minimized (appropriate thresholds)
- Cross-browser compatibility verified

## Dependencies

**depends-on**: All previous tasks (optimized code to test)

## Exit Criteria

- Visual tests pass
- SSIM targets met
- Baseline verified
- No significant visual regressions