Feature: Performance Monitoring
  As a developer
  I want to monitor performance metrics
  So that I can optimize the experience

  Background:
    Given the WebXR experience is loaded
    And performance monitoring is enabled

  Scenario: Frame rate is tracked continuously
    When the scene is rendering
    Then FPS should be measured every second
    And FPS should be logged to console in development
    And FPS data should be stored for analysis

  Scenario: Quality adapts based on FPS
    Given the current FPS drops below 30
    Then animation speed should increase by 50%
    And spring tension should increase by 50%
    And quality level should be set to "reduced"
    When FPS returns above 50
    Then quality level should return to "high"

  Scenario: Draw calls are counted and limited
    Then draw calls should be counted per frame
    And draw call count should be logged in development
    And draw calls should not exceed 100

  Scenario: Memory usage is tracked
    Then GPU memory usage should be estimated
    And memory usage should be logged in development
    And memory should not exceed 150MB

  Scenario: Performance gates prevent degradation
    Given FPS drops below 20 for 3 consecutive seconds
    Then non-essential features should be disabled
    And animation complexity should be reduced
    And a warning should be logged

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
    Then object traversal should be minimized

  Scenario: Invisible objects are not rendered
    Given an object's opacity is below 0.01
    Then the object should not be rendered
    And the object should not receive raycasting
    And rendering should resume when opacity increases

  Scenario: Instancing reduces draw calls
    Then work cards should use InstancedMesh
    Then total draw calls should be under 50
    And draw call reduction should be at least 60%

  Scenario: Performance metrics are sent in production
    Then FPS should be sampled (not continuous)
    Then errors should be sent to error tracking
    Then performance data should be aggregated
