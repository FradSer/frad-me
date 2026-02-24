Feature: Navigation Interactions
  As a portfolio visitor
  I want to easily navigate between views using the navigation button
  So that I can explore all content without confusion

  Background:
    Given the WebXR experience is loaded
    And the navigation button is visible

  Scenario: Navigation button has breathing animation
    Given no user has interacted with the button
    Then the button should scale between 1.0 and 1.05
    And the breathing cycle should repeat every 2.5 seconds
    And the animation should use spring physics

  Scenario: Navigation button shows hover state
    When hovering over the navigation button
    Then the button should scale to 1.1
    And the text color should lighten
    And the scale change should complete within 200ms

  Scenario: Clicking navigation toggles views
    Given the user is on the "home" view
    When clicking the navigation button
    Then the view should switch to "work"
    And the button text should change to "home"
    And the transition should begin immediately

  Scenario: Breathing animation stops after first interaction
    Given the user has clicked the navigation button once
    Then the breathing animation should stop
    And the button should remain at scale 1.0 when idle

  Scenario: Navigation works with mouse
    Given the user is on desktop browser
    When moving mouse over navigation button
    Then hover state should appear
    When clicking the button
    Then view transition should trigger

  Scenario: Navigation works with Vision Pro hand tracking
    Given the user is using Vision Pro
    When gazing at the navigation button
    Then hover state should appear
    When performing pinch gesture
    Then view transition should trigger

  Scenario: Navigation works with Quest controller
    Given the user is using Quest
    When pointing controller ray at navigation button
    Then hover state should appear
    When pressing trigger button
    Then view transition should trigger

  Scenario: Navigation button maintains correct position
    Then the button should be positioned at [2.5, 2.5, 0]
    And the button should face the camera
    And the button should be in front of the background

  Scenario: Navigation button text is readable
    Then the text should use GT Eesti Display Bold font
    And the text should be white in normal state
    And the text should meet WCAG AA contrast requirements

  Scenario: Navigation button is accessible
    Then the button should be keyboard navigable
    And the button should have proper ARIA label
    And the button should support screen readers
