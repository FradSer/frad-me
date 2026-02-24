# Task 011: Verify Bundle Optimization

**Priority**: P0
**Estimated Effort**: 0.5 day
**Phase**: 5 - Feature 4: Loading States

## BDD Scenario

```gherkin
Scenario: Loading errors are handled gracefully
  When a texture fails to load
  Then a placeholder should be displayed
  And an error message should be logged
  And the rest of the scene should remain functional

Scenario: Initial bundle size is optimized
  Then the initial JavaScript bundle should be under 200KB
  And total WebXR chunks should be under 2MB
  And lazy-loaded components should not block initial render

Scenario: Loading is faster on repeat visits
  Given the user has visited WebXR before
  Then cached assets should load from browser cache
  And loading time should be under 500ms

Scenario: Loading meets performance budgets
  Then total page load time should be under 2 seconds
  And time to interactive should be under 2.5 seconds
  And cumulative layout shift should be under 0.1
```

## Description

Verify bundle size, caching, error handling, and performance budgets.

## Verification

### tests/unit/webxr/bundleOptimization.test.ts

```typescript
it('handles texture load errors gracefully', () => {
  // Mock failed texture load
  // Verify placeholder shown
  // Verify error logged
});

it('initial bundle is under 200KB', () => {
  // Analyze bundle size
  // Assert < 200KB
});

it('WebXR chunks under 2MB', () => {
  // Analyze all chunks
  // Assert < 2MB
});

it('cached load under 500ms', () => {
  // Second visit
  // Measure load time
  // Assert < 500ms
});

it('page load under 2 seconds', () => {
  // Measure load time
  // Assert < 2000ms
});
```

## Files to Verify

- `next.config.ts` - bundle splitting
- `utils/webxr/textureAtlas.ts` - error handling

## Verification Steps

1. Run `pnpm analyze` to check bundle sizes
2. Run `pnpm test tests/unit/webxr/bundleOptimization.test.ts`

## Acceptance Criteria

- Bundle sizes meet targets (200KB initial, 2MB total)
- Cache behavior verified
- Error handling verified

## Dependencies

**depends-on**: [Task 010: Loading state tests](./task-010-loading-state-tests.md)
