Feature: WebXR Performance Benchmarks

  As a developer optimizing the WebXR portfolio experience
  I want automated performance benchmarks to verify optimization goals
  So that I can ensure the experience meets target performance metrics across all devices

  Background:
    Given the WebXR canvas is active and fully loaded
    And the benchmark runner is initialized
    And performance monitoring is enabled

  Scenario: Frame rate meets Vision Pro target
    Given the user is on Vision Pro
    When measuring FPS over 10 seconds
    Then the average FPS should be at least 60
    And the minimum FPS should be at least 55
    And frame time should not exceed 16.67ms
    And no frame drops should be detected

  Scenario: Frame rate meets Quest target
    Given the user is on Quest
    When measuring FPS over 10 seconds
    Then the average FPS should be at least 45
    And the minimum FPS should be at least 40
    And frame time should not exceed 22.2ms
    And no frame drops should be detected

  Scenario: Frame rate meets desktop target
    Given the user is on desktop
    When measuring FPS over 10 seconds
    Then the average FPS should be at least 30
    And the minimum FPS should be at least 25
    And frame time should not exceed 33.3ms
    And no frame drops should be detected

  Scenario: Draw calls are minimized in work view
    Given the user is on the work view
    And all 5 work cards are visible
    When counting draw calls
    Then the total draw calls should be under 50
    And draw calls per mesh should be under 2
    And draw call reduction versus baseline should be at least 60%

  Scenario: Draw calls are minimized in home view
    Given the user is on the home view
    And the Hero Text is visible
    When counting draw calls
    Then the total draw calls should be under 30
    And draw calls per mesh should be under 1.5
    And instancing efficiency should be above 80%

  Scenario: Hover response time is instant
    Given the user is viewing work cards
    When hovering over a work card
    Then the visual response should begin within 16ms
    And the card should reach target scale within 200ms
    And the response time should be consistent across cards
    And p95 response time should be under 20ms

  Scenario: View transition completes within target time
    Given the user is on the home view
    When triggering transition to work view
    Then the transition should complete within 500ms
    And no flickering should occur during transition
    And all animations should be synchronized
    And frame rate should remain above target during transition

  Scenario: GPU memory usage is within budget
    Given the WebXR scene is fully loaded
    When measuring GPU memory usage
    Then the total memory should be under 150MB
    And texture memory should be under 100MB
    And geometry memory should be under 30MB
    And program memory should be under 20MB

  Scenario: No memory leaks occur
    Given the scene has been active for 5 minutes
    When creating and disposing 100 instances of meshes
    Then memory usage should return to baseline within 100MB
    And no memory growth trend should be detected
    And all disposed resources should be released
    And garbage collection should reclaim resources

  Scenario: Visual quality is maintained
    Given the baseline screenshot is captured
    When comparing current visual output to baseline
    Then the SSIM score should be at least 0.95
    And no visual artifacts should be present
    And text should remain readable
    And colors should match within acceptable tolerance

  Scenario: Quality is consistent across device classes
    Given the benchmark runs on Vision Pro
    And the benchmark runs on Quest
    And the benchmark runs on desktop
    Then visual output should be consistent across devices
    And performance should scale appropriately
    And all devices should meet their respective targets

  Scenario: Performance report is generated
    Given all benchmarks have completed
    When generating the performance report
    Then the report should include all measured metrics
    And the report should compare results against targets
    And the report should identify failing benchmarks
    And the report should provide optimization suggestions

  Scenario: Benchmarks are repeatable
    Given the same benchmark is run 5 times
    When comparing results across runs
    Then FPS variance should be under 5%
    Then draw call count should be consistent
    Then memory usage should be stable
    Then response times should be repeatable within 10%

  Scenario: Benchmarks detect performance regressions
    Given a baseline benchmark has been recorded
    When running benchmarks after code changes
    Then performance regressions should be detected
    Then regression severity should be quantified
    Then the report should highlight affected metrics
    Then test should fail if targets are not met