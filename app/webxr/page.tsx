'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import WebXRErrorBoundary from '@/components/common/WebXRErrorBoundary'
import WebXR3DErrorBoundary from '@/components/WebXR/WebXR3DErrorBoundary'
import { WebXRViewProvider } from '@/contexts/WebXR/WebXRViewContext'
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
const Navigation3D = dynamic(
  () => measureChunkLoad('Navigation3D', () => import('@/components/WebXR/Navigation3D')),
  { ssr: false }
)
const FooterLinks3D = dynamic(
  () => measureChunkLoad('FooterLinks3D', () => import('@/components/WebXR/FooterLinks3D')),
  { ssr: false }
)
const WorkGrid3D = dynamic(
  () => measureChunkLoad('WorkGrid3D', () => import('@/components/WebXR/WorkGrid3D')),
  { ssr: false }
)
const CameraController3D = dynamic(
  () => measureChunkLoad('CameraController3D', () => import('@/components/WebXR/CameraController3D')),
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
        <WebXRViewProvider>
          <Suspense fallback={<LoadingFallback />}>
            <GenericCanvas>
              <WebXR3DErrorBoundary componentName="CameraController3D">
                <CameraController3D />
              </WebXR3DErrorBoundary>
              <WebXR3DErrorBoundary componentName="HeroText">
                <HeroText />
              </WebXR3DErrorBoundary>
              <WebXR3DErrorBoundary componentName="WorkGrid3D">
                <WorkGrid3D />
              </WebXR3DErrorBoundary>
              <WebXR3DErrorBoundary componentName="Navigation3D">
                <Navigation3D />
              </WebXR3DErrorBoundary>
              <WebXR3DErrorBoundary componentName="FooterLinks3D">
                <FooterLinks3D />
              </WebXR3DErrorBoundary>
              <WebXR3DErrorBoundary componentName="Stars">
                <Stars {...STARS_CONFIG} />
              </WebXR3DErrorBoundary>
            </GenericCanvas>
          </Suspense>
        </WebXRViewProvider>
      </WebXRErrorBoundary>
    </div>
  )
}
