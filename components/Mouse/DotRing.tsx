'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';

import useMouseContext from '@/hooks/useMouseContext';
import useMousePosition from '@/hooks/useMousePosition';

import { calculateBlendPosition } from '@/utils/motion/animationHelpers';
import { primaryTransition } from '@/utils/motion/springTransitions';

// CSS size is 4rem (w-16 h-16). Scale between 0.25 (=1rem) and 1 (=4rem)
// Center regardless of visual size.
const DOT_SCALE = {
  small: 0.25,
  large: 1,
} as const;

// Solid circle: visible only during work-card hover
const solidCircleVariants = {
  initial: { scale: DOT_SCALE.small, opacity: 0, transition: primaryTransition },
  headerLinkHovered: { scale: DOT_SCALE.small, opacity: 0, transition: primaryTransition },
  buttonHovered: { scale: DOT_SCALE.small, opacity: 0, transition: primaryTransition },
  workCardHover: { scale: DOT_SCALE.large, opacity: 1, transition: primaryTransition },
  attracted: { scale: DOT_SCALE.small, opacity: 0, transition: primaryTransition },
};

// Blend circle: visible in default state, hides on hover
const blendCircleVariants = {
  initial: { scale: DOT_SCALE.small, opacity: 1, transition: primaryTransition },
  headerLinkHovered: { scale: DOT_SCALE.small, opacity: 0, transition: primaryTransition },
  buttonHovered: { scale: DOT_SCALE.small, opacity: 0, transition: primaryTransition },
  workCardHover: { scale: DOT_SCALE.large, opacity: 0, transition: primaryTransition },
  attracted: { scale: DOT_SCALE.small, opacity: 0, transition: primaryTransition },
};

// Text label (READ / WIP)
const textVariants = {
  initial: { opacity: 0, y: 8, transition: primaryTransition },
  workCardHover: { opacity: 1, y: 0, transition: primaryTransition },
};

const cursorStateMap = {
  'header-link-hovered': { background: 'headerLinkHovered', text: 'initial', title: '' },
  'button-hovered': { background: 'buttonHovered', text: 'initial', title: '' },
  'work-card-hovered': { background: 'workCardHover', text: 'workCardHover', title: 'READ' },
  'work-card-hovered-wip': { background: 'workCardHover', text: 'workCardHover', title: 'WIP' },
  attracted: { background: 'attracted', text: 'initial', title: '' },
  default: { background: 'initial', text: 'initial', title: '' },
} as const;

export default function DotRing() {
  const mousePosition = useMousePosition();
  const mouseContext = useMouseContext();

  const attractedX = useMotionValue(0);
  const attractedY = useMotionValue(0);
  const springX = useSpring(attractedX, SPRING_CONFIG);
  const springY = useSpring(attractedY, SPRING_CONFIG);

  const textAttractedX = useMotionValue(0);
  const textAttractedY = useMotionValue(0);
  const textSpringX = useSpring(textAttractedX, TEXT_SPRING_CONFIG);
  const textSpringY = useSpring(textAttractedY, TEXT_SPRING_CONFIG);

  const [displayTitle, setDisplayTitle] = useState('');

  const currentState = cursorStateMap[mouseContext.cursorType] ?? cursorStateMap.default;

  useEffect(() => {
    const blendedPosition = calculateBlendPosition(
      mousePosition,
      mouseContext.attractorPosition,
      BLEND_FACTOR,
    );
    attractedX.set(blendedPosition.x);
    attractedY.set(blendedPosition.y);
    textAttractedX.set(blendedPosition.x);
    textAttractedY.set(blendedPosition.y);
  }, [
    mousePosition,
    mouseContext.attractorPosition,
    attractedX,
    attractedY,
    textAttractedX,
    textAttractedY,
  ]);

  useEffect(() => {
    if (currentState.title) setDisplayTitle(currentState.title);
  }, [currentState.title]);

  const positionStyle = { left: springX, top: springY, x: '-50%', y: '-50%' } as const;
  const textPositionStyle = { left: textSpringX, top: textSpringY, x: '-50%', y: '-50%' } as const;

  return (
    <>
      <motion.div
        className="fixed hidden md:flex w-16 h-16 items-center justify-center pointer-events-none z-70"
        style={textPositionStyle}
      >
        <motion.span
          animate={currentState.text}
          variants={textVariants}
          initial="initial"
          className="text-black font-bold text-xl"
        >
          {displayTitle}
        </motion.span>
      </motion.div>

      <motion.div
        animate={currentState.background}
        variants={solidCircleVariants}
        initial="initial"
        className="fixed hidden md:block w-16 h-16 rounded-full bg-white pointer-events-none z-60"
        style={positionStyle}
      />

      <motion.div
        animate={currentState.background}
        variants={blendCircleVariants}
        initial="initial"
        className="fixed hidden md:block w-16 h-16 rounded-full bg-white pointer-events-none z-60 mix-blend-difference"
        style={positionStyle}
      />
    </>
  );
}
