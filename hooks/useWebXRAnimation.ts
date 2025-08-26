import { useMemo } from 'react';
import { useSimpleLerp, springConfigToLerpSpeed } from '@/hooks/useSimpleLerp';
import { 
  WEBXR_ANIMATION_CONFIG, 
  getAdaptiveSpring,
  validateAnimationPreset,
  type AnimationPreset 
} from '@/utils/webxr/animationConfig';

/**
 * Hook that provides animation with centralized configuration
 */
export function useWebXRAnimation(preset: AnimationPreset, initialValue: number = 0) {
  const springConfig = useMemo(() => {
    if (validateAnimationPreset(preset)) {
      return WEBXR_ANIMATION_CONFIG.springs[preset];
    }
    console.warn(`Invalid animation preset "${preset}", falling back to "normal"`);
    return WEBXR_ANIMATION_CONFIG.springs.normal;
  }, [preset]);

  const lerpConfig = useMemo(() => ({
    speed: springConfigToLerpSpeed(springConfig)
  }), [springConfig]);

  return useSimpleLerp(initialValue, lerpConfig);
}

/**
 * Hook that provides adaptive animation based on performance
 */
export function useAdaptiveAnimation(preset: AnimationPreset, initialValue: number = 0) {
  const springConfig = useMemo(() => {
    return getAdaptiveSpring(preset);
  }, [preset]);

  const lerpConfig = useMemo(() => ({
    speed: springConfigToLerpSpeed(springConfig)
  }), [springConfig]);

  return useSimpleLerp(initialValue, lerpConfig);
}