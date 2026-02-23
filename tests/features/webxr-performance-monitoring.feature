Feature: WebXR Performance Monitoring

  Scenario: Track FPS over time
    Given a performance monitor is initialized
    When multiple frames are recorded with timestamps
    Then the monitor calculates accurate FPS based on frame intervals
    And FPS is updated in real-time

  Scenario: Determine quality level based on FPS
    Given a performance monitor is initialized
    When FPS is 60 or above
    Then quality level is set to High
    When FPS is between 30 and 49
    Then quality level is set to Normal
    When FPS is below 30
    Then quality level is set to Reduced

  Scenario: Track draw calls from renderer
    Given a performance monitor is initialized with a renderer
    When the renderer renders frames
    Then draw calls are counted from renderer.info.render.calls

  Scenario: Track memory usage from renderer
    Given a performance monitor is initialized with a renderer
    When memory information is queried
    Then memory usage is extracted from renderer.info.memory

  Scenario: Performance context provides metrics to consumers
    Given a PerformanceContext provider is mounted
    When a component consumes the context
    Then the component receives current FPS
    And the component receives quality level
    And the component receives draw call count
    And the component receives memory usage
    And the component receives full metrics object

  Scenario: Log metrics in development environment
    Given performance monitoring is active
    And the environment is development
    When metrics are updated
    Then performance metrics are logged to console
    And no logging occurs in production