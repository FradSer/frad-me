Feature: Strudel Piece on Home
  As a portfolio visitor
  I want to play a short Strudel music piece from the home page
  So that I can experience an AI-composed signature without leaving the site

  Background:
    Given the user is on the home page
    And the @strudel/web bundle has not been dynamically imported yet

  Scenario: Section renders with attribution before any interaction
    Then the section heading "listen" is visible
    And a play control labeled "play" is visible
    And the attribution says it was composed by "Claude Opus 4.7"
    And the attribution links the performer to "https://strudel.cc"
    And no Strudel runtime functions have been invoked

  Scenario: First click awaits the runtime then starts playback
    When the user clicks the play control
    Then the control label changes to "loading"
    And the @strudel/web module is dynamically imported exactly once
    When initStrudel resolves with the drum-machines sample pack registered
    Then evaluate() is called with the home-page piece
    And evaluate() runs strictly after initStrudel resolves
    And the control label changes to "pause"

  Scenario: Clicking again pauses playback without re-importing the runtime
    Given the piece is already playing
    When the user clicks the control
    Then hush() is invoked on the runtime
    And the control label changes to "play"
    And initStrudel is not invoked a second time

  Scenario: A runtime failure surfaces a retry affordance
    Given initStrudel rejects with an error
    When the user clicks the play control
    Then the control label changes to "retry"
    And evaluate() is never called

  Scenario: Navigating away stops playback
    Given the piece is already playing
    When the StrudelPiece component unmounts
    Then hush() is invoked on the runtime
