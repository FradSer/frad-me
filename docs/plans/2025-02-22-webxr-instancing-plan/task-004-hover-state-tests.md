# Task 004: Hover State Tests

**Priority**: P0
**Estimated Effort**: 1 day
**Phase**: 2 - Feature 1: Hover Interactions

## BDD Scenario

```gherkin
Feature: Work Card Hover Interactions
  As a portfolio visitor
  I want instant visual feedback when hovering over work cards

  Background:
    Given the WebXR experience is loaded
    And the user is on the "work" view
    And all 5 work cards are visible

  Scenario: Instant hover response on work card
    When the user's gaze or cursor hovers over a work card
    Then the card should begin scaling up within 16ms
    And the card should reach target scale (1.1x) within 200ms
    And the glow effect should appear immediately

  Scenario: Hover animation uses spring physics
    When hovering over a work card
    Then the scale animation should use spring physics
    And the forward movement should have slight overshoot
    And the glow opacity should fade in smoothly

  Scenario: Hover works across multiple cards
    When the user hovers over card 1
    Then card 1 should scale up
    When the user moves to hover over card 2
    Then card 1 should return to normal scale
    And card 2 should scale up

  Scenario: WIP badge appears on hover
    Given a work card has the "isWIP" flag set
    When hovering over that card
    Then the "WIP" badge should appear with the card

  Scenario: Hover ends when cursor leaves
    Given a work card is currently hovered
    When the cursor moves away from the card
    Then the card should scale back to normal using spring physics
    And the glow effect should fade out
```

## Description

Create unit and component tests for hover interactions on work cards. Tests verify that the existing `WorkCardsInstanced` component correctly handles hover states.

## Verification (Test-First)

### Red - Create Failing Tests

Create tests that verify hover behavior against BDD scenarios:

### tests/unit/webxr/hoverState.test.ts

```typescript
describe('WorkCardInstanced Hover State', () => {
  it('should respond to hover within 16ms', async () => {
    // Measure time from pointer move to scale change
    // Assert time < 16ms
  });

  it('should use spring physics for scale animation', () => {
    // Verify scaleSpring uses elastic/bouncy config
  });

  it('should handle multiple card hover correctly', () => {
    // Hover card 1, then move to card 2
    // Verify card 1 scales down, card 2 scales up
  });

  it('should show WIP badge on hover', () => {
    // Mock work with isWIP: true
    // Hover and verify badge appears
  });

  it('should animate out on hover end', () => {
    // Hover then leave
    // Verify spring animation back to normal
  });
});
```

### tests/components/WebXR/WorkCardsInstanced.hover.test.tsx

```typescript
describe('WorkCardsInstanced Hover', () => {
  it('triggers onPointerMove handler', () => {
    // Render component
    // Simulate pointer move
    // Verify hover state updates
  });
});
```

## Verification Steps

1. Run `pnpm test tests/unit/webxr/hoverState.test.ts`
2. Verify tests fail because implementation doesn't exist in test environment
3. Run `pnpm test tests/components/WebXR/WorkCardsInstanced.hover.test.tsx`

## Acceptance Criteria

- 5+ test cases for hover scenarios
- Tests verify timing (<16ms, <200ms, <300ms)
- Tests verify spring physics behavior
- Tests verify WIP badge visibility

## Dependencies

**depends-on**: [Task 002: Set up Cucumber step definitions](./task-002-setup-step-definitions.md)
