Feature: Preserve the original rectangle without hydration errors
  Scenario: Hydrate the homepage decoration
    Given the original rectangle is rendered on the server
    When the browser hydrates it
    Then its initial transform matches the server markup
    And no hydration mismatch is reported
    And mouse movement still updates its original skew effect
