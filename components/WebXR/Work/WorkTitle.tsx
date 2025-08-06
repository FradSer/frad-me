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

const Text = dynamic(
  () =>
    measureChunkLoad('Text', () =>
      import('@react-three/drei').then((mod) => ({ default: mod.Text })),
    ),
  { ssr: false },
)

interface WorkTitleProps {
  position: [number, number, number]
  currentSection: 'hero' | 'work'
}

const WorkTitle = ({ position, currentSection }: WorkTitleProps) => {
  const textRef = useRef<THREE.Group>(null)

  // Simplified spring animation - start from bottom, animate to final position
  const positionSpring = useSpringAnimation(
    [position[0], position[1] - 8, position[2]], // Start 8 units below final position
    SPRING_CONFIGS.workTitlePosition,
  )

  const scaleSpring = useSpringScalar(0, SPRING_CONFIGS.workTitleScale) // Start completely hidden
  const rotationYSpring = useSpringScalar(0, SPRING_CONFIGS.workTitleRotation)

  useEffect(() => {
    if (currentSection === 'work') {
      // Immediate entrance animation when work section becomes active
      positionSpring.set(position)
      scaleSpring.set(1)
      rotationYSpring.set(0.1)
    } else {
      // Reset to bottom position when not active
      positionSpring.set([position[0], position[1] - 8, position[2]])
      scaleSpring.set(0)
      rotationYSpring.set(0)
    }
  }, [currentSection, position, positionSpring, scaleSpring, rotationYSpring])

  useFrame(() => {
    if (!textRef.current) return

    // Apply spring values to mesh
    textRef.current.position.copy(positionSpring.value)
    textRef.current.scale.setScalar(scaleSpring.value)
    textRef.current.rotation.y = rotationYSpring.value
    
    // Handle visibility
    textRef.current.visible = scaleSpring.value > 0.01
  })

  return (
    <group ref={textRef}>
      <Text
        color="white"
        anchorX="center"
        anchorY="middle"
        fontSize={3}
        font="fonts/GT-Eesti-Display-Bold-Trial.woff"
        letterSpacing={0.1}
      >
        work
      </Text>
    </group>
  )
}

export default WorkTitle
