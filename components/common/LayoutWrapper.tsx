import { ReactNode, useEffect } from 'react'

import classNames from 'classnames'
import { motion, useAnimationControls } from 'framer-motion'

import Header from '@/components/Header'

import useLoading from '@/hooks/useLoading'

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
  }

  const loadingDotTransition = {
    duration: 0.8,
    yoyo: Infinity,
    ease: 'easeInOut',
  }

  const loadingDotVariants = {
    start: {
      opacity: 0,
    },
    end: {
      opacity: 1,
    },
  }

  return (
    <motion.span variants={loadingDotsVariants} initial="start" animate="end">
      {Array.from({ length: 3 }, (_, i) => (
        <motion.span
          key={i}
          variants={loadingDotVariants}
          transition={loadingDotTransition}
        >
          .
        </motion.span>
      ))}
    </motion.span>
  )
}

interface ILayoutWrapperProps {
  children: ReactNode
}

function LayoutWrapper({ children }: Readonly<ILayoutWrapperProps>) {
  const loading = useLoading()

  const loadingBackgroundControls = useAnimationControls()
  const loadingContentControls = useAnimationControls()
  const contentControls = useAnimationControls()

  const linearTransition = {
    type: 'linear',
  }

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
  }

  const loadingBackgroundVariants = {
    initial: {
      y: '-100vh',
    },
    show: {
      y: 0,
      transition: {
        ...linearTransition,
        duration: 0.8,
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
  }

  const headerVariants = {
    initial: {
      opacity: 0,
      y: '-10vh',
    },
    hidden: {
      opacity: 0,
      y: '-10vh',
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
        duration: 0.8,
        delay: 0.4,
      },
    },
  }

  const childrenVariants = {
    initial: {
      opacity: 0,
      y: '20vh',
    },
    hidden: {
      opacity: 0,
      y: '20vh',
      transition: {
        ...linearTransition,
        duration: 0.8,
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
  }

  useEffect(() => {
    if (loading.isLoading) {
      loadingBackgroundControls.start('show')
      loadingContentControls.start('show')
      contentControls.start('hidden')
    } else {
      loadingBackgroundControls.start('hidden')
      loadingContentControls.start('hidden')
      contentControls.start('show')
    }
  }, [
    loading,
    contentControls,
    loadingBackgroundControls,
    loadingContentControls,
  ])

  const loadingClass = classNames(
    'fixed flex h-screen w-screen items-center justify-center overflow-hidden',
    {
      'z-50': loading.isLoading,
    },
  )

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
          loadingClass,
        )}
      >
        loading
        <LoadingDots />
      </motion.span>
      <motion.div
        onViewportEnter={() => {
          if (!loading.isLoading) {
            contentControls.start('show')
          }
        }}
        className="flex w-full flex-col items-center justify-center bg-white dark:bg-black"
      >
        <motion.div
          initial="initial"
          animate={contentControls}
          variants={headerVariants}
          className="layout-wrapper fixed top-0 z-50"
        >
          <Header />
        </motion.div>
        <motion.div
          initial="initial"
          animate={contentControls}
          variants={childrenVariants}
          className="flex flex-col items-center justify-center"
        >
          {children}
        </motion.div>
      </motion.div>
    </>
  )
}

export default LayoutWrapper
