import React, { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { measureChunkLoad } from '@/utils/performance'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { useWebXRHeroText } from '@/hooks/useWebXRAnimation'
import WEBXR_ANIMATION_CONFIG from '@/utils/webxr/animationConfig'

const Text = dynamic(
  () => measureChunkLoad('Text', () => import('@react-three/drei').then(mod => ({ default: mod.Text }))),
  { ssr: false }
)

interface LineProps {
  position: [number, number, number]
  color: string
  text: string
}

interface ShapeProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

type RotationAxis = 'x' | 'y' | 'z'

// Enhanced interactive mesh with centralized animation configuration
const useInteractiveMesh = (rotationAxis: RotationAxis, rotationSpeed = 10) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)
  const { heroScale, heroActiveScale } = WEBXR_ANIMATION_CONFIG.timing.hover

  // Use centralized hero text animation hook
  const heroAnim = useWebXRHeroText()

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Base rotation
      meshRef.current.rotation[rotationAxis] += delta / rotationSpeed
      
      // Apply centralized interactive scale
      meshRef.current.scale.setScalar(heroAnim.interactiveScale)
      
      // Add interactive rotation based on interaction state
      const rotationIntensity = active ? 2 : hovered ? 1 : 0
      if (rotationAxis !== 'y') meshRef.current.rotation.y += rotationIntensity * delta
      if (rotationAxis !== 'x') meshRef.current.rotation.x += rotationIntensity * delta * 0.5
    }
  })

  const handlers = {
    onClick: () => {
      setActive(!active)
      if (active) {
        heroAnim.onInteractionEnd()
      } else {
        heroAnim.onInteractionStart()
      }
    },
    onPointerOver: () => {
      setHovered(true)
      if (!active) {
        heroAnim.onHover()
      }
    },
    onPointerOut: () => {
      setHovered(false)
      if (!active) {
        heroAnim.onInteractionEnd()
      }
    }
  }

  return { meshRef, hovered, active, handlers }
}

const Line = ({ position, color, text }: LineProps) => (
  <Text
    color={color}
    anchorX="center"
    anchorY="middle"
    fontSize={1}
    position={position}
    rotation={[0, 0, 0]}
    font="fonts/GT-Eesti-Display-Bold-Trial.woff"
    onClick={() => {/* Handle click event */}}
  >
    {text}
  </Text>
)

const InteractiveShape = ({ 
  children, 
  rotationAxis, 
  rotationSpeed, 
  ...props 
}: ShapeProps & { 
  children: React.ReactNode
  rotationAxis: RotationAxis
  rotationSpeed?: number
}) => {
  const { meshRef, hovered, handlers } = useInteractiveMesh(rotationAxis, rotationSpeed)

  return (
    <mesh {...props} ref={meshRef} {...handlers}>
      {children}
      <meshStandardMaterial color={hovered ? 'gray' : 'white'} />
    </mesh>
  )
}

const Box = (props: ShapeProps) => (
  <InteractiveShape {...props} rotationAxis="x">
    <boxGeometry args={[3, 1, 1]} />
  </InteractiveShape>
)

const Triangle = (props: ShapeProps) => (
  <InteractiveShape {...props} scale={1.5} rotationAxis="z">
    <coneGeometry args={[1, 1.4, 3, 1]} />
  </InteractiveShape>
)

const Sphere = (props: ShapeProps) => (
  <InteractiveShape {...props} scale={1.5} rotationAxis="y" rotationSpeed={5}>
    <sphereGeometry args={[0.65, 16, 16]} />
  </InteractiveShape>
)

// Content configuration for cleaner management
const heroContent = [
  { type: 'triangle', position: [-9, 4, 0] as [number, number, number], rotation: [0.1, 0.2, 0.1] as [number, number, number], scale: 0.5 },
  { type: 'line', position: [-5.3, 3, 0] as [number, number, number], color: 'white', text: 'Frad LEE' },
  { type: 'line', position: [2, 3, 0] as [number, number, number], color: 'gray', text: 'is a self-taught craftier' },
  { type: 'line', position: [-1.8, 1.8, 0] as [number, number, number], color: 'gray', text: 'who is eager to learn for' },
  { type: 'box', position: [5.7, 1.8, 0] as [number, number, number] },
  { type: 'line', position: [-1, 0.6, 0] as [number, number, number], color: 'gray', text: 'advancement. Whether it is' },
  { type: 'line', position: [-1.3, -0.6, 0] as [number, number, number], color: 'gray', text: 'coding in a new language,' },
  { type: 'line', position: [0.1, -1.8, 0] as [number, number, number], color: 'gray', text: 'design with any tool whatsoever' },
  { type: 'line', position: [-2.5, -3, 0] as [number, number, number], color: 'gray', text: 'or building a startup' },
  { type: 'sphere', position: [3.2, -4, 0] as [number, number, number] }
]

const renderElement = (element: typeof heroContent[0], index: number) => {
  const key = `${element.type}-${index}`
  
  switch (element.type) {
    case 'line':
      return <Line key={key} position={element.position} color={element.color!} text={element.text!} />
    case 'box':
      return <Box key={key} position={element.position} />
    case 'triangle':
      return <Triangle key={key} position={element.position} rotation={element.rotation} scale={element.scale} />
    case 'sphere':
      return <Sphere key={key} position={element.position} />
    default:
      return null
  }
}

function HeroText() {
  const { currentView } = useWebXRView()
  const groupRef = useRef<THREE.Group>(null)
  
  // Use centralized hero text animation
  const heroAnim = useWebXRHeroText()
  
  // Track current view for consistent updates
  const currentViewRef = useRef(currentView)

  // Use frame for consistent animation updates
  useFrame(() => {
    if (!groupRef.current) return
    
    // Update animation targets when view changes
    if (currentViewRef.current !== currentView) {
      if (currentView === 'work') {
        heroAnim.hide()
      } else {
        heroAnim.showHome()
      }
      currentViewRef.current = currentView
    }
    
    // Apply centralized animation transforms
    groupRef.current.position.set(heroAnim.position[0], heroAnim.position[1], heroAnim.position[2])
    groupRef.current.scale.set(heroAnim.scale[0], heroAnim.scale[1], heroAnim.scale[2])
    
    // Handle visibility using centralized threshold
    const shouldHide = heroAnim.opacity < WEBXR_ANIMATION_CONFIG.effects.opacity.visibilityThreshold
    groupRef.current.visible = !shouldHide
    
    // Apply centralized opacity to all materials
    if (groupRef.current.visible) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              if (material instanceof THREE.MeshStandardMaterial || 
                  material instanceof THREE.MeshBasicMaterial) {
                material.opacity = heroAnim.opacity
                material.transparent = true
              }
            })
          } else {
            const material = child.material
            if (material instanceof THREE.MeshStandardMaterial || 
                material instanceof THREE.MeshBasicMaterial) {
              material.opacity = heroAnim.opacity
              material.transparent = true
            }
          }
        }
      })
    }
  })

  return (
    <group 
      ref={groupRef}
    >
      <ambientLight intensity={Math.PI / 10} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <group>
        {heroContent.map(renderElement)}
      </group>
    </group>
  )
}

export default HeroText
