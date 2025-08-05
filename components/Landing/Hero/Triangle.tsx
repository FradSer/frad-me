import { useEffect, useRef } from 'react'

import { motion, useMotionValue, useTransform, useScroll } from 'framer-motion'

import usePhysicalAttraction from '@/hooks/usePhysicalAttraction'

export default function Triangle() {
  const { scrollYProgress } = useScroll()
  const triangleRef = useRef<HTMLDivElement>(null)

  const x = useTransform(scrollYProgress, [0, 0.3], [0, -50])
  const y = useTransform(scrollYProgress, [0, 0.3], [0, 200])

  const initialRotate = Math.random() * 360
  const rotate = useMotionValue(0)
  const rotateOffset = useTransform(scrollYProgress, [0, 0.5], [0, 180])

  // Physical attraction
  const { isAttracted } = usePhysicalAttraction({
    elementRef: triangleRef,
    attractionRadius: 80,
    isActive: true,
  })

  useEffect(() => {
    function updateRotate() {
      const newRotate = rotateOffset.get() + initialRotate
      rotate.set(newRotate)
    }
    const unsubscribe = rotateOffset.onChange(updateRotate)
    return () => {
      unsubscribe()
    }
  }, [scrollYProgress, initialRotate, rotate, rotateOffset])

  return (
    <motion.div
      ref={triangleRef}
      initial={{ rotate: initialRotate }}
      animate={{
        scale: isAttracted ? 1.1 : 1,
      }}
      style={{
        x,
        y,
        rotate,
      }}
      transition={{
        scale: {
          type: 'spring',
          stiffness: 400,
          damping: 25,
          duration: isAttracted ? 0.2 : 0.3,
        },
        default: {
          type: 'spring',
          stiffness: 300,
          damping: 30,
        },
      }}
    >
      <svg
        viewBox="0 0 149 129"
        className="h-20 w-20 fill-black dark:fill-white sm:h-24 sm:w-24 lg:h-28 lg:w-28 2xl:h-32 2xl:w-32"
      >
        <path d="M74.5 0L148.545 128.25H0.454826L74.5 0Z" />
      </svg>
    </motion.div>
  )
}
