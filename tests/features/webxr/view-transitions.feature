Feature: WebXR View Transitions

  As a visitor exploring the portfolio in WebXR
  I want smooth transitions between home and work views
  So that the experience feels cohesive and immersive

  Background:
    Given the WebXR canvas is loaded
    And the user has stable positioning in the scene

  Scenario: Smooth transition from home to work view
    When the user activates the navigation button
    Then the view transition should begin immediately
    And the transition should complete within 800ms
    And all elements should arrive at their target positions smoothly
    And no elements should flicker during the transition

  Scenario: Smooth transition from work to home view
    Given the user is viewing the work view
    When the user activates the navigation button
    Then the view transition should begin immediately
    And the transition should complete within 800ms
    And all elements should return to their home positions smoothly

  Scenario: Elements fade and reposition during transitions
    When the view transition begins
    Then exiting elements should fade out gradually
    And entering elements should fade in gradually
    And all elements should move along curved paths
    And opacity and position transitions should be synchronized

  Scenario: Camera movement during view transitions
    When the view transition begins
    Then the camera should smoothly interpolate to new position
    And the camera should smoothly interpolate to new field of view
    And the camera movement should feel natural, not jerky
    And the camera should end at the exact target position

  Scenario: Hero text visibility follows view state
    When the user transitions to the work view
    Then the hero text should fade out
    And the hero text should be hidden when opacity falls below threshold
    And the hero text should not be rendered while hidden

  Scenario: Work cards animate into view with stagger
    When the user transitions to the work view
    Then work cards should enter one at a time
    And the delay between each card should be 150ms
    And all cards should complete entrance within animation duration
    And the entrance animation should use spring physics

  Scenario: Footer links visibility follows view state
    When the user transitions to the work view
    Then the footer links should fade out
    And the footer links should fade back in when returning to home view
    And the fade timing should be synchronized with other elements

  Scenario: Navigation button updates during transitions
    When the view transition begins
    Then the navigation button text should update immediately
    And the button should remain interactive during transition
    And rapid button clicks should not cause transition conflicts

  Scenario: Transitions work at target frame rates
    Given the system is running at 60fps on Vision Pro
    When the user triggers a view transition
    Then the transition should complete in 48 frames
    And the transition should maintain 60fps throughout

  Scenario: Transitions adapt to performance conditions
    Given the system is running at 30fps or below
    When the user triggers a view transition
    Then the animation speeds should be adjusted
    And the transition should still complete within acceptable time
    And the visual quality should remain acceptable

  Scenario: View state context is accurate during transitions
    When a view transition is in progress
    Then the current view context should report the target view
    And components should receive updated view state immediately
    And no components should render in an inconsistent state

  Scenario: Transitions can be interrupted
    Given a view transition is in progress
    When the user triggers the opposite view transition
    Then the current transition should be canceled
    And the new transition should begin immediately
    And elements should animate smoothly to new target state