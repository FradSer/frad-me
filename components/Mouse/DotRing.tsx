import { useMemo } from 'react'
import { motion, useSpring } from 'framer-motion'

import useMouseContext from '@/hooks/useMouseContext'
import useMousePosition from '@/hooks/useMousePosition'

export default function DotRing() {
  const mousePosition = useMousePosition()
  const { cursorType } = useMouseContext()

  // Smooth mouse following with spring physics
  const x = useSpring(mousePosition.x, { stiffness: 300, damping: 30 })
  const y = useSpring(mousePosition.y, { stiffness: 300, damping: 30 })

  // Memoize cursor state to avoid recalculating on every render
  const cursorState = useMemo(() => {
    switch (cursorType) {
      case 'header-link-hovered':
        return { showBackground: false, showText: false, text: '' }
      case 'work-card-hovered':
        return { showBackground: true, showText: true, text: 'READ', size: '4rem' }
      case 'work-card-hovered-wip':
        return { showBackground: true, showText: true, text: 'WIP', size: '4rem' }
      case 'attracted':
        return { showBackground: false, showText: false, text: '' }
      default:
        return { showBackground: true, showText: false, text: '', size: '1rem' }
    }
  }, [cursorType])

  const baseStyle = { 
    left: x, 
    top: y, 
    x: '-50%', 
    y: '-50%' 
  }

  return (
    <>
      {/* Text overlay */}
      {cursorState.showText && (
        <motion.div
          className="fixed flex items-center justify-center pointer-events-none text-black font-bold text-xl z-50"
          style={{
            ...baseStyle,
            height: cursorState.size,
            width: cursorState.size,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {cursorState.text}
        </motion.div>
      )}

      {/* Background circle */}
      {cursorState.showBackground && (
        <motion.div
          className={`fixed rounded-full bg-white pointer-events-none z-40 ${
            cursorType === 'default' ? 'mix-blend-difference' : ''
          }`}
          style={baseStyle}
          initial={{ height: '1rem', width: '1rem', opacity: 1 }}
          animate={{
            height: cursorState.size || '1rem',
            width: cursorState.size || '1rem',
            opacity: 1,
          }}
          transition={{ duration: 0.2 }}
        />
      )}
    </>
  )
}
