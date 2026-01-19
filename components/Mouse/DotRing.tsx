import { clsx } from 'clsx';
import { motion, useAnimationControls, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useMemo } from 'react';

import useMouseContext from '@/hooks/useMouseContext';
import useMousePosition from '@/hooks/useMousePosition';

import { calculateBlendPosition } from '@/utils/motion/animationHelpers';
import { primaryTransition } from '@/utils/motion/springTransitions';

// * Configuration constants
const SPRING_CONFIG = {
  stiffness: 300,
  damping: 30,
} as const;

const BLEND_FACTOR = 0.7;

const CURSOR_SIZES = {
  small: '1rem',
  medium: '2rem',
  large: '4rem',
} as const;

const CURSOR_SCALE = {
  small: 0.5,
  normal: 1,
} as const;

// * Move static objects outside component to prevent recreation
const transitionOffset = { x: '-50%', y: '-50%' };

const backgroundVariants = {
  initial: {
    ...transitionOffset,
    height: CURSOR_SIZES.small,
    width: CURSOR_SIZES.small,
    opacity: 1,
    transition: primaryTransition,
  },
  headerLinkHovered: {
    opacity: 0,
    transition: primaryTransition,
  },
  workCardHover: {
    ...transitionOffset,
    height: CURSOR_SIZES.large,
    width: CURSOR_SIZES.large,
    transition: primaryTransition,
  },
  attracted: {
    ...transitionOffset,
    height: CURSOR_SIZES.small,
    width: CURSOR_SIZES.small,
    opacity: 0,
    transition: primaryTransition,
  },
};

const textVariants = {
  initial: {
    ...transitionOffset,
    height: CURSOR_SIZES.medium,
    width: CURSOR_SIZES.medium,
    opacity: 0,
    scale: CURSOR_SCALE.small,
    transition: primaryTransition,
  },
  workCardHover: {
    ...transitionOffset,
    height: CURSOR_SIZES.large,
    width: CURSOR_SIZES.large,
    opacity: 1,
    scale: CURSOR_SCALE.normal,
    transition: primaryTransition,
  },
};

const cursorStateMap = {
  'header-link-hovered': { animation: 'headerLinkHovered', title: '' },
  'work-card-hovered': { animation: 'workCardHover', title: 'READ' },
  'work-card-hovered-wip': { animation: 'workCardHover', title: 'WIP' },
  attracted: { animation: 'attracted', title: '' },
  default: { animation: 'initial', title: '' },
} as const;

export default function DotRing() {
  // * Hooks
  const mousePosition = useMousePosition();
  const mouseContext = useMouseContext();

  // * Physical attraction - initialize motion values once
  const attractedX = useMotionValue(0);
  const attractedY = useMotionValue(0);
  const springX = useSpring(attractedX, SPRING_CONFIG);
  const springY = useSpring(attractedY, SPRING_CONFIG);

  // * Memoized styling classes
  const textClass = useMemo(
    () =>
      'fixed flex items-center justify-center duration-200 pointer-events-none text-black font-bold text-xl z-70',
    [],
  );

  const backgroundClass = useMemo(
    () =>
      clsx('fixed rounded-full bg-white pointer-events-none z-60 duration-100', {
        'mix-blend-difference': mouseContext.cursorType === 'default',
      }),
    [mouseContext.cursorType],
  );

  // * Animation
  const controls = useAnimationControls();

  // * Memoized current state calculation
  const currentState = useMemo(
    () => cursorStateMap[mouseContext.cursorType] || cursorStateMap.default,
    [mouseContext.cursorType],
  );

  const dotRingTitle = currentState.title;

  // * Effects - optimize position updates
  useEffect(() => {
    const blendedPosition = calculateBlendPosition(
      mousePosition,
      mouseContext.attractorPosition,
      BLEND_FACTOR,
    );

    attractedX.set(blendedPosition.x);
    attractedY.set(blendedPosition.y);
  }, [mousePosition, mouseContext.attractorPosition, attractedX, attractedY]);

  useEffect(() => {
    controls.start(currentState.animation);
  }, [currentState.animation, controls]);

  // * Render
  return (
    <>
      <motion.div
        animate={controls}
        variants={textVariants}
        initial="initial"
        className={textClass}
        style={{ left: springX, top: springY }}
      >
        <h1>{dotRingTitle}</h1>
      </motion.div>
      <motion.div
        animate={controls}
        variants={backgroundVariants}
        initial="initial"
        className={backgroundClass}
        style={{ left: springX, top: springY }}
      />
    </>
  );
}
