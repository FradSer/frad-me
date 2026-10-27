Feature: Ask — portfolio assistant
  As a portfolio visitor
  I want current, sourced answers about Frad
  So that I can explore his work through a reliable conversation

  Scenario: Configuration controls availability
    Given Gateway authentication is absent or configured through a key or Vercel OIDC
    When the browser checks GET /api/chat
    Then enabled reflects the available authentication
    And the X-Chat-Model response header identifies the configured model without exposing credentials
    And an unconfigured POST returns 503

  Scenario: A valid conversation streams one bounded answer
    Given the client submits valid UI messages ending in a nonempty user question
    When the API starts generation
    Then it uses the configured Gateway model or alibaba/qwen3.7-flash
    And it converts messages with the same tool schemas used for validation
    And it permits four steps, 2400 output tokens, and one SDK retry
    And it returns the SDK UI message stream with reasoning hidden
    And request cancellation reaches model generation

  Scenario: Invalid conversation input is rejected before generation
    Given JSON is malformed or messages are missing, malformed, or contain a system role
    Or the final message is not a nonempty user question
    When the client submits the conversation
    Then the API returns a structured 400 error without starting generation

  Scenario: Conversation and request limits are enforced
    Given a conversation exceeds 40 messages, 4000 characters per user message, or 32000 total text characters
    When the client submits the conversation
    Then the API rejects the conversation before generation
    Given the request body exceeds 128000 actual UTF-8 bytes
    When the client submits it with no trustworthy Content-Length
    Then the API returns 413 without starting generation
    And it cancels an oversized streaming body as soon as the byte limit is crossed

  Scenario: Rate limiting includes retry guidance
    Given an IP has made 20 requests during the current minute
    When that IP submits another request
    Then the API returns 429 with Retry-After
    And another IP can still submit a question

  Scenario: Tool-assisted conversation supports follow-up questions
    Given assistant history contains tool calls
    When the API validates and converts the conversation
    Then it uses the actual server tool schemas
    And it ignores incomplete historical tool calls during conversion
    And portfolio, resume, and recent activity tools remain executable
    And an assistant answer longer than 4000 characters does not block a valid follow-up

  Scenario: Setup and streaming errors do not disclose provider details
    Given generation setup or the provider stream fails
    When the visitor receives the failure
    Then the error is sanitized
    And no ad hoc model fallback appends another answer to a partial response

  Scenario: Answers use the current public profile
    When the server creates the model request
    Then its system prompt comes from shared profile and project knowledge
    And questions outside Frad's portfolio remain out of scope
    And tool descriptions and results help the model cite public sources

  Scenario: Explicit recent GitHub questions fetch repository activity
    When the visitor asks "请查询 Frad 的 GitHub 近期活动"
    Then the first generation step is required to call get_recent_activity
    And subsequent steps can answer using the activity result
    When the visitor asks "介绍 Code Terrier"
    Then recent activity lookup is not forced
