import { useRef, useEffect, RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { workCardPositions } from '@/utils/webxr/animationHelpers'
import { NAVIGATION_POSITIONS, ANIMATION_DELAYS } from '@/utils/webxr/animationConstants'
import { applyOpacityToObject } from '@/utils/webxr/materialUtils'

interface UseCardAnimationProps {
  groupRef: RefObject<THREE.Group>
  visible: boolean
  hovered: boolean
  position: [number, number, number]
  index: number
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
  index 
}: UseCardAnimationProps) => {
  const animationState = useRef<AnimationState>({ isInitialized: false, startTime: 0 })

  // Initialize position when first becoming visible or reinitialize when switching back to visible
  useEffect(() => {
    if (visible && groupRef.current) {
      // Reset to navigation position and small scale
      groupRef.current.position.set(...NAVIGATION_POSITIONS.navigationButtonAbsolute)
      groupRef.current.scale.setScalar(0.1)
      
      // Always reinitialize animation state when becoming visible
      animationState.current.isInitialized = true
      animationState.current.startTime = Date.now() + (ANIMATION_DELAYS.cardEntranceDelay + index * ANIMATION_DELAYS.cardStagger) * 1000
      
      // Reset opacity to 0 for smooth fade-in
      applyOpacityToObject(groupRef.current, 0)
    } else if (!visible) {
      // Immediately mark as not initialized when hidden to allow immediate re-animation
      animationState.current.isInitialized = false
      animationState.current.startTime = 0
    }
  }, [visible, groupRef, index])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    if (visible) {
      // Check if this card should start animating yet
      const currentTime = Date.now()
      const shouldAnimate = currentTime >= animationState.current.startTime
      
      if (!shouldAnimate) {
        // Stay at starting position until it's this card's turn
        return
      }
      
      // Calculate time since animation should have started for this card
      const animationProgress = Math.min(1, (currentTime - animationState.current.startTime) / ANIMATION_DELAYS.cardAnimationDuration)
      
      // Enhanced spring easing with more bounce
      const easeOutBack = (t: number) => {
        const c1 = 1.70158
        const c3 = c1 + 1
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
      }
      const easedProgress = easeOutBack(animationProgress)
      
      // Calculate target values
      const targetX = position[0]
      const targetY = hovered 
        ? position[1] + workCardPositions.hover.y
        : position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1
      const targetZ = hovered 
        ? position[2] + workCardPositions.hover.z
        : position[2]
      
      const targetScale = hovered ? 1.1 : 1
      const targetOpacity = 1
      
      // Enhanced spring-like animation with stronger bounce effect
      const baseSpeed = animationProgress < 1 ? 6 : 4 // Enhanced speed for spring effect
      const springMultiplier = 1 + Math.sin(easedProgress * Math.PI) * 0.3 // Add oscillation
      const animationSpeed = baseSpeed * springMultiplier
      const positionLerpSpeed = delta * animationSpeed
      const scaleLerpSpeed = delta * (animationSpeed + 2) // More responsive scaling
      
      // Animate position and scale with spring effect
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, positionLerpSpeed)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, positionLerpSpeed)
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, positionLerpSpeed)
      
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, scaleLerpSpeed))
      
      // Apply opacity using utility with smooth fade-in
      const firstMesh = groupRef.current.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh | undefined
      const currentOpacity = firstMesh?.material && 'opacity' in firstMesh.material ? firstMesh.material.opacity : 0
      const newOpacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity * easedProgress, delta * 6) // Slower opacity transition
      applyOpacityToObject(groupRef.current, newOpacity)
    } else {
      // Animate back to navigation button position when hiding
      const targetOpacity = 0
      const targetScale = 0.1
      
      // Return to navigation position with faster exit animation
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, NAVIGATION_POSITIONS.navigationButtonAbsolute[0], delta * 8)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, NAVIGATION_POSITIONS.navigationButtonAbsolute[1], delta * 8)
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, NAVIGATION_POSITIONS.navigationButtonAbsolute[2], delta * 8)
      
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 10))
      
      // Fade out using utility with faster exit
      const firstMesh = groupRef.current.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh | undefined
      const currentOpacity = firstMesh?.material && 'opacity' in firstMesh.material ? firstMesh.material.opacity : 1
      const newOpacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity, delta * 12)
      applyOpacityToObject(groupRef.current, newOpacity)
    }
    
    // Handle rotation animation
    const targetRotation = hovered ? 0.1 : 0
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, delta * 5)
  })

  return {
    isAnimated: animationState.current.isInitialized
  }
}