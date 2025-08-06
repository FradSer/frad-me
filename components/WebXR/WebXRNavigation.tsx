import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import dynamic from 'next/dynamic'
import * as THREE from 'three'
import { measureChunkLoad } from '@/utils/performance'

const Html = dynamic(
  () => measureChunkLoad('Html', () => import('@react-three/drei').then(mod => ({ default: mod.Html }))),
  { ssr: false }
)

const Text = dynamic(
  () => measureChunkLoad('Text', () => import('@react-three/drei').then(mod => ({ default: mod.Text }))),
  { ssr: false }
)

interface NavigationProps {
  currentSection: 'hero' | 'work'
  onNavigate: (section: 'hero' | 'work') => void
}

interface NavButtonProps {
  position: [number, number, number]
  text: string
  isActive: boolean
  onClick: () => void
}

const NavButton = ({ position, text, isActive, onClick }: NavButtonProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (meshRef.current) {
      // Pulse animation for active button
      if (isActive) {
        meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1)
      } else if (hovered) {
        meshRef.current.scale.setScalar(1.1)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? '#60a5fa' : hovered ? '#34d399' : '#6b7280'}
          transparent
          opacity={0.8}
          emissive={isActive ? '#1d4ed8' : '#000000'}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </mesh>
      
      <Text
        position={[0, -0.6, 0]}
        color={isActive ? '#60a5fa' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
        fontSize={0.25}
        font="fonts/GT-Eesti-Display-Bold-Trial.woff"
      >
        {text}
      </Text>
    </group>
  )
}

const NavigationMenu = ({ position }: { position: [number, number, number] }) => (
  <Html
    position={position}
    transform
    occlude
    distanceFactor={10}
  >
    <div className="bg-black bg-opacity-75 rounded-lg p-4 text-white text-center border border-gray-600">
      <div className="text-sm font-medium mb-2">Navigation</div>
      <div className="text-xs text-gray-300 space-y-1">
        <div>🎯 Point & Click - Interact</div>
        <div>🔄 Drag - Look Around</div>
        <div>⚡ VR/AR - Enhanced Experience</div>
      </div>
    </div>
  </Html>
)

function WebXRNavigation({ currentSection, onNavigate }: NavigationProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <group>
      {/* Navigation Buttons */}
      <NavButton
        position={[6, 3, 0]}
        text="Hero"
        isActive={currentSection === 'hero'}
        onClick={() => onNavigate('hero')}
      />
      
      <NavButton
        position={[6, 1, 0]}
        text="Work"
        isActive={currentSection === 'work'}
        onClick={() => onNavigate('work')}
      />

      {/* Menu Toggle */}
      <mesh
        position={[6, -1, 0]}
        onClick={() => setShowMenu(!showMenu)}
        onPointerOver={() => {}}
        onPointerOut={() => {}}
      >
        <boxGeometry args={[0.4, 0.4, 0.1]} />
        <meshStandardMaterial
          color={showMenu ? '#34d399' : '#6b7280'}
          transparent
          opacity={0.8}
        />
      </mesh>

      <Text
        position={[6, -1.6, 0]}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontSize={0.2}
        font="fonts/GT-Eesti-Display-Bold-Trial.woff"
      >
        Help
      </Text>

      {/* Navigation Menu */}
      {showMenu && <NavigationMenu position={[3, -1, 0]} />}

      {/* Navigation Lights */}
      <pointLight
        position={[6, 2, 1]}
        intensity={0.5}
        color={currentSection === 'hero' ? '#60a5fa' : '#34d399'}
        distance={3}
        decay={2}
      />
    </group>
  )
}

export default WebXRNavigation