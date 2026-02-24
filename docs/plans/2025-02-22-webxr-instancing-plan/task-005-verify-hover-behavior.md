# Task 005: Verify Hover Behavior

**Priority**: P0
**Estimated Effort**: 0.5 day
**Phase**: 2 - Feature 1: Hover Interactions

## BDD Scenario

```gherkin
Scenario: Hover respects reduced motion preference
  Given the user has enabled reduced motion preference
  When hovering over a work card
  Then the scale change should be minimal (1.05x max)
  And the animation should be linear, not spring-based

Scenario: Hand tracking gaze hover works
  Given the user is using Vision Pro with hand tracking
  When the user's gaze focuses on a work card
  Then the card should show hover state
  When the user performs pinch gesture
  Then the card should trigger click navigation
```

## Description

Verify the hover behavior implementation against edge cases and accessibility requirements.

## Verification

### Green - Run Tests

Run the tests from Task 004 and verify they pass with the existing implementation.

### Reduced Motion Test

```typescript
it('should respect reduced motion preference', () => {
  // Mock window.matchMedia('(prefers-reduced-motion: reduce)')
  // Hover card
  // Verify scale is minimal (1.05x max)
  // Verify animation is linear
});
```

### Hand Tracking Test

```typescript
it('should handle Vision Pro gaze input', () => {
  // Mock Vision Pro gaze events
  // Simulate gaze on card
  // Verify hover state activates
});
```

## Files to Verify

- `components/WebXR/WorkCardsInstanced/index.tsx` - hover handlers
- `utils/webxr/animationConfig.ts` - reduced motion config
- `hooks/useSimpleLerp.ts` - linear animation option

## Verification Steps

1. Run `pnpm test tests/unit/webxr/hoverState.test.ts`
2. Verify reduced motion tests pass
3. Verify timing assertions pass

## Acceptance Criteria

- All hover state tests pass
- Reduced motion preference is respected
- Hover response time < 16ms verified

## Dependencies

**depends-on**: [Task 004: Hover state tests](./task-004-hover-state-tests.md)
