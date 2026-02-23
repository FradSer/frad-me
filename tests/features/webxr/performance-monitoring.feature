Feature: WebXR Performance Monitoring

  As a developer maintaining the WebXR portfolio experience
  I want continuous performance monitoring and adaptive quality
  So that the experience remains smooth across all devices

  Background:
    Given the WebXR canvas is active
    And the performance monitoring system is initialized

  Scenario: Frame rate is tracked continuously
    When the WebXR scene is rendering
    Then the current FPS should be calculated every frame
    And FPS should be stored in state
    And FPS should be accessible to all components

  Scenario: Performance quality adapts to frame rate
    Given the system is running at 60fps or above
    Then the quality level should be set to "high"

    Given the system is running between 30fps and 50fps
    Then the quality level should be set to "normal"

    Given the system is running below 30fps
    Then the quality level should be set to "reduced"

  Scenario: Animations speed adapt to performance
    Given the system is running below 30fps
    When an animation plays
    Then the spring tension should increase by 50%
    And the spring friction should increase by 20%
    And the animation should complete faster

  Scenario: Components hide when below opacity threshold
    Given a component has opacity below 0.01
    When the frame renders
    Then the component should not be rendered
    And the component should use minimal resources
    And the component should become visible again when opacity increases

  Scenario: Draw calls are monitored
    When the WebXR scene renders
    Then the number of draw calls should be tracked
    And draw calls should be logged in development
    And draw calls should remain under 100 per frame

  Scenario: Triangle count is monitored
    When the WebXR scene renders
    Then the total triangle count should be tracked
    And triangle count should be logged in development
    And triangle count should remain reasonable for target devices

  Scenario: Memory usage is tracked
    When the WebXR scene is active
    Then memory allocations should be monitored
    And memory leaks should be detected
    And unused resources should be disposed

  Scenario: Performance metrics are logged in development
    Given the environment is development
    When performance issues are detected
    Then warnings should be logged to console
    And detailed metrics should be available
    And optimization suggestions should be provided

  Scenario: Frame rate targets are met on devices
    Given the user is on Vision Pro
    Then the target frame rate should be 60fps
    And the experience should maintain 60fps during normal use

    Given the user is on Quest
    Then the target frame rate should be 45fps
    And the experience should maintain 45fps during normal use

    Given the user is on desktop
    Then the target frame rate should be 30fps minimum
    And the experience should maintain 30fps during normal use

  Scenario: Performance degrades gracefully under load
    Given the system is running at reduced quality
    When additional elements enter the scene
    Then the quality level should not drop further
    And animations should remain smooth
    And the experience should remain usable

  Scenario: Performance metrics are exposed for debugging
    Given the developer needs to debug performance
    When performance monitoring is enabled
    Then current FPS should be available
    And quality level should be available
    And draw call count should be available
    And component visibility status should be available

  Scenario: Performance targets are enforced
    Given the system is running at target frame rate
    When new features are added
    Then the frame rate should not drop below target
    And performance tests should fail if targets are not met
    And optimization should be required before merging