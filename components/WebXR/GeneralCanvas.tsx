import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Controllers, XR, XRButton } from '@react-three/xr';
import { ReactNode } from 'react';

import useXRDetect from '../../hooks/useXRDetect';

type IGenericCanvasProps = {
  children: ReactNode;
};

function GenericCanvas({ children }: IGenericCanvasProps) {
  const xrDetect = useXRDetect();

  const deg2rad = (degrees: number) => degrees * (Math.PI / 180);

  return xrDetect.isVR ? (
    <>
      <XRButton mode="VR" />
      <Canvas>
        <XR>
          <Controllers />
          {children}
        </XR>
      </Canvas>
    </>
  ) : (
    <Canvas>
      <PerspectiveCamera />
      <OrbitControls makeDefault />
      {children}
    </Canvas>
  );
}

export default GenericCanvas;
