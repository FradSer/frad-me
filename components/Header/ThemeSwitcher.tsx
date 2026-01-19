'use client';

import { motion } from 'motion/react';
import { useMemo } from 'react';

import { CursorProvider, CursorType } from '@/components/common/CursorProvider';
import { MoonIcon, SunIcon } from '@/components/common/Icons';
import useThemeMode from '@/hooks/useThemeMode';

import { primaryTransition, secondaryTransition } from '@/utils/motion/springTransitions';

export default function ThemeSwitcher() {
  const { isMounted, resolvedTheme, toggleTheme } = useThemeMode();

  const hoverVariants = useMemo(
    () => ({
      initial: {
        scale: 1,
        transition: primaryTransition,
      },
      hover: {
        scale: 1.1,
        transition: secondaryTransition,
      },
    }),
    [],
  );

  const isDark = isMounted && resolvedTheme === 'dark';

  // * Render
  return (
    <CursorProvider targetCursorType={CursorType.headerLinkHovered}>
      <motion.button
        aria-label="Toggle Dark Mode"
        type="button"
        className="flex h-8 w-8 items-center justify-center text-black dark:text-white dark:mix-blend-difference"
        onClick={toggleTheme}
        initial="initial"
        whileHover="hover"
        variants={hoverVariants}
      >
        {isDark ? (
          <SunIcon className="h-6 w-6 fill-current" />
        ) : (
          <MoonIcon className="h-6 w-6 fill-current" />
        )}
      </motion.button>
    </CursorProvider>
  );
}
