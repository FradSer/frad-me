import type { ReactNode } from 'react';

import { motion } from 'motion/react';

import Header from '@/components/Header';

import useLoading from '@/hooks/useLoading';
import {
  createPageVariants,
  createHeaderVariants,
  createStaggerChildren,
  createLoadingDots,
} from '@/utils/motion/animationUtils';
import { createCursorClasses, LAYOUT_CLASSES } from '@/utils/classNames';

const LoadingDots = () => {
  const containerVariants = createStaggerChildren(0.4);
  const dotVariants = createLoadingDots();

  return (
    <motion.span variants={containerVariants} animate="animate">
      {Array.from({ length: 3 }, (_, i) => (
        <motion.span key={i} variants={dotVariants}>
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
    className={createCursorClasses(
      `${LAYOUT_CLASSES.fullScreen} bg-white dark:bg-black`,
    )}
  >
    <div
      className={createCursorClasses(
        `${LAYOUT_CLASSES.loadingText} text-black dark:text-white`,
      )}
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
    <div className="flex w-full flex-col items-center justify-center bg-white dark:bg-black">
      <motion.header
        variants={headerVariants}
        initial="initial"
        animate="animate"
        className="layout-wrapper fixed top-0 z-50"
      >
        <Header />
      </motion.header>

      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col items-center justify-center"
      >
        {children}
      </motion.main>
    </div>
  );
}
