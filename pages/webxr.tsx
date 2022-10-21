import {
  Html,
  OrbitControls,
  PerspectiveCamera,
  Stars,
  Text,
} from '@react-three/drei';
import { useFrame, Canvas } from '@react-three/fiber';
import { Controllers, Interactive, useXR, XR, XRButton } from '@react-three/xr';
import { useState } from 'react';

import GenericCanvas from '../components/WebXR/GeneralCanvas';

import Hero from '../components/Landing/Hero';
import Model from '../components/WebXR/Model';
import XIGLogo from '../components/WebXR/XIGLogo';

function Children() {
  const deg2rad = (degrees: number) => degrees * (Math.PI / 180);
  return (
    <>
      <Html
        position={[1, 1, 5]}
        scale={[10, 1, 1]}
        rotation={[deg2rad(0), deg2rad(0), deg2rad(0)]}
        transform
        occlude
      >
        <Hero isWebXR={true} />
      </Html>
      <Stars
        radius={5}
        depth={50}
        count={500}
        factor={10}
        saturation={0}
        fade
      />
    </>
  );
}

const WebXR = () => {
  return <GenericCanvas children={<Children />} />;
};

export default WebXR;
