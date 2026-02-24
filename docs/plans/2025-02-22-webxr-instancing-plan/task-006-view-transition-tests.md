# Task 006: View Transition Tests

**Priority**: P0
**Estimated Effort**: 1 day
**Phase**: 3 - Feature 2: View Transitions

## BDD Scenario

```gherkin
Feature: View Transitions
  As a portfolio visitor
  I want smooth transitions between home and work views

  Background:
    Given the WebXR experience is loaded
    And all assets have finished loading

  Scenario: Smooth transition from home to work view
    Given the user is on the "home" view
    When the user clicks the navigation button
    Then the Hero Text should fade out and move backward
    And the work cards should fade in and move forward
    And the transition should complete within 800ms
    And no flickering should occur during transition

  Scenario: Smooth transition from work to home view
    Given the user is on the "work" view
    When the user clicks the navigation button
    Then the work cards should fade out and move backward
    And the Hero Text should fade in and move forward

  Scenario: Camera moves smoothly during transition
    Given the user is on the "home" view
    When transitioning to "work" view
    Then the camera should move from [0, 0, 5] to [0, 2, 8]
    And the camera movement should use spring physics
    And the FOV should change from 75deg to 65deg

  Scenario: Work cards enter with staggered animation
    When transitioning to work view
    Then the first work card should start animating after 400ms
    And subsequent cards should stagger by 150ms

  Scenario: Rapid switching between views
    Given the user is transitioning to work view
    When the user clicks navigation button again before transition completes
    Then the current transition should reverse
    And no animation should overlap
```

## Description

Create tests for view transition functionality. Tests verify that the `WebXRViewContext` correctly manages home↔work transitions with proper timing and animation.

## Verification (Test-First)

### Red - Create Failing Tests

### tests/unit/webxr/viewTransition.test.ts

```typescript
describe('View Transition', () => {
  it('should transition from home to work within 800ms', async () => {
    // Start transition
    // Measure time to complete
    // Assert time <= 800ms
  });

  it('should fade Hero Text during transition', () => {
    // Verify opacity animates from 1 to 0
  });

  it('should move camera with spring physics', () => {
    // Verify camera position lerps with spring config
  });

  it('should stagger card entrance by 150ms', () => {
    // Verify card N+1 starts 150ms after card N
  });

  it('should reverse transition on rapid click', () => {
    // Start transition
    // Click again before complete
    // Verify smooth reversal
  });
});
```

### tests/integration/webxr/viewContext.test.ts

```typescript
describe('WebXRViewContext', () => {
  it('manages currentView state', () => {
    // Set view to 'work'
    // Verify currentView === 'work'
  });

  it('triggers transition on navigation', () => {
    // Click nav button
    // Verify view changes
  });
});
```

## Verification Steps

1. Run `pnpm test tests/unit/webxr/viewTransition.test.ts`
2. Verify tests fail (tests verify implementation behavior)

## Acceptance Criteria

- 5+ test cases for view transitions
- Tests verify timing (800ms, 400ms stagger, 150ms intervals)
- Tests verify camera movement and FOV change
- Tests verify rapid switch reversal

## Dependencies

**depends-on**: [Task 003: Configure Jest for WebXR](./task-003-configure-jest-webxr.md)
