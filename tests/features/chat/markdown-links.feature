Feature: Clickable web addresses in assistant answers
  Scenario: An inline-code web address remains readable and opens its destination
    Given an assistant answer contains **Code Terrier** (**`https://codeterrier.com`**)
    When the answer renders
    Then the web address is a clickable link with code styling and safe external-link attributes

  Scenario: Code and existing Markdown links retain their meaning
    Given an answer contains ordinary Markdown formatting and links
    And inline code, fenced code, and a code-styled label inside a Markdown link
    When the answer renders
    Then ordinary Markdown links and formatting remain intact
    And code blocks and non-URL code remain code
    And existing links never contain nested anchors
    And only complete HTTP or HTTPS addresses inside inline code become links

  Scenario: User messages remain literal
    Given a user message contains Markdown and an inline-code web address
    When the message renders
    Then it remains literal user text without generated links
