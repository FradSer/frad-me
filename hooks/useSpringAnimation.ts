/**
 * Modern spring animation utilities for improved performance
 * Migrated from deprecated SpringScalar implementation
 */

import {
  SpringScalar,
  useSpringValue,
  useTripleSpring,
  usePositionSpring,
  SPRING_PRESETS,
  type SpringConfig
} from '@/utils/animation/springUtils';

// Re-export for convenience
export {
  SpringScalar,
  useSpringValue,
  useTripleSpring,
  usePositionSpring,
  SPRING_PRESETS,
  type SpringConfig
};

// Legacy exports for backward compatibility - marked as deprecated
/**
 * @deprecated Use useSpringValue from '@/utils/animation/springUtils' instead
 */
export const useSpringScalar = useSpringValue;

/**
 * @deprecated Use useTripleSpring from '@/utils/animation/springUtils' instead
 */
export const useSpringAnimation = useTripleSpring;
