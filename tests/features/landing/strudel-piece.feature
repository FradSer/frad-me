Feature: Strudel Piece on Home
  As a portfolio visitor
  I want to play a short Strudel music piece from the home page
  So that I can experience an AI-composed signature without leaving the site

  Scenario: Section renders without loading audio code
    Given the user opens the home page
    Then the section heading "sonics" and a play control are visible
    And attribution credits "GPT-6.1 Sol" and links to "https://strudel.cc"
    And no Strudel runtime is loaded while the page is idle

  Scenario: Hover or keyboard focus prepares playback silently
    When the user hovers over or focuses the play control
    Then the runtime is prefetched without creating an audio context or starting playback

  Scenario: First click unlocks audio before asynchronous work
    When the user clicks the play control
    Then the browser audio context is created and resumed immediately within the click
    And the control reports a loading status and prevents duplicate starts
    When the runtime is ready
    Then initStrudel receives the unlocked audio context and an onEvalError callback
    And initAudio completes before the synthetic piece is evaluated
    And no external sample pack is downloaded
    And the control becomes a pause control after successful playback

  Scenario: Playback pauses and resumes with one initialized runtime
    Given the piece is playing
    When the user pauses and then plays again
    Then hush stops playback before the piece restarts
    And the same audio context and initialized runtime are reused

  Scenario: A load or evaluation failure can be retried
    Given runtime loading, initialization, or evaluation fails
    When the user attempts playback
    Then a friendly live status explains that playback failed
    And the control offers retry
    When the user retries successfully
    Then playback starts
    And a previous failed module import does not prevent recovery

  Scenario: A suspended context is not reported as playing
    Given the audio context remains suspended after resume
    When the user starts playback
    Then playback fails without evaluating the piece

  Scenario: Navigation cancels pending playback
    Given runtime initialization or evaluation is still pending
    When the user navigates away
    Then the pending operation observes cancellation
    And no deferred evaluation begins after navigation
    And any evaluation that finishes late is hushed
    And a newly mounted player's evaluation waits until the previous player's cleanup completes

  Scenario: The standalone score matches the home page
    Then the paste-ready Strudel score matches the canonical home-page piece
    And the composer credit remains "GPT-6.1 Sol"

  Scenario: Navigation stops active playback
    Given the piece is playing
    When the player unmounts
    Then global playback is stopped
