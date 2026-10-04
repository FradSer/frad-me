Feature: Optimize interactions while preserving the original design
  Scenario: Keep the mobile menu on the same translucent glass surface
    Given the viewport is narrower than the desktop navigation breakpoint
    When the menu is opened or closed
    Then the header and expanded menu share one translucent blurred background
    And the surface follows the light or dark theme
    And the original navigation spacing and typography are preserved

  Scenario: Keep the original speech control reachable on a phone
    Given the original homepage is viewed on a narrow screen
    When the speech control is available
    Then its complete button is inside the viewport
    And the introduction typography and desktop control position are preserved

  Scenario: Close the mobile menu with a keyboard
    Given the mobile menu is open
    When the visitor presses Escape
    Then the menu closes and focus returns to its original button
    And the previous body scroll setting is restored

  Scenario: Defer the music runtime until intent to play
    Given a visitor opens the homepage
    When the page becomes idle
    Then the music runtime is not loaded
    When the visitor focuses or points at the play control
    Then the runtime is prefetched without changing the control's appearance
