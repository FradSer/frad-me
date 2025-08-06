import React, { Suspense, useEffect, useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, AdaptiveDpr } from '@react-three/drei'

import SafeCanvas from './SafeCanvas'
import { detectWebXRPolyfill, WebXRPolyfillDetection } from '@/utils/webxrDiagnostics'

interface IsolatedCanvasProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onPolyfillDetected?: (detection: WebXRPolyfillDetection) => void
}

// Store original WebGL constructors before any polyfill contamination
const OriginalWebGLRenderingContext = typeof window !== 'undefined' ? window.WebGLRenderingContext : null
const OriginalWebGL2RenderingContext = typeof window !== 'undefined' ? window.WebGL2RenderingContext : null

const IsolatedLoadingFallback = () => (
  <Html center>
    <div className="flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      <span className="ml-3 text-white">Loading Isolated 3D Mode...</span>
    </div>
  </Html>
)

const IsolatedCanvas: React.FC<IsolatedCanvasProps> = ({ 
  children, 
  fallback, 
  onPolyfillDetected 
}) => {
  const [polyfillDetection, setPolyfillDetection] = useState<WebXRPolyfillDetection | null>(null)
  const [isolationFailed, setIsolationFailed] = useState(false)

  useEffect(() => {
    const detection = detectWebXRPolyfill()
    setPolyfillDetection(detection)
    
    if (detection.detected) {
      console.warn('WebXR polyfill detected, using isolated mode:', detection)
      onPolyfillDetected?.(detection)
    }
  }, [onPolyfillDetected])

  // Create isolated WebGL context getter
  const createIsolatedContext = useMemo(() => {
    if (typeof window === 'undefined' || !OriginalWebGLRenderingContext) {
      return null
    }

    return (canvas: HTMLCanvasElement, contextId: string, attributes?: any) => {
      try {
        // Use original constructors to bypass polyfill
        let context: WebGLRenderingContext | WebGL2RenderingContext | null = null

        if (contextId === 'webgl' || contextId === 'experimental-webgl') {
          // Create context using original method
          context = canvas.getContext('webgl', {
            ...attributes,
            // Force conservative settings when polyfill detected
            antialias: polyfillDetection?.detected ? false : attributes?.antialias,
            powerPreference: 'default',
            failIfMajorPerformanceCaveat: false
          }) as WebGLRenderingContext

          if (!context && !polyfillDetection?.detected) {
            context = canvas.getContext('experimental-webgl', attributes) as WebGLRenderingContext
          }
        } else if (contextId === 'webgl2' && OriginalWebGL2RenderingContext) {
          context = canvas.getContext('webgl2', {
            ...attributes,
            antialias: polyfillDetection?.detected ? false : attributes?.antialias,
            powerPreference: 'default',
            failIfMajorPerformanceCaveat: false
          }) as WebGL2RenderingContext
        }

        if (context && polyfillDetection?.detected) {
          // Wrap critical methods to prevent null returns
          const originalGetShaderSource = context.getShaderSource
          context.getShaderSource = function(shader: WebGLShader): string | null {
            const source = originalGetShaderSource.call(this, shader)
            return source || ''
          }

          const originalGetShaderInfoLog = context.getShaderInfoLog
          context.getShaderInfoLog = function(shader: WebGLShader): string | null {
            const log = originalGetShaderInfoLog.call(this, shader)
            return log || ''
          }

          const originalGetProgramInfoLog = context.getProgramInfoLog
          context.getProgramInfoLog = function(program: WebGLProgram): string | null {
            const log = originalGetProgramInfoLog.call(this, program)
            return log || ''
          }
        }

        return context
      } catch (error) {
        console.error('Failed to create isolated WebGL context:', error)
        setIsolationFailed(true)
        return null
      }
    }
  }, [polyfillDetection])

  const isolatedGLSettings = useMemo(() => ({
    // Very conservative settings when polyfill detected
    antialias: polyfillDetection?.detected ? false : true,
    alpha: false,
    depth: true,
    stencil: false,
    powerPreference: 'default' as const,
    preserveDrawingBuffer: false,
    premultipliedAlpha: false,
    failIfMajorPerformanceCaveat: false
  }), [polyfillDetection])

  const handleCanvasError = (error: any) => {
    console.error('Isolated Canvas Error:', error)
    setIsolationFailed(true)
  }

  // Fall back to SafeCanvas if isolation failed or polyfill confidence is too high
  if (isolationFailed || (polyfillDetection?.confidence && polyfillDetection.confidence > 75)) {
    console.warn('Falling back to SafeCanvas due to isolation failure or high polyfill confidence')
    return fallback ? <>{fallback}</> : <SafeCanvas>{children}</SafeCanvas>
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {polyfillDetection?.detected && (
        <div className="absolute left-4 top-4 z-50 rounded bg-yellow-500 bg-opacity-90 p-2 text-xs text-black">
          <div className="font-semibold">⚠️ WebXR Extension Detected</div>
          <div>Using isolated rendering mode</div>
          <div className="text-xs opacity-75">
            Confidence: {polyfillDetection.confidence}% | Methods: {polyfillDetection.methods.join(', ')}
          </div>
        </div>
      )}

      <Canvas
        dpr={polyfillDetection?.detected ? 1 : [1, 2]}
        gl={isolatedGLSettings}
        camera={{
          position: [0, 0, 10],
          fov: 50,
          near: 0.1,
          far: 100
        }}
        shadows={polyfillDetection?.detected ? false : true}
        onError={handleCanvasError}
        onCreated={({ gl }) => {
          try {
            gl.setClearColor('#1e1b4b')
            
            // Test WebGL functionality using the underlying context
            const context = gl.getContext()
            if (context) {
              const testShader = context.createShader(context.VERTEX_SHADER)
              if (testShader) {
                context.shaderSource(testShader, 'attribute vec4 position; void main() { gl_Position = position; }')
                context.compileShader(testShader)
                
                if (!context.getShaderParameter(testShader, context.COMPILE_STATUS)) {
                  const error = context.getShaderInfoLog(testShader)
                  if (error && error.includes('polyfill')) {
                    throw new Error('Polyfill interference detected in shader compilation')
                  }
                }
                
                context.deleteShader(testShader)
              }
            }

            console.log('Isolated Canvas initialized successfully')
          } catch (contextError) {
            console.error('Isolated Canvas context error:', contextError)
            setIsolationFailed(true)
          }
        }}
      >
        <AdaptiveDpr pixelated />
        
        <Suspense fallback={<IsolatedLoadingFallback />}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  )
}

export default IsolatedCanvas