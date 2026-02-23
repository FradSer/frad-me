Feature: WebXR Vertex Shader Logic
  As a developer using the WebXR instancing system
  I want to ensure the vertex shader logic works correctly
  So that instances animate and respond to user interactions as expected

  Scenario Outline: Floating formula produces correct output
    Given time value is <time>
    And animation offset is <offset>
    And floating speed is 2.0
    And floating amplitude is 0.05
    When calculating floating offset
    Then the result should be sin(time * 2.0 + offset) * 0.05

    Examples:
      | time | offset |
      | 0.0  | 0.0    |
      | 1.0  | 0.0    |
      | 0.5  | 0.5    |
      | 1.57 | 0.0    |

  Scenario: Animation phases create staggered effect
    Given we have 5 instances
    When calculating animation offsets for each instance
    Then each instance should have a unique phase offset
    And the offset should increase with instance index

  Scenario: View Y is correctly interpolated
    Given base Y is 0.0
    And hover Y is 1.0
    When view mode is 0.5 (transitioning)
    Then view Y offset should be 0.5

  Scenario Outline: Hover detection logic
    Given instance ID is <instanceId>
    And hover index uniform is <hoverIndex>
    When calculating hover state
    Then the result should be <expected>

    Examples:
      | instanceId | hoverIndex | expected |
      | 0          | 0          | 1.0      |
      | 1          | 0          | 0.0      |
      | 2          | -1         | 0.0      |
      | 3          | 3          | 1.0      |

  Scenario: Hover scale and position offsets are applied
    Given an instance at position (0, 0, 0)
    When the instance is hovered
    Then Z position should increase by HOVER_FORWARD_OFFSET
    And Y position should increase by HOVER_UP_OFFSET
    And scale should increase by uHoverScale

  Scenario: Reduced motion support respects animation parameters
    Given floating speed is 2.0
    And floating amplitude is 0.05
    When reduced motion is enabled
    Then floating amplitude should be reduced
    Or floating speed should be zero