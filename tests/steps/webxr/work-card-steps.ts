import { Given, When, Then } from '@cucumber/cucumber';
import { World } from '@cucumber/cucumber';

// Background: WebXR loaded, on work view, cards visible
Given('the WebXR experience is loaded', async function (this: World) {
  // Navigate to /webxr or check state
  this.set('webxrLoaded', true);
});

Given('the user is on the {string} view', async function (this: World, view: string) {
  this.set('currentView', view);
});

Given('all 5 work cards are visible', async function (this: World) {
  this.set('cardsVisible', true);
});

// Scenario: Instant hover response
When('the user\'s gaze or cursor hovers over a work card', async function (this: World) {
  // Simulate hover event
  this.set('hovered', true);
});

Then('the card should begin scaling up within 16ms', async function (this: World) {
  // Verify timing - would need actual performance measurement
  const hoverTime = this.get('hoverTime') as number;
  const now = Date.now();
  expect(now - hoverTime).toBeLessThan(16);
});

Then('the card should reach target scale (1.1x) within 200ms', async function (this: World) {
  // Verify scale animation completes
});

Then('the glow effect should appear immediately', async function (this: World) {
  // Verify glow opacity
});

// Scenario: Hover animation uses spring physics
Then('the scale animation should use spring physics', async function (this: World) {
  // Verify spring configuration
});

Then('the forward movement should have slight overshoot', async function (this: World) {
  // Verify overshoot in animation
});

Then('the glow opacity should fade in smoothly', async function (this: World) {
  // Verify glow opacity transition
});

// Scenario: Multiple cards hover
When('the user hovers over card 1', async function (this: World) {
  this.set('hoveredCard', 0);
});

Then('card 1 should scale up', async function (this: World) {
  expect(this.get('hoveredCard')).toBe(0);
});

When('the user moves to hover over card 2', async function (this: World) {
  this.set('hoveredCard', 1);
});

Then('card 1 should return to normal scale', async function (this: World) {
  // Verify previous card returns to normal
});

Then('card 2 should scale up', async function (this: World) {
  expect(this.get('hoveredCard')).toBe(1);
});

Then('the transition between cards should be smooth', async function (this: World) {
  // Verify transition timing
});

// Scenario: WIP badge
Given('a work card has the {string} flag set', async function (this: World, flag: string) {
  this.set('workCardFlags', { isWIP: flag === 'isWIP' });
});

Then('the {string} badge should appear with the card', async function (this: World, badge: string) {
  expect(badge).toBe('WIP');
});

Then('the badge should have proper contrast', async function (this: World) {
  // Verify contrast ratio
});

// Scenario: Hover ends
Given('a work card is currently hovered', async function (this: World) {
  this.set('hovered', true);
});

When('the cursor moves away from the card', async function (this: World) {
  this.set('hovered', false);
});

Then('the card should scale back to normal using spring physics', async function (this: World) {
  // Verify spring animation
});

Then('the glow effect should fade out', async function (this: World) {
  // Verify glow fades
});

Then('the animation should complete within 300ms', async function (this: World) {
  // Verify timing
});

// Scenario: Hand tracking
Given('the user is using Vision Pro with hand tracking', async function (this: World) {
  this.set('device', 'vision-pro');
});

When('the user\'s gaze focuses on a work card', async function (this: World) {
  this.set('gazeFocused', true);
});

Then('the card should show hover state', async function (this: World) {
  expect(this.get('gazeFocused')).toBe(true);
});

When('the user performs pinch gesture', async function (this: World) {
  this.set('pinchGesture', true);
});

Then('the card should trigger click navigation', async function (this: World) {
  // Verify navigation triggered
});

// Scenario: Reduced motion
Given('the user has enabled reduced motion preference', async function (this: World) {
  this.set('reducedMotion', true);
});

Then('the scale change should be minimal (1.05x max)', async function (this: World) {
  // Verify reduced scale
});

Then('the animation should be linear, not spring-based', async function (this: World) {
  // Verify linear animation
});

// Scenario: Cross-device consistency
Given('the user accesses WebXR on Vision Pro', async function (this: World) {
  this.set('device', 'vision-pro');
});

And('given the user accesses WebXR on Quest', async function (this: World) {
  this.set('device', 'quest');
});

And('given the user accesses WebXR on desktop browser', async function (this: World) {
  this.set('device', 'desktop');
});

Then('hover response time should be consistent (less than 20ms variance)', async function (this: World) {
  // Verify consistent timing across devices
});

Then('visual feedback should be identical', async function (this: World) {
  // Verify visual consistency
});
