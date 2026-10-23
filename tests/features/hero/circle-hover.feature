Feature: Hero circle interaction
  As a portfolio visitor
  I want clear feedback from the circular selected-work control
  So that I can explore the portfolio with a pointer or keyboard

  Scenario: The visible circle is the accessible control
    Given the hero is rendered
    Then one native button is named "View selected work"
    And the visible circular target has its own measurable bounds and rounded shape
    And the hero does not wrap the control in another button

  Scenario: Pointer and keyboard feedback remain coordinated
    When the pointer enters the circular control
    Then the arrow and circle show active feedback
    When the control also receives keyboard focus
    And the pointer leaves the control
    Then the feedback remains active until focus leaves

  Scenario: The fused cursor follows the round target
    Given a fine pointer with motion enabled hovers over the arrow inside the circle
    Then the single cursor shape expands to the circle's bounds with circular corners
    When the pointer leaves the control
    Then the cursor returns to a dot

  Scenario: Activation scrolls to selected work
    When the visitor activates "View selected work"
    Then the selected-work section scrolls into view smoothly

  Scenario: Reduced motion preserves accessible interaction
    Given the visitor requests reduced motion
    When the circular control receives pointer or keyboard focus
    Then the arrow does not bounce or loop
    And activating the control scrolls to selected work without animation
