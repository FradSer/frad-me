import React, { useRef, useEffect, useState, useMemo } from 'react'

import { Text, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TextContentProps {
  quality: 'high' | 'medium' | 'low'
}

interface BaseTextProps {
  text: string
  position: [number, number, number]
  size: number
  color: string
  delay: number
  quality: 'high' | 'medium' | 'low'
}

interface AnimatedTextProps extends BaseTextProps {
  animationType?: 'fade' | 'scale' | 'slide'
}

interface Text3DProps extends BaseTextProps {
  emissiveIntensity?: number
}

// Constants for better maintainability
const FONT_PATH = '/fonts/GT-Eesti-Display-Bold-Trial.woff'
const CHARACTER_SET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;':\",./<>? "

const ANIMATION_CONFIG = {
  fade: { frequency: 0.5, amplitude: 0.1, base: 0.9 },
  scale: { frequency: 2, amplitude: 0.05, base: 1 },
  slide: { frequency: 1, amplitude: 0.1, base: 0 },
  glow: { frequency: 3, amplitude: 0.1, base: 0.2 }
} as const

const QUALITY_CONFIG = {
  low: { maxWidth: 8, segments: 16, height: 0.1, curveSegments: 8 },
  medium: { maxWidth: 12, segments: 24, height: 0.1, curveSegments: 8 },
  high: { maxWidth: 12, segments: 24, height: 0.2, curveSegments: 12 }
} as const

// Reusable material configurations
const createStandardMaterial = (color: string, emissiveIntensity: number, transparent = false) => ({
  color,
  emissive: color,
  emissiveIntensity,
  ...(transparent ? { transparent: true, opacity: 0.9 } : { roughness: 0.1, metalness: 0.8 })
})

// Custom hook for delayed visibility
const useDelayedVisibility = (delay: number) => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])
  
  return isVisible
}

const AnimatedText = React.memo<AnimatedTextProps>(({
  text,
  position,
  size,
  color,
  delay,
  animationType = 'fade',
  quality
}) => {
  const textRef = useRef<THREE.Mesh>(null)
  const isVisible = useDelayedVisibility(delay)
  const qualityConfig = QUALITY_CONFIG[quality]

  useFrame((state) => {
    if (!textRef.current || !isVisible) return

    const time = state.clock.elapsedTime + delay
    const material = textRef.current.material as THREE.Material
    
    // Apply animation based on type
    switch (animationType) {
      case 'fade':
        if (material instanceof THREE.Material) {
          material.opacity = ANIMATION_CONFIG.fade.base + Math.sin(time * ANIMATION_CONFIG.fade.frequency) * ANIMATION_CONFIG.fade.amplitude
        }
        break
      case 'scale':
        textRef.current.scale.setScalar(ANIMATION_CONFIG.scale.base + Math.sin(time * ANIMATION_CONFIG.scale.frequency) * ANIMATION_CONFIG.scale.amplitude)
        break
      case 'slide':
        textRef.current.position.y = position[1] + Math.sin(time * ANIMATION_CONFIG.slide.frequency) * ANIMATION_CONFIG.slide.amplitude
        break
    }

    // Apply glow effect
    if (material instanceof THREE.MeshStandardMaterial) {
      material.emissiveIntensity = ANIMATION_CONFIG.glow.base + Math.sin(time * ANIMATION_CONFIG.glow.frequency) * ANIMATION_CONFIG.glow.amplitude
    }
  })

  const materialProps = useMemo(() => createStandardMaterial(color, 0.2, true), [color])
  
  return (
    <Text
      ref={textRef}
      position={position}
      fontSize={size}
      color={color}
      anchorX="center"
      anchorY="middle"
      font={FONT_PATH}
      characters={CHARACTER_SET}
      maxWidth={qualityConfig.maxWidth}
      textAlign="center"
      visible={isVisible}
    >
      {text}
      <meshStandardMaterial {...materialProps} />
    </Text>
  )
})

AnimatedText.displayName = 'AnimatedText'

const Text3D = React.memo<Text3DProps>(({
  text,
  position,
  size,
  color,
  emissiveIntensity = 0.3,
  delay,
  quality
}) => {
  const textRef = useRef<THREE.Mesh>(null)
  const qualityConfig = QUALITY_CONFIG[quality]

  useFrame((state) => {
    if (!textRef.current) return

    const time = state.clock.elapsedTime + delay
    textRef.current.rotation.y = Math.sin(time * 0.5) * 0.1
    textRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.02)
  })

  const materialProps = useMemo(() => createStandardMaterial(color, emissiveIntensity), [color, emissiveIntensity])
  
  const textProps = useMemo(() => ({
    position,
    fontSize: size,
    color,
    anchorX: "center" as const,
    anchorY: "middle" as const,
    font: FONT_PATH,
    bevelEnabled: quality === 'high',
    bevelSize: quality === 'high' ? 0.02 : 0,
    bevelThickness: quality === 'high' ? 0.01 : 0,
    height: qualityConfig.height,
    curveSegments: qualityConfig.curveSegments,
    castShadow: quality === 'high',
    receiveShadow: quality === 'high'
  }), [position, size, color, quality, qualityConfig])

  if (quality === 'low') {
    return (
      <AnimatedText
        text={text}
        position={position}
        size={size}
        color={color}
        delay={delay}
        animationType="fade"
        quality={quality}
      />
    )
  }

  return (
    <Text ref={textRef} {...textProps}>
      {text}
      <meshStandardMaterial {...materialProps} />
    </Text>
  )
})

Text3D.displayName = 'Text3D'

const FloatingTextBubble = React.memo<{
  text: string
  position: [number, number, number]
  delay: number
  quality: 'high' | 'medium' | 'low'
}>(({ text, position, delay, quality }) => {
  const groupRef = useRef<THREE.Group>(null)
  const qualityConfig = QUALITY_CONFIG[quality]

  useFrame((state) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime + delay
    groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.3
    groupRef.current.rotation.z = Math.sin(time * 0.8) * 0.05
  })

  const sphereGeometry = useMemo(() => 
    [text.length * 0.15, qualityConfig.segments, qualityConfig.segments] as [number, number, number],
    [text.length, qualityConfig.segments]
  )

  const bubbleMaterial = useMemo(() => ({
    color: "#1f2937",
    transparent: true,
    opacity: 0.3,
    roughness: 0.8
  }), [])

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      <mesh>
        <sphereGeometry args={sphereGeometry} />
        <meshStandardMaterial {...bubbleMaterial} />
      </mesh>
      
      <AnimatedText
        text={text}
        position={[0, 0, 0.1]}
        size={0.4}
        color="#ffffff"
        delay={delay}
        animationType="scale"
        quality={quality}
      />
    </group>
  )
})

FloatingTextBubble.displayName = 'FloatingTextBubble'

// Content configuration - exactly matching Hero component from pages/index.tsx
const HERO_TEXT_LINES = [
  { text: "Frad LEE", position: [0, 4, 0] as [number, number, number], size: 2.5, color: "#ffffff", delay: 0, emissiveIntensity: 0.5, type: "title" },
  { text: "is a self-taught craftier", position: [0, 2.5, 0] as [number, number, number], size: 1.2, color: "#9ca3af", delay: 0.3, emissiveIntensity: 0.2, type: "subtitle" },
  { text: "who is eager to learn for", position: [0, 1.5, 0] as [number, number, number], size: 1.2, color: "#9ca3af", delay: 0.6, emissiveIntensity: 0.2, type: "subtitle" },
  { text: "advancement. Whether it's", position: [0, 0.5, 0] as [number, number, number], size: 1.2, color: "#9ca3af", delay: 0.9, emissiveIntensity: 0.2, type: "subtitle" },
  { text: "coding", position: [-2, -0.5, 0] as [number, number, number], size: 1.2, color: "#ffffff", delay: 1.2, emissiveIntensity: 0.3, type: "highlight" },
  { text: "in a new language,", position: [2, -0.5, 0] as [number, number, number], size: 1.0, color: "#9ca3af", delay: 1.3, emissiveIntensity: 0.2, type: "subtitle" },
  { text: "design", position: [-2, -1.5, 0] as [number, number, number], size: 1.2, color: "#ffffff", delay: 1.5, emissiveIntensity: 0.3, type: "highlight" },
  { text: "with any tool whatsoever", position: [2.5, -1.5, 0] as [number, number, number], size: 1.0, color: "#9ca3af", delay: 1.6, emissiveIntensity: 0.2, type: "subtitle" },
  { text: "or building a", position: [-1.5, -2.5, 0] as [number, number, number], size: 1.0, color: "#9ca3af", delay: 1.8, emissiveIntensity: 0.2, type: "subtitle" },
  { text: "startup", position: [1.5, -2.5, 0] as [number, number, number], size: 1.2, color: "#ffffff", delay: 1.9, emissiveIntensity: 0.3, type: "highlight" }
] as const

const BUBBLE_TEXTS = [
  { text: "Creative", position: [-8, 2, -3] as [number, number, number], delay: 1 },
  { text: "Developer", position: [6, 3, -2] as [number, number, number], delay: 2 },
  { text: "Designer", position: [-4, -1, -4] as [number, number, number], delay: 3 },
  { text: "Innovator", position: [8, -2, -3] as [number, number, number], delay: 4 }
] as const

const HELP_TEXT_STYLE = {
  color: 'white',
  fontSize: '14px',
  textAlign: 'center' as const,
  userSelect: 'none' as const,
  pointerEvents: 'none' as const
}

const TextContent = React.memo<TextContentProps>(({ quality }) => {
  const showBubbles = quality !== 'low'
  const showHelpText = quality === 'high'

  return (
    <group position={[0, 0, -10]}>
      {HERO_TEXT_LINES.map((line, index) => (
        <Text3D
          key={`text-${index}`}
          text={line.text}
          position={line.position}
          size={line.size}
          color={line.color}
          delay={line.delay}
          quality={quality}
          emissiveIntensity={line.emissiveIntensity}
        />
      ))}

      {showBubbles && BUBBLE_TEXTS.map((bubble, index) => (
        <FloatingTextBubble
          key={`bubble-${index}`}
          text={bubble.text}
          position={bubble.position}
          delay={bubble.delay}
          quality={quality}
        />
      ))}

      {showHelpText && (
        <Html
          position={[0, -4, 0]}
          transform
          occlude
          style={HELP_TEXT_STYLE}
        >
          <div className="animate-pulse">
            ↑ Scroll or drag to explore ↑
          </div>
        </Html>
      )}
    </group>
  )
})

TextContent.displayName = 'TextContent'

export default TextContent