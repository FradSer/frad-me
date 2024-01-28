import React from 'react'

import dynamic from 'next/dynamic'

import { Stars } from '@react-three/drei'
import { Controllers, XR, XRButton } from '@react-three/xr'
import { useControls } from 'leva'

import Hero from '@/components/Landing/Hero'
import GenericCanvas from '@/components/WebXR/GeneralCanvas'
import HeroText from '@/components/WebXR/HeroText'

const Html = dynamic(() => import('../components/WebXR/Html'), { ssr: false })

const WebXR = () => {
  // const deg2rad = (degrees: number) => degrees * (Math.PI / 180)
  // const { positionX, positionY, positionZ, rotationX, rotationY, rotationZ } =
  //   useControls({
  //     positionX: 0,
  //     positionY: 0,
  //     positionZ: -10,
  //     rotationX: 0,
  //     rotationY: 0,
  //     rotationZ: 0,
  //   })

  return (
    <div className="h-screen w-screen">
      <GenericCanvas>
        {/*<mesh*/}
        {/*  position={[positionX, positionY, positionZ]}*/}
        {/*  rotation={[*/}
        {/*    deg2rad(rotationX),*/}
        {/*    deg2rad(rotationY),*/}
        {/*    deg2rad(rotationZ),*/}
        {/*  ]}*/}
        {/*>*/}
        {/*  <HeroText />*/}
        {/*</mesh>*/}
        <mesh position={[0, 2, -10]}>
          <HeroText />
        </mesh>

        <Stars
          radius={5}
          depth={50}
          count={500}
          factor={10}
          saturation={0}
          fade
        />
      </GenericCanvas>
    </div>
  )
}

export default WebXR
