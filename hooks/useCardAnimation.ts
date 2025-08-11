import { useRef, useEffect, RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { workCardPositions } from '@/utils/webxr/animationHelpers'
import { NAVIGATION_POSITIONS } from '@/utils/webxr/animationConstants'
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
}

export const useCardAnimation = ({ 
  groupRef, 
  visible, 
  hovered, 
  position, 
  index 
}: UseCardAnimationProps) => {
  const animationState = useRef<AnimationState>({ isInitialized: false })

  // Initialize position when first becoming visible
  useEffect(() => {
    if (visible && !animationState.current.isInitialized && groupRef.current) {
      groupRef.current.position.set(...NAVIGATION_POSITIONS.navigationButtonAbsolute)
      groupRef.current.scale.setScalar(0.1)
      animationState.current.isInitialized = true
    }
  }, [visible, groupRef])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    if (visible) {
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
      
      // Animation speeds with staggered delay
      const animationSpeed = 3 + index * 0.5
      const positionLerpSpeed = delta * animationSpeed
      const scaleLerpSpeed = delta * (animationSpeed + 2)
      
      // Animate position and scale
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, positionLerpSpeed)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, positionLerpSpeed)
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, positionLerpSpeed)
      
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, scaleLerpSpeed))
      
      // Apply opacity using utility
      const firstMesh = groupRef.current.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh | undefined
      const currentOpacity = firstMesh?.material && 'opacity' in firstMesh.material ? firstMesh.material.opacity : 0
      const newOpacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity, delta * 8)
      applyOpacityToObject(groupRef.current, newOpacity)
    } else {
      // Animate back to navigation button position when hiding
      const targetOpacity = 0
      const targetScale = 0.1
      
      // Return to navigation position
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, NAVIGATION_POSITIONS.navigationButtonAbsolute[0], delta * 5)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, NAVIGATION_POSITIONS.navigationButtonAbsolute[1], delta * 5)
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, NAVIGATION_POSITIONS.navigationButtonAbsolute[2], delta * 5)
      
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 8))
      
      // Fade out using utility
      const firstMesh = groupRef.current.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh | undefined
      const currentOpacity = firstMesh?.material && 'opacity' in firstMesh.material ? firstMesh.material.opacity : 1
      const newOpacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity, delta * 10)
      applyOpacityToObject(groupRef.current, newOpacity)
      
      // Reset initialization when fully hidden to allow re-animation
      if (groupRef.current.scale.x < 0.15) {
        animationState.current.isInitialized = false
      }
    }
    
    // Handle rotation animation
    const targetRotation = hovered ? 0.1 : 0
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, delta * 5)
  })

  return {
    isAnimated: animationState.current.isInitialized
  }
}