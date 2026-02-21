'use client';

import { motion } from 'motion/react';

type MobileMenuButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export default function MobileMenuButton({ isOpen, onToggle }: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      onClick={onToggle}
      className="flex h-10 w-10 items-center justify-center text-black dark:text-white"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" className="fill-none stroke-current">
        <title>{isOpen ? 'Close menu' : 'Open menu'}</title>
        {/* Top line → rotates to form X */}
        <motion.line
          x1="1"
          y1="4"
          x2="17"
          y2="4"
          strokeWidth="1.4"
          strokeLinecap="round"
          animate={isOpen ? { y1: 9, y2: 9, rotate: 45 } : { y1: 4, y2: 4, rotate: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ originX: '50%', originY: '50%' }}
        />
        {/* Bottom line → rotates to form X */}
        <motion.line
          x1="1"
          y1="14"
          x2="17"
          y2="14"
          strokeWidth="1.4"
          strokeLinecap="round"
          animate={isOpen ? { y1: 9, y2: 9, rotate: -45 } : { y1: 14, y2: 14, rotate: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ originX: '50%', originY: '50%' }}
        />
      </svg>
    </button>
  );
}
