import {
  OrbitControls,
  PerspectiveCamera,
  Stars,
  Text,
} from '@react-three/drei';
import { useFrame, Canvas } from '@react-three/fiber';
import { Controllers, Interactive, useXR, XR, XRButton } from '@react-three/xr';
import { useState } from 'react';
import { useControls } from 'leva';

import GenericCanvas from '../components/WebXR/GeneralCanvas';
import Html from '../components/WebXR/Html';

import Hero from '../components/Landing/Hero';
import Model from '../components/WebXR/Model';
import XIGLogo from '../components/WebXR/XIGLogo';

const WebXR = () => {
  const deg2rad = (degrees: number) => degrees * (Math.PI / 180);
  const { positionX, positionY, positionZ, rotationX, rotationY, rotationZ } =
    useControls({
      positionX: 0,
      positionY: 1,
      positionZ: -1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
    });

  return (
    <GenericCanvas>
      <mesh
        position={[positionX, positionY, positionZ]}
        rotation={[deg2rad(rotationX), deg2rad(rotationY), deg2rad(rotationZ)]}
      >
        <Html width={1} height={1}>
          <Hero isWebXR={true} />
        </Html>
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
  );
};

export default WebXR;
