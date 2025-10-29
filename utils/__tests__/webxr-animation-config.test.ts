/**
 * @jest-environment jsdom
 */

import {
  type AnimationPreset,
  getAdaptiveSpring,
  getCompatibleSpringConfig,
  getLerpSpeed,
  getQualityLevel,
  getStaggerDelay,
  isValidSpring,
  shouldHideComponent,
  updateFPS,
  validateAnimationPreset,
  WEBXR_ANIMATION_CONFIG,
} from '@/utils/webxr/animationConfig';

describe('WebXR Animation Configuration', () => {
  beforeEach(() => {
    // Reset FPS to default
    updateFPS(60);
  });

  describe('Configuration Structure', () => {
    it('should have valid spring configurations', () => {
      expect(WEBXR_ANIMATION_CONFIG.springs).toBeDefined();
      expect(WEBXR_ANIMATION_CONFIG.springs.normal).toEqual({ tension: 280, friction: 28 });
      expect(WEBXR_ANIMATION_CONFIG.springs.elastic).toEqual({ tension: 400, friction: 25 });
    });

    it('should have timing configurations', () => {
      expect(WEBXR_ANIMATION_CONFIG.timing.delays.cardStagger).toBe(150);
      expect(WEBXR_ANIMATION_CONFIG.timing.delays.breathingInterval).toBe(2500);
    });

    it('should have position configurations', () => {
      expect(WEBXR_ANIMATION_CONFIG.positions.camera.home.position).toEqual([0, 0, 5]);
      expect(WEBXR_ANIMATION_CONFIG.positions.workCards.entrance).toEqual([2.5, 2.5, -8]);
    });

    it('should have scale configurations', () => {
      expect(WEBXR_ANIMATION_CONFIG.scales.default).toBe(1.0);
      expect(WEBXR_ANIMATION_CONFIG.scales.hover).toBe(1.1);
    });

    it('should have performance configurations', () => {
      expect(WEBXR_ANIMATION_CONFIG.performance.hideThreshold).toBe(0.01);
      expect(WEBXR_ANIMATION_CONFIG.performance.fpsThreshold).toBe(30);
    });
  });

  describe('Validation Functions', () => {
    it('should validate spring configurations', () => {
      expect(isValidSpring({ tension: 100, friction: 10 })).toBe(true);
      expect(isValidSpring({ tension: -1, friction: 10 })).toBe(false);
      expect(isValidSpring({ tension: 100 })).toBe(false);
      expect(isValidSpring(null)).toBe(false);
    });

    it('should validate animation presets', () => {
      expect(validateAnimationPreset('normal')).toBe(true);
      expect(validateAnimationPreset('elastic')).toBe(true);
      expect(validateAnimationPreset('invalid')).toBe(false);
    });
  });

  describe('Animation Functions', () => {
    it('should calculate lerp speed', () => {
      const speed = getLerpSpeed('normal');
      expect(typeof speed).toBe('number');
      expect(speed).toBeGreaterThan(0);
      expect(speed).toBeLessThanOrEqual(1);
    });

    it('should calculate stagger delay', () => {
      expect(getStaggerDelay(0)).toBe(0);
      expect(getStaggerDelay(1)).toBe(150);
      expect(getStaggerDelay(2)).toBe(300);
    });

    it('should provide compatible spring config', () => {
      const config = getCompatibleSpringConfig('elastic');
      expect(config).toEqual({ tension: 400, friction: 25 });
    });
  });

  describe('Performance Management', () => {
    it('should update and track FPS', () => {
      updateFPS(45);
      expect(getQualityLevel()).toBe('normal');

      updateFPS(60);
      expect(getQualityLevel()).toBe('high');

      updateFPS(20);
      expect(getQualityLevel()).toBe('reduced');
    });

    it('should provide adaptive spring configuration', () => {
      // High FPS - no adaptation
      updateFPS(60);
      const highFpsSpring = getAdaptiveSpring('normal');
      expect(highFpsSpring.tension).toBe(280);
      expect(highFpsSpring.friction).toBe(28);

      // Low FPS - adapted
      updateFPS(20);
      const lowFpsSpring = getAdaptiveSpring('normal');
      expect(lowFpsSpring.tension).toBe(280 * 1.5);
      expect(lowFpsSpring.friction).toBe(28 * 1.2);
    });

    it('should determine component visibility', () => {
      expect(shouldHideComponent(0.005)).toBe(true);
      expect(shouldHideComponent(0.02)).toBe(false);
    });
  });

  describe('Type Safety', () => {
    it('should provide type-safe animation presets', () => {
      const presets: AnimationPreset[] = ['slow', 'normal', 'fast', 'bouncy', 'elastic'];

      presets.forEach((preset) => {
        expect(validateAnimationPreset(preset)).toBe(true);
        expect(getLerpSpeed(preset)).toBeGreaterThan(0);
      });
    });
  });
});
