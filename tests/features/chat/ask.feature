Feature: Ask — AI chat Q&A
  As a portfolio visitor
  I want to ask the AI about Frad's work via the Ask section
  So that I can get streamed answers without page reload or error

  Background:
    Given the user is on the home page
    And the Ask section is visible

  Scenario: Ask section renders with heading and suggested questions
    Then the heading "ask" is visible
    And suggested questions are displayed
    And the input placeholder is "Ask me anything about Frad..."

  Scenario: Frontend sends a question via DefaultChatTransport
    When the user types "What does Frad do?" and submits
    Then the message is sent via DefaultChatTransport to "/api/chat"
    And the streaming response is rendered incrementally

  Scenario: Chat API validates and streams via stateless helpers
    Given the server has AI Gateway configured (AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN)
    When the client POSTs valid UIMessages to /api/chat
    Then the server validates with safeValidateUIMessages
    And converts with convertToModelMessages
    And streams via toUIMessageStream + createUIMessageStreamResponse
    And the response has UIMessage stream headers

  Scenario: Invalid payload is rejected with structured error
    When the client POSTs to /api/chat without messages field
    Then the server responds 400 with "Missing messages field."
    When the client POSTs invalid messages format
    Then the server responds 400 with "Invalid messages format."

  Scenario: Chat uses a Free Tier eligible Gateway model by default
    Given AI_GATEWAY_MODEL_ID is not configured
    Then the server uses "alibaba/qwen3.7-flash"

  Scenario: Tool calling remains available after upgrade
    When the assistant needs to answer about projects
    Then the tools get_works, read_work, search_works, get_resume are available
    And stopWhen is isStepCount(3)

  Scenario: Visitor asks about Frad's latest work
    When the visitor asks what Frad is currently building
    Then the assistant uses get_recent_activity to fetch live GitHub data
