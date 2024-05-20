import React, { ReactNode, useRef } from 'react'

import { Canvas, useFrame } from '@react-three/fiber'
import { Controllers, XR, XRButton } from '@react-three/xr'

import useMousePosition from '@/hooks/useMousePosition'
import useWindowSize from '@/hooks/useWindowSize'
import useXRDetect from '@/hooks/useXRDetect'

type IGenericCanvasProps = {
  children: ReactNode
}

function MouseMove({ children }: Readonly<IGenericCanvasProps>) {
  const mousePosition = useMousePosition()
  const windowSize = useWindowSize()

  const ref = useRef<any>()

  useFrame(() => {
    const positionX = mousePosition.x / windowSize.width
    const positionY = mousePosition.y / windowSize.height

    const delta = 0.1

    ref.current.position.x = positionX * delta
    ref.current.position.y = positionY * delta
  })

  return <mesh ref={ref}>{children}</mesh>
}

function GenericCanvas({ children }: IGenericCanvasProps) {
  const xrDetect = useXRDetect()

  return xrDetect.isVR ? (
    <div className="w-screen h-screen bg-black">
      <div
        className={
          'absolute h-60 w-60 bottom-4 m-auto left-0 right-0 text-white text-5xl font-black z-50'
        }
      >
        <XRButton mode="VR" />
      </div>
      <Canvas className={'w-full'}>
        <XR>
          <Controllers />
          {children}
        </XR>
      </Canvas>
    </div>
  ) : (
    <Canvas>
      <MouseMove>{children}</MouseMove>
    </Canvas>
  )
}

export default GenericCanvas
