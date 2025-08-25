import type { Position, Size } from '@/types/common';

// Animation constants and utilities
export const ANIMATION_DURATIONS = {
  fast: 0.3,
  normal: 0.6,
  slow: 1.2,
} as const;

// Common animation variants
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
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: duration * 0.5,
      ease: 'easeIn',
    },
  },
});

export const createHeaderVariants = (
  duration = ANIMATION_DURATIONS.normal,
  delay = 0.2,
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
      ease: 'easeOut',
    },
  },
});

export const createStaggerChildren = (delay = 0.1) => ({
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
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
});

// Utility functions
export const calculateSkew = (
  mousePos: Position,
  windowSize: Size,
  angle: number = 2,
) => {
  const xValue = mousePos.x / windowSize.width;
  const yValue = mousePos.y / windowSize.height;

  return {
    skewX: xValue * angle * 2 - angle,
    skewY: yValue * -angle * 2 + angle,
    xValue,
    yValue,
  };
};
