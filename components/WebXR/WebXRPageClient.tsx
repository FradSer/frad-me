'use client'

import { Suspense, useState, useCallback } from 'react'
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
const WebXRWork = dynamic(
  () => measureChunkLoad('WebXRWork', () => import('@/components/WebXR/WebXRWork')),
  { ssr: false }
)
const WebXRNavigation = dynamic(
  () => measureChunkLoad('WebXRNavigation', () => import('@/components/WebXR/WebXRNavigation')),
  { ssr: false }
)
const Stars = dynamic(
  () => measureChunkLoad('Stars', () => import('@react-three/drei').then(mod => ({ default: mod.Stars }))),
  { ssr: false }
)

const ENHANCED_STARS_CONFIG = {
  radius: 20,
  depth: 80,
  count: 800,
  factor: 15,
  saturation: 0,
  fade: true,
} as const

const LoadingFallback = () => (
  <div className="h-screen w-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
      <p className="text-white text-sm">Loading WebXR Experience...</p>
      <p className="text-gray-400 text-xs mt-2">Preparing immersive portfolio...</p>
    </div>
  </div>
)

type Section = 'hero' | 'work'

export default function WebXRPageClient() {
  const [currentSection, setCurrentSection] = useState<Section>('hero')

  const handleNavigate = useCallback((section: Section) => {
    setCurrentSection(section)
  }, [])

  return (
    <div className="h-screen w-screen bg-black">
      <WebXRErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <GenericCanvas>
            <Stars {...ENHANCED_STARS_CONFIG} />
            
            <group>
              {currentSection === 'hero' ? (
                <mesh position={[0, 2, -10]}>
                  <HeroText />
                </mesh>
              ) : (
                <WebXRWork />
              )}
            </group>

            <WebXRNavigation
              currentSection={currentSection}
              onNavigate={handleNavigate}
            />
          </GenericCanvas>
        </Suspense>
      </WebXRErrorBoundary>
    </div>
  )
}