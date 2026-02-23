Feature: WebXR Work Card Hover Interactions

  As a visitor exploring the portfolio in WebXR
  I want work cards to respond instantly to my hover interactions
  So that I can quickly identify and engage with relevant projects

  Background:
    Given the WebXR canvas is loaded
    And the user is viewing the home view
    And work cards are visible in the scene

  Scenario: Instant hover response on work card
    When the user's gaze or cursor hovers over a work card
    Then the card should begin scaling up within 16ms
    And the card should reach target scale within 200ms
    And the glow effect should appear immediately

  Scenario: Smooth hover animation with spring physics
    When the user hovers over a work card
    Then the card should animate using spring physics
    And the animation should feel fluid and natural
    And the scale should not overshoot by more than 5%

  Scenario: Instant hover exit response
    When the user's gaze or cursor moves away from a hovered work card
    Then the card should begin scaling down within 16ms
    And the card should return to default scale within 200ms
    And the glow effect should disappear immediately

  Scenario: Hover state persists during rapid movement
    Given the user is rapidly moving between work cards
    When the user hovers over a work card
    Then the card should achieve a visually distinct hover state
    And the hover state should be maintained while gaze remains on card

  Scenario: Hover effect works across all supported devices
    When a user on Vision Pro hovers over a work card
    And a user on Quest hovers over a work card
    And a user on desktop with mouse hovers over a work card
    Then all users should see consistent hover behavior
    And the hover response time should be within 16ms on all devices

  Scenario: Multiple cards can be in hover states simultaneously
    Given there are multiple work cards visible
    When the user hovers over multiple cards in sequence
    Then each hovered card should display its hover state
    And non-hovered cards should maintain their default state
    And performance should remain above target FPS

  Scenario: Hover feedback is visually accessible
    When a work card is hovered
    Then the color contrast between hovered and non-hovered states meets WCAG standards
    And the scale change is at least 10%
    And a glow effect provides additional visual feedback

  Scenario: Hover does not interrupt other animations
    Given work cards are animating into view
    When the user hovers over a card during entrance animation
    Then the hover effect should be visible
    And the entrance animation should continue smoothly
    And both animations should complete without visual artifacts