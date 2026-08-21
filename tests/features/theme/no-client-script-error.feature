Feature: No client script tag error
  As a visitor
  I want the site to render without React script-tag console errors
  So that no error overlay or hydration warning appears in production

  Scenario: Theme provider must not trigger script-tag console error
    Given the theme provider is rendered via ThemeModeProvider
    When the app renders on the client
    Then there must be no "Encountered a script tag while rendering React component" error
    And no script tag is rendered inside a client component subtree
