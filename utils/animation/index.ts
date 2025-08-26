/**
 * Consolidated animation utilities index
 * Provides a single entry point for all animation-related functionality
 */

// Modern animation helpers for 3D/WebXR
export {
  useFloatAnimation,
  useRotationAnimation,
  useScaleAnimation,
  usePulseAnimation,
  useOrbitAnimation,
  useCombinedAnimation,
  easingFunctions,
  ModernAnimationHelpers,
  type AnimationType,
  type AnimationConfig,
  type EasingFunction,
} from './modernAnimationHelpers';

// Spring animation utilities
export {
  SpringScalar,
  useSpringValue,
  useTripleSpring,
  usePositionSpring,
  SPRING_PRESETS,
  type SpringConfig,
} from './springUtils';

// 2D motion and Framer Motion utilities
export {
  createVariants,
  useAnimationGroup,
  calculateBlendPosition,
  calculateDistance,
  lerp,
  lerpPosition,
  type AnimationVariant,
  type AnimationVariants,
  type AnimationStateMap,
} from '../motion/animationHelpers';

// Legacy imports for backward compatibility
export {
  useSimpleLerp,
  useTripleLerp,
  springConfigToLerpSpeed,
} from '../../hooks/useSimpleLerp';

// Re-export WebXR animation constants
export {
  SPRING_CONFIGS,
  ANIMATION_DELAYS,
  NAVIGATION_POSITIONS,
  CAMERA_POSITIONS,
  FOOTER_POSITIONS,
  WORK_GRID_POSITIONS,
  WORK_CARD_POSITIONS,
  IMMERSIVE_BUTTON_POSITIONS,
  ENTRANCE_POSITIONS,
} from '../webxr/animationConstants';

// Re-export WebXR animation helpers
export {
  heroAnimationStates,
  workCardPositions,
  createAnimationPosition,
  createStaggeredDelay,
  type AnimationPosition,
  type AnimationState,
} from '../webxr/animationHelpers';