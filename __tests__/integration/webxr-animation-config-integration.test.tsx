/**
 * @jest-environment jsdom
 */

import { describe, expect, it } from '@jest/globals';
import { 
  WEBXR_ANIMATION_CONFIG, 
  getLerpSpeed, 
  getAdaptiveSpring,
  updateFPS,
  getQualityLevel,
  shouldHideComponent,
  validateAnimationPreset,
  isValidSpring
} from '@/utils/webxr/animationConfig';

describe('WebXR Animation Config Integration', () => {
  describe('Configuration Structure', () => {
    it('should have valid spring configurations', () => {
      Object.entries(WEBXR_ANIMATION_CONFIG.springs).forEach(([preset, spring]) => {
        expect(isValidSpring(spring)).toBe(true);
        expect(spring.tension).toBeGreaterThan(0);
        expect(spring.friction).toBeGreaterThan(0);
      });
    });

    it('should have valid timing configurations', () => {
      expect(WEBXR_ANIMATION_CONFIG.timing.delays.cardStagger).toBe(150);
      expect(WEBXR_ANIMATION_CONFIG.timing.delays.breathingInterval).toBe(2500);
      expect(WEBXR_ANIMATION_CONFIG.timing.delays.breathingDuration).toBe(1000);
    });

    it('should have valid scale configurations', () => {
      expect(WEBXR_ANIMATION_CONFIG.scales.default).toBe(1.0);
      expect(WEBXR_ANIMATION_CONFIG.scales.hover).toBe(1.1);
      expect(WEBXR_ANIMATION_CONFIG.scales.breathing).toBe(1.05);
    });
  });

  describe('Animation Functions', () => {
    it('should calculate lerp speed correctly', () => {
      const speed = getLerpSpeed('normal');
      expect(typeof speed).toBe('number');
      expect(speed).toBeGreaterThan(0);
      expect(speed).toBeLessThanOrEqual(1);
    });

    it('should validate animation presets', () => {
      expect(validateAnimationPreset('elastic')).toBe(true);
      expect(validateAnimationPreset('invalid')).toBe(false);
    });

    it('should provide adaptive spring configuration', () => {
      updateFPS(60); // High FPS
      const highFpsSpring = getAdaptiveSpring('normal');
      expect(highFpsSpring.tension).toBe(280);
      expect(highFpsSpring.friction).toBe(28);

      updateFPS(20); // Low FPS
      const lowFpsSpring = getAdaptiveSpring('normal');
      expect(lowFpsSpring.tension).toBeGreaterThan(280);
      expect(lowFpsSpring.friction).toBeGreaterThan(28);
    });
  });

  describe('Performance Management', () => {
    it('should determine quality levels correctly', () => {
      updateFPS(60);
      expect(getQualityLevel()).toBe('high');

      updateFPS(40);
      expect(getQualityLevel()).toBe('normal');

      updateFPS(20);
      expect(getQualityLevel()).toBe('reduced');
    });

    it('should determine component visibility', () => {
      expect(shouldHideComponent(0.005)).toBe(true);
      expect(shouldHideComponent(0.5)).toBe(false);
    });
  });
});