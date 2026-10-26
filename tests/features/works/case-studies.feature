Feature: Read portfolio case studies
  Scenario: Understand the project before reading the case
    Given a visitor opens a published case study
    Then its title is the page's only level-one heading
    And a separate summary, platforms, and Frad's role introduce the work
    And the visitor can return to all work or open the named next case

  Scenario: Read the evidence across devices
    Given a case contains prose, images, formulas, and before-and-after comparisons
    Then body text has a comfortable reading width and clear section hierarchy
    And document links are visibly identifiable
    And images and captions remain available without scroll-triggered reveals
    And published MDX modules have explicit static imports so their client references are visible to instant validation
    And the route registry renders every case discovered in the content directory and rejects unknown slugs
    And each comparison distinguishes its before and after image
    And reduced motion shows the complete diagram instead of animated interface layers
    And existing media references resolve to local assets

  Scenario: Read the same case through assistant tools
    When a case summary is extracted from MDX
    Then it starts with the case narrative instead of metadata or asset paths
    And it retains prose around section separators
    And it is limited to 500 characters
