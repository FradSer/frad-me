'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

import { DownArrowIcon } from '@/components/common/Icons';

const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

function CircleArrow({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const animated = active && !reducedMotion;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <motion.span
        data-hero-arrow
        data-active={active}
        initial={false}
        animate={{ scale: animated ? 1.1 : 1, y: animated ? [0, 6, 0] : 0 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : {
                scale: SPRING,
                y: animated
                  ? { duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }
                  : SPRING,
              }
        }
        className="flex h-16 w-16 items-center justify-center fill-white dark:fill-black"
      >
        <DownArrowIcon className="h-full w-full" />
      </motion.span>
    </span>
  );
}

export default function DotCircle() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const active = hovered || focused;

  const scrollToWork = () => {
    document.getElementById('work')?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <motion.button
      type="button"
      aria-label="View selected work"
      onClick={scrollToWork}
      onMouseEnter={() => {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="absolute -bottom-20 -right-20 z-30 h-24 w-24 scale-75 rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black dark:focus-visible:outline-white lg:-bottom-20 lg:-right-24 lg:scale-100"
    >
      <motion.span
        aria-hidden="true"
        data-hero-circle
        data-active={active}
        initial={false}
        animate={{ scale: active && !reducedMotion ? 1.12 : 1 }}
        transition={reducedMotion ? { duration: 0 } : SPRING}
        className="pointer-events-none absolute inset-0 rounded-full bg-black dark:bg-white"
      />
      <CircleArrow active={active} reducedMotion={reducedMotion} />
    </motion.button>
  );
}
