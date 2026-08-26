Feature: Instant content shell
  As a visitor
  I want the page shell to appear in the server-rendered HTML
  So that first paint shows real content instead of a hydration-gated loading placeholder

  Scenario: Layout wrapper server-renders children without a loading gate
    Given the layout wrapper is rendered on the server
    When the markup is generated
    Then the children are present in the initial HTML
    And no "loading" placeholder is rendered

  Scenario: Shell elements carry no hydration-gated entrance styles
    Given the layout wrapper is rendered on the server
    When the markup is generated
    Then the header is present in the initial HTML
    And neither the header nor the main element has an inline hidden or translated style

  Scenario: Hero decorations prerender deterministically
    Given the hero decoration is rendered twice on the server
    When the markup is compared
    Then both renders are identical

  Scenario: Speech control mounts outside the hero heading
    Given the hero is rendered with speech synthesis supported
    When the speech control appears after mount
    Then the control is not a descendant of the hero heading
    And the heading subtree is unchanged by the control
