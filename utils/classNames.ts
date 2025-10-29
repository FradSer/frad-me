import { clsx } from 'clsx';

/**
 * Utility functions for common className patterns
 */

export const createCursorClasses = (
  baseClasses: string,
  conditionalClasses?: Record<string, boolean>,
) => clsx(baseClasses, conditionalClasses);

export const LAYOUT_CLASSES = {
  fullScreen: 'fixed inset-0 z-50 flex items-center justify-center',
  centerFlex: 'flex items-center justify-center',
  loadingText: 'text-4xl font-bold md:text-7xl',
} as const;
