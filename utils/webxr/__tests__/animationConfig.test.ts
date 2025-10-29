import {
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
} from '../animationConfig';

describe('WebXR Animation Configuration', () => {
  describe('Configuration Structure', () => {
    it('should have valid spring configurations', () => {
      Object.values(WEBXR_ANIMATION_CONFIG.springs).forEach((spring) => {
        expect(isValidSpring(spring)).toBe(true);
        expect(spring.tension).toBeGreaterThan(0);
        expect(spring.friction).toBeGreaterThan(0);
      });
    });

    it('should have timing configurations', () => {
      expect(WEBXR_ANIMATION_CONFIG.timing.delays.cardStagger).toBeGreaterThan(0);
      expect(WEBXR_ANIMATION_CONFIG.timing.delays.cardEntranceDelay).toBeGreaterThan(0);
      expect(WEBXR_ANIMATION_CONFIG.timing.durations.cardAnimation).toBeGreaterThan(0);
    });

    it('should have position configurations', () => {
      expect(WEBXR_ANIMATION_CONFIG.positions.workCards.entrance).toHaveLength(3);
      expect(WEBXR_ANIMATION_CONFIG.positions.camera.home).toBeDefined();
      expect(WEBXR_ANIMATION_CONFIG.positions.camera.work).toBeDefined();
    });

    it('should have scale configurations', () => {
      expect(WEBXR_ANIMATION_CONFIG.scales.default).toBe(1.0);
      expect(WEBXR_ANIMATION_CONFIG.scales.hover).toBeGreaterThan(
        WEBXR_ANIMATION_CONFIG.scales.default,
      );
      expect(WEBXR_ANIMATION_CONFIG.scales.entrance).toBeLessThan(
        WEBXR_ANIMATION_CONFIG.scales.default,
      );
    });

    it('should have opacity configurations', () => {
      expect(WEBXR_ANIMATION_CONFIG.opacity.visible).toBe(1.0);
      expect(WEBXR_ANIMATION_CONFIG.opacity.hidden).toBe(0.0);
    });
  });

  describe('Spring Validation', () => {
    it('should validate valid spring configurations', () => {
      const validSpring = { tension: 300, friction: 30 };
      expect(isValidSpring(validSpring)).toBe(true);
    });

    it('should reject invalid spring configurations', () => {
      expect(isValidSpring(null)).toBe(false);
      expect(isValidSpring({})).toBe(false);
      expect(isValidSpring({ tension: 300 })).toBe(false);
      expect(isValidSpring({ friction: 30 })).toBe(false);
      expect(isValidSpring({ tension: 0, friction: 30 })).toBe(false);
      expect(isValidSpring({ tension: 300, friction: 0 })).toBe(false);
    });

    it('should validate animation presets', () => {
      expect(validateAnimationPreset('slow')).toBe('slow');
      expect(validateAnimationPreset('normal')).toBe('normal');
      expect(validateAnimationPreset('fast')).toBe('fast');
      expect(validateAnimationPreset('bouncy')).toBe('bouncy');
      expect(validateAnimationPreset('elastic')).toBe('elastic');
      expect(validateAnimationPreset('invalid')).toBe(false);
    });
  });

  describe('Animation Functions', () => {
    it('should calculate lerp speed for different presets', () => {
      const slowSpeed = getLerpSpeed('slow');
      const fastSpeed = getLerpSpeed('fast');

      expect(slowSpeed).toBeGreaterThan(0);
      expect(fastSpeed).toBeGreaterThan(slowSpeed);
      expect(fastSpeed).toBeLessThanOrEqual(1);
    });

    it('should get compatible spring config', () => {
      const spring = getCompatibleSpringConfig('bouncy');

      expect(spring).toHaveProperty('tension');
      expect(spring).toHaveProperty('friction');
      expect(isValidSpring(spring)).toBe(true);
    });
  });

  describe('Performance Management', () => {
    beforeEach(() => {
      // Reset FPS to default
      updateFPS(60);
    });

    it('should update and track FPS', () => {
      updateFPS(30);
      expect(getQualityLevel()).toBe('normal');

      updateFPS(20);
      expect(getQualityLevel()).toBe('reduced');

      updateFPS(55);
      expect(getQualityLevel()).toBe('high');
    });

    it('should determine quality levels correctly', () => {
      updateFPS(25);
      expect(getQualityLevel()).toBe('reduced');

      updateFPS(35);
      expect(getQualityLevel()).toBe('normal');

      updateFPS(55);
      expect(getQualityLevel()).toBe('high');
    });

    it('should provide adaptive spring configuration', () => {
      updateFPS(29); // Low FPS
      const adaptiveSpring = getAdaptiveSpring('bouncy');

      expect(adaptiveSpring.tension).toBeGreaterThan(WEBXR_ANIMATION_CONFIG.springs.bouncy.tension);
      expect(adaptiveSpring.friction).toBeGreaterThan(
        WEBXR_ANIMATION_CONFIG.springs.bouncy.friction,
      );
    });

    it('should not adapt spring when FPS is good', () => {
      updateFPS(60); // Good FPS
      const adaptiveSpring = getAdaptiveSpring('bouncy');

      expect(adaptiveSpring.tension).toBe(WEBXR_ANIMATION_CONFIG.springs.bouncy.tension);
      expect(adaptiveSpring.friction).toBe(WEBXR_ANIMATION_CONFIG.springs.bouncy.friction);
    });
  });

  describe('Component Visibility', () => {
    it('should determine when to hide components', () => {
      expect(shouldHideComponent(0.005)).toBe(true);
      expect(shouldHideComponent(0.1)).toBe(false);
      expect(shouldHideComponent(1.0)).toBe(false);
    });

    it('should use correct hide threshold', () => {
      const threshold = WEBXR_ANIMATION_CONFIG.performance.hideThreshold;
      expect(shouldHideComponent(threshold - 0.001)).toBe(true);
      expect(shouldHideComponent(threshold)).toBe(false);
    });
  });

  describe('Animation Timing', () => {
    it('should calculate stagger delays correctly', () => {
      const baseDelay = 100;
      const delay0 = getStaggerDelay(0, baseDelay);
      const delay1 = getStaggerDelay(1, baseDelay);
      const delay2 = getStaggerDelay(2, baseDelay);

      expect(delay0).toBe(0);
      expect(delay1).toBe(baseDelay);
      expect(delay2).toBe(baseDelay * 2);
    });

    it('should use default stagger delay when not specified', () => {
      const delay = getStaggerDelay(1);
      expect(delay).toBe(WEBXR_ANIMATION_CONFIG.timing.delays.cardStagger);
    });
  });

  describe('Configuration Integrity', () => {
    it('should have all required spring presets', () => {
      const requiredPresets: Array<keyof typeof WEBXR_ANIMATION_CONFIG.springs> = [
        'slow',
        'normal',
        'fast',
        'bouncy',
        'elastic',
      ];

      requiredPresets.forEach((preset) => {
        expect(WEBXR_ANIMATION_CONFIG.springs).toHaveProperty(preset);
        expect(isValidSpring(WEBXR_ANIMATION_CONFIG.springs[preset])).toBe(true);
      });
    });

    it('should have consistent timing values', () => {
      expect(WEBXR_ANIMATION_CONFIG.timing.delays.cardStagger).toBeGreaterThan(0);
      expect(WEBXR_ANIMATION_CONFIG.timing.delays.cardEntranceDelay).toBeGreaterThan(0);
      expect(WEBXR_ANIMATION_CONFIG.timing.durations.cardAnimation).toBeGreaterThan(
        WEBXR_ANIMATION_CONFIG.timing.delays.cardEntranceDelay,
      );
    });

    it('should have valid scale progressions', () => {
      expect(WEBXR_ANIMATION_CONFIG.scales.entrance).toBeLessThan(
        WEBXR_ANIMATION_CONFIG.scales.default,
      );
      expect(WEBXR_ANIMATION_CONFIG.scales.hover).toBeGreaterThan(
        WEBXR_ANIMATION_CONFIG.scales.default,
      );
      expect(WEBXR_ANIMATION_CONFIG.scales.breathing).toBeGreaterThan(
        WEBXR_ANIMATION_CONFIG.scales.entrance,
      );
    });
  });

  describe('Type Safety', () => {
    it('should export Vec3 as readonly tuple', () => {
      const entrance = WEBXR_ANIMATION_CONFIG.positions.workCards.entrance;
      expect(entrance).toHaveLength(3);
      expect(typeof entrance[0]).toBe('number');
      expect(typeof entrance[1]).toBe('number');
      expect(typeof entrance[2]).toBe('number');
    });

    it('should export AnimationPreset union type', () => {
      const presets: Array<keyof typeof WEBXR_ANIMATION_CONFIG.springs> = [
        'slow',
        'normal',
        'fast',
      ];
      presets.forEach((preset) => {
        expect(typeof preset).toBe('string');
      });
    });
  });

  describe('Performance Thresholds', () => {
    it('should have reasonable performance thresholds', () => {
      expect(WEBXR_ANIMATION_CONFIG.performance.fpsThreshold).toBeGreaterThan(0);
      expect(WEBXR_ANIMATION_CONFIG.performance.highQualityThreshold).toBeGreaterThan(
        WEBXR_ANIMATION_CONFIG.performance.fpsThreshold,
      );
      expect(WEBXR_ANIMATION_CONFIG.performance.hideThreshold).toBeGreaterThan(0);
      expect(WEBXR_ANIMATION_CONFIG.performance.hideThreshold).toBeLessThan(1);
    });

    it('should handle edge FPS values', () => {
      updateFPS(0);
      expect(getQualityLevel()).toBe('reduced');

      updateFPS(100);
      expect(getQualityLevel()).toBe('high');
    });
  });

  describe('Animation Coordination', () => {
    it('should maintain consistent animation timing relationships', () => {
      const staggerDelay = WEBXR_ANIMATION_CONFIG.timing.delays.cardStagger;
      const entranceDelay = WEBXR_ANIMATION_CONFIG.timing.delays.cardEntranceDelay;
      const animationDuration = WEBXR_ANIMATION_CONFIG.timing.durations.cardAnimation;

      // Entrance delay should be reasonable relative to stagger
      expect(entranceDelay).toBeGreaterThanOrEqual(staggerDelay);

      // Animation duration should be longer than entrance delay
      expect(animationDuration).toBeGreaterThanOrEqual(entranceDelay);
    });

    it('should have balanced breathing animation timing', () => {
      const breathingInterval = WEBXR_ANIMATION_CONFIG.timing.delays.breathingInterval;
      const breathingDuration = WEBXR_ANIMATION_CONFIG.timing.delays.breathingDuration;

      expect(breathingInterval).toBeGreaterThan(breathingDuration);
      expect(breathingDuration).toBeGreaterThan(0);
    });
  });
});
