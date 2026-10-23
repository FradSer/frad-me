Feature: Public GitHub activity with honest fallback
  Scenario: A failed lookup uses the shared public portfolio
    Given GitHub cannot return usable public repository data
    When the assistant requests recent activity
    Then it receives shared resume projects with absolute public links
    And language, stars, and activity dates remain unknown
    And the result explicitly identifies curated portfolio information rather than live activity
    And a later lookup retries GitHub instead of caching the failure

  Scenario: Live activity contains only eligible public repositories
    Given GitHub returns valid repository data
    When the assistant requests recent activity
    Then private, archived, and forked repositories are excluded
    And successful live results are cached for ten minutes

  Scenario: Cancellation propagates instead of returning fallback
    Given a caller cancels its activity request
    When GitHub is pending or a cached snapshot exists
    Then the activity operation rejects with the caller's cancellation
    And the aborted request does not populate the cache
