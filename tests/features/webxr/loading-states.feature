Feature: WebXR Loading States

  As a visitor entering the WebXR portfolio experience
  I want clear loading feedback and quick initial rendering
  So that I don't abandon the experience before it starts

  Background:
    Given the user has navigated to the WebXR page
    And the browser supports WebXR

  Scenario: Initial loading indicator displays
    When the WebXR page begins loading
    Then a loading spinner should appear
    And a "Loading WebXR Experience..." message should display
    And the loading state should be centered on screen
    And the background should be black

  Scenario: Loading indicator disappears when ready
    Given the loading indicator is displayed
    When all WebXR components have loaded
    Then the loading indicator should fade out
    And the WebXR scene should become visible
    And the transition should be smooth

  Scenario: Components load with progressive enhancement
    When the WebXR scene loads
    Then the canvas should render first
    And the camera should initialize
    And static elements should appear next
    And animated elements should load last

  Scenario: Text elements load asynchronously
    When the WebXR scene loads
    Then 3D text components should load on demand
    And a fallback should display while text is loading
    And text loading should not block the initial render

  Scenario: Work cards load with stagger
    When the user transitions to the work view
    Then work cards should load one at a time
    And the delay between cards should be 150ms
    And each card should animate into view
    And the loading should feel intentional, not sluggish

  Scenario: Texture loading has fallback
    Given a work card has a cover image texture
    When the texture fails to load
    Then a fallback color should display
    And the card should remain interactive
    And the user should be informed of the loading issue

  Scenario: Fonts are preloaded
    When the WebXR page loads
    Then required fonts should begin loading immediately
    And text should not display until fonts are loaded
    And font loading should not block other components

  Scenario: Loading performance meets targets
    When the user navigates to the WebXR page
    Then the initial loading indicator should appear within 100ms
    And the WebXR scene should be interactive within 2 seconds
    And all work cards should be visible within 1 second of view transition

  Scenario: Loading state handles bundle splitting
    When the WebXR page loads
    Then components should load in separate chunks
    And chunks should load on demand
    And the initial bundle should be under 200KB

  Scenario: Loading works across network conditions
    Given the user has a slow network connection
    When the WebXR page loads
    Then the loading indicator should remain visible
    And a timeout should not occur before 10 seconds
    And the experience should degrade gracefully

  Scenario: Loading error has fallback
    Given a critical WebXR component fails to load
    When the component fails
    Then an error boundary should catch the error
    And a fallback component should render
    And the user should be able to continue using other features

  Scenario: Cached content loads faster
    Given the user has previously visited the WebXR page
    When the user navigates to the WebXR page again
    Then the loading indicator should appear briefly
    And the WebXR scene should be visible within 500ms
    And cached assets should be used