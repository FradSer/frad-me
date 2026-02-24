# Task 010: Loading State Tests

**Priority**: P0
**Estimated Effort**: 1 day
**Phase**: 5 - Feature 4: Loading States

## BDD Scenario

```gherkin
Feature: Loading States
  As a portfolio visitor
  I want clear feedback during loading

  Background:
    Given the user navigates to /webxr
    And the WebXR experience has not loaded yet

  Scenario: Loading indicator appears immediately
    Then a loading spinner should appear within 100ms
    And the spinner should be centered on screen

  Scenario: Components load in chunks
    Then WebXRCanvas should load first
    And heavy components should load in parallel

  Scenario: Texture atlas loads progressively
    When the texture atlas begins loading
    Then a progress indicator should show loading progress

  Scenario: Custom fonts load asynchronously
    When the GT Eesti Display Bold font is loading
    Then text should use fallback font until loaded
    And text should re-render with custom font when loaded

  Scenario: Scene becomes interactive after loading
    Given all assets have finished loading
    Then the loading indicator should fade out
    And the breathing animation should start
```

## Description

Create tests for loading states including loading indicators, progressive loading, and interactive transitions.

## Verification (Test-First)

### Red - Create Failing Tests

### tests/unit/webxr/loadingStates.test.ts

```typescript
describe('Loading States', () => {
  it('shows loading indicator within 100ms', () => {
    // Navigate to /webxr
    // Verify loading appears < 100ms
  });

  it('loads components in chunks', () => {
    // Check network requests
    // Verify chunk splitting
  });

  it('shows texture loading progress', () => {
    // Verify texture loading triggers progress
  });

  it('falls back to system font', () => {
    // Mock slow font loading
    // Verify fallback font used
  });

  it('fades loading indicator on complete', () => {
    // All assets load
    // Verify indicator fades
  });
});
```

## Verification Steps

1. Run `pnpm test tests/unit/webxr/loadingStates.test.ts`
2. Verify tests fail appropriately

## Acceptance Criteria

- Loading indicator timing verified (<100ms)
- Chunk loading verified
- Font fallback verified
- Fade-out transition verified

## Dependencies

**depends-on**: [Task 003: Configure Jest for WebXR](./task-003-configure-jest-webxr.md)
