import { ReactNode } from 'react'
import { motion } from 'framer-motion'

import Header from '@/components/Header'
import useLoading from '@/hooks/useLoading'

const LoadingDots = () => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.4,
      },
    },
  }

  const dotVariants = {
    animate: {
      opacity: [0, 1, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <motion.span variants={containerVariants} animate="animate">
      {Array.from({ length: 3 }, (_, i) => (
        <motion.span key={i} variants={dotVariants}>
          .
        </motion.span>
      ))}
    </motion.span>
  )
}

type LayoutWrapperProps = {
  children: ReactNode
}

const ANIMATION_DURATION = 0.6

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: ANIMATION_DURATION, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: ANIMATION_DURATION * 0.5, ease: 'easeIn' }
  }
}

const headerVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: ANIMATION_DURATION, delay: 0.2, ease: 'easeOut' }
  }
}

const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black"
  >
    <div className="text-4xl font-bold text-black dark:text-white md:text-7xl">
      loading
      <LoadingDots />
    </div>
  </motion.div>
)

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isLoading } = useLoading()

  return (
    <>
      {isLoading && <LoadingScreen />}
      
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
    </>
  )
}
