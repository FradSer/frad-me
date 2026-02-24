# Task 007: Verify Transition Timing

**Priority**: P0
**Estimated Effort**: 0.5 day
**Phase**: 3 - Feature 2: View Transitions

## BDD Scenario

```gherkin
Scenario: Elements fade smoothly during transitions
  When transitioning between views
  Then fading elements should use spring-based opacity
  And opacity should never drop below 0.01 before becoming invisible
  And opacity transitions should be synchronized with position changes

Scenario: Footer links appear only on home view
  Given the user is on the "work" view
  Then the external links should be hidden
  When the user switches to "home" view
  Then the external links should fade in

Scenario: Transitions respect reduced motion
  Given the user has enabled reduced motion preference
  When transitioning between views
  Then animations should be linear
  And transition time should be reduced to 400ms

Scenario: Navigation button updates text and state
  Given the user is on the "home" view
  Then the navigation button should display "work"
  When the user transitions to "work" view
  Then the navigation button should display "home"
```

## Description

Verify transition timing, opacity synchronization, reduced motion, and footer links visibility.

## Verification

### Green - Run Tests

Run transition tests and verify implementation matches specs.

### tests/unit/webxr/transitionTiming.test.ts

```typescript
it('should use spring-based opacity', () => {
  // Verify opacity uses spring/lerp, not CSS transitions
});

it('should maintain opacity > 0.01 until invisible', () => {
  // Verify OPACITY_THRESHOLDS.minimum is 0.01
});

it('should show footer links only on home view', () => {
  // Switch to work view
  // Verify FooterLinks3D has opacity 0
  // Switch to home view
  // Verify opacity increases
});

it('should reduce transition time for reduced motion', () => {
  // Mock reduced motion preference
  // Verify transition time is 400ms
});
```

## Files to Verify

- `components/WebXR/FooterLinks3D.tsx` - visibility toggle
- `utils/webxr/materialUtils.ts` - applyOpacityToObject
- `utils/webxr/animationConfig.ts` - reduced motion config

## Verification Steps

1. Run `pnpm test tests/unit/webxr/transitionTiming.test.ts`
2. Verify all assertions pass

## Acceptance Criteria

- Transition time < 800ms verified
- Opacity threshold 0.01 verified
- Footer links visibility toggles correctly
- Reduced motion transitions 400ms

## Dependencies

**depends-on**: [Task 006: View transition tests](./task-006-view-transition-tests.md)
