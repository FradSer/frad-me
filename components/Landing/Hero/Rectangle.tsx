import { useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

import useOptimizedMousePosition from '@/hooks/useOptimizedMousePosition'
import usePhysicalAttraction from '@/hooks/usePhysicalAttraction'
import useWindowSize from '@/hooks/useWindowSize'
import { calculateSkew, SPRING_CONFIGS } from '@/utils/motion/animationUtils'

export default function Rectangle() {
  const mousePosition = useOptimizedMousePosition()
  const size = useWindowSize()
  const rectangleRef = useRef<HTMLDivElement>(null)

  // Physical attraction with optimized hook
  const { isAttracted } = usePhysicalAttraction({
    elementRef: rectangleRef,
    attractionRadius: 60,
    isActive: true,
  })

  const { skewX: calculatedSkewX, skewY: calculatedSkewY, xValue, yValue } = calculateSkew(
    mousePosition,
    size,
    2
  )

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const skewX = useTransform(mouseX, [0, 1], [2, -2], { clamp: true })
  const skewY = useTransform(mouseY, [0, 1], [-2, 2], { clamp: true })

  // Update motion values
  mouseX.set(xValue, true)
  mouseY.set(yValue, true)

  return (
    <div className="ml-2 flex grow lg:ml-8">
      <motion.div
        ref={rectangleRef}
        className="h-full w-full bg-black dark:bg-white"
        animate={{
          scale: isAttracted ? 1.05 : 1,
        }}
        style={{
          skewX: skewX,
          skewY: skewY,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      ></motion.div>
    </div>
  )
}
