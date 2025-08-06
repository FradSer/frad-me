import React, { useRef, useEffect } from 'react'

import dynamic from 'next/dynamic'

import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useSpringAnimation, useSpringScalar } from '@/hooks/useSpringAnimation'

import { measureChunkLoad } from '@/utils/performance'
import {
  SPRING_CONFIGS,
  ENTRANCE_POSITIONS,
} from '@/utils/webxr/animationConstants'
import { applyOpacityToObject } from '@/utils/webxr/materialUtils'

const HeroText = dynamic(
  () =>
    measureChunkLoad('HeroText', () => import('@/components/WebXR/HeroText')),
  { ssr: false },
)

interface AnimatedHeroSectionProps {
  currentSection: 'hero' | 'work'
}

function AnimatedHeroSection({ currentSection }: AnimatedHeroSectionProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Use centralized spring animation hooks
  const positionSpring = useSpringAnimation(
    ENTRANCE_POSITIONS.heroDefault,
    SPRING_CONFIGS.heroPosition,
  )

  const scaleSpring = useSpringScalar(1, SPRING_CONFIGS.heroScale)
  const opacitySpring = useSpringScalar(1, SPRING_CONFIGS.heroOpacity)

  useEffect(() => {
    if (currentSection === 'hero') {
      positionSpring.set(ENTRANCE_POSITIONS.heroDefault)
      scaleSpring.set(1.0) // Ensure exact scale
      opacitySpring.set(1.0) // Ensure full opacity
    } else {
      // Immediately hide hero when switching to work
      positionSpring.set(ENTRANCE_POSITIONS.heroHidden)
      scaleSpring.set(0.0) // Make completely invisible when hidden
      opacitySpring.set(0.0) // Make completely transparent
    }
  }, [currentSection, positionSpring, scaleSpring, opacitySpring])

  useFrame(() => {
    if (!meshRef.current) return

    // Apply spring values to mesh
    meshRef.current.position.copy(positionSpring.value)
    meshRef.current.scale.setScalar(scaleSpring.value)

    // Handle visibility - completely hide when opacity is near 0
    const currentOpacity = opacitySpring.value
    meshRef.current.visible = currentOpacity > 0.01
    
    // Apply opacity using optimized utility
    if (meshRef.current.visible) {
      applyOpacityToObject(meshRef.current, currentOpacity)
    }
  })

  return (
    <mesh ref={meshRef}>
      <group userData={{ interactive: currentSection === 'hero' }}>
        <HeroText />
      </group>
    </mesh>
  )
}

export default AnimatedHeroSection
