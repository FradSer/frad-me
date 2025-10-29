import type { Transition, Variant, Variants } from 'motion/react';
import { useAnimationControls } from 'motion/react';

import type { Position } from '@/types/common';
import { primaryTransition } from './springTransitions';

/**
 * Animation variant configuration for Framer Motion
 */
export type AnimationVariant = Variant & {
  transition?: Transition;
};

/**
 * Collection of animation variants mapped by animation group names
 * Each group contains multiple states (e.g., initial, hover, etc.)
 */
export type AnimationVariants = Record<string, Variants>;

/**
 * Animation state mapping for group control
 */
export type AnimationStateMap = Record<string, string>;

/**
 * Creates animation variants with consistent transitions applied
 *
 * @param variants - Object mapping animation group names to Variants objects
 * @returns Variants object with transitions applied to each state within each group
 */
export const createVariants = (variants: AnimationVariants): AnimationVariants => {
  const withTransition = (variant: Variant | undefined): Variant | undefined => {
    if (!variant || typeof variant !== 'object') return variant;
    return {
      ...variant,
      transition: variant.transition || primaryTransition,
    };
  };

  return Object.keys(variants).reduce((acc, key) => {
    const groupVariants = variants[key];
    const processedVariants: Variants = {};
    Object.entries(groupVariants).forEach(([stateKey, variant]) => {
      (processedVariants as Record<string, Variant | undefined>)[stateKey] =
        withTransition(variant);
    });
    acc[key] = processedVariants;
    return acc;
  }, {} as AnimationVariants);
};

/**
 * Hook for managing multiple animation controls as a coordinated group
 * Provides utilities for controlling multiple animations simultaneously
 *
 * @param animationKeys - Array of unique identifiers for each animation control
 * @returns Object containing individual controls and group manipulation functions
 */
export const useAnimationGroup = (animationKeys: string[]) => {
  // biome-ignore lint/correctness/useHookAtTopLevel: hooks are called at top level in map
  const controlsArray = animationKeys.map(() => useAnimationControls());
  const controls = animationKeys.reduce(
    (acc, key, index) => {
      acc[key] = controlsArray[index];
      return acc;
    },
    {} as Record<string, ReturnType<typeof useAnimationControls>>,
  );

  /**
   * Starts specific animations with individual states
   *
   * @param stateMap - Object mapping animation keys to their desired states
   */
  const startGroup = (stateMap: AnimationStateMap) => {
    Object.entries(stateMap).forEach(([key, state]) => {
      controls[key]?.start(state);
    });
  };

  return { controls, startGroup };
};

/**
 * Utility functions for position calculations and blending
 */

// Lerp function for smooth interpolation (internal use only)
const lerp = (start: number, end: number, factor: number): number =>
  start + (end - start) * factor;

// Position lerp for smooth 2D interpolation (internal use only)
const lerpPosition = (start: Position, end: Position, factor: number): Position => ({
  x: lerp(start.x, end.x, factor),
  y: lerp(start.y, end.y, factor),
});

/**
 * Calculates a blended position between mouse position and an attractor
 * Used for smooth mouse cursor attraction effects
 *
 * @param mousePos - Current mouse position
 * @param attractorPos - Target position to blend towards (null if no attraction)
 * @param blendFactor - Strength of attraction (0 = no attraction, 1 = full attraction)
 * @returns Blended position coordinates
 */
export const calculateBlendPosition = (
  mousePos: Position,
  attractorPos: Position | null,
  blendFactor = 0.7,
): Position => {
  if (!attractorPos) return mousePos;
  return lerpPosition(mousePos, attractorPos, blendFactor);
};
