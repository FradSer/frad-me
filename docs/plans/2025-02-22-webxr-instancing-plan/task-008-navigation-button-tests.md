# Task 008: Navigation Button Tests

**Priority**: P0
**Estimated Effort**: 1 day
**Phase**: 4 - Feature 3: Navigation

## BDD Scenario

```gherkin
Feature: Navigation Interactions
  As a portfolio visitor
  I want to easily navigate between views using the navigation button

  Background:
    Given the WebXR experience is loaded
    And the navigation button is visible

  Scenario: Navigation button has breathing animation
    Given no user has interacted with the button
    Then the button should scale between 1.0 and 1.05
    And the breathing cycle should repeat every 2.5 seconds

  Scenario: Navigation button shows hover state
    When hovering over the navigation button
    Then the button should scale to 1.1
    And the text color should lighten
    And the scale change should complete within 200ms

  Scenario: Clicking navigation toggles views
    Given the user is on the "home" view
    When clicking the navigation button
    Then the view should switch to "work"
    And the button text should change to "home"

  Scenario: Breathing animation stops after first interaction
    Given the user has clicked the navigation button once
    Then the breathing animation should stop

  Scenario: Navigation button maintains correct position
    Then the button should be positioned at [2.5, 2.5, 0]
    And the button should face the camera
```

## Description

Create tests for navigation button functionality including breathing animation, hover states, and view toggling.

## Verification (Test-First)

### Red - Create Failing Tests

### tests/unit/webxr/navigationButton.test.ts

```typescript
describe('Navigation Button', () => {
  it('has breathing animation scaling 1.0 to 1.05', () => {
    // Verify scale oscillates in range
    // Verify cycle is 2.5 seconds
  });

  it('scales to 1.1 on hover within 200ms', () => {
    // Hover button
    // Verify scale === 1.1
    // Verify time < 200ms
  });

  it('toggles view on click', () => {
    // Click button
    // Verify view changes
  });

  it('stops breathing after first click', () => {
    // First click
    // Verify breathing stops
  });

  it('positioned at [2.5, 2.5, 0]', () => {
    // Check position
  });
});
```

## Verification Steps

1. Run `pnpm test tests/unit/webxr/navigationButton.test.ts`
2. Verify tests fail (implementation needs verification)

## Acceptance Criteria

- 5+ test cases for navigation button
- Breathing animation timing verified (2.5s)
- Hover timing verified (<200ms)
- Position verified

## Dependencies

**depends-on**: [Task 003: Configure Jest for WebXR](./task-003-configure-jest-webxr.md)
