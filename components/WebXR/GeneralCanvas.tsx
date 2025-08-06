import React, { ReactNode, useRef } from 'react'
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

const xrStore = createXRStore()

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

const XRControls = () => (
  <div className="absolute bottom-4 left-0 right-0 z-50 m-auto h-60 w-60 text-5xl font-black text-white">
    <button onClick={() => xrStore.enterVR()}>Enter VR</button>
    <button onClick={() => xrStore.enterAR()}>Enter AR</button>
  </div>
)

const VRCanvas = ({ children }: CanvasProps) => (
  <div className="h-screen w-screen bg-black">
    <XRControls />
    <Canvas className="w-full">
      <XR store={xrStore}>{children}</XR>
    </Canvas>
  </div>
)

const StandardCanvas = ({ children }: CanvasProps) => (
  <Canvas>
    <MouseMove>{children}</MouseMove>
  </Canvas>
)

function GenericCanvas({ children }: CanvasProps) {
  const { isVR } = useXRDetect()
  
  return isVR ? 
    <VRCanvas>{children}</VRCanvas> : 
    <StandardCanvas>{children}</StandardCanvas>
}

export default GenericCanvas
