/**
 * Unit tests for WebXR fragment shader logic
 *
 * These tests verify the fragment shader logic by implementing equivalent
 * TypeScript functions that mirror the GLSL shader behavior.
 */

import { describe, expect, it } from '@jest/globals';
import { HIDE_THRESHOLD, OPACITY_THRESHOLDS } from '@/utils/webxr/shaders/shaderTypes';

// Fragment shader constants
const GLOW_INTENSITY = 0.3;
const HIDE_THRESHOLD_SHADER = HIDE_THRESHOLD;
const TEXTURE_ALPHA_THRESHOLD = 0.01;

/**
 * Mix two values (GLSL mix function equivalent)
 * mix(x, y, a) = x * (1 - a) + y * a
 */
function mix(x: number, y: number, a: number): number {
  return x * (1 - a) + y * a;
}

/**
 * Mix two color vectors
 */
function mixColor(
  texColor: [number, number, number],
  glowColor: [number, number, number],
  amount: number,
): [number, number, number] {
  return [
    mix(texColor[0], glowColor[0], amount),
    mix(texColor[1], glowColor[1], amount),
    mix(texColor[2], glowColor[2], amount),
  ];
}

/**
 * Calculate final opacity combining texture alpha and uniforms
 */
function calculateFinalOpacity(texAlpha: number, uOpacity: number, vOpacity: number): number {
  return texAlpha * uOpacity * vOpacity;
}

/**
 * Check if fragment should be discarded based on alpha threshold
 */
function shouldDiscardFragment(alpha: number, threshold: number): boolean {
  return alpha < threshold;
}

/**
 * Adjust UV coordinates with offset
 */
function adjustUV(
  baseU: number,
  baseV: number,
  offsetU: number,
  offsetV: number,
): { u: number; v: number } {
  return { u: baseU + offsetU, v: baseV + offsetV };
}

/**
 * Calculate final color with hover glow effect
 */
function calculateFinalColor(
  texColor: [number, number, number],
  glowColor: [number, number, number],
  hovered: number,
  glowIntensity: number = GLOW_INTENSITY,
): [number, number, number] {
  const mixAmount = hovered * glowIntensity;
  return mixColor(texColor, glowColor, mixAmount);
}

/**
 * Sample texture color (simulated - returns fixed color based on UV)
 */
function _sampleTexture(u: number, v: number): { color: [number, number, number]; alpha: number } {
  // Simulate a simple texture that varies with UV
  const r = u;
  const g = v;
  const b = (u + v) / 2;
  const alpha = 0.8;
  return { color: [r, g, b], alpha };
}

describe('fragment shader logic', () => {
  describe('view opacity mixing', () => {
    it('mixes opacity correctly when vOpacity is 0.5', () => {
      const texAlpha = 0.8;
      const uOpacity = 0.7;
      const vOpacity = 0.5;

      const result = calculateFinalOpacity(texAlpha, uOpacity, vOpacity);
      expect(result).toBeCloseTo(0.8 * 0.7 * 0.5, 6);
    });

    it('mixes opacity correctly when vOpacity is 1.0', () => {
      const texAlpha = 0.8;
      const uOpacity = 0.7;
      const vOpacity = 1.0;

      const result = calculateFinalOpacity(texAlpha, uOpacity, vOpacity);
      expect(result).toBeCloseTo(0.8 * 0.7 * 1.0, 6);
    });

    it('mixes opacity correctly when vOpacity is 0.0', () => {
      const texAlpha = 0.8;
      const uOpacity = 0.7;
      const vOpacity = 0.0;

      const result = calculateFinalOpacity(texAlpha, uOpacity, vOpacity);
      expect(result).toBeCloseTo(0.8 * 0.7 * 0.0, 6);
    });

    it('handles zero texture alpha', () => {
      const texAlpha = 0.0;
      const uOpacity = 0.9;
      const vOpacity = 1.0;

      const result = calculateFinalOpacity(texAlpha, uOpacity, vOpacity);
      expect(result).toBe(0);
    });

    it('handles zero uOpacity', () => {
      const texAlpha = 0.8;
      const uOpacity = 0.0;
      const vOpacity = 1.0;

      const result = calculateFinalOpacity(texAlpha, uOpacity, vOpacity);
      expect(result).toBe(0);
    });
  });

  describe('hover fade effect', () => {
    it('applies no glow when not hovered', () => {
      const texColor: [number, number, number] = [1.0, 0.0, 0.0];
      const glowColor: [number, number, number] = [0.0, 0.5, 1.0];
      const hovered = 0.0;

      const result = calculateFinalColor(texColor, glowColor, hovered);
      expect(result).toEqual(texColor);
    });

    it('applies glow with correct intensity when hovered', () => {
      const texColor: [number, number, number] = [1.0, 0.0, 0.0];
      const glowColor: [number, number, number] = [0.0, 0.5, 1.0];
      const hovered = 1.0;

      const result = calculateFinalColor(texColor, glowColor, hovered);
      const mixAmount = hovered * GLOW_INTENSITY;

      expect(result[0]).toBeCloseTo(mix(texColor[0], glowColor[0], mixAmount), 6);
      expect(result[1]).toBeCloseTo(mix(texColor[1], glowColor[1], mixAmount), 6);
      expect(result[2]).toBeCloseTo(mix(texColor[2], glowColor[2], mixAmount), 6);
    });

    it('mix amount is 0 when hovered is 0', () => {
      const hovered = 0.0;

      const mixAmount = hovered * GLOW_INTENSITY;
      expect(mixAmount).toBe(0);
    });

    it('mix amount is 0.3 when hovered is 1', () => {
      const hovered = 1.0;

      const mixAmount = hovered * GLOW_INTENSITY;
      expect(mixAmount).toBeCloseTo(0.3, 6);
    });
  });

  describe('glow color mixing', () => {
    it('mixes red texture color correctly with glow', () => {
      const texColor: [number, number, number] = [1.0, 0.0, 0.0];
      const glowColor: [number, number, number] = [0.3, 0.3, 1.0];
      const hovered = 1.0;

      const result = calculateFinalColor(texColor, glowColor, hovered);
      const mixAmount = hovered * GLOW_INTENSITY;

      // mix(1.0, 0.3, 0.3) = 1.0 * 0.7 + 0.3 * 0.3 = 0.7 + 0.09 = 0.79
      // mix(0.0, 0.3, 0.3) = 0.0 * 0.7 + 0.3 * 0.3 = 0 + 0.09 = 0.09
      // mix(0.0, 1.0, 0.3) = 0.0 * 0.7 + 1.0 * 0.3 = 0 + 0.3 = 0.3
      expect(result[0]).toBeCloseTo(mix(texColor[0], glowColor[0], mixAmount), 6);
      expect(result[1]).toBeCloseTo(mix(texColor[1], glowColor[1], mixAmount), 6);
      expect(result[2]).toBeCloseTo(mix(texColor[2], glowColor[2], mixAmount), 6);
    });

    it('mixes green texture color correctly with glow', () => {
      const texColor: [number, number, number] = [0.0, 1.0, 0.0];
      const glowColor: [number, number, number] = [0.3, 0.3, 1.0];
      const hovered = 1.0;

      const result = calculateFinalColor(texColor, glowColor, hovered);
      const mixAmount = hovered * GLOW_INTENSITY;

      expect(result[0]).toBeCloseTo(mix(texColor[0], glowColor[0], mixAmount), 6);
      expect(result[1]).toBeCloseTo(mix(texColor[1], glowColor[1], mixAmount), 6);
      expect(result[2]).toBeCloseTo(mix(texColor[2], glowColor[2], mixAmount), 6);
    });

    it('mixes blue texture color correctly with glow', () => {
      const texColor: [number, number, number] = [0.0, 0.0, 1.0];
      const glowColor: [number, number, number] = [0.3, 0.3, 1.0];
      const hovered = 1.0;

      const result = calculateFinalColor(texColor, glowColor, hovered);
      const mixAmount = hovered * GLOW_INTENSITY;

      expect(result[0]).toBeCloseTo(mix(texColor[0], glowColor[0], mixAmount), 6);
      expect(result[1]).toBeCloseTo(mix(texColor[1], glowColor[1], mixAmount), 6);
      expect(result[2]).toBeCloseTo(mix(texColor[2], glowColor[2], mixAmount), 6);
    });

    it('preserves glow color when fully hovered and texture is white', () => {
      const texColor: [number, number, number] = [1.0, 1.0, 1.0];
      const glowColor: [number, number, number] = [0.3, 0.3, 1.0];
      const hovered = 1.0;

      const result = calculateFinalColor(texColor, glowColor, hovered);
      const mixAmount = hovered * GLOW_INTENSITY;

      // mix(1.0, 0.3, 0.3) = 0.79
      // mix(1.0, 0.3, 0.3) = 0.79
      // mix(1.0, 1.0, 0.3) = 1.0
      expect(result[0]).toBeCloseTo(mix(texColor[0], glowColor[0], mixAmount), 6);
      expect(result[1]).toBeCloseTo(mix(texColor[1], glowColor[1], mixAmount), 6);
      expect(result[2]).toBeCloseTo(mix(texColor[2], glowColor[2], mixAmount), 6);
    });
  });

  describe('alpha discard', () => {
    it('discards fragment when texture alpha is 0', () => {
      const alpha = 0.0;
      const shouldDiscard = shouldDiscardFragment(alpha, TEXTURE_ALPHA_THRESHOLD);
      expect(shouldDiscard).toBe(true);
    });

    it('discards fragment when texture alpha is 0.005', () => {
      const alpha = 0.005;
      const shouldDiscard = shouldDiscardFragment(alpha, TEXTURE_ALPHA_THRESHOLD);
      expect(shouldDiscard).toBe(true);
    });

    it('does not discard fragment when texture alpha is exactly at threshold', () => {
      const alpha = TEXTURE_ALPHA_THRESHOLD;
      const shouldDiscard = shouldDiscardFragment(alpha, TEXTURE_ALPHA_THRESHOLD);
      expect(shouldDiscard).toBe(false);
    });

    it('does not discard fragment when texture alpha is above threshold', () => {
      const alpha = 0.5;
      const shouldDiscard = shouldDiscardFragment(alpha, TEXTURE_ALPHA_THRESHOLD);
      expect(shouldDiscard).toBe(false);
    });

    it('handles edge case just below threshold', () => {
      const alpha = TEXTURE_ALPHA_THRESHOLD - 0.000001;
      const shouldDiscard = shouldDiscardFragment(alpha, TEXTURE_ALPHA_THRESHOLD);
      expect(shouldDiscard).toBe(true);
    });

    it('handles edge case just above threshold', () => {
      const alpha = TEXTURE_ALPHA_THRESHOLD + 0.000001;
      const shouldDiscard = shouldDiscardFragment(alpha, TEXTURE_ALPHA_THRESHOLD);
      expect(shouldDiscard).toBe(false);
    });

    it('matches OPACITY_THRESHOLDS constant', () => {
      expect(OPACITY_THRESHOLDS.minimum).toBe(HIDE_THRESHOLD_SHADER);
      expect(OPACITY_THRESHOLDS.hidden).toBe(0.0);
      expect(OPACITY_THRESHOLDS.visible).toBe(1.0);
    });
  });

  describe('final opacity discard', () => {
    it('discards fragment when final opacity is below threshold', () => {
      const texAlpha = 0.5;
      const uOpacity = 0.01;
      const vOpacity = 1.0;

      const finalOpacity = calculateFinalOpacity(texAlpha, uOpacity, vOpacity);
      const shouldDiscard = shouldDiscardFragment(finalOpacity, HIDE_THRESHOLD_SHADER);

      expect(finalOpacity).toBeLessThan(HIDE_THRESHOLD_SHADER);
      expect(shouldDiscard).toBe(true);
    });

    it('does not discard fragment when final opacity is above threshold', () => {
      const texAlpha = 0.8;
      const uOpacity = 0.9;
      const vOpacity = 1.0;

      const finalOpacity = calculateFinalOpacity(texAlpha, uOpacity, vOpacity);
      const shouldDiscard = shouldDiscardFragment(finalOpacity, HIDE_THRESHOLD_SHADER);

      expect(finalOpacity).toBeGreaterThan(HIDE_THRESHOLD_SHADER);
      expect(shouldDiscard).toBe(false);
    });
  });

  describe('texture sampling with adjusted UV', () => {
    it('adjusts UV coordinates with offset', () => {
      const baseU = 0.0;
      const baseV = 0.0;
      const offsetU = 0.5;
      const offsetV = 0.0;

      const result = adjustUV(baseU, baseV, offsetU, offsetV);
      expect(result.u).toBeCloseTo(0.5, 6);
      expect(result.v).toBeCloseTo(0.0, 6);
    });

    it('adjusts UV coordinates with both offsets', () => {
      const baseU = 0.5;
      const baseV = 0.5;
      const offsetU = 0.0;
      const offsetV = 0.5;

      const result = adjustUV(baseU, baseV, offsetU, offsetV);
      expect(result.u).toBeCloseTo(0.5, 6);
      expect(result.v).toBeCloseTo(1.0, 6);
    });

    it('handles fractional UV values', () => {
      const baseU = 0.25;
      const baseV = 0.75;
      const offsetU = 0.25;
      const offsetV = 0.0;

      const result = adjustUV(baseU, baseV, offsetU, offsetV);
      expect(result.u).toBeCloseTo(0.5, 6);
      expect(result.v).toBeCloseTo(0.75, 6);
    });

    it('handles negative offsets', () => {
      const baseU = 0.5;
      const baseV = 0.5;
      const offsetU = -0.25;
      const offsetV = -0.25;

      const result = adjustUV(baseU, baseV, offsetU, offsetV);
      expect(result.u).toBeCloseTo(0.25, 6);
      expect(result.v).toBeCloseTo(0.25, 6);
    });
  });

  describe('final opacity combines multiple factors', () => {
    it('calculates correct opacity for full values', () => {
      const texAlpha = 0.8;
      const uOpacity = 0.9;
      const vOpacity = 1.0;
      const expected = 0.72;

      const result = calculateFinalOpacity(texAlpha, uOpacity, vOpacity);
      expect(result).toBeCloseTo(expected, 6);
    });

    it('calculates correct opacity for half uOpacity and vOpacity', () => {
      const texAlpha = 1.0;
      const uOpacity = 0.5;
      const vOpacity = 0.5;
      const expected = 0.25;

      const result = calculateFinalOpacity(texAlpha, uOpacity, vOpacity);
      expect(result).toBeCloseTo(expected, 6);
    });

    it('calculates correct opacity when vOpacity is 0', () => {
      const texAlpha = 0.5;
      const uOpacity = 1.0;
      const vOpacity = 0.0;
      const expected = 0.0;

      const result = calculateFinalOpacity(texAlpha, uOpacity, vOpacity);
      expect(result).toBeCloseTo(expected, 6);
    });

    it('handles multiplication order correctly', () => {
      const texAlpha = 0.5;
      const uOpacity = 0.5;
      const vOpacity = 0.5;

      const result = calculateFinalOpacity(texAlpha, uOpacity, vOpacity);
      // texAlpha * uOpacity * vOpacity = 0.5 * 0.5 * 0.5 = 0.125
      expect(result).toBeCloseTo(0.125, 6);
    });
  });

  describe('mix function', () => {
    it('returns x when mix amount is 0', () => {
      expect(mix(10, 20, 0)).toBe(10);
    });

    it('returns y when mix amount is 1', () => {
      expect(mix(10, 20, 1)).toBe(20);
    });

    it('returns average when mix amount is 0.5', () => {
      expect(mix(10, 20, 0.5)).toBe(15);
    });

    it('handles negative values', () => {
      expect(mix(-10, 10, 0.5)).toBe(0);
    });
  });

  describe('glow intensity constant', () => {
    it('has correct value', () => {
      expect(GLOW_INTENSITY).toBe(0.3);
    });

    it('produces reasonable mix results', () => {
      const texColor: [number, number, number] = [1.0, 0.0, 0.0];
      const glowColor: [number, number, number] = [0.0, 1.0, 0.0];
      const result = calculateFinalColor(texColor, glowColor, 1.0);

      // With GLOW_INTENSITY=0.3, the result should be 70% texture, 30% glow
      expect(result[0]).toBeCloseTo(0.7, 6);
      expect(result[1]).toBeCloseTo(0.3, 6);
    });
  });

  describe('shader constants matching', () => {
    it('HIDE_THRESHOLD matches OPACITY_THRESHOLDS.minimum', () => {
      expect(HIDE_THRESHOLD).toBe(HIDE_THRESHOLD_SHADER);
      expect(OPACITY_THRESHOLDS.minimum).toBe(HIDE_THRESHOLD_SHADER);
    });

    it('HIDE_THRESHOLD is 0.01', () => {
      expect(HIDE_THRESHOLD_SHADER).toBe(0.01);
    });

    it('TEXTURE_ALPHA_THRESHOLD is 0.01', () => {
      expect(TEXTURE_ALPHA_THRESHOLD).toBe(0.01);
    });
  });
});
