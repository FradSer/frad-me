import { motion } from 'motion/react';
import { type ReactNode, useMemo } from 'react';

import Header from '@/components/Header';

import useLoading from '@/hooks/useLoading';
import { createCursorClasses, LAYOUT_CLASSES } from '@/utils/classNames';
import {
  createHeaderVariants,
  createLoadingDots,
  createPageVariants,
  createStaggerChildren,
} from '@/utils/motion/animationUtils';

const LoadingDots = () => {
  const containerVariants = useMemo(() => createStaggerChildren(0.4), []);
  const dotVariants = useMemo(() => createLoadingDots(), []);

  return (
    <motion.span variants={containerVariants} animate="animate">
      {['loading-dot-1', 'loading-dot-2', 'loading-dot-3'].map((dotKey) => (
        <motion.span key={dotKey} variants={dotVariants}>
          .
        </motion.span>
      ))}
    </motion.span>
  );
};

type LayoutWrapperProps = {
  children: ReactNode;
};

const pageVariants = createPageVariants();
const headerVariants = createHeaderVariants();

const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={createCursorClasses(`${LAYOUT_CLASSES.fullScreen} bg-white dark:bg-black`)}
  >
    <div
      className={createCursorClasses(`${LAYOUT_CLASSES.loadingText} text-black dark:text-white`)}
    >
      loading
      <LoadingDots />
    </div>
  </motion.div>
);

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isLoading } = useLoading();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative flex w-full flex-col items-center justify-center bg-white dark:bg-black">
      {/* === STATUS BAR BLUR ===
          Must live here (outside motion.header) because Framer Motion applies
          transform: translateY() during animation, which breaks backdrop-filter
          on position:fixed children in Safari. */}

      {/* Dedicated status bar layer: covers exactly env(safe-area-inset-top).
          backdrop-blur-xl + opaque tint keeps white iOS icons readable. */}
      <div
        className="fixed inset-x-0 top-0 h-[env(safe-area-inset-top)] backdrop-blur-xl pointer-events-none z-[60] dark:hidden"
        style={{
          background: 'rgba(255,255,255,0.4)',
          maskImage:
            'linear-gradient(to bottom, black 60%, rgba(0,0,0,0.5) 85%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 60%, rgba(0,0,0,0.5) 85%, transparent 100%)',
        }}
      />
      <div
        className="fixed inset-x-0 top-0 h-[env(safe-area-inset-top)] backdrop-blur-xl pointer-events-none z-[60] hidden dark:block"
        style={{
          background: 'rgba(0,0,0,0.4)',
          maskImage:
            'linear-gradient(to bottom, black 60%, rgba(0,0,0,0.5) 85%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 60%, rgba(0,0,0,0.5) 85%, transparent 100%)',
        }}
      />

      {/* Header gradient blur: covers full header + safe area with a fade-out edge */}
      <div
        className="fixed inset-x-0 top-0 h-[calc(6rem+env(safe-area-inset-top))] backdrop-blur-lg pointer-events-none z-40 dark:hidden"
        style={{
          background: 'rgba(255,255,255,0.08)',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)',
        }}
      />
      <div
        className="fixed inset-x-0 top-0 h-[calc(6rem+env(safe-area-inset-top))] backdrop-blur-lg pointer-events-none z-40 hidden dark:block"
        style={{
          background: 'rgba(0,0,0,0.08)',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)',
        }}
      />

      <motion.header
        variants={headerVariants}
        initial="initial"
        animate="animate"
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 sm:px-8"
      >
        <div className="layout-wrapper pointer-events-auto mx-auto">
          <Header />
        </div>
      </motion.header>

      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex w-full flex-col items-center justify-center bg-white dark:bg-black"
      >
        {children}
      </motion.main>
    </div>
  );
}
