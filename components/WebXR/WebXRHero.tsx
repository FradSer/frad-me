import React, { useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { measureChunkLoad } from '@/utils/performance'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

const Text = dynamic(
  () => measureChunkLoad('Text', () => import('@react-three/drei').then(mod => ({ default: mod.Text }))),
  { ssr: false }
)

const Html = dynamic(
  () => measureChunkLoad('Html', () => import('@react-three/drei').then(mod => ({ default: mod.Html }))),
  { ssr: false }
)

interface TextElementProps {
  position: [number, number, number]
  color: string
  text: string
  fontSize?: number
  isBold?: boolean
  onClick?: () => void
}

interface ShapeProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  onClick?: () => void
}

type RotationAxis = 'x' | 'y' | 'z'

const heroText = `
Frad LEE is a self-taught craftier
who is eager to learn for advancement. Whether it's
coding in a new language,
design with any tool whatsoever
or building a startup.
`

const useInteractiveMesh = (rotationAxis: RotationAxis, rotationSpeed = 8) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation[rotationAxis] += delta / rotationSpeed
      if (hovered) {
        meshRef.current.scale.setScalar(1.1 + Math.sin(Date.now() * 0.005) * 0.05)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }
  })

  const handlers = {
    onClick: () => setActive(!active),
    onPointerOver: () => setHovered(true),
    onPointerOut: () => setHovered(false)
  }

  return { meshRef, hovered, active, handlers }
}

const TextElement = ({ position, color, text, fontSize = 0.8, isBold = false, onClick }: TextElementProps) => (
  <Text
    color={color}
    anchorX="left"
    anchorY="middle"
    fontSize={fontSize}
    position={position}
    font="fonts/GT-Eesti-Display-Bold-Trial.woff"
    onClick={onClick}
  >
    {text}
  </Text>
)

const Triangle = ({ onClick, ...props }: ShapeProps) => {
  const { meshRef, hovered, handlers } = useInteractiveMesh('z', 5)

  return (
    <mesh {...props} ref={meshRef} {...handlers} onClick={onClick}>
      <coneGeometry args={[0.5, 0.8, 3]} />
      <meshStandardMaterial 
        color={hovered ? '#60a5fa' : 'white'} 
        transparent
        opacity={hovered ? 0.9 : 0.7}
      />
    </mesh>
  )
}

const Rectangle = ({ onClick, ...props }: ShapeProps) => {
  const { meshRef, hovered, handlers } = useInteractiveMesh('x', 6)

  return (
    <mesh {...props} ref={meshRef} {...handlers} onClick={onClick}>
      <boxGeometry args={[2, 0.6, 0.3]} />
      <meshStandardMaterial 
        color={hovered ? '#34d399' : 'white'}
        transparent
        opacity={hovered ? 0.9 : 0.7}
      />
    </mesh>
  )
}

const DotCircle = ({ onClick, ...props }: ShapeProps) => {
  const { meshRef, hovered, handlers } = useInteractiveMesh('y', 4)

  return (
    <mesh {...props} ref={meshRef} {...handlers} onClick={onClick}>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshStandardMaterial 
        color={hovered ? '#f59e0b' : 'white'}
        transparent
        opacity={hovered ? 0.9 : 0.7}
      />
    </mesh>
  )
}

const SpeechButton = ({ isSupported, isSpeaking, onSpeak, onStop }: {
  isSupported: boolean
  isSpeaking: boolean
  onSpeak: () => void
  onStop: () => void
}) => {
  if (!isSupported) return null

  return (
    <Html
      position={[-8, 5, 0]}
      transform
      occlude
      distanceFactor={10}
    >
      <button
        onClick={isSpeaking ? onStop : onSpeak}
        className="rounded bg-gray-200 p-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        style={{ minWidth: '40px', minHeight: '40px' }}
      >
        {isSpeaking ? '⏹' : '▶'}
      </button>
    </Html>
  )
}

function WebXRHero() {
  const { isSupported, isSpeaking, speak, stop } = useSpeechSynthesis()

  const handleSpeak = useCallback(() => {
    speak(heroText, 'Fred')
  }, [speak])

  const handleWorkScroll = useCallback(() => {
    // In WebXR, we'll animate to work section instead of scrolling
    console.log('Navigate to work section')
  }, [])

  return (
    <group position={[0, 0, -5]}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <spotLight position={[-10, 10, 10]} angle={0.3} intensity={0.5} />

      <SpeechButton
        isSupported={isSupported}
        isSpeaking={isSpeaking}
        onSpeak={handleSpeak}
        onStop={stop}
      />

      {/* Triangle */}
      <Triangle position={[-7.5, 2.5, 0]} scale={1.2} />

      {/* Hero Text Lines */}
      <TextElement
        position={[-6, 2.5, 0]}
        color="white"
        text="Frad LEE"
        fontSize={1.2}
        isBold
      />
      <TextElement
        position={[-1.5, 2.5, 0]}
        color="#9ca3af"
        text="is a self-taught craftier"
        fontSize={0.9}
      />

      <TextElement
        position={[-6, 1.5, 0]}
        color="#9ca3af"
        text="who is eager to learn for"
        fontSize={0.9}
      />
      <Rectangle position={[1.5, 1.5, 0]} />

      <TextElement
        position={[-6, 0.5, 0]}
        color="#9ca3af"
        text="advancement. Whether it's"
        fontSize={0.9}
      />

      <TextElement
        position={[-6, -0.5, 0]}
        color="white"
        text="coding"
        fontSize={1}
        isBold
      />
      <TextElement
        position={[-3.5, -0.5, 0]}
        color="#9ca3af"
        text="in a new language,"
        fontSize={0.9}
      />

      <TextElement
        position={[-6, -1.5, 0]}
        color="white"
        text="design"
        fontSize={1}
        isBold
      />
      <TextElement
        position={[-3.5, -1.5, 0]}
        color="#9ca3af"
        text="with any tool whatsoever"
        fontSize={0.9}
      />

      <TextElement
        position={[-6, -2.5, 0]}
        color="#9ca3af"
        text="or building a"
        fontSize={0.9}
      />
      <TextElement
        position={[-2.5, -2.5, 0]}
        color="white"
        text="startup"
        fontSize={1}
        isBold
      />
      <DotCircle position={[0.5, -2.5, 0]} onClick={handleWorkScroll} />
    </group>
  )
}

export default WebXRHero