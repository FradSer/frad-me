'use client';

import { motion } from 'motion/react';
import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';

const ChatPanel = dynamic(() => import('./ChatPanel'), { ssr: false });

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <ChatPanel isOpen={isOpen} onClose={close} />
      <motion.button
        type="button"
        onClick={toggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:right-6"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {isOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M5 5L15 15M15 5L5 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M3 5.5C3 4.11929 4.11929 3 5.5 3H14.5C15.8807 3 17 4.11929 17 5.5V11.5C17 12.8807 15.8807 14 14.5 14H7L4 17V14H5.5C4.11929 14 3 12.8807 3 11.5V5.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="7" cy="8.5" r="0.75" fill="currentColor" />
              <circle cx="10" cy="8.5" r="0.75" fill="currentColor" />
              <circle cx="13" cy="8.5" r="0.75" fill="currentColor" />
            </svg>
          )}
        </motion.div>
      </motion.button>
    </>
  );
}
