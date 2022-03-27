import {
  Html,
  OrbitControls,
  PerspectiveCamera,
  Sky,
  Text,
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { DefaultXRControllers, Interactive, useXR } from '@react-three/xr';
import { useState } from 'react';

import Hero from '../components/Landing/Hero';
import GenericCanvas from '../components/WebXR/GeneralCanvas';
import Model from '../components/WebXR/Model';
import XIGLogo from '../components/WebXR/XIGLogo';

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeBufferGeometry attach="geometry" args={[40, 40]} />
      <meshStandardMaterial attach="material" color="#666" />
    </mesh>
  );
}

function Box({ color, size, scale, children, ...rest }: any) {
  return (
    <mesh scale={scale} {...rest}>
      <boxBufferGeometry attach="geometry" args={size} />
      <meshPhongMaterial attach="material" color={color} />
      {children}
    </mesh>
  );
}

function Button(props: any) {
  const [hover, setHover] = useState(false);
  const [color, setColor] = useState(0x123456);

  const onSelect = () => {
    setColor((Math.random() * 0xffffff) | 0);
  };

  return (
    <Interactive
      onSelect={onSelect}
      onHover={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <Box
        color={color}
        scale={hover ? [1.5, 1.5, 1.5] : [1, 1, 1]}
        size={[0.4, 0.1, 0.1]}
        {...props}
      >
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.05}
          color="#000"
          anchorX="center"
          anchorY="middle"
        >
          Hello, Frad LEE!
        </Text>
      </Box>
    </Interactive>
  );
}

function GenericChildren() {
  const deg2rad = (degrees: number) => degrees * (Math.PI / 180);
  return (
    <>
      <Html
        position={[-3.3, 4.2, -6.19]}
        scale={[0.04, 0.04, 0.04]}
        rotation={[deg2rad(0), deg2rad(26), deg2rad(0)]}
        transform
        occlude
      >
        <Hero isWebXR={true} />
      </Html>
      <Sky sunPosition={[0, 10, 0]} />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Model />
      <XIGLogo />
    </>
  );
}

function CanvasChildren() {
  const deg2rad = (degrees: number) => degrees * (Math.PI / 180);

  return (
    <>
      <PerspectiveCamera
        position={[20, 20, 20]}
        rotation={[deg2rad(60), deg2rad(60), deg2rad(50)]}
        makeDefault
      />
      <OrbitControls />
    </>
  );
}

function Player() {
  const { player } = useXR();

  useFrame(() => {
    player.position.x = -1;
    player.position.y = 4;
    player.position.z = -3;
  });

  return null;
}

function VRCanvasChildren() {
  return (
    <>
      <DefaultXRControllers />
      <Player />
    </>
  );
}

export default function WebXR() {
  return (
    <div className="h-screen w-screen">
      <GenericCanvas
        genericChildren={<GenericChildren />}
        vrCanvasChildren={<VRCanvasChildren />}
        canvasChildren={<CanvasChildren />}
      />
    </div>
  );
}
