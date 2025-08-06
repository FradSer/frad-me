'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import WebXRErrorBoundary from '@/components/common/WebXRErrorBoundary'
import { measureChunkLoad } from '@/utils/performance'

// Dynamic imports for bundle optimization
const GenericCanvas = dynamic(
  () => measureChunkLoad('GenericCanvas', () => import('@/components/WebXR/GeneralCanvas')),
  { ssr: false }
)
const HeroText = dynamic(
  () => measureChunkLoad('HeroText', () => import('@/components/WebXR/HeroText')),
  { ssr: false }
)
const Stars = dynamic(
  () => measureChunkLoad('Stars', () => import('@react-three/drei').then(mod => ({ default: mod.Stars }))),
  { ssr: false }
)

const STARS_CONFIG = {
  radius: 5,
  depth: 50,
  count: 500,
  factor: 10,
  saturation: 0,
  fade: true,
} as const

const LoadingFallback = () => (
  <div className="h-screen w-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
      <p className="text-white text-sm">Loading WebXR Experience...</p>
    </div>
  </div>
)

export default function WebXR() {
  return (
    <div className="h-screen w-screen">
      <WebXRErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <GenericCanvas>
            <mesh position={[0, 2, -10]}>
              <HeroText />
            </mesh>
            <Stars {...STARS_CONFIG} />
          </GenericCanvas>
        </Suspense>
      </WebXRErrorBoundary>
    </div>
  )
}
