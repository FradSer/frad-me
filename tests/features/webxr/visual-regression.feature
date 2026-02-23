Feature: WebXR Visual Regression Tests

  As a developer maintaining the WebXR portfolio experience
  I want automated visual regression tests to detect unintended visual changes
  So that the visual quality and design consistency are maintained across releases

  Background:
    Given the WebXR page is loaded
    And the canvas is fully rendered
    And all textures are loaded
    And animations have settled to their final state

  Scenario: Home view baseline screenshot matches
    When the current view is 'home'
    And the hero text is fully visible
    And no work cards are displayed
    Then the visual state should match the baseline screenshot
    And the pixel difference should be below 0.5%
    And the SSIM score should be above 0.98

  Scenario: Work view baseline screenshot matches
    When the current view is 'work'
    And all work cards are fully visible
    And the hero text is hidden
    Then the visual state should match the baseline screenshot
    And the pixel difference should be below 0.5%
    And the SSIM score should be above 0.98

  Scenario: Hover state visual consistency
    Given the current view is 'work'
    And a work card is being hovered
    And the hover glow effect is active
    Then the visual state should match the hover baseline screenshot
    And the pixel difference should be below 0.5%
    And the SSIM score should be above 0.98

  Scenario: WIP badge visibility
    Given the current view is 'work'
    And at least one work card has WIP status
    Then the WIP badge should be visible on the appropriate card
    And the visual state should match the WIP baseline screenshot
    And the pixel difference should be below 0.5%

  Scenario: View transition mid-state
    When a view transition is in progress
    And the transition is at 50% completion
    Then the visual state should match the transition baseline screenshot
    And the pixel difference should be below 0.5%
    And anti-aliasing differences should be ignored

  Scenario: Reduced motion visual state
    Given the user has enabled reduced motion preference
    When the WebXR experience renders
    Then animations should use simplified transitions
    And the visual state should match the reduced motion baseline
    And the pixel difference should be below 0.5%

  Scenario: Loading state visual consistency
    When the WebXR page is loading
    And textures are still being fetched
    Then a loading indicator should be visible
    And the visual state should match the loading baseline screenshot
    And timing differences should be ignored

  Scenario: Baseline screenshots can be updated
    When running tests with baseline update flag
    And screenshots differ from current baseline
    Then new screenshots should be saved as baseline
    And the update should not affect test results

  Scenario: Anti-aliasing differences are ignored
    When comparing screenshots
    And only anti-aliasing artifacts differ
    Then the comparison should pass
    And the anti-aliasing tolerance threshold should be respected

  Scenario: Timing differences are ignored
    When comparing screenshots
    And only animation timing differs
    Then the comparison should pass
    And the visual content should be identical

  Scenario: Structural similarity calculation is accurate
    When comparing two identical screenshots
    Then the SSIM score should be exactly 1.0
    When comparing screenshots with minor differences
    Then the SSIM score should reflect the perceptual difference
    And a score below 0.95 should indicate significant visual changes

  Scenario: Pixel-by-pixel comparison thresholds
    When comparing screenshots
    And less than 0.5% of pixels differ
    Then the comparison should pass
    When comparing screenshots
    And more than 1.0% of pixels differ
    Then the comparison should fail
    And the failing pixels should be highlighted in the diff output

  Scenario: Visual regression tests are deterministic
    When running the same visual test multiple times
    Then the test results should be identical
    And no timing-related flakiness should occur
    And screenshot capture should be consistent

  Scenario: Cross-browser visual consistency
    Given visual regression tests run on Chromium
    And visual regression tests run on Firefox
    And visual regression tests run on WebKit
    Then baseline screenshots should be stored per-browser
    And each browser should have its own baseline
    And test failures should be reported per-browser

  Scenario: Dark mode visual state
    Given the user has selected dark mode
    When the WebXR experience renders
    Then the visual state should match the dark mode baseline
    And the pixel difference should be below 0.5%
    And lighting effects should be properly rendered

  Scenario: Light mode visual state
    Given the user has selected light mode
    When the WebXR experience renders
    Then the visual state should match the light mode baseline
    And the pixel difference should be below 0.5%
    And lighting effects should be properly rendered

  Scenario: Screenshot directory structure is organized
    When baseline screenshots are saved
    Then they should be in tests/e2e/webxr/screenshots/baseline/
    And each scenario should have a named screenshot file
    And browser-specific screenshots should be in subdirectories

  Scenario: Failed comparison generates diff output
    When a visual comparison fails
    Then a diff image should be generated
    And the diff should highlight changed pixels
    And the diff should be saved for review
    And the percentage of changed pixels should be reported