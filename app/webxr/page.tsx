'use client'

import React from 'react'
import { Metadata } from 'next'

import { Stars } from '@react-three/drei'

import GenericCanvas from '@/components/WebXR/GeneralCanvas'
import HeroText from '@/components/WebXR/HeroText'

export default function WebXR() {
  return (
    <div className="h-screen w-screen">
      <GenericCanvas>
        <mesh position={[0, 2, -10]}>
          <HeroText />
        </mesh>

        <Stars
          radius={5}
          depth={50}
          count={500}
          factor={10}
          saturation={0}
          fade
        />
      </GenericCanvas>
    </div>
  )
}