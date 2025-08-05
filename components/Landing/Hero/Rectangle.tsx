import { useRef } from 'react'

import { motion, useMotionValue, useTransform } from 'framer-motion'

import useMousePosition from '@/hooks/useMousePosition'
import useWindowSize from '@/hooks/useWindowSize'
import usePhysicalAttraction from '@/hooks/usePhysicalAttraction'

// https://github.com/brunob/leaflet.fullscreen/issues/52

export default function Rectangle() {
  // * Hooks
  const mousePosition = useMousePosition()
  const size = useWindowSize()
  const rectangleRef = useRef<HTMLDivElement>(null)

  // * Physical attraction
  const { isAttracted } = usePhysicalAttraction({
    elementRef: rectangleRef,
    attractionRadius: 60,
    isActive: true,
  })

  // * Animation
  let angle = 2

  // we replace the useState with two motion values. One for each axis.
  // Since we want the card to start out flat we set the initial
  // values to x=0.5 y=0.5 which equals to no transformation
  const mouseY = useMotionValue(0.5)
  const mouseX = useMotionValue(0.5)

  const skewX = useTransform(mouseX, [0, 1], [angle, -angle], {
    clamp: true,
  })
  const skewY = useTransform(mouseY, [0, 1], [-angle, angle], {
    clamp: true,
  })

  // set x,y local coordinates
  const xValue = mousePosition.x / size.width
  const yValue = mousePosition.y / size.height

  // update MotionValues
  mouseX.set(xValue, true)
  mouseY.set(yValue, true)

  // * Render
  return (
    <div className="ml-2 flex grow lg:ml-8">
      <motion.div
        ref={rectangleRef}
        className="h-full w-full bg-black dark:bg-white"
        animate={{
          scale: isAttracted ? 0 : 1,
          opacity: isAttracted ? 0 : 1,
        }}
        style={{
          skewX: skewX,
          skewY: skewY,
        }}
        transition={{
          scale: {
            type: 'spring',
            stiffness: 400,
            damping: 25,
            duration: isAttracted ? 0.15 : 0.3,
          },
          opacity: {
            type: 'spring',
            stiffness: 400,
            damping: 25,
            duration: isAttracted ? 0.15 : 0.3,
          },
          default: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
          },
        }}
      ></motion.div>
    </div>
  )
}
