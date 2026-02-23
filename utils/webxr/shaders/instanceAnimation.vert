/**
 * Vertex shader for WebXR instancing system
 * Handles:
 * - Floating animation via GPU-based sine wave
 * - View transition (home <-> work) mixing
 * - Hover effect with forward movement and scale
 * - Texture atlas UV coordinate adjustment
 */

// Uniforms - updated per frame or on state change
uniform float uTime;           // Global time for animation
uniform float uViewMode;       // 0 for home, 1 for work
uniform float uHoverIndex;     // Currently hovered instance index
uniform float uOpacity;        // Opacity level
uniform float uHoverScale;     // Scale multiplier for hovered instance

// Attributes - per-instance data
attribute float aAnimationOffset;  // Animation phase offset for staggering
attribute vec2 aUvOffset;          // UV offset for texture atlas
attribute float aBaseY;            // Base Y position for home view
attribute float aHoverY;           // Target Y position for work view
attribute vec3 aBasePosition;      // Base position for home view
attribute vec3 aHoverPosition;     // Target position for work view

// Varyings - passed to fragment shader
varying vec2 vUv;                  // Adjusted UV coordinates
varying float vHovered;            // Hover state (0.0 or 1.0)
varying float vInstanceIndex;      // Instance ID for debugging
varying float vOpacity;            // Opacity for fragment shader

// Constants
#define FLOATING_SPEED 2.0
#define FLOATING_AMPLITUDE 0.05
#define HOVER_FORWARD_OFFSET 0.5
#define HOVER_UP_OFFSET 0.3

/**
 * Calculate hover state for current instance
 * Uses step functions for efficient GPU comparison
 */
float calculateHovered() {
  float instanceId = float(gl_InstanceID);
  // Check if instanceId is within [uHoverIndex - 0.5, uHoverIndex + 0.5]
  float lowerBound = step(instanceId - 0.5, uHoverIndex);
  float upperBound = step(uHoverIndex - 0.5, instanceId);
  return lowerBound * upperBound;
}

/**
 * Apply floating animation using sine wave
 * Creates gentle bobbing motion for all instances
 */
vec3 applyFloating(vec3 position, float animationOffset) {
  float floating = sin(uTime * FLOATING_SPEED + animationOffset) * FLOATING_AMPLITUDE;
  position.y += floating;
  return position;
}

/**
 * Apply view transition between home and work positions
 * Uses smooth interpolation (mix)
 */
vec3 applyViewTransition(vec3 basePos, vec3 hoverPos) {
  return mix(basePos, hoverPos, uViewMode);
}

/**
 * Apply hover effect - forward movement and slight upward offset
 * Only affects the currently hovered instance
 */
vec3 applyHoverEffect(vec3 position, float isHovered) {
  position.z += isHovered * HOVER_FORWARD_OFFSET;
  position.y += isHovered * HOVER_UP_OFFSET;
  return position;
}

/**
 * Calculate scale for hovered instance
 * Apply in vertex shader for smooth GPU animation
 */
float calculateInstanceScale(float isHovered) {
  return 1.0 + isHovered * (uHoverScale - 1.0);
}

void main() {
  vInstanceIndex = float(gl_InstanceID);
  vOpacity = uOpacity;

  // Calculate hover state
  vHovered = calculateHovered();

  // Start with base vertex position
  vec3 pos = position;

  // Apply view transition (home <-> work)
  vec3 targetPosition = applyViewTransition(aBasePosition, aHoverPosition);

  // Add view-specific Y offset
  float viewYOffset = mix(aBaseY, aHoverY, uViewMode);
  pos.y += viewYOffset;

  // Apply floating animation
  pos = applyFloating(pos, aAnimationOffset);

  // Apply hover effect
  pos = applyHoverEffect(pos, vHovered);

  // Calculate instance scale for hover
  float instanceScale = calculateInstanceScale(vHovered);
  pos *= instanceScale;

  // Apply instance matrix and model-view transformation
  vec4 worldPosition = instanceMatrix * vec4(pos, 1.0);
  vec4 mvPosition = modelViewMatrix * worldPosition;

  // Final position in clip space
  gl_Position = projectionMatrix * mvPosition;

  // Adjust UV coordinates for texture atlas
  vUv = uv + aUvOffset;
}