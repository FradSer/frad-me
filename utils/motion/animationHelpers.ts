import type { Transition, Variant, Variants } from 'motion/react';
import { useAnimationControls } from 'motion/react';
import { useCallback, useMemo } from 'react';

import type { Position } from '@/types/common';
import { primaryTransition } from './springTransitions';

export type AnimationVariant = Variant & {
  transition?: Transition;
};

export type AnimationVariants = Record<string, Variants>;
export type AnimationStateMap = Record<string, string>;

const DEFAULT_BLEND_FACTOR = 0.7;

const applyTransition = (variant: Variant | undefined): Variant | undefined => {
  if (!variant || typeof variant !== 'object') return variant;
  return {
    ...variant,
    transition: variant.transition || primaryTransition,
  };
};

export function createVariants(variants: AnimationVariants): AnimationVariants {
  return Object.entries(variants).reduce((acc, [key, groupVariants]) => {
    const processedVariants: Variants = {};
    Object.entries(groupVariants).forEach(([stateKey, variant]) => {
      (processedVariants as Record<string, Variant | undefined>)[stateKey] =
        applyTransition(variant);
    });
    acc[key] = processedVariants;
    return acc;
  }, {} as AnimationVariants);
}

export function useAnimationGroup(animationKeys: string[]) {
  // biome-ignore lint/correctness/useHookAtTopLevel: hooks are called at top level in map
  const controlsArray = animationKeys.map(() => useAnimationControls());

  const controls = useMemo(
    () =>
      animationKeys.reduce(
        (acc, key, index) => {
          acc[key] = controlsArray[index];
          return acc;
        },
        {} as Record<string, ReturnType<typeof useAnimationControls>>,
      ),
    [animationKeys, controlsArray],
  );

  const startGroup = useCallback(
    (stateMap: AnimationStateMap) => {
      Object.entries(stateMap).forEach(([key, state]) => {
        controls[key]?.start(state);
      });
    },
    [controls],
  );

  return { controls, startGroup };
}

const lerp = (start: number, end: number, factor: number): number => start + (end - start) * factor;

const lerpPosition = (start: Position, end: Position, factor: number): Position => ({
  x: lerp(start.x, end.x, factor),
  y: lerp(start.y, end.y, factor),
});

export function calculateBlendPosition(
  mousePos: Position,
  attractorPos: Position | null,
  blendFactor = DEFAULT_BLEND_FACTOR,
): Position {
  if (!attractorPos) return mousePos;
  return lerpPosition(mousePos, attractorPos, blendFactor);
}
