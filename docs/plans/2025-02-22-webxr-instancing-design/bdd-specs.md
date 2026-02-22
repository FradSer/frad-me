# BDD Specifications

**Design Document**: WebXR GPU-First Instancing Optimization
**Date**: 2025-02-22

---

## Overview

This document defines Behavior-Driven Development (BDD) specifications for the WebXR optimization project. These Given/When/Then scenarios describe the expected behavior from a user perspective, ensuring all features work as designed.

**Feature Files Location**: `/tests/features/webxr/`

---

## Feature 1: Work Card Hover Interactions

**File**: `tests/features/webxr/work-card-hover-interactions.feature`

### Background
```gherkin
Feature: Work Card Hover Interactions
  As a portfolio visitor
  I want instant visual feedback when hovering over work cards
  So that I can confidently explore the portfolio

  Background:
    Given the WebXR experience is loaded
    And the user is on the "work" view
    And all 5 work cards are visible
```

### Scenarios

#### Scenario 1: Instant hover response
```gherkin
Scenario: Instant hover response on work card
  When the user's gaze or cursor hovers over a work card
  Then the card should begin scaling up within 16ms
  And the card should reach target scale (1.1x) within 200ms
  And the glow effect should appear immediately
```

#### Scenario 2: Smooth hover animation
```gherkin
Scenario: Hover animation uses spring physics
  When hovering over a work card
  Then the scale animation should use spring physics
  And the forward movement should have slight overshoot
  And the glow opacity should fade in smoothly
```

#### Scenario 3: Multiple cards hover
```gherkin
Scenario: Hover works across multiple cards
  When the user hovers over card 1
  Then card 1 should scale up
  When the user moves to hover over card 2
  Then card 1 should return to normal scale
  And card 2 should scale up
  And the transition between cards should be smooth
```

#### Scenario 4: Hover with WIP badge
```gherkin
Scenario: WIP badge appears on hover
  Given a work card has the "isWIP" flag set
  When hovering over that card
  Then the "WIP" badge should appear with the card
  And the badge should have proper contrast
```

#### Scenario 5: Hover ends smoothly
```gherkin
Scenario: Hover ends when cursor leaves
  Given a work card is currently hovered
  When the cursor moves away from the card
  Then the card should scale back to normal using spring physics
  And the glow effect should fade out
  And the animation should complete within 300ms
```

#### Scenario 6: Vision Pro hand tracking hover
```gherkin
Scenario: Hand tracking gaze hover works
  Given the user is using Vision Pro with hand tracking
  When the user's gaze focuses on a work card
  Then the card should show hover state
  When the user performs pinch gesture
  Then the card should trigger click navigation
```

#### Scenario 7: Reduced motion preference
```gherkin
Scenario: Hover respects reduced motion preference
  Given the user has enabled reduced motion preference
  When hovering over a work card
  Then the scale change should be minimal (1.05x max)
  And the animation should be linear, not spring-based
```

#### Scenario 8: Cross-device consistency
```gherkin
Scenario: Hover behavior is consistent across devices
  Given the user accesses WebXR on Vision Pro
  And given the user accesses WebXR on Quest
  And given the user accesses WebXR on desktop browser
  Then hover response time should be consistent (< 20ms variance)
  And visual feedback should be identical
```

---

## Feature 2: View Transitions

**File**: `tests/features/webxr/view-transitions.feature`

### Background
```gherkin
Feature: View Transitions
  As a portfolio visitor
  I want smooth transitions between home and work views
  So that the experience feels cohesive and polished

  Background:
    Given the WebXR experience is loaded
    And all assets have finished loading
```

### Scenarios

#### Scenario 1: Home to work transition
```gherkin
Scenario: Smooth transition from home to work view
  Given the user is on the "home" view
  When the user clicks the navigation button
  Then the Hero Text should fade out and move backward
  And the work cards should fade in and move forward
  And the transition should complete within 800ms
  And no flickering should occur during transition
```

#### Scenario 2: Work to home transition
```gherkin
Scenario: Smooth transition from work to home view
  Given the user is on the "work" view
  When the user clicks the navigation button
  Then the work cards should fade out and move backward
  And the Hero Text should fade in and move forward
  And the transition should complete within 800ms
  And the state change should be atomic
```

#### Scenario 3: Camera movement during transition
```gherkin
Scenario: Camera moves smoothly during transition
  Given the user is on the "home" view
  When transitioning to "work" view
  Then the camera should move from [0, 0, 5] to [0, 2, 8]
  And the camera movement should use spring physics
  And the FOV should change from 75deg to 65deg
  And the look-at point should remain at [0, 0, 0]
```

#### Scenario 4: Staggered card entrance
```gherkin
Scenario: Work cards enter with staggered animation
  When transitioning to work view
  Then the first work card should start animating after 400ms
  And subsequent cards should stagger by 150ms
  And all cards should complete entrance within 1200ms
```

#### Scenario 5: Opacity transitions
```gherkin
Scenario: Elements fade smoothly during transitions
  When transitioning between views
  Then fading elements should use spring-based opacity
  And opacity should never drop below 0.01 before becoming invisible
  And opacity transitions should be synchronized with position changes
```

#### Scenario 6: Rapid view switching
```gherkin
Scenario: Rapid switching between views
  Given the user is transitioning to work view
  When the user clicks navigation button again before transition completes
  Then the current transition should reverse
  And no animation should overlap
  And the final state should match the target view
```

#### Scenario 7: Performance under transition
```gherkin
Scenario: Frame rate maintained during transitions
  Given the user has 60 FPS baseline
  When transitioning between views
  Then FPS should never drop below 45
  And frame time should not exceed 22ms
  And no frame drops should be noticeable
```

#### Scenario 8: External links visibility
```gherkin
Scenario: Footer links appear only on home view
  Given the user is on the "work" view
  Then the external links should be hidden
  When the user switches to "home" view
  Then the external links should fade in
  And the links should be interactive within 200ms
```

#### Scenario 9: Reduced motion transitions
```gherkin
Scenario: Transitions respect reduced motion
  Given the user has enabled reduced motion preference
  When transitioning between views
  Then animations should be linear
  And transition time should be reduced to 400ms
  And no spring overshoot should occur
```

#### Scenario 10: Navigation button state
```gherkin
Scenario: Navigation button updates text and state
  Given the user is on the "home" view
  Then the navigation button should display "work"
  When the user transitions to "work" view
  Then the navigation button should display "home"
  And the button should stop breathing animation after interaction
```

---

## Feature 3: Navigation Interactions

**File**: `tests/features/webxr/navigation-interactions.feature`

### Background
```gherkin
Feature: Navigation Interactions
  As a portfolio visitor
  I want to easily navigate between views using the navigation button
  So that I can explore all content without confusion

  Background:
    Given the WebXR experience is loaded
    And the navigation button is visible
```

### Scenarios

#### Scenario 1: Breathing animation
```gherkin
Scenario: Navigation button has breathing animation
  Given no user has interacted with the button
  Then the button should scale between 1.0 and 1.05
  And the breathing cycle should repeat every 2.5 seconds
  And the animation should use spring physics
```

#### Scenario 2: Hover state
```gherkin
Scenario: Navigation button shows hover state
  When hovering over the navigation button
  Then the button should scale to 1.1
  And the text color should lighten
  And the scale change should complete within 200ms
```

#### Scenario 3: Click behavior
```gherkin
Scenario: Clicking navigation toggles views
  Given the user is on the "home" view
  When clicking the navigation button
  Then the view should switch to "work"
  And the button text should change to "home"
  And the transition should begin immediately
```

#### Scenario 4: Breathing stops after interaction
```gherkin
Scenario: Breathing animation stops after first interaction
  Given the user has clicked the navigation button once
  Then the breathing animation should stop
  And the button should remain at scale 1.0 when idle
```

#### Scenario 5: Mouse input
```gherkin
Scenario: Navigation works with mouse
  Given the user is on desktop browser
  When moving mouse over navigation button
  Then hover state should appear
  When clicking the button
  Then view transition should trigger
```

#### Scenario 6: Hand tracking input
```gherkin
Scenario: Navigation works with Vision Pro hand tracking
  Given the user is using Vision Pro
  When gazing at the navigation button
  Then hover state should appear
  When performing pinch gesture
  Then view transition should trigger
```

#### Scenario 7: Quest controller input
```gherkin
Scenario: Navigation works with Quest controller
  Given the user is using Quest
  When pointing controller ray at navigation button
  Then hover state should appear
  When pressing trigger button
  Then view transition should trigger
```

#### Scenario 8: Button position
```gherkin
Scenario: Navigation button maintains correct position
  Then the button should be positioned at [2.5, 2.5, 0]
  And the button should face the camera
  And the button should be in front of the background
```

#### Scenario 9: Text readability
```gherkin
Scenario: Navigation button text is readable
  Then the text should use GT Eesti Display Bold font
  And the text should be white in normal state
  And the text should meet WCAG AA contrast requirements
```

#### Scenario 10: Accessibility
```gherkin
Scenario: Navigation button is accessible
  Then the button should be keyboard navigable
  And the button should have proper ARIA label
  And the button should support screen readers
```

---

## Feature 4: Loading States

**File**: `tests/features/webxr/loading-states.feature`

### Background
```gherkin
Feature: Loading States
  As a portfolio visitor
  I want clear feedback during loading
  So that I understand what's happening

  Background:
    Given the user navigates to /webxr
    And the WebXR experience has not loaded yet
```

### Scenarios

#### Scenario 1: Initial loading indicator
```gherkin
Scenario: Loading indicator appears immediately
  Then a loading spinner should appear within 100ms
  And the spinner should be centered on screen
  And the text "Loading WebXR Experience..." should be visible
```

#### Scenario 2: Dynamic imports load asynchronously
```gherkin
Scenario: Components load in chunks
  Then WebXRCanvas should load first
  And heavy components should load in parallel
  And chunk load times should be logged in development
```

#### Scenario 3: Texture loading
```gherkin
Scenario: Texture atlas loads progressively
  When the texture atlas begins loading
  Then a progress indicator should show loading progress
  And each card image should appear as it loads
  And fully loaded cards should be interactive immediately
```

#### Scenario 4: Font loading
```gherkin
Scenario: Custom fonts load asynchronously
  When the GT Eesti Display Bold font is loading
  Then text should use fallback font until loaded
  And text should re-render with custom font when loaded
  And no layout shift should occur
```

#### Scenario 5: Interactive state
```gherkin
Scenario: Scene becomes interactive after loading
  Given all assets have finished loading
  Then the loading indicator should fade out
  And the scene should become interactive within 500ms
  And the breathing animation should start
```

#### Scenario 6: Error handling
```gherkin
Scenario: Loading errors are handled gracefully
  When a texture fails to load
  Then a placeholder should be displayed
  And an error message should be logged
  And the rest of the scene should remain functional
```

#### Scenario 7: Bundle size monitoring
```gherkin
Scenario: Initial bundle size is optimized
  Then the initial JavaScript bundle should be under 200KB
  And total WebXR chunks should be under 2MB
  And lazy-loaded components should not block initial render
```

#### Scenario 8: Cache behavior
```gherkin
Scenario: Loading is faster on repeat visits
  Given the user has visited WebXR before
  Then cached assets should load from browser cache
  And loading time should be under 500ms
  And no loading indicator should be needed
```

#### Scenario 9: Vision Pro loading
```gherkin
Scenario: Loading optimizes for Vision Pro
  Given the user is accessing via Vision Pro
  Then textures should be pre-loaded at higher resolution
  And shaders should be pre-compiled
  And loading should complete in under 1 second
```

#### Scenario 10: Performance budget
```gherkin
Scenario: Loading meets performance budgets
  Then total page load time should be under 2 seconds
  And time to interactive should be under 2.5 seconds
  And cumulative layout shift should be under 0.1
```

---

## Feature 5: Performance Monitoring

**File**: `tests/features/webxr/performance-monitoring.feature`

### Background
```gherkin
Feature: Performance Monitoring
  As a developer
  I want to monitor performance metrics
  So that I can optimize the experience

  Background:
    Given the WebXR experience is loaded
    And performance monitoring is enabled
```

### Scenarios

#### Scenario 1: FPS tracking
```gherkin
Scenario: Frame rate is tracked continuously
  When the scene is rendering
  Then FPS should be measured every second
  And FPS should be logged to console in development
  And FPS data should be stored for analysis
```

#### Scenario 2: Quality adaptation
```gherkin
Scenario: Quality adapts based on FPS
  Given the current FPS drops below 30
  Then animation speed should increase by 50%
  And spring tension should increase by 50%
  And quality level should be set to "reduced"
  When FPS returns above 50
  Then quality level should return to "high"
```

#### Scenario 3: Draw call monitoring
```gherkin
Scenario: Draw calls are counted and limited
  Then draw calls should be counted per frame
  And draw call count should be logged in development
  And draw calls should not exceed 100
```

#### Scenario 4: Memory monitoring
```gherkin
Scenario: Memory usage is tracked
  Then GPU memory usage should be estimated
  And memory usage should be logged in development
  And memory should not exceed 150MB
```

#### Scenario 5: Performance gates
```gherkin
Scenario: Performance gates prevent degradation
  Given FPS drops below 20 for 3 consecutive seconds
  Then non-essential features should be disabled
  And animation complexity should be reduced
  And a warning should be logged
```

#### Scenario 6: Device-specific targets
```gherkin
Scenario: Performance targets vary by device
  Given the user is on Vision Pro
  Then target FPS should be 60
  Given the user is on Quest
  Then target FPS should be 45
  Given the user is on desktop
  Then target FPS should be 30
```

#### Scenario 7: Hot path optimization
```gherkin
Scenario: Render loop is optimized
  Then the render loop should avoid allocations
  Then vectors and matrices should be reused
  Then object traversal should be minimized
```

#### Scenario 8: Visibility culling
```gherkin
Scenario: Invisible objects are not rendered
  Given an object's opacity is below 0.01
  Then the object should not be rendered
  And the object should not receive raycasting
  And rendering should resume when opacity increases
```

#### Scenario 9: Instancing verification
```gherkin
Scenario: Instancing reduces draw calls
  Then work cards should use InstancedMesh
  Then total draw calls should be under 50
  And draw call reduction should be at least 60%
```

#### Scenario 10: Production monitoring
```gherkin
Scenario: Performance metrics are sent in production
  Then FPS should be sampled (not continuous)
  Then errors should be sent to error tracking
  Then performance data should be aggregated
```

---

## Testing Strategy

### Test Organization

```
tests/
├── features/
│   └── webxr/
│       ├── work-card-hover-interactions.feature
│       ├── view-transitions.feature
│       ├── navigation-interactions.feature
│       ├── loading-states.feature
│       └── performance-monitoring.feature
├── unit/
│   ├── webxr/
│   │   ├── textureAtlas.test.ts
│   │   ├── instanceManager.test.ts
│   │   └── animationConfig.test.ts
├── components/
│   └── WebXR/
│       ├── WorkCardsInstanced.test.tsx
│       ├── HeroText.test.tsx
│       └── Navigation3D.test.tsx
├── integration/
│   └── webxr/
│       ├── viewTransitions.test.ts
│       └── hoverStates.test.ts
└── e2e/
    └── webxr/
        ├── portfolioFlow.spec.ts
        └── performance.spec.ts
```

### Test Coverage Targets

| Test Type | Coverage Target | Tool |
|-----------|-----------------|------|
| Unit | 90%+ | Jest |
| Component | 85%+ | Jest + RTL |
| Integration | 70%+ | Jest |
| E2E | Critical flows | Playwright |
| Visual | Key states | Playwright + Screenshots |
| Performance | All devices | Custom + Playwright |
| Accessibility | WCAG AA | Axe + Manual |

### BDD Testing Framework

Use Cucumber/Gherkin syntax with step definitions:

```typescript
// tests/steps/work-card-steps.ts
import { Given, When, Then } from '@cucumber/cucumber';

Given('the WebXR experience is loaded', async function () {
  // Implementation
});

When('the user hovers over a work card', async function () {
  // Implementation
});

Then('the card should begin scaling up within 16ms', async function () {
  // Implementation with timing assertion
});
```

### Performance Testing

Automated performance benchmarks:

```typescript
// tests/performance/webxr-benchmarks.ts
describe('WebXR Performance Benchmarks', () => {
  it('should maintain 60fps on Vision Pro', () => {
    // Measure frame rate over 10 seconds
    // Assert minimum FPS >= 60
  });

  it('should have under 50 draw calls', () => {
    // Count draw calls in work view
    // Assert count <= 50
  });

  it('should respond to hover within 16ms', () => {
    // Measure hover response time
    // Assert time <= 16ms
  });
});
```

---

## References

- [W3C XR Accessibility Guidelines](https://www.w3.org/WAI/apg/xr-accessibility/)
- [MDN WebXR Performance Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API/Performance)
- [Three.js Performance Best Practices](https://www.utsubo.com/blog/threejs-best-practices-100-tips)
- [WCAG 3.0 Silver Guidelines](https://www.w3.org/TR/wcag-3.0/)
- [Meta Horizon Worlds Accessibility](https://developer.oculus.com/documentation/native/android/mobile-accessibility-guide-intro/)

---

**Document Version**: 1.0
**Last Updated**: 2025-02-22