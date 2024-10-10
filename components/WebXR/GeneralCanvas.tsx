import React, { ReactNode, useRef } from 'react'

import { Canvas, useFrame } from '@react-three/fiber'
import { XR, createXRStore} from '@react-three/xr'

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
    <div className="h-screen w-screen bg-black">
      <div
        className={
          'absolute bottom-4 left-0 right-0 z-50 m-auto h-60 w-60 text-5xl font-black text-white'
        }
      >
        <button onClick={() => store.enterVR()}>Enter</button>
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
