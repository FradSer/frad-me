import { useState } from 'react';

import { motion } from 'motion/react';

import { CursorProvider, CursorType } from '@/components/common/CursorProvider';

import { primaryTransition } from '@/utils/motion/springTransitions';

interface IDotCircleProps {
  isInteractive?: boolean;
}

function DotCircle({ isInteractive = true }: Readonly<IDotCircleProps>) {
  const animationCircleDelay = 2.5;
  const animationArrowDelay = 0.6;
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <CursorProvider targetCursorType={CursorType.headerLinkHovered}>
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="absolute -bottom-20 -right-20 z-30 h-24 w-24 scale-75 hover:cursor-pointer lg:-bottom-20 lg:-right-24 lg:scale-100"
      >
        <motion.div // Arrow
          whileInView={{
            opacity: [0, 1],
            transition: {
              ...primaryTransition,
              delay: animationArrowDelay + animationCircleDelay,
            },
          }}
          viewport={{ once: true }}
          animate={
            hovered
              ? {
                  scale: 1.1,
                  y: [0, 4, 0], // Continuous loop: down 4px then back to 0
                }
              : {
                  scale: 1,
                  y: 0,
                }
          }
          transition={
            hovered
              ? {
                  scale: { duration: 0.2, ease: 'easeOut' },
                  y: {
                    duration: 1.2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: 'loop',
                    ease: 'easeInOut',
                  },
                }
              : {
                  scale: { duration: 0.2, ease: 'easeOut' },
                  y: { duration: 0.3, ease: 'easeOut' },
                }
          }
          className="absolute left-9 top-4 z-10 m-auto h-6 w-6 fill-white dark:fill-black"
        >
          <svg viewBox="0 0 18 46">
            <path d="M0.439999 31.768C1.54933 32.1947 2.57333 32.664 3.512 33.176C4.49333 33.688 5.41067 34.264 6.264 34.904L6.264 0.599999L11.512 0.599999L11.512 34.904C12.3653 34.3067 13.2613 33.752 14.2 33.24C15.1813 32.728 16.2267 32.2587 17.336 31.832L17.336 36.696C14.2213 39.3413 11.8533 42.2427 10.232 45.4L7.48 45.4C5.944 42.2427 3.59733 39.3413 0.439999 36.696L0.439999 31.768Z" />
          </svg>
        </motion.div>
        <motion.div // Circle
          initial={{ height: '20%', width: '20%' }}
          animate={{ height: ['20%', '100%'], width: ['20%', '100%'] }}
          transition={{ ...primaryTransition, delay: animationCircleDelay }}
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
