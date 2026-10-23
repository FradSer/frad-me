Feature: Ask about Frad's public work
  Scenario: Visitors understand the assistant and current topics
    Given the assistant is available
    When I open ask
    Then I see an AI assistant introduction and four questions about current public work
    And I can read linked answers in the conversation

  Scenario: A failed question can be retried without duplication
    Given a question fails after submission
    Then my input remains available
    When I retry the answer
    Then the existing question is regenerated without another user message

  Scenario: Visitors control an active conversation
    Given an answer is being generated
    Then the status distinguishes thinking from writing
    And I can stop generation
    When I start a new conversation
    Then messages, errors, and input are reset

  Scenario: Temporary availability failures are recoverable
    Given the availability check fails
    Then I can retry the connection or read the resume
    And leaving the page aborts the availability request

  Scenario: Keyboard submission does not send twice
    Given I have entered a question
    When I press Enter twice while a request is pending
    Then only one question is submitted
    And Shift plus Enter inserts a newline
