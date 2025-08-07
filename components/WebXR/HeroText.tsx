import React, { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useFrame } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { measureChunkLoad } from '@/utils/performance'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { heroAnimationStates } from '@/utils/webxr/animationHelpers'
import { springConfigs } from '@/utils/webxr/springConfigs'

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

// Custom hook for interactive mesh behavior
const useInteractiveMesh = (rotationAxis: RotationAxis, rotationSpeed = 10) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation[rotationAxis] += delta / rotationSpeed
    }
  })

  const handlers = {
    onClick: () => setActive(!active),
    onPointerOver: () => setHovered(true),
    onPointerOut: () => setHovered(false)
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
  
  const targetState = currentView === 'work' ? heroAnimationStates.hidden : heroAnimationStates.home
  
  const { position, scale, opacity } = useSpring({
    position: [targetState.position.x, targetState.position.y, targetState.position.z] as [number, number, number],
    scale: [targetState.scale.x, targetState.scale.y, targetState.scale.z] as [number, number, number],
    opacity: targetState.opacity,
    config: springConfigs.heroTransition,
  })

  return (
    <animated.group 
      position={position}
      scale={scale}
    >
      <ambientLight intensity={Math.PI / 10} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <animated.group 
        opacity={opacity.to(o => o)}
      >
        {heroContent.map(renderElement)}
      </animated.group>
    </animated.group>
  )
}

export default HeroText
