'use client'

import { Stars } from '@react-three/drei'

import GenericCanvas from '@/components/WebXR/GeneralCanvas'
import HeroText from '@/components/WebXR/HeroText'

const STARS_CONFIG = {
  radius: 5,
  depth: 50,
  count: 500,
  factor: 10,
  saturation: 0,
  fade: true,
} as const

export default function WebXR() {
  return (
    <div className="h-screen w-screen">
      <GenericCanvas>
        <mesh position={[0, 2, -10]}>
          <HeroText />
        </mesh>
        <Stars {...STARS_CONFIG} />
      </GenericCanvas>
    </div>
  )
}
