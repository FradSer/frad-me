/**
 * Unit tests for WebXR vertex shader logic
 *
 * These tests verify the shader logic by implementing equivalent
 * TypeScript functions that mirror the GLSL shader behavior.
 */

import { describe, expect, it } from '@jest/globals';
import { FRAGMENT_SHADER, VERTEX_SHADER } from '@/utils/webxr/shaders/loadShader';
import { OPACITY_THRESHOLDS, SHADER_DEFINES } from '@/utils/webxr/shaders/shaderTypes';

// Constants from the vertex shader
const FLOATING_SPEED_SHADER = 2.0;
const FLOATING_AMPLITUDE_SHADER = 0.05;
const HOVER_FORWARD_OFFSET_SHADER = 0.5;
const HOVER_UP_OFFSET_SHADER = 0.3;

// Fragment shader constants
const HIDE_THRESHOLD_SHADER = 0.01;

/**
 * Calculate floating animation offset (mirrors shader's applyFloating function)
 * floating = sin(uTime * FLOATING_SPEED + animationOffset) * FLOATING_AMPLITUDE
 */
function calculateFloatingOffset(
  time: number,
  animationOffset: number,
  speed: number = FLOATING_SPEED_SHADER,
  amplitude: number = FLOATING_AMPLITUDE_SHADER,
): number {
  return Math.sin(time * speed + animationOffset) * amplitude;
}

/**
 * Calculate hover state using step function (mirrors shader's calculateHovered)
 * Uses step functions for efficient GPU comparison
 * step(a, b) returns 0 if a > b, 1 if a <= b
 */
function calculateHovered(instanceId: number, hoverIndex: number): number {
  const lowerBound = step(instanceId - 0.5, hoverIndex);
  const upperBound = step(hoverIndex - 0.5, instanceId);
  return lowerBound * upperBound;
}

/**
 * Step function: returns 1 if edge <= value, 0 otherwise
 */
function step(edge: number, value: number): number {
  return value >= edge ? 1 : 0;
}

/**
 * Apply view transition between base and target positions
 * Uses smooth interpolation (mix)
 */
function applyViewTransition(basePos: number, targetPos: number, viewMode: number): number {
  return basePos * (1 - viewMode) + targetPos * viewMode;
}

/**
 * Calculate instance scale based on hover state
 */
function calculateInstanceScale(
  isHovered: number,
  hoverScale: number = SHADER_DEFINES.HOVER_SCALE,
): number {
  return 1.0 + isHovered * (hoverScale - 1.0);
}

/**
 * Apply hover effect to position
 */
function applyHoverEffect(
  x: number,
  y: number,
  z: number,
  isHovered: number,
): { x: number; y: number; z: number } {
  return {
    x,
    y: y + isHovered * HOVER_UP_OFFSET_SHADER,
    z: z + isHovered * HOVER_FORWARD_OFFSET_SHADER,
  };
}

/**
 * Calculate animation phase offset for staggering
 */
function calculateAnimationPhaseOffset(index: number, total: number, phaseOffset = 0.5): number {
  return (index / total) * Math.PI * 2 * phaseOffset;
}

/**
 * Apply reduced motion to animation parameters
 */
function applyReducedMotion(
  amplitude: number,
  speed: number,
  reducedMotion: boolean,
): { amplitude: number; speed: number } {
  if (reducedMotion) {
    return { amplitude: 0, speed: 0 };
  }
  return { amplitude, speed };
}

describe('vertex shader logic', () => {
  describe('floating formula', () => {
    it('produces correct output for zero time and offset', () => {
      const result = calculateFloatingOffset(0, 0);
      expect(result).toBeCloseTo(0, 6);
    });

    it('produces correct output for peak of sine wave', () => {
      const result = calculateFloatingOffset(Math.PI / (2 * FLOATING_SPEED_SHADER), 0);
      expect(result).toBeCloseTo(FLOATING_AMPLITUDE_SHADER, 6);
    });

    it('produces correct output with animation offset', () => {
      const result = calculateFloatingOffset(0, Math.PI / 2);
      expect(result).toBeCloseTo(FLOATING_AMPLITUDE_SHADER, 6);
    });

    it('matches SHADER_DEFINES constants', () => {
      expect(SHADER_DEFINES.FLOATING_SPEED).toBe(FLOATING_SPEED_SHADER);
      expect(SHADER_DEFINES.FLOATING_AMPLITUDE).toBe(FLOATING_AMPLITUDE_SHADER);
    });

    it('produces correct output for time 1.0', () => {
      const time = 1.0;
      const offset = 0;
      const expected = Math.sin(time * FLOATING_SPEED_SHADER) * FLOATING_AMPLITUDE_SHADER;
      const result = calculateFloatingOffset(time, offset);
      expect(result).toBeCloseTo(expected, 6);
    });

    it('produces correct output for time 0.5 with offset 0.5', () => {
      const time = 0.5;
      const offset = 0.5;
      const expected = Math.sin(time * FLOATING_SPEED_SHADER + offset) * FLOATING_AMPLITUDE_SHADER;
      const result = calculateFloatingOffset(time, offset);
      expect(result).toBeCloseTo(expected, 6);
    });

    it('produces correct output for time 1.57 (approx PI/2)', () => {
      const time = 1.57;
      const offset = 0;
      const expected = Math.sin(time * FLOATING_SPEED_SHADER) * FLOATING_AMPLITUDE_SHADER;
      const result = calculateFloatingOffset(time, offset);
      expect(result).toBeCloseTo(expected, 6);
    });
  });

  describe('animation phases', () => {
    it('create staggered effect across instances', () => {
      const total = 5;
      const offsets = Array.from({ length: total }, (_, i) =>
        calculateAnimationPhaseOffset(i, total),
      );

      // Check each offset is unique
      const uniqueOffsets = new Set(offsets);
      expect(uniqueOffsets.size).toBe(total);
    });

    it('offset increases with instance index', () => {
      const total = 5;
      const offsets = Array.from({ length: total }, (_, i) =>
        calculateAnimationPhaseOffset(i, total),
      );

      for (let i = 1; i < total; i++) {
        expect(offsets[i]).toBeGreaterThan(offsets[i - 1]);
      }
    });

    it('respects phase offset parameter', () => {
      const offset1 = calculateAnimationPhaseOffset(1, 5, 0.5);
      const offset2 = calculateAnimationPhaseOffset(1, 5, 1.0);

      expect(offset2).toBeGreaterThan(offset1);
      expect(offset2 / offset1).toBeCloseTo(2, 6);
    });
  });

  describe('view Y interpolation', () => {
    it('interpolates correctly at midpoint', () => {
      const baseY = 0.0;
      const hoverY = 1.0;
      const viewMode = 0.5;

      const result = applyViewTransition(baseY, hoverY, viewMode);
      expect(result).toBeCloseTo(0.5, 6);
    });

    it('returns baseY at viewMode 0', () => {
      const baseY = 0.0;
      const hoverY = 1.0;
      const viewMode = 0.0;

      const result = applyViewTransition(baseY, hoverY, viewMode);
      expect(result).toBe(baseY);
    });

    it('returns hoverY at viewMode 1', () => {
      const baseY = 0.0;
      const hoverY = 1.0;
      const viewMode = 1.0;

      const result = applyViewTransition(baseY, hoverY, viewMode);
      expect(result).toBe(hoverY);
    });

    it('handles negative values', () => {
      const baseY = -1.0;
      const hoverY = 1.0;
      const viewMode = 0.5;

      const result = applyViewTransition(baseY, hoverY, viewMode);
      expect(result).toBeCloseTo(0, 6);
    });
  });

  describe('hover detection logic', () => {
    it('detects hover when instance ID matches hover index', () => {
      const result = calculateHovered(0, 0);
      expect(result).toBe(1.0);
    });

    it('does not detect hover when instance ID differs', () => {
      const result = calculateHovered(1, 0);
      expect(result).toBe(0.0);
    });

    it('returns 0 when no instance is hovered (-1)', () => {
      const result = calculateHovered(2, -1);
      expect(result).toBe(0.0);
    });

    it('detects hover for higher instance IDs', () => {
      const result = calculateHovered(3, 3);
      expect(result).toBe(1.0);
    });

    it('uses step function correctly for lower bound', () => {
      // step(instanceId - 0.5, uHoverIndex)
      // instanceId=1, hoverIndex=0: step(0.5, 0) = 0
      expect(step(0.5, 0)).toBe(0);

      // instanceId=0, hoverIndex=0: step(-0.5, 0) = 1
      expect(step(-0.5, 0)).toBe(1);
    });

    it('uses step function correctly for upper bound', () => {
      // step(uHoverIndex - 0.5, instanceId)
      // instanceId=1, hoverIndex=0: step(-0.5, 1) = 1
      expect(step(-0.5, 1)).toBe(1);

      // instanceId=-1, hoverIndex=0: step(-0.5, -1) = 0
      expect(step(-0.5, -1)).toBe(0);
    });

    it('correctly handles boundary case at hoverIndex', () => {
      // Tests the condition: instanceId ∈ [uHoverIndex - 0.5, uHoverIndex + 0.5]
      const hoverIndex = 2;

      // At exact index
      expect(calculateHovered(2, hoverIndex)).toBe(1.0);

      // Just within bounds
      expect(calculateHovered(2.49, hoverIndex)).toBe(1.0);
      expect(calculateHovered(1.51, hoverIndex)).toBe(1.0);

      // Just outside bounds
      expect(calculateHovered(2.51, hoverIndex)).toBe(0.0);
      expect(calculateHovered(1.49, hoverIndex)).toBe(0.0);
    });
  });

  describe('hover scale and position offsets', () => {
    it('increases Z position when hovered', () => {
      const pos = { x: 0, y: 0, z: 0 };
      const result = applyHoverEffect(pos.x, pos.y, pos.z, 1.0);

      expect(result.z).toBeCloseTo(HOVER_FORWARD_OFFSET_SHADER, 6);
    });

    it('does not change Z position when not hovered', () => {
      const pos = { x: 0, y: 0, z: 0 };
      const result = applyHoverEffect(pos.x, pos.y, pos.z, 0.0);

      expect(result.z).toBe(0);
    });

    it('increases Y position when hovered', () => {
      const pos = { x: 0, y: 0, z: 0 };
      const result = applyHoverEffect(pos.x, pos.y, pos.z, 1.0);

      expect(result.y).toBeCloseTo(HOVER_UP_OFFSET_SHADER, 6);
    });

    it('does not change Y position when not hovered', () => {
      const pos = { x: 0, y: 0, z: 0 };
      const result = applyHoverEffect(pos.x, pos.y, pos.z, 0.0);

      expect(result.y).toBe(0);
    });

    it('increases scale when hovered', () => {
      const scale = calculateInstanceScale(1.0);
      expect(scale).toBeCloseTo(SHADER_DEFINES.HOVER_SCALE, 6);
    });

    it('keeps base scale when not hovered', () => {
      const scale = calculateInstanceScale(0.0);
      expect(scale).toBe(1.0);
    });

    it('applies hover offsets simultaneously', () => {
      const pos = { x: 0, y: 0, z: 0 };
      const scale = calculateInstanceScale(1.0);
      const result = applyHoverEffect(pos.x, pos.y, pos.z, 1.0);

      expect(result.z).toBeCloseTo(HOVER_FORWARD_OFFSET_SHADER, 6);
      expect(result.y).toBeCloseTo(HOVER_UP_OFFSET_SHADER, 6);
      expect(scale).toBeCloseTo(SHADER_DEFINES.HOVER_SCALE, 6);
    });

    it('matches SHADER_DEFINES constants', () => {
      expect(SHADER_DEFINES.HOVER_FORWARD_OFFSET).toBe(HOVER_FORWARD_OFFSET_SHADER);
      expect(SHADER_DEFINES.HOVER_UP_OFFSET).toBe(HOVER_UP_OFFSET_SHADER);
      expect(SHADER_DEFINES.HOVER_SCALE).toBe(1.1);
    });
  });

  describe('reduced motion support', () => {
    it('reduces floating amplitude when reduced motion is enabled', () => {
      const result = applyReducedMotion(FLOATING_AMPLITUDE_SHADER, FLOATING_SPEED_SHADER, true);
      expect(result.amplitude).toBe(0);
    });

    it('sets speed to zero when reduced motion is enabled', () => {
      const result = applyReducedMotion(FLOATING_AMPLITUDE_SHADER, FLOATING_SPEED_SHADER, true);
      expect(result.speed).toBe(0);
    });

    it('keeps original parameters when reduced motion is disabled', () => {
      const result = applyReducedMotion(FLOATING_AMPLITUDE_SHADER, FLOATING_SPEED_SHADER, false);
      expect(result.amplitude).toBe(FLOATING_AMPLITUDE_SHADER);
      expect(result.speed).toBe(FLOATING_SPEED_SHADER);
    });

    it('floating with reduced motion produces zero offset', () => {
      const { amplitude } = applyReducedMotion(
        FLOATING_AMPLITUDE_SHADER,
        FLOATING_SPEED_SHADER,
        true,
      );
      const offset = calculateFloatingOffset(1.0, 0, FLOATING_SPEED_SHADER, amplitude);
      expect(offset).toBe(0);
    });
  });

  describe('shader constants', () => {
    it('VERTEX_SHADER is defined and contains expected functions', () => {
      expect(VERTEX_SHADER).toBeDefined();
      expect(VERTEX_SHADER).toContain('applyFloating');
      expect(VERTEX_SHADER).toContain('calculateHovered');
      expect(VERTEX_SHADER).toContain('applyViewTransition');
      expect(VERTEX_SHADER).toContain('applyHoverEffect');
      expect(VERTEX_SHADER).toContain('calculateInstanceScale');
    });

    it('VERTEX_SHADER contains correct constants', () => {
      expect(VERTEX_SHADER).toContain('#define FLOATING_SPEED 2.0');
      expect(VERTEX_SHADER).toContain('#define FLOATING_AMPLITUDE 0.05');
      expect(VERTEX_SHADER).toContain('#define HOVER_FORWARD_OFFSET 0.5');
      expect(VERTEX_SHADER).toContain('#define HOVER_UP_OFFSET 0.3');
    });

    it('FRAGMENT_SHADER is defined', () => {
      expect(FRAGMENT_SHADER).toBeDefined();
      expect(FRAGMENT_SHADER).toContain('texture2D');
      expect(FRAGMENT_SHADER).toContain('mix');
      expect(FRAGMENT_SHADER).toContain('discard');
    });

    it('FRAGMENT_SHADER contains correct constants', () => {
      expect(FRAGMENT_SHADER).toContain('#define GLOW_INTENSITY 0.3');
      expect(FRAGMENT_SHADER).toContain('#define HIDE_THRESHOLD 0.01');
    });

    it('OPACITY_THRESHOLDS constant matches fragment shader', () => {
      expect(OPACITY_THRESHOLDS.minimum).toBe(HIDE_THRESHOLD_SHADER);
    });
  });
});
