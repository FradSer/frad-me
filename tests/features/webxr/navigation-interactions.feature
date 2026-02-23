Feature: WebXR Navigation Interactions

  As a visitor exploring the portfolio in WebXR
  I want to interact with navigation elements smoothly
  So that I can control my experience without frustration

  Background:
    Given the WebXR canvas is loaded
    And the user is positioned in the scene
    And the navigation button is visible

  Scenario: Navigation button responds to hover
    When the user's gaze or cursor hovers over the navigation button
    Then the button text should scale up immediately
    And the button text color should change to indicate hover state
    And the breathing animation should pause on hover
    And the response time should be within 16ms

  Scenario: Navigation button has breathing animation when idle
    Given the navigation button has not been interacted with
    When the user views the home view
    Then the button should continuously pulse with a subtle breathing animation
    And the breathing interval should be 2.5 seconds
    And the scale change should be at most 5%

  Scenario: Navigation button stops breathing after interaction
    Given the navigation button has breathing animation active
    When the user hovers over the button
    Then the breathing animation should stop
    And the button should remain at the hover scale
    And the button should not restart breathing until view change

  Scenario: Navigation button activates on click or gaze-select
    When the user activates the navigation button
    Then the view should begin transitioning immediately
    And the button interaction should be registered
    And the button should provide feedback on activation

  Scenario: Navigation button text updates based on current view
    Given the user is on the home view
    Then the navigation button text should display "work"
    When the user transitions to the work view
    Then the navigation button text should display "home"
    And the text update should happen immediately

  Scenario: Navigation button is positioned correctly
    When the user views the home view
    Then the navigation button should be positioned at [2.5, 2.5, 0]
    And the button should be in the user's field of view
    And the button should not obstruct other content

  Scenario: Navigation interactions work across input methods
    Given the user is on Vision Pro with gaze and pinch
    When the user looks at the navigation button and pinches
    Then the navigation should activate

    Given the user is on Quest with controller
    When the user points the controller ray at the button and triggers
    Then the navigation should activate

    Given the user is on desktop with mouse
    When the user clicks the navigation button
    Then the navigation should activate

  Scenario: Navigation button remains visible during transitions
    When a view transition is in progress
    Then the navigation button should remain visible
    And the button should remain interactive
    And the button should animate smoothly to new position if needed

  Scenario: Navigation button scale responds to state
    Given the navigation button is in default state
    When the button becomes hovered
    Then the button scale should increase to hover value
    When the button becomes active
    Then the button scale should increase to active value
    And all scale changes should use spring physics

  Scenario: Navigation button has proper contrast
    When the navigation button is displayed
    Then the text should be white in default state
    And the text should be light gray in hover state
    And the contrast ratio should meet WCAG AA standards
    And the text should be readable against the background