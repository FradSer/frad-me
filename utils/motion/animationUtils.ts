import type { Position, Size } from '@/types/common';

export const ANIMATION_DURATIONS = {
  fast: 0.3,
  normal: 0.6,
} as const;

const EASE_TYPES = {
  easeOut: 'easeOut' as const,
  easeIn: 'easeIn' as const,
  easeInOut: 'easeInOut' as const,
} as const;

const DEFAULT_STAGGER_DELAY = 0.1;
const DEFAULT_HEADER_DELAY = 0.2;

export const createPageVariants = (duration = ANIMATION_DURATIONS.normal) => ({
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      ease: EASE_TYPES.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: duration * 0.5,
      ease: EASE_TYPES.easeIn,
    },
  },
});

export const createHeaderVariants = (
  duration = ANIMATION_DURATIONS.normal,
  delay = DEFAULT_HEADER_DELAY,
) => ({
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      delay,
      ease: EASE_TYPES.easeOut,
    },
  },
});

export const createStaggerChildren = (delay = DEFAULT_STAGGER_DELAY) => ({
  animate: {
    transition: {
      staggerChildren: delay,
    },
  },
});

export const createLoadingDots = () => ({
  animate: {
    opacity: [0, 1, 0],
    transition: {
      duration: 0.8,
      repeat: Number.POSITIVE_INFINITY,
      ease: EASE_TYPES.easeInOut,
    },
  },
});

const DEFAULT_SKEW_ANGLE = 2;

export function calculateSkew(
  mousePos: Position,
  windowSize: Size,
  angle: number = DEFAULT_SKEW_ANGLE,
) {
  const xValue = mousePos.x / windowSize.width;
  const yValue = mousePos.y / windowSize.height;

  return {
    skewX: xValue * angle * 2 - angle,
    skewY: yValue * -angle * 2 + angle,
    xValue,
    yValue,
  };
}
