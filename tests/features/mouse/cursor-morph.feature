Feature: The cursor dot joins interactive elements
  As a visitor using a fine pointer
  I want the cursor to morph into controls
  So that hover feedback remains continuous and visible

  Scenario: Hover an unwrapped link or button
    When the pointer enters a link or button through its nested content
    Then the visible cursor morphs to the actual control bounds
    And links and buttons use the same capsule corners based on half the shorter cursor dimension
    And the cursor cannot intercept clicks
    When the pointer moves just outside the control
    Then the cursor remains attracted within a 48-pixel release zone
    And its center and dimensions move continuously toward the pointer and a 16-pixel dot
    When the pointer moves beyond the release zone
    Then the same shape returns to the small visible dot

  Scenario: Re-enter or move to another control during magnetic release
    Given the pointer is just outside the previous target
    When it re-enters that target
    Then the full target geometry is restored
    When it enters a different control
    Then that control takes over immediately

  Scenario: Invalid magnetic targets cannot linger
    Given the pointer remains inside the magnetic release zone
    When the previous control is disabled, removed, or replaced during navigation
    Then the stale target is released
    When the window loses focus or fine-pointer motion becomes unavailable
    Then the custom cursor hides and clears the target

  Scenario: Hover an editable field
    When the pointer enters an input or textarea
    Then the cursor morphs into a line at the field's lower border
    And text and the native caret remain readable

  Scenario: Selectable text uses a vertical cursor
    When the pointer is over an actual selectable glyph
    Then the same cursor path becomes a 2-pixel-wide vertical line at the pointer
    And its height follows the glyph's text line
    And text takes priority over magnetic retention from a nearby control
    When the pointer moves over blank paragraph space or nonselectable content
    Then nonselectable content clears the text cursor immediately
    And ordinary text departure allows an 8-pixel glyph-edge tolerance
    And beyond that tolerance the text cursor follows the pointer for 160 milliseconds before returning to a dot
    And repeated pointer movement does not extend the release deadline
    And unrelated DOM updates neither shorten nor extend the release deadline
    And re-entering selectable glyphs cancels the pending release
    And controls and work cards take over immediately without waiting for text release

  Scenario: Delayed text release cannot restore invalid geometry
    Given a text release timer is pending
    When the text becomes hidden or the pointer context is invalidated
    Then text feedback and its timer are cleared immediately
    And the old timer cannot replace a newer control or revive an unmounted cursor

  Scenario: Dragging a selection preserves the vertical cursor
    Given a selection drag starts on selectable text
    When the pointer crosses a link, a work card, or leaves the text line during the drag
    Then the cursor remains vertical without morphing into the link
    And work card READ or WIP labels do not replace selection feedback
    When the pointer is released
    Then the next pointer target determines the cursor shape normally
    And pointer cancellation also releases selection mode
    And a drag can start inside an already active glyph-edge tolerance
    And releasing a drag over blank space starts the same 160-millisecond text release delay
    When the window loses focus during text mode
    Then the vertical geometry is cleared and the custom cursor hides

  Scenario: Work card labels remain readable
    When the pointer enters a work card
    Then the cursor remains a white circle with the READ or WIP label
    And the work card is not replaced by a control-sized rectangle

  Scenario: Scrolling resolves the work card under a stationary pointer
    Given the pointer is over a work card showing READ or WIP
    When scrolling reveals another descendant of the same card
    Then the work card cursor and label remain visible
    And scrolling before a pending pointer frame still resolves the new element under the pointer
    When scrolling reveals a different published or work-in-progress card
    Then its READ or WIP label replaces the previous label without pointer movement
    And a late hover-end callback from the previous card cannot replace the current card cursor
    When scrolling reveals blank content, a control, or a removed card
    Then the previous work card state is cleared without oversized geometry

  Scenario: Hovered elements move or disappear
    When the page scrolls or the hovered target changes size
    Then the cursor uses fresh target bounds under the pointer
    When the target is removed or navigation replaces it
    Then stale target geometry is cleared

  Scenario: Native cursor remains available without fine-pointer motion
    Given the device has a coarse pointer or reduced motion is requested
    Then the custom cursor is disabled
    And native pointer and text cursors remain available
