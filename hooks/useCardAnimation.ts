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
  
  // Focus on scale, opacity, rotation, and entrance position animation
  const springScale = useSimpleLerp(0.1, fastConfig) // Use fast config for smoother scale animation
  const springOpacity = useSimpleLerp(0, elasticConfig) // Smooth fade
  const springRotation = useSimpleLerp(0, fastConfig) // Responsive hover feedback
  
  // Position animation for spray effect from navigation button
  const springPosX = useSimpleLerp(workCardPositions.entrance.x, elasticConfig) // X position animation
  const springPosY = useSimpleLerp(workCardPositions.entrance.y, elasticConfig) // Y position animation
  const springPosZ = useSimpleLerp(workCardPositions.entrance.z, elasticConfig) // Z position animation

  // Initialize spring animations when visibility changes
  useEffect(() => {
    if (visible && groupRef.current) {
      // Reset spring values to starting state
      springScale.set(0.1) // Start small for entrance effect
      springOpacity.set(0)
      springRotation.set(0)
      
      // Set entrance position as starting point for spray effect
      springPosX.set(workCardPositions.entrance.x)
      springPosY.set(workCardPositions.entrance.y)
      springPosZ.set(workCardPositions.entrance.z)
      
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
      
      // Reset position to entrance point
      springPosX.set(workCardPositions.entrance.x)
      springPosY.set(workCardPositions.entrance.y)
      springPosZ.set(workCardPositions.entrance.z)
      
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
        // Keep cards at entrance position while waiting
        groupRef.current.position.x = springPosX.value
        groupRef.current.position.y = springPosY.value
        groupRef.current.position.z = springPosZ.value
        
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
      
      // Calculate target positions for spray effect animation
      const floatingOffset = Math.sin(state.clock.elapsedTime + index) * 0.1
      const finalX = position[0] // Use prop position as final target
      const finalY = position[1] + (hovered ? workCardPositions.hover.y : floatingOffset)
      const finalZ = position[2] + (hovered ? workCardPositions.hover.z : 0)
      
      // Update position spring targets for spray effect
      springPosX.set(finalX)
      springPosY.set(finalY)
      springPosZ.set(finalZ)
      
      // Apply animated positions
      groupRef.current.position.x = springPosX.value
      groupRef.current.position.y = springPosY.value
      groupRef.current.position.z = springPosZ.value
      
      // Update other spring targets
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
      // Use springs for smooth exit animation - return to entrance position
      springScale.set(0.1) // Match initial scale
      springOpacity.set(0)
      springRotation.set(0)
      
      // Return to entrance position for exit
      springPosX.set(workCardPositions.entrance.x)
      springPosY.set(workCardPositions.entrance.y)
      springPosZ.set(workCardPositions.entrance.z)
      
      // Apply spring values during exit
      groupRef.current.position.x = springPosX.value
      groupRef.current.position.y = springPosY.value
      groupRef.current.position.z = springPosZ.value
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
