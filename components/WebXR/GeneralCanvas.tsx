import React, { ReactNode, useRef, useEffect, useState } from 'react'

import { Canvas, useFrame } from '@react-three/fiber'
import { XR, createXRStore} from '@react-three/xr'

import useMousePosition from '@/hooks/useMousePosition'
import useWindowSize from '@/hooks/useWindowSize'
import useXRDetect from '@/hooks/useXRDetect'
import { webxrErrorLogger } from '@/utils/errorLogger'

type IGenericCanvasProps = {
  children: ReactNode
}

const store = createXRStore()

function MouseMove({ children }: Readonly<IGenericCanvasProps>) {
  const mousePosition = useMousePosition()
  const windowSize = useWindowSize()
  const ref = useRef<any>()

  useFrame(() => {
    if (!ref.current) return
    
    const positionX = (mousePosition.x / windowSize.width) * 0.1
    const positionY = (mousePosition.y / windowSize.height) * 0.1

    ref.current.position.x = positionX
    ref.current.position.y = positionY
  })

  return <mesh ref={ref}>{children}</mesh>
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
    <Canvas
      style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3, #7c3aed)' }}
      camera={{
        position: [0, 0, 10],
        fov: 50
      }}
    >
      <color attach="background" args={['#1e1b4b']} />
      <fog attach="fog" args={['#1e1b4b', 15, 50]} />
      <MouseMove>{children}</MouseMove>
    </Canvas>
  )
}

export default GenericCanvas
