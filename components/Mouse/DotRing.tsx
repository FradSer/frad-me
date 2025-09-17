import { useEffect } from 'react';

import { clsx } from 'clsx';
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useSpring,
} from 'motion/react';

import useMouseContext from '@/hooks/useMouseContext';
import useMousePosition from '@/hooks/useMousePosition';

import { calculateBlendPosition } from '@/utils/motion/animationHelpers';
import { primaryTransition } from '@/utils/motion/springTransitions';

export default function DotRing() {
  // * Hooks
  const mousePosition = useMousePosition();
  const mouseContext = useMouseContext();

  // * Physical attraction
  const attractedX = useMotionValue(mousePosition.x);
  const attractedY = useMotionValue(mousePosition.y);
  const springX = useSpring(attractedX, { stiffness: 300, damping: 30 });
  const springY = useSpring(attractedY, { stiffness: 300, damping: 30 });

  // * Styling
  const textClass = clsx(
    'fixed flex items-center justify-center duration-200 pointer-events-none text-black font-bold text-xl z-50',
  );

  const backgroundClass = clsx(
    'fixed rounded-full bg-white pointer-events-none z-40 duration-100',
    {
      'mix-blend-difference': mouseContext.cursorType === 'default',
    },
  );

  // * Animation
  const controls = useAnimationControls();

  const transitionOffset = { x: '-50%', y: '-50%' };

  const backgroundVariants = {
    initial: {
      ...transitionOffset,
      height: '1rem',
      width: '1rem',
      opacity: 1,
      transition: {
        ...primaryTransition,
      },
    },
    headerLinkHovered: {
      opacity: 0,
      transition: { ...primaryTransition },
    },
    workCardHover: {
      ...transitionOffset,
      height: '4rem',
      width: '4rem',
      transition: {
        ...primaryTransition,
      },
    },
    attracted: {
      ...transitionOffset,
      height: '1rem',
      width: '1rem',
      opacity: 0,
      transition: {
        ...primaryTransition,
      },
    },
  };

  const textVariants = {
    initial: {
      ...transitionOffset,
      height: '2rem',
      width: '2rem',
      opacity: 0,
      scale: 0.5,
      transition: {
        ...primaryTransition,
      },
    },

    workCardHover: {
      ...transitionOffset,
      height: '4rem',
      width: '4rem',
      opacity: 1,
      scale: 1,
      transition: {
        ...primaryTransition,
      },
    },
  };

  // * Cursor state mapping
  const cursorStateMap = {
    'header-link-hovered': { animation: 'headerLinkHovered', title: '' },
    'work-card-hovered': { animation: 'workCardHover', title: 'READ' },
    'work-card-hovered-wip': { animation: 'workCardHover', title: 'WIP' },
    attracted: { animation: 'attracted', title: '' },
    default: { animation: 'initial', title: '' },
  } as const;

  const currentState =
    cursorStateMap[mouseContext.cursorType] || cursorStateMap.default;
  const dotRingTitle = currentState.title;

  // * Effects
  useEffect(() => {
    const blendedPosition = calculateBlendPosition(
      mousePosition,
      mouseContext.attractorPosition,
      0.7,
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
