import { useEffect, useState } from 'react'

import classNames from 'classnames'
import { motion, useAnimationControls, useMotionValue, useSpring } from 'framer-motion'

import useMouseContext from '@/hooks/useMouseContext'
import useMousePosition from '@/hooks/useMousePosition'

import { primaryTransition } from '@/utils/motion/springTransitions'

export default function DotRing() {
  // * Hooks
  const mousePosition = useMousePosition()
  const mouseContext = useMouseContext()

  // * Physical attraction
  const attractedX = useMotionValue(mousePosition.x)
  const attractedY = useMotionValue(mousePosition.y)
  const springX = useSpring(attractedX, { stiffness: 300, damping: 30 })
  const springY = useSpring(attractedY, { stiffness: 300, damping: 30 })

  // * Styling
  const textClass = classNames(
    'fixed flex items-center justify-center duration-200 pointer-events-none text-black font-bold text-xl z-50',
  )

  const backgroundClass = classNames(
    'fixed rounded-full bg-white pointer-events-none z-40 duration-100',
    {
      'mix-blend-difference': mouseContext.cursorType == 'default',
    },
  )

  // * Animation
  const controls = useAnimationControls()

  const transitionOffset = { x: '-50%', y: '-50%' }

  const backgroundVariants = {
    initial: {
      ...transitionOffset,
      height: '1rem',
      width: '1rem',
      opacity: 1,
      transition: {
        ...primaryTransition,
      },
    },
    headerLinkHovered: {
      opacity: 0,
      transition: { ...primaryTransition },
    },
    workCardHover: {
      ...transitionOffset,
      height: '4rem',
      width: '4rem',
      transition: {
        ...primaryTransition,
      },
    },
    attracted: {
      ...transitionOffset,
      height: '2rem',
      width: '2rem',
      opacity: 0.8,
      transition: {
        ...primaryTransition,
      },
    },
  }

  const textVariants = {
    initial: {
      ...transitionOffset,
      height: '2rem',
      width: '2rem',
      opacity: 0,
      scale: 0.5,
      transition: {
        ...primaryTransition,
      },
    },

    workCardHover: {
      ...transitionOffset,
      height: '4rem',
      width: '4rem',
      opacity: 1,
      scale: 1,
      transition: {
        ...primaryTransition,
      },
    },
  }

  // * Dot Ring Title
  const [dotRingTitle, setDotRingTitle] = useState('')

  // * Effects
  useEffect(() => {
    // Update position based on attraction
    if (mouseContext.attractorPosition) {
      const attractorPos = mouseContext.attractorPosition
      const mousePos = { x: mousePosition.x, y: mousePosition.y }
      
      // Calculate blend position (closer to attractor)
      const blendFactor = 0.7
      const blendedX = mousePos.x + (attractorPos.x - mousePos.x) * blendFactor
      const blendedY = mousePos.y + (attractorPos.y - mousePos.y) * blendFactor
      
      attractedX.set(blendedX)
      attractedY.set(blendedY)
    } else {
      attractedX.set(mousePosition.x)
      attractedY.set(mousePosition.y)
    }
  }, [mousePosition, mouseContext.attractorPosition, attractedX, attractedY])

  useEffect(() => {
    switch (mouseContext.cursorType) {
      case 'header-link-hovered':
        controls.start('headerLinkHovered')
        break
      case 'work-card-hovered':
        controls.start('workCardHover')
        setDotRingTitle('READ')
        break
      case 'work-card-hovered-wip':
        controls.start('workCardHover')
        setDotRingTitle('WIP')
        break
      case 'attracted':
        controls.start('attracted')
        setDotRingTitle('')
        break
      default:
        controls.start('initial')
        setDotRingTitle('')
    }
  }, [mouseContext.cursorType, controls])

  // * Render
  return (
    <>
      <motion.div
        animate={controls}
        variants={textVariants}
        initial="initial"
        className={textClass}
        style={{ left: springX, top: springY }}
      >
        <h1>{dotRingTitle}</h1>
      </motion.div>
      <motion.div
        animate={controls}
        variants={backgroundVariants}
        initial="initial"
        className={backgroundClass}
        style={{ left: springX, top: springY }}
      ></motion.div>
    </>
  )
}
