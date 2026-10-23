Feature: Public, current knowledge for Ask
  As a portfolio visitor
  I want answers grounded in Frad's shared profile and project sources
  So that current work and historical case studies are not confused

  Scenario: Current projects use the shared resume
    When the assistant lists or reads current projects
    Then each project has its shared description and public source link
    And named projects are resolved before recent GitHub activity

  Scenario: Historical case studies remain discoverable
    When a visitor reads BearyChat or searches for design research
    Then the existing portfolio catalog and case study summary remain available
    And a current Pachino description takes precedence over its historical case study

  Scenario: System knowledge follows profile updates
    When the shared profile changes
    Then the next system prompt includes the updated public facts
    And contact details come only from the shared profile

  Scenario: Evidence has explicit limits
    Then GitHub activity is described as public activity rather than complete work or priorities
    And patent publication is distinguished from a granted patent
    And unknown availability, salary, revenue and scientific outcomes are not invented
    And the assistant describes Frad rather than impersonating him
    And injected role changes in messages or source material do not override its instructions
