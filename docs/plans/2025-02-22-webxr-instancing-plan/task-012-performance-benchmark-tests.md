# Task 012: Performance Benchmark Tests

**Priority**: P0
**Estimated Effort**: 1 day
**Phase**: 6 - Feature 5: Performance Monitoring

## BDD Scenario

```gherkin
Feature: Performance Monitoring
  As a developer
  I want to monitor performance metrics

  Background:
    Given the WebXR experience is loaded
    And performance monitoring is enabled

  Scenario: Frame rate is tracked continuously
    When the scene is rendering
    Then FPS should be measured every second
    And FPS should be logged to console in development

  Scenario: Quality adapts based on FPS
    Given the current FPS drops below 30
    Then animation speed should increase by 50%
    And quality level should be set to "reduced"
    When FPS returns above 50
    Then quality level should return to "high"

  Scenario: Draw calls are counted and limited
    Then draw calls should be counted per frame
    And draw calls should not exceed 100

  Scenario: Memory usage is tracked
    Then GPU memory usage should be estimated
    And memory should not exceed 150MB

  Scenario: Performance gates prevent degradation
    Given FPS drops below 20 for 3 consecutive seconds
    Then non-essential features should be disabled
    And animation complexity should be reduced

  Scenario: Performance targets vary by device
    Given the user is on Vision Pro
    Then target FPS should be 60
    Given the user is on Quest
    Then target FPS should be 45
    Given the user is on desktop
    Then target FPS should be 30

  Scenario: Render loop is optimized
    Then the render loop should avoid allocations
    Then vectors and matrices should be reused

  Scenario: Invisible objects are not rendered
    Given an object's opacity is below 0.01
    Then the object should not be rendered

  Scenario: Instancing reduces draw calls
    Then work cards should use InstancedMesh
    Then total draw calls should be under 50
    And draw call reduction should be at least 60%
```

## Description

Create performance benchmark tests for FPS tracking, draw calls, memory, and device-specific targets.

## Verification (Test-First)

### Red - Create Failing Tests

### tests/unit/webxr/performanceMonitoring.test.ts

```typescript
describe('Performance Monitoring', () => {
  it('tracks FPS every second', () => {
    // Verify FPS measured
    // Verify logging in dev
  });

  it('adapts quality when FPS drops below 30', () => {
    // Mock low FPS
    // Verify quality reduction
  });

  it('counts draw calls per frame', () => {
    // Verify renderer.info.render.calls
    // Assert < 100
  });

  it('tracks memory usage', () => {
    // Verify memory estimation
    // Assert < 150MB
  });

  it('disables features when FPS < 20 for 3s', () => {
    // Mock sustained low FPS
    // Verify feature reduction
  });

  it('sets device-specific targets', () => {
    // Verify Vision Pro target 60
    // Verify Quest target 45
    // Verify desktop target 30
  });

  it('uses object pooling for vectors', () => {
    // Verify no allocations in render loop
  });

  it('hides objects with opacity < 0.01', () => {
    // Verify visibility culling
  });

  it('achieves under 50 draw calls with instancing', () => {
    // Verify InstancedMesh used
    // Assert < 50 draw calls
  });
});
```

## Verification Steps

1. Run `pnpm test tests/unit/webxr/performanceMonitoring.test.ts`
2. Verify tests fail appropriately

## Acceptance Criteria

- FPS tracking verified
- Quality adaptation verified
- Draw calls < 50 verified
- Memory < 150MB verified
- Device targets verified

## Dependencies

**depends-on**: [Task 003: Configure Jest for WebXR](./task-003-configure-jest-webxr.md)
