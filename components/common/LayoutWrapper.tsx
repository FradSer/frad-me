import { ReactNode } from 'react'

import { motion } from 'framer-motion'

import Header from '@/components/Header'

import useLoading from '@/hooks/useLoading'
import { 
  createPageVariants, 
  createHeaderVariants, 
  createStaggerChildren, 
  createLoadingDots 
} from '@/utils/motion/animationUtils'

const LoadingDots = () => {
  const containerVariants = createStaggerChildren(0.4)
  const dotVariants = createLoadingDots()

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

const pageVariants = createPageVariants()
const headerVariants = createHeaderVariants()

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