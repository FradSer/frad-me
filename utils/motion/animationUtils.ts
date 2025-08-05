// Animation constants and utilities
export const ANIMATION_DURATIONS = {
  fast: 0.3,
  normal: 0.6,
  slow: 1.2,
} as const

export const SPRING_CONFIGS = {
  gentle: { stiffness: 100, damping: 20 },
  snappy: { stiffness: 300, damping: 30 },
  bouncy: { stiffness: 400, damping: 10 },
} as const

export const TRANSFORM_ORIGINS = {
  center: { x: '-50%', y: '-50%' },
  topLeft: { x: '0%', y: '0%' },
  topRight: { x: '-100%', y: '0%' },
  bottomLeft: { x: '0%', y: '-100%' },
  bottomRight: { x: '-100%', y: '-100%' },
} as const

export const OPACITY_TRANSITIONS = {
  fadeIn: { opacity: [0, 1] },
  fadeOut: { opacity: [1, 0] },
  fadeInOut: { opacity: [0, 1, 0] },
} as const

export const SCALE_TRANSITIONS = {
  scaleIn: { scale: [0, 1] },
  scaleOut: { scale: [1, 0] },
  scaleUp: { scale: [1, 1.1] },
  scaleDown: { scale: [1, 0.9] },
} as const

export const SLIDE_TRANSITIONS = {
  slideUp: { y: [20, 0] },
  slideDown: { y: [-20, 0] },
  slideLeft: { x: [20, 0] },
  slideRight: { x: [-20, 0] },
} as const

// Common animation variants
export const createPageVariants = (duration = ANIMATION_DURATIONS.normal) => ({
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: { 
      duration, 
      ease: 'easeOut' 
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { 
      duration: duration * 0.5, 
      ease: 'easeIn' 
    },
  },
})

export const createHeaderVariants = (duration = ANIMATION_DURATIONS.normal, delay = 0.2) => ({
  initial: { 
    opacity: 0, 
    y: -20 
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: { 
      duration, 
      delay, 
      ease: 'easeOut' 
    },
  },
})

export const createStaggerChildren = (delay = 0.1) => ({
  animate: {
    transition: {
      staggerChildren: delay,
    },
  },
})

export const createLoadingDots = () => ({
  animate: {
    opacity: [0, 1, 0],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
})

// Utility functions
export const blendPositions = (
  mousePos: { x: number; y: number },
  attractorPos: { x: number; y: number },
  blendFactor: number = 0.7
) => ({
  x: mousePos.x + (attractorPos.x - mousePos.x) * blendFactor,
  y: mousePos.y + (attractorPos.y - mousePos.y) * blendFactor,
})

export const calculateSkew = (
  mousePos: { x: number; y: number },
  windowSize: { width: number; height: number },
  angle: number = 2
) => {
  const xValue = mousePos.x / windowSize.width
  const yValue = mousePos.y / windowSize.height
  
  return {
    skewX: xValue * angle * 2 - angle,
    skewY: yValue * -angle * 2 + angle,
    xValue,
    yValue,
  }
}