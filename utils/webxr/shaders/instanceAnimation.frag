/**
 * Fragment shader for WebXR instancing system
 * Handles:
 * - Texture sampling from texture atlas
 * - Color mixing with hover glow effect
 * - Opacity transitions for fade in/out
 * - Alpha discard for performance
 */

// Uniforms
uniform sampler2D uTextureAtlas;  // Combined card textures
uniform float uOpacity;           // Overall opacity
uniform vec3 uGlowColor;          // Color for hover glow effect

// Varyings from vertex shader
varying vec2 vUv;                  // Adjusted UV coordinates
varying float vHovered;            // Hover state (0.0 or 1.0)
varying float vInstanceIndex;      // Instance ID for debugging
varying float vOpacity;            // Opacity from vertex shader

// Constants
#define GLOW_INTENSITY 0.3
#define HIDE_THRESHOLD 0.01

/**
 * Main fragment shader
 * Samples texture, applies hover glow, handles opacity
 */
void main() {
  // Sample texture at adjusted UV coordinates
  vec4 texColor = texture2D(uTextureAtlas, vUv);

  // Discard fragments with very low alpha for performance
  if (texColor.a < 0.01) {
    discard;
  }

  // Apply hover glow effect by mixing texture color with glow color
  vec3 finalColor = mix(texColor.rgb, uGlowColor, vHovered * GLOW_INTENSITY);

  // Final opacity combines texture alpha and uniform opacity
  float finalOpacity = texColor.a * uOpacity * vOpacity;

  // Discard if below threshold
  if (finalOpacity < HIDE_THRESHOLD) {
    discard;
  }

  // Output final color
  gl_FragColor = vec4(finalColor, finalOpacity);
}