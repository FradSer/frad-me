import React, { Suspense, useMemo } from 'react'

import { Html, AdaptiveDpr } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

interface SafeCanvasProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

const SafeLoadingFallback = () => (
  <Html center>
    <div className="flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      <span className="ml-3 text-white">Loading Safe 3D Mode...</span>
    </div>
  </Html>
)

const SafeCanvas: React.FC<SafeCanvasProps> = ({ children, fallback }) => {
  const safeGLSettings = useMemo(
    () => ({
      // Very conservative WebGL settings to avoid polyfill conflicts
      antialias: false,
      alpha: false,
      depth: true,
      stencil: false,
      powerPreference: 'default' as const,
      preserveDrawingBuffer: false,
      premultipliedAlpha: false,
      failIfMajorPerformanceCaveat: false,
    }),
    [],
  )

  const handleCanvasError = (error: any) => {
    console.error('Safe Canvas Error:', error)

    // If we're still getting errors, show the fallback
    if (fallback) {
      return fallback
    }

    // Last resort: show error message
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="max-w-md text-center text-white">
          <h1 className="mb-4 text-2xl font-bold">3D Mode Unavailable</h1>
          <p className="mb-6 text-gray-300">
            Your browser or device doesn&apos;t support the required 3D
            features.
          </p>
          <button
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const homeUrl = new URL('/', window.location.origin)
                window.location.href = homeUrl.toString()
              }
            }}
          >
            Visit Main Site
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Canvas
        dpr={1} // Fixed DPR to avoid scaling issues
        gl={safeGLSettings}
        camera={{
          position: [0, 0, 10],
          fov: 50,
          near: 0.1,
          far: 100, // Reduced far plane
        }}
        shadows={false} // Disable shadows completely for safety
        onError={handleCanvasError}
        onCreated={({ gl }) => {
          try {
            // Very basic WebGL setup without risky operations
            gl.setClearColor('#1e1b4b')
            console.log('Safe Canvas initialized successfully')
          } catch (contextError) {
            console.error('Safe Canvas context error:', contextError)
            throw contextError
          }
        }}
      >
        {/* Only essential performance components */}
        <AdaptiveDpr pixelated />

        <Suspense fallback={<SafeLoadingFallback />}>{children}</Suspense>
      </Canvas>
    </div>
  )
}

export default SafeCanvas
