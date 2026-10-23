Feature: Current professional profile
  As a prospective collaborator
  I want an evidence-based overview of Frad's current work
  So that I can assess his experience and explore relevant projects

  Scenario: Shared profile introduces the resume
    Given the resume has a headline and a shared professional summary
    When I open the resume
    Then the introduction shows the headline and summary alongside Frad's name
    And search and social descriptions use the same summary

  Scenario: Current projects are easy to explore
    Given the resume contains selected projects with public links
    When I browse the resume
    Then Selected Projects appears before Experience
    And each project shows its role, description, and a named link to its destination

  Scenario: Contact information remains reachable
    Given the shared profile contains contact details
    When I choose a contact link
    Then email opens a mailto destination
    And every other contact retains its declared destination

  Scenario: Employment dates remain stable
    Given the profile contains completed and ongoing roles
    When the resume renders at different times
    Then employment dates use semantic time elements and UTC month labels
    And ongoing employment ends with Present
    And no duration changes after rendering

  Scenario: Patent publications are represented accurately
    Given the profile lists patent publication records
    When I read the patent section
    Then each record links to its publication
    And the resume does not describe the publications as granted patents
