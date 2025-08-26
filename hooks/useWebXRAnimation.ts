import { useMemo, useState, useCallback } from 'react';
import { useSimpleLerp, springConfigToLerpSpeed } from '@/hooks/useSimpleLerp';
import { 
  WEBXR_ANIMATION_CONFIG, 
  AnimationConfigManager,
  type AnimationPreset 
} from '@/utils/webxr/animationConfig';

/**
 * Hook that provides animation with centralized configuration
 * @param preset Animation preset from centralized config
 * @param initialValue Starting value for the animation
 * @returns Animation control object with value and set function
 */
export function useWebXRAnimation(preset: AnimationPreset, initialValue: number = 0) {
  const springConfig = useMemo(() => {
    // Check if preset exists in the config
    if (preset in WEBXR_ANIMATION_CONFIG.springs) {
      return WEBXR_ANIMATION_CONFIG.springs[preset];
    } else {
      console.warn(`Invalid animation preset "${preset}", falling back to "normal"`);
      return WEBXR_ANIMATION_CONFIG.springs.normal;
    }
  }, [preset]);

  const lerpConfig = useMemo(() => ({
    speed: springConfigToLerpSpeed(springConfig)
  }), [springConfig]);

  return useSimpleLerp(initialValue, lerpConfig);
}

/**
 * Hook that provides adaptive animation based on performance metrics
 * @param preset Base animation preset
 * @param initialValue Starting value for the animation
 * @returns Animation control with performance monitoring
 */
export function useAdaptiveAnimation(preset: AnimationPreset, initialValue: number = 0) {
  const manager = AnimationConfigManager.getInstance();
  const [, forceUpdate] = useState({});
  
  const adaptiveConfig = useMemo(() => {
    return manager.getAdaptiveConfig(preset);
  }, [preset, manager]);

  const lerpConfig = useMemo(() => ({
    speed: springConfigToLerpSpeed(adaptiveConfig)
  }), [adaptiveConfig]);

  const animation = useSimpleLerp(initialValue, lerpConfig);

  const updateFPS = useCallback((fps: number) => {
    manager.updateFrameMetrics(fps);
    // Force re-render to get updated quality level
    forceUpdate({});
  }, [manager]);

  return {
    ...animation,
    config: adaptiveConfig,
    performance: {
      quality: manager.getQualityLevel(),
    },
    updateFPS,
  };
}