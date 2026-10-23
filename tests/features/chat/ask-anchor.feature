Feature: Direct links to the Ask section
  Scenario: An anchor loads after the page shell
    Given a visitor opens the homepage with the ask hash
    And the Ask client island has not mounted yet
    When the Ask section is inserted into the page
    Then the page scrolls to that section
    And the anchor observer stops once the section is found

  Scenario: Anchor navigation is cancelled safely
    Given a hash target is still loading
    When the hash changes or the layout unmounts
    Then pending observers and animation frames are cancelled
    And the previous target cannot trigger a later scroll

  Scenario: Reduced motion is respected
    Given the visitor prefers reduced motion
    When a hash target appears
    Then the page scrolls instantly instead of smoothly
