import { motion } from 'motion/react';
import type { ReactNode } from 'react';

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
  const containerVariants = createStaggerChildren(0.4);
  const dotVariants = createLoadingDots();

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
