import { useRef, useEffect, RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { workCardPositions } from '@/utils/webxr/animationHelpers'
import { ANIMATION_DELAYS, SPRING_CONFIGS } from '@/utils/webxr/animationConstants'
import { applyOpacityToObject } from '@/utils/webxr/materialUtils'
import { useSimpleLerp, springConfigToLerpSpeed } from '@/hooks/useSimpleLerp'

interface UseCardAnimationProps {
  groupRef: RefObject<THREE.Group>
  visible: boolean
  hovered: boolean
  position: [number, number, number]
  index: number
  onOpacityChange?: (opacity: number) => void
}

interface AnimationState {
  isInitialized: boolean
  startTime: number
}

export const useCardAnimation = ({ 
  groupRef, 
  visible, 
  hovered, 
  position, 
  index,
  onOpacityChange
}: UseCardAnimationProps) => {
  const animationState = useRef<AnimationState>({ isInitialized: false, startTime: 0 })
  
  // Simplified spring-based animation system focusing on scale and opacity
  const elasticConfig = { speed: springConfigToLerpSpeed(SPRING_CONFIGS.elastic) }
  const fastConfig = { speed: springConfigToLerpSpeed(SPRING_CONFIGS.fast) }
  const bouncyConfig = { speed: springConfigToLerpSpeed(SPRING_CONFIGS.bouncy) }
  
  // Focus on scale, opacity, and rotation - position is handled by direct prop
  const springScale = useSimpleLerp(0.1, fastConfig) // Use fast config for smoother scale animation
  const springOpacity = useSimpleLerp(0, elasticConfig) // Smooth fade
  const springRotation = useSimpleLerp(0, fastConfig) // Responsive hover feedback

  // Initialize spring animations when visibility changes
  useEffect(() => {
    if (visible && groupRef.current) {
      // Reset spring values to starting state
      springScale.set(0.1) // Start small for entrance effect
      springOpacity.set(0)
      springRotation.set(0)
      
      // Initialize animation timing with staggered delays
      animationState.current.isInitialized = true
      animationState.current.startTime = Date.now() + (ANIMATION_DELAYS.cardEntranceDelay + index * ANIMATION_DELAYS.cardStagger) * 1000
      
      // Ensure opacity is properly reset for each card individually
      const timeoutId = setTimeout(() => {
        if (groupRef.current) {
          applyOpacityToObject(groupRef.current, 0)
        }
      }, 50)
      
      return () => clearTimeout(timeoutId)
    } else if (!visible) {
      // Reset to hidden state when not visible
      springScale.set(0.1)
      springOpacity.set(0)
      springRotation.set(0)
      
      animationState.current.isInitialized = false
      animationState.current.startTime = 0
    }
  }, [visible, index])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    if (visible) {
      // Check if this card should start animating yet
      const currentTime = Date.now()
      const shouldAnimate = currentTime >= animationState.current.startTime
      
      
      if (!shouldAnimate) {
        // Calculate target values even during wait state to prepare for smooth entrance
        const targetScale = hovered ? 1.1 : 1
        const targetRotation = hovered ? 0.1 : 0
        
        // Set targets but don't animate scale/rotation until entrance time
        springRotation.set(targetRotation)
        
        // Apply current spring values while waiting to start
        groupRef.current.scale.setScalar(springScale.value)
        groupRef.current.rotation.y = springRotation.value
        
        // Always apply opacity even during wait state
        applyOpacityToObject(groupRef.current, springOpacity.value)
        onOpacityChange?.(springOpacity.value)
        return
      }
      
      // Calculate target values - position is handled by direct prop, focus on scale/opacity/rotation
      const targetScale = hovered ? 1.1 : 1
      const targetOpacity = 1
      const targetRotation = hovered ? 0.1 : 0
      
      // Add subtle floating animation by adjusting position relative to base
      const floatingOffset = Math.sin(state.clock.elapsedTime + index) * 0.1
      const hoverYOffset = hovered ? workCardPositions.hover.y : floatingOffset
      const hoverZOffset = hovered ? workCardPositions.hover.z : 0
      
      // Apply relative position offsets for hover and floating effects
      groupRef.current.position.y = position[1] + hoverYOffset
      groupRef.current.position.z = position[2] + hoverZOffset
      
      // Update spring targets
      springScale.set(targetScale)
      springOpacity.set(targetOpacity)
      springRotation.set(targetRotation)
      
      // Apply spring values to 3D object (except position which is handled above)
      groupRef.current.scale.setScalar(springScale.value)
      groupRef.current.rotation.y = springRotation.value
      
      // Render order is now handled at individual element level
      
      // Apply spring-driven opacity
      applyOpacityToObject(groupRef.current, springOpacity.value)
      
      // Notify parent component of opacity changes for HTML elements
      onOpacityChange?.(springOpacity.value)
      
    } else {
      // Use springs for smooth exit animation
      springScale.set(0.1) // Match initial scale
      springOpacity.set(0)
      springRotation.set(0)
      
      // Apply spring values during exit (position stays at prop value)
      groupRef.current.scale.setScalar(springScale.value)
      groupRef.current.rotation.y = springRotation.value
      
      // Apply spring-driven opacity during exit
      applyOpacityToObject(groupRef.current, springOpacity.value)
      onOpacityChange?.(springOpacity.value)
    }
  })

  return {
    isAnimated: animationState.current.isInitialized
  }
}
