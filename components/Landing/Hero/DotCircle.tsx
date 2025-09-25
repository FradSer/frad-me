import { useState } from 'react';

import { motion } from 'motion/react';

import { CursorProvider, CursorType } from '@/components/common/CursorProvider';
import { DownArrowIcon } from '@/components/common/Icons';

import { primaryTransition } from '@/utils/motion/springTransitions';

// * Animation configuration constants
const ANIMATION_CONFIG = {
  circleDelay: 2.5,
  arrowDelay: 0.6,
  hoverScale: 1.1,
  bounceDistance: 4,
  bounceYPath: [0, 4, 0] as [number, number, number],
} as const;

const ANIMATION_TIMING = {
  scaleDuration: 0.2,
  bounceDuration: 1.2,
  resetDuration: 0.3,
} as const;

const CIRCLE_SIZE = {
  initial: '20%',
  expanded: '100%',
} as const;

interface IDotCircleProps {
  isInteractive?: boolean;
}

function DotCircle({ isInteractive = true }: Readonly<IDotCircleProps>) {
  const [hovered, setHovered] = useState<boolean>(false);

  const arrowAnimateProps = hovered
    ? {
        scale: ANIMATION_CONFIG.hoverScale,
        y: ANIMATION_CONFIG.bounceYPath,
      }
    : {
        scale: 1,
        y: 0,
      };

  const arrowTransitionProps = hovered
    ? {
        scale: { duration: ANIMATION_TIMING.scaleDuration, ease: 'easeOut' },
        y: {
          duration: ANIMATION_TIMING.bounceDuration,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: 'loop' as const,
          ease: 'easeInOut',
        },
      }
    : {
        scale: { duration: ANIMATION_TIMING.scaleDuration, ease: 'easeOut' },
        y: { duration: ANIMATION_TIMING.resetDuration, ease: 'easeOut' },
      };

  return (
    <CursorProvider targetCursorType={CursorType.headerLinkHovered}>
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="absolute -bottom-20 -right-20 z-30 h-24 w-24 scale-75 hover:cursor-pointer lg:-bottom-20 lg:-right-24 lg:scale-100"
      >
        <motion.div
          whileInView={{
            opacity: [0, 1],
            transition: {
              ...primaryTransition,
              delay: ANIMATION_CONFIG.arrowDelay + ANIMATION_CONFIG.circleDelay,
            },
          }}
          viewport={{ once: true }}
          animate={arrowAnimateProps}
          transition={arrowTransitionProps}
          className="absolute left-9 top-4 z-10 m-auto h-6 w-6 fill-white dark:fill-black"
        >
          <DownArrowIcon />
        </motion.div>
        <motion.div
          initial={{ height: CIRCLE_SIZE.initial, width: CIRCLE_SIZE.initial }}
          animate={{
            height: [CIRCLE_SIZE.initial, CIRCLE_SIZE.expanded],
            width: [CIRCLE_SIZE.initial, CIRCLE_SIZE.expanded]
          }}
          transition={{ ...primaryTransition, delay: ANIMATION_CONFIG.circleDelay }}
          className="absolute z-0 h-full w-full"
        >
          <svg viewBox="0 0 96 96" className="fill-black dark:fill-white">
            <circle cx="48" cy="48" r="48" />
          </svg>
        </motion.div>
      </motion.div>
    </CursorProvider>
  );
}

export default DotCircle;
