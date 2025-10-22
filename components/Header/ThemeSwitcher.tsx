'use client';

import { useMemo } from 'react';

import { motion } from 'motion/react';

import { CursorProvider, CursorType } from '@/components/common/CursorProvider';
import { SunIcon, MoonIcon } from '@/components/common/Icons';
import useThemeMode from '@/hooks/useThemeMode';

import {
  primaryTransition,
  secondaryTransition,
} from '@/utils/motion/springTransitions';

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
        className="flex h-8 w-8 items-center justify-center"
        onClick={toggleTheme}
        initial="initial"
        whileHover="hover"
        variants={hoverVariants}
      >
        {isDark ? (
          <SunIcon className="h-6 w-6 fill-black dark:fill-white" />
        ) : (
          <MoonIcon className="h-6 w-6 fill-black dark:fill-white" />
        )}
      </motion.button>
    </CursorProvider>
  );
}
