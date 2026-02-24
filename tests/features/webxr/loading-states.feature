Feature: Loading States
  As a portfolio visitor
  I want clear feedback during loading
  So that I understand what's happening

  Background:
    Given the user navigates to /webxr
    And the WebXR experience has not loaded yet

  Scenario: Loading indicator appears immediately
    Then a loading spinner should appear within 100ms
    And the spinner should be centered on screen
    And the text "Loading WebXR Experience..." should be visible

  Scenario: Components load in chunks
    Then WebXRCanvas should load first
    And heavy components should load in parallel
    And chunk load times should be logged in development

  Scenario: Texture atlas loads progressively
    When the texture atlas begins loading
    Then a progress indicator should show loading progress
    And each card image should appear as it loads
    And fully loaded cards should be interactive immediately

  Scenario: Custom fonts load asynchronously
    When the GT Eesti Display Bold font is loading
    Then text should use fallback font until loaded
    And text should re-render with custom font when loaded
    And no layout shift should occur

  Scenario: Scene becomes interactive after loading
    Given all assets have finished loading
    Then the loading indicator should fade out
    And the scene should become interactive within 500ms
    And the breathing animation should start

  Scenario: Loading errors are handled gracefully
    When a texture fails to load
    Then a placeholder should be displayed
    And an error message should be logged
    And the rest of the scene should remain functional

  Scenario: Initial bundle size is optimized
    Then the initial JavaScript bundle should be under 200KB
    And total WebXR chunks should be under 2MB
    And lazy-loaded components should not block initial render

  Scenario: Loading is faster on repeat visits
    Given the user has visited WebXR before
    Then cached assets should load from browser cache
    And loading time should be under 500ms
    And no loading indicator should be needed

  Scenario: Loading optimizes for Vision Pro
    Given the user is accessing via Vision Pro
    Then textures should be pre-loaded at higher resolution
    And shaders should be pre-compiled
    And loading should complete in under 1 second

  Scenario: Loading meets performance budgets
    Then total page load time should be under 2 seconds
    And time to interactive should be under 2.5 seconds
    And cumulative layout shift should be under 0.1
