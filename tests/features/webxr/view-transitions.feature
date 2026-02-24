Feature: View Transitions
  As a portfolio visitor
  I want smooth transitions between home and work views
  So that the experience feels cohesive and polished

  Background:
    Given the WebXR experience is loaded
    And all assets have finished loading

  Scenario: Smooth transition from home to work view
    Given the user is on the "home" view
    When the user clicks the navigation button
    Then the Hero Text should fade out and move backward
    And the work cards should fade in and move forward
    And the transition should complete within 800ms
    And no flickering should occur during transition

  Scenario: Smooth transition from work to home view
    Given the user is on the "work" view
    When the user clicks the navigation button
    Then the work cards should fade out and move backward
    And the Hero Text should fade in and move forward
    And the transition should complete within 800ms
    And the state change should be atomic

  Scenario: Camera moves smoothly during transition
    Given the user is on the "home" view
    When transitioning to "work" view
    Then the camera should move from [0, 0, 5] to [0, 2, 8]
    And the camera movement should use spring physics
    And the FOV should change from 75deg to 65deg
    And the look-at point should remain at [0, 0, 0]

  Scenario: Work cards enter with staggered animation
    When transitioning to work view
    Then the first work card should start animating after 400ms
    And subsequent cards should stagger by 150ms
    And all cards should complete entrance within 1200ms

  Scenario: Elements fade smoothly during transitions
    When transitioning between views
    Then fading elements should use spring-based opacity
    And opacity should never drop below 0.01 before becoming invisible
    And opacity transitions should be synchronized with position changes

  Scenario: Rapid switching between views
    Given the user is transitioning to work view
    When the user clicks navigation button again before transition completes
    Then the current transition should reverse
    And no animation should overlap
    And the final state should match the target view

  Scenario: Frame rate maintained during transitions
    Given the user has 60 FPS baseline
    When transitioning between views
    Then FPS should never drop below 45
    And frame time should not exceed 22ms
    And no frame drops should be noticeable

  Scenario: Footer links appear only on home view
    Given the user is on the "work" view
    Then the external links should be hidden
    When the user switches to "home" view
    Then the external links should fade in
    And the links should be interactive within 200ms

  Scenario: Transitions respect reduced motion
    Given the user has enabled reduced motion preference
    When transitioning between views
    Then animations should be linear
    And transition time should be reduced to 400ms
    And no spring overshoot should occur

  Scenario: Navigation button updates text and state
    Given the user is on the "home" view
    Then the navigation button should display "work"
    When the user transitions to "work" view
    Then the navigation button should display "home"
    And the button should stop breathing animation after interaction
