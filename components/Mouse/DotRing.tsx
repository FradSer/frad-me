import { useEffect } from 'react'

import { motion, useAnimationControls } from 'framer-motion'

import useMouseContext from '@/hooks/useMouseContext'
import useMouseAttraction from '@/hooks/useMouseAttraction'

import { getCursorState } from '@/utils/cursor'
import { createCursorClasses, CURSOR_BASE_CLASSES } from '@/utils/classNames'
import { createBackgroundVariants, createTextVariants } from '@/utils/motion/variantFactory'

export default function DotRing() {
  const mouseContext = useMouseContext()
  const { springX, springY } = useMouseAttraction()

  const controls = useAnimationControls()
  const currentState = getCursorState(mouseContext.cursorType)

  // Dynamic class names based on cursor type
  const textClass = createCursorClasses(CURSOR_BASE_CLASSES.text)
  const backgroundClass = createCursorClasses(CURSOR_BASE_CLASSES.background, {
    'mix-blend-difference': mouseContext.cursorType === 'default',
  })

  // Trigger animations based on cursor state
  useEffect(() => {
    controls.start(currentState.animation)
  }, [currentState.animation, controls])

  const backgroundVariants = createBackgroundVariants()
  const textVariants = createTextVariants()
  const style = { left: springX, top: springY }

  return (
    <>
      <motion.div
        animate={controls}
        variants={textVariants}
        initial="initial"
        className={textClass}
        style={style}
      >
        <h1>{currentState.title}</h1>
      </motion.div>
      <motion.div
        animate={controls}
        variants={backgroundVariants}
        initial="initial"
        className={backgroundClass}
        style={style}
      />
    </>
  )
}
