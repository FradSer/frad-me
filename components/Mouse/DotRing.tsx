'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';

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

// Base CSS size is 4rem (w-16 h-16). Scale between 0.25 (=1rem) and 1 (=4rem)
// so that translate(-50%, -50%) always centers correctly regardless of visual size.
const DOT_SCALE = {
  small: 0.25,
  large: 1,
} as const;

// Solid circle (no blend mode): visible only during work-card hover
const solidCircleVariants = {
  initial: { scale: DOT_SCALE.small, opacity: 0, transition: primaryTransition },
  headerLinkHovered: { scale: DOT_SCALE.small, opacity: 0, transition: primaryTransition },
  workCardHover: { scale: DOT_SCALE.large, opacity: 1, transition: primaryTransition },
  attracted: { scale: DOT_SCALE.small, opacity: 0, transition: primaryTransition },
};

// Blend circle (mix-blend-difference always on): visible in default state, hides on hover
const blendCircleVariants = {
  initial: { scale: DOT_SCALE.small, opacity: 1, transition: primaryTransition },
  headerLinkHovered: { scale: DOT_SCALE.small, opacity: 0, transition: primaryTransition },
  workCardHover: { scale: DOT_SCALE.large, opacity: 0, transition: primaryTransition },
  attracted: { scale: DOT_SCALE.small, opacity: 0, transition: primaryTransition },
};

// Text label (READ / WIP): pixel y slide-up + opacity fade only.
const textVariants = {
  initial: { opacity: 0, y: 8, transition: primaryTransition },
  workCardHover: { opacity: 1, y: 0, transition: primaryTransition },
};

// Separate background and text animation targets per cursor state
const cursorStateMap = {
  'header-link-hovered': { background: 'headerLinkHovered', text: 'initial', title: '' },
  'work-card-hovered': { background: 'workCardHover', text: 'workCardHover', title: 'READ' },
  'work-card-hovered-wip': { background: 'workCardHover', text: 'workCardHover', title: 'WIP' },
  attracted: { background: 'attracted', text: 'initial', title: '' },
  default: { background: 'initial', text: 'initial', title: '' },
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

  // * Retain last non-empty title so fade-out animates visible text
  const [displayTitle, setDisplayTitle] = useState('');

  const currentState = cursorStateMap[mouseContext.cursorType] ?? cursorStateMap.default;

  // * Effects
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
    if (currentState.title) setDisplayTitle(currentState.title);
  }, [currentState.title]);

  // * Render
  const positionStyle = { left: springX, top: springY, x: '-50%', y: '-50%' } as const;

  return (
    <>
      {/* Text label: fixed 4rem wrapper handles centering; inner span animates */}
      <motion.div
        className="fixed hidden md:flex w-16 h-16 items-center justify-center pointer-events-none z-70"
        style={positionStyle}
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

      {/* Solid circle - no blend mode, fades in during work-card hover */}
      <motion.div
        animate={currentState.background}
        variants={solidCircleVariants}
        initial="initial"
        className="fixed hidden md:block w-16 h-16 rounded-full bg-white pointer-events-none z-60"
        style={positionStyle}
      />

      {/* Blend circle - mix-blend-difference always on, visible in default state */}
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
