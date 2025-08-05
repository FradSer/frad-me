import React, { ReactNode, useRef } from 'react'
import dynamic from 'next/dynamic'

import { useFrame } from '@react-three/fiber'
import { createXRStore } from '@react-three/xr'
import * as THREE from 'three'
import { measureChunkLoad } from '@/utils/performance'

// Dynamic imports for better code splitting
const Canvas = dynamic(
  () => measureChunkLoad('Canvas', () => import('@react-three/fiber').then(mod => ({ default: mod.Canvas }))),
  { ssr: false }
)
const XR = dynamic(
  () => measureChunkLoad('XR', () => import('@react-three/xr').then(mod => ({ default: mod.XR }))),
  { ssr: false }
)

import useMousePosition from '@/hooks/useMousePosition'
import useWindowSize from '@/hooks/useWindowSize'
import useXRDetect from '@/hooks/useXRDetect'

type IGenericCanvasProps = {
  children: ReactNode
}

const store = createXRStore()

function MouseMove({ children }: Readonly<IGenericCanvasProps>) {
  const mousePosition = useMousePosition()
  const windowSize = useWindowSize()

  const ref = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (ref.current) {
      const positionX = mousePosition.x / windowSize.width
      const positionY = mousePosition.y / windowSize.height

      const delta = 0.1

      ref.current.position.x = positionX * delta
      ref.current.position.y = positionY * delta
    }
  })

  return <mesh ref={ref}>{children}</mesh>
}

function GenericCanvas({ children }: IGenericCanvasProps) {
  const xrDetect = useXRDetect()

  return xrDetect.isVR ? (
    <div className="h-screen w-screen bg-black">
      <div
        className={
          'absolute bottom-4 left-0 right-0 z-50 m-auto h-60 w-60 text-5xl font-black text-white'
        }
      >
        <button onClick={() => store.enterVR()}>Enter VR</button>
        <button onClick={() => store.enterAR()}>Enter AR</button>
      </div>
      <Canvas className={'w-full'}>
        <XR store={store}>{children}</XR>
      </Canvas>
    </div>
  ) : (
    <Canvas>
      <MouseMove>{children}</MouseMove>
    </Canvas>
  )
}

export default GenericCanvas
