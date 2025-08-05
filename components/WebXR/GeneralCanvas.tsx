import React, { ReactNode, useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useFrame } from '@react-three/fiber'
import { createXRStore } from '@react-three/xr'
import * as THREE from 'three'
import { measureChunkLoad } from '@/utils/performance'
import useMousePosition from '@/hooks/useMousePosition'
import useWindowSize from '@/hooks/useWindowSize'
import useXRDetect from '@/hooks/useXRDetect'
import { webxrErrorLogger } from '@/utils/errorLogger'

type CanvasProps = {
  children: ReactNode
}

interface IGenericCanvasProps {
  children: ReactNode
}

// Dynamic imports for code splitting
const Canvas = dynamic(
  () => measureChunkLoad('Canvas', () => 
    import('@react-three/fiber').then(mod => ({ default: mod.Canvas }))
  ),
  { ssr: false }
)

const XR = dynamic(
  () => measureChunkLoad('XR', () => 
    import('@react-three/xr').then(mod => ({ default: mod.XR }))
  ),
  { ssr: false }
)

const store = createXRStore()

const MouseMove = ({ children }: CanvasProps) => {
  const mousePosition = useMousePosition()
  const windowSize = useWindowSize()
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    
    const deltaX = (mousePosition.x / windowSize.width) * 0.1
    const deltaY = (mousePosition.y / windowSize.height) * 0.1
    
    meshRef.current.position.set(deltaX, deltaY, 0)
  })

  return <mesh ref={meshRef}>{children}</mesh>
}

function GenericCanvas({ children }: IGenericCanvasProps) {
  const xrDetect = useXRDetect()
  const [webglError, setWebglError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleWebGLContextLost = (event: Event) => {
      event.preventDefault()
      const error = new Error('WebGL context lost')
      webxrErrorLogger.logError(error)
      setWebglError('WebGL context was lost. Please refresh the page.')
    }

    const handleWebGLContextRestored = () => setWebglError(null)

    window.addEventListener('webglcontextlost', handleWebGLContextLost)
    window.addEventListener('webglcontextrestored', handleWebGLContextRestored)

    return () => {
      window.removeEventListener('webglcontextlost', handleWebGLContextLost)
      window.removeEventListener('webglcontextrestored', handleWebGLContextRestored)
    }
  }, [])

  const handleXRAction = (action: () => void) => {
    try {
      action()
    } catch (error) {
      webxrErrorLogger.logError(error as Error)
      throw error
    }
  }

  if (webglError) {
    throw new Error(webglError)
  }

  if (xrDetect.isVR) {
    return (
      <div className="h-screen w-screen bg-black">
        <div className="absolute bottom-4 left-0 right-0 z-50 m-auto h-60 w-60 text-5xl font-black text-white">
          <button onClick={() => handleXRAction(() => store.enterVR())}>
            Enter VR
          </button>
          <button onClick={() => handleXRAction(() => store.enterAR())}>
            Enter AR
          </button>
        </div>
        <Canvas className="w-full">
          <XR store={store}>{children}</XR>
        </Canvas>
      </div>
    )
  }

  return (
    <Canvas>
      <MouseMove>{children}</MouseMove>
    </Canvas>
  )
}

export default GenericCanvas
