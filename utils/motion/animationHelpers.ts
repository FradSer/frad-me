import { useAnimationControls } from 'framer-motion';
import type { Variant } from 'framer-motion';

import type { Position } from '@/types/common';
import { primaryTransition } from './springTransitions';

/**
 * Animation variant configuration for Framer Motion
 */
export type AnimationVariant = Variant & {
  transition?: any;
  [key: string]: any;
};

/**
 * Collection of animation variants mapped by state names
 */
export type AnimationVariants = Record<string, AnimationVariant>;

/**
 * Animation state mapping for group control
 */
export type AnimationStateMap = Record<string, string>;

/**
 * Creates animation variants with consistent transitions applied
 *
 * @param variants - Object mapping state names to animation configurations
 * @returns Variants object with transitions applied to each state
 */
export const createVariants = (
  variants: AnimationVariants,
): AnimationVariants => {
  const withTransition = (variant: AnimationVariant): AnimationVariant => ({
    ...variant,
    transition: variant.transition || primaryTransition,
  });

  return Object.keys(variants).reduce((acc, key) => {
    acc[key] = withTransition(variants[key]);
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
  const controls = animationKeys.reduce(
    (acc, key) => {
      acc[key] = useAnimationControls();
      return acc;
    },
    {} as Record<string, ReturnType<typeof useAnimationControls>>,
  );

  /**
   * Starts all animations with the same state
   *
   * @param state - The animation state to apply to all controls
   */
  const startAll = (state: string) => {
    Object.values(controls).forEach((control) => control.start(state));
  };

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

  return { controls, startAll, startGroup };
};

/**
 * Utility functions for position calculations and blending
 */

// Lerp function for smooth interpolation
export const lerp = (start: number, end: number, factor: number): number => 
  start + (end - start) * factor;

// Position lerp for smooth 2D interpolation
export const lerpPosition = (
  start: Position,
  end: Position,
  factor: number
): Position => ({
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

/**
 * Calculates the Euclidean distance between two points
 *
 * @param point1 - First point coordinates
 * @param point2 - Second point coordinates
 * @returns Distance between the two points
 */
export const calculateDistance = (point1: Position, point2: Position): number =>
  Math.hypot(point2.x - point1.x, point2.y - point1.y);
