Feature: The cursor dot joins interactive elements
  As a visitor using a fine pointer
  I want the cursor to morph into controls
  So that hover feedback remains continuous and visible

  Scenario: Hover an unwrapped link or button
    When the pointer enters a link or button through its nested content
    Then the visible cursor morphs to the actual control bounds
    And its shape respects the control geometry
    And the cursor cannot intercept clicks
    When the pointer leaves the control
    Then the same shape springs back to a small visible dot

  Scenario: Hover an editable field
    When the pointer enters an input or textarea
    Then the cursor morphs into a line at the field's lower border
    And text and the native caret remain readable

  Scenario: Work card labels remain readable
    When the pointer enters a work card
    Then the cursor remains a white circle with the READ or WIP label
    And the work card is not replaced by a control-sized rectangle

  Scenario: Hovered elements move or disappear
    When the page scrolls or the hovered target changes size
    Then the cursor uses fresh target bounds under the pointer
    When the target is removed or navigation replaces it
    Then stale target geometry is cleared

  Scenario: Native cursor remains available without fine-pointer motion
    Given the device has a coarse pointer or reduced motion is requested
    Then the custom cursor is disabled
    And native pointer and text cursors remain available
