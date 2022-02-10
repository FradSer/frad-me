import { OrbitControls, PerspectiveCamera, Sky, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { DefaultXRControllers, Interactive, useXR, VRCanvas } from '@react-three/xr';
import { useEffect, useRef, useState } from 'react';

import useXRDetect from '../../hooks/useXRDetect';
import Model from './Model';

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

function Player() {
  const { player } = useXR();

  useFrame(() => {
    player.position.x = -1;
    player.position.y = 4;
    player.position.z = -3;
  });

  return null;
}

export default function WebXR() {
  const xrDetect = useXRDetect();

  const deg2rad = (degrees: number) => degrees * (Math.PI / 180);

  return xrDetect.isVR ? (
    <VRCanvas>
      <Sky sunPosition={[0, 10, 0]} />
      <ambientLight />
      <DefaultXRControllers />
      <Player />
      <pointLight position={[10, 10, 10]} />
      <Model />
    </VRCanvas>
  ) : (
    <Canvas>
      <Sky />
      <PerspectiveCamera
        position={[20, 20, 20]}
        rotation={[deg2rad(60), deg2rad(60), deg2rad(50)]}
        makeDefault
      />
      <OrbitControls />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Model />
    </Canvas>
  );
}
