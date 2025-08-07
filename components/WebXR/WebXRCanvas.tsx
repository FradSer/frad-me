import React, { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'

interface WebXRCanvasProps {
  children: React.ReactNode
}

// Create a shared XR store for the entire application
export const xrStore = createXRStore()

const WebXRCanvas: React.FC<WebXRCanvasProps> = ({ children }) => {
  const { webXRSupported, isVisionPro } = useWebXRView()
  const [isXRActive, setIsXRActive] = useState(false)

  useEffect(() => {
    // Listen to XR state changes
    return xrStore.subscribe((state: any) => {
      setIsXRActive(!!state.session)
    })
  }, [])

  // Enhanced WebGL settings for Vision Pro
  const canvasSettings = {
    gl: {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance' as const,
      stencil: false,
      depth: true,
    },
    shadows: true,
    camera: {
      fov: isVisionPro ? 65 : 75,
      near: 0.1,
      far: 1000,
      position: [0, 0, 5] as [number, number, number],
    },
    style: {
      background: isXRActive ? 'transparent' : 'black',
      width: '100%',
      height: '100%',
    }
  }

  return (
    <Canvas {...canvasSettings}>
      {webXRSupported ? (
        <XR store={xrStore}>
          {children}
        </XR>
      ) : (
        children
      )}
    </Canvas>
  )
}

export default WebXRCanvas