# Task 009: Verify Navigation Accessibility

**Priority**: P0
**Estimated Effort**: 0.5 day
**Phase**: 4 - Feature 3: Navigation

## BDD Scenario

```gherkin
Scenario: Navigation works with mouse
  Given the user is on desktop browser
  When moving mouse over navigation button
  Then hover state should appear
  When clicking the button
  Then view transition should trigger

Scenario: Navigation works with Vision Pro hand tracking
  Given the user is using Vision Pro
  When gazing at the navigation button
  Then hover state should appear
  When performing pinch gesture
  Then view transition should trigger

Scenario: Navigation works with Quest controller
  Given the user is using Quest
  When pointing controller ray at navigation button
  Then hover state should appear
  When pressing trigger button
  Then view transition should trigger

Scenario: Navigation button text is readable
  Then the text should use GT Eesti Display Bold font
  And the text should be white in normal state
  And the text should meet WCAG AA contrast requirements

Scenario: Navigation button is accessible
  Then the button should be keyboard navigable
  And the button should have proper ARIA label
  And the button should support screen readers
```

## Description

Verify navigation accessibility and device input support.

## Verification

### tests/unit/webxr/navigationAccessibility.test.ts

```typescript
it('supports keyboard navigation', () => {
  // Tab to button
  // Verify focus
  // Press Enter
  // Verify view changes
});

it('has proper ARIA label', () => {
  // Check aria-label
  // Verify label describes action
});

it('meets WCAG AA contrast', () => {
  // Measure text/background contrast
  // Verify ratio >= 4.5:1
});

it('supports Vision Pro pinch gesture', () => {
  // Mock pinch event
  // Verify triggers click
});

it('supports Quest controller', () => {
  // Mock controller ray
  // Verify hover/click work
});
```

## Files to Verify

- `components/WebXR/Navigation3D.tsx` - ARIA attributes
- `components/WebXR/VisionProInputHandler.tsx` - hand tracking
- `utils/webxr/accessibilityValidator.ts` - contrast checks

## Verification Steps

1. Run `pnpm test tests/unit/webxr/navigationAccessibility.test.ts`
2. Verify accessibility tests pass

## Acceptance Criteria

- Keyboard navigation works
- ARIA label present and descriptive
- WCAG AA contrast ratio >= 4.5:1
- Vision Pro and Quest input supported

## Dependencies

**depends-on**: [Task 008: Navigation button tests](./task-008-navigation-button-tests.md)
