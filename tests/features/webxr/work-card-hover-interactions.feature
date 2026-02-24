Feature: Work Card Hover Interactions
  As a portfolio visitor
  I want instant visual feedback when hovering over work cards
  So that I can confidently explore the portfolio

  Background:
    Given the WebXR experience is loaded
    And the user is on the "work" view
    And all 5 work cards are visible

  Scenario: Instant hover response on work card
    When the user's gaze or cursor hovers over a work card
    Then the card should begin scaling up within 16ms
    And the card should reach target scale (1.1x) within 200ms
    And the glow effect should appear immediately

  Scenario: Hover animation uses spring physics
    When hovering over a work card
    Then the scale animation should use spring physics
    And the forward movement should have slight overshoot
    And the glow opacity should fade in smoothly

  Scenario: Hover works across multiple cards
    When the user hovers over card 1
    Then card 1 should scale up
    When the user moves to hover over card 2
    Then card 1 should return to normal scale
    And card 2 should scale up
    And the transition between cards should be smooth

  Scenario: WIP badge appears on hover
    Given a work card has the "isWIP" flag set
    When hovering over that card
    Then the "WIP" badge should appear with the card
    And the badge should have proper contrast

  Scenario: Hover ends when cursor leaves
    Given a work card is currently hovered
    When the cursor moves away from the card
    Then the card should scale back to normal using spring physics
    And the glow effect should fade out
    And the animation should complete within 300ms

  Scenario: Hand tracking gaze hover works
    Given the user is using Vision Pro with hand tracking
    When the user's gaze focuses on a work card
    Then the card should show hover state
    When the user performs pinch gesture
    Then the card should trigger click navigation

  Scenario: Hover respects reduced motion preference
    Given the user has enabled reduced motion preference
    When hovering over a work card
    Then the scale change should be minimal (1.05x max)
    And the animation should be linear, not spring-based

  Scenario: Hover behavior is consistent across devices
    Given the user accesses WebXR on Vision Pro
    And given the user accesses WebXR on Quest
    And given the user accesses WebXR on desktop browser
    Then hover response time should be consistent (< 20ms variance)
    And visual feedback should be identical
