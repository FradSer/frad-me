import classNames from 'classnames';
import { motion, useAnimation } from 'framer-motion';
import { ReactNode, useEffect } from 'react';

import useLoading from '../../hooks/useLoading';

interface ILayoutWrapperProps {
  children: ReactNode;
}

function LayoutWrapper({ children }: ILayoutWrapperProps) {
  const loading = useLoading();

  const loadingBackgroundControls = useAnimation();
  const loadingContentControls = useAnimation();
  const childrenControls = useAnimation();

  const linearTransition = {
    type: 'linear',
  };

  const loadingContentVariants = {
    initial: {
      opacity: 0,
      scale: 0,
    },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        ...linearTransition,
        duration: 0.8,
      },
    },
    hidden: {
      opacity: 0,
      scale: 0,
      transition: {
        ...linearTransition,
        duration: 0.4,
      },
    },
  };

  const loadingBackgroundVariants = {
    initial: {
      opacity: 0,
      y: '-100vh',
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        ...linearTransition,
        duration: 0.6,
        delay: 0.2,
      },
    },
    hidden: {
      opacity: 1,
      y: '-100vh',
      transition: {
        ...linearTransition,
        duration: 0.4,
      },
    },
  };

  const childrenVariants = {
    initial: {
      opacity: 0,
      y: 0,
    },
    hidden: {
      opacity: 0,
      y: '20vh',
      transition: {
        ...linearTransition,
        duration: 0.4,
      },
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        ...linearTransition,
        duration: 1.2,
        delay: 0.2,
      },
    },
  };

  useEffect(() => {
    if (loading.isLoading) {
      loadingBackgroundControls.start('show');
      loadingContentControls.start('show');
      childrenControls.start('hidden');
    } else {
      loadingBackgroundControls.start('hidden');
      loadingContentControls.start('hidden');
      childrenControls.start('show');
    }
  }, [
    loading,
    childrenControls,
    loadingBackgroundControls,
    loadingContentControls,
  ]);

  const loadingClass = classNames(
    'fixed flex h-screen w-screen items-center justify-center overflow-hidden',
    {
      'z-50': loading.isLoading,
      '-z-50': !loading.isLoading,
    }
  );

  function LoadingDots() {
    const loadingDotsVariants = {
      start: {
        transition: {
          staggerChildren: 0.4,
        },
      },
      end: {
        transition: {
          staggerChildren: 0.4,
        },
      },
    };

    const loadingDotTransition = {
      duration: 0.8,
      yoyo: Infinity,
      ease: 'easeInOut',
    };

    const loadingDotVariants = {
      start: {
        opacity: 0,
      },
      end: {
        opacity: 1,
      },
    };

    return (
      <motion.span variants={loadingDotsVariants} initial="start" animate="end">
        {Array.from({ length: 3 }, (_, i) => (
          <motion.span
            variants={loadingDotVariants}
            transition={loadingDotTransition}
          >
            .
          </motion.span>
        ))}
      </motion.span>
    );
  }

  return (
    <>
      <motion.div
        initial="initial"
        animate={loadingBackgroundControls}
        variants={loadingBackgroundVariants}
        className={classNames('bg-white dark:bg-black', loadingClass)}
      />
      <motion.span
        initial="initial"
        animate={loadingContentControls}
        variants={loadingContentVariants}
        className={classNames(
          'text-4xl font-bold text-black dark:text-white md:text-7xl',
          loadingClass
        )}
      >
        loading
        <LoadingDots />
      </motion.span>
      <motion.div
        initial="initial"
        animate={childrenControls}
        variants={childrenVariants}
        className="flex flex-col items-center justify-center bg-white dark:bg-black"
      >
        {children}
      </motion.div>
    </>
  );
}

export default LayoutWrapper;
