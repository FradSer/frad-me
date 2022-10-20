import { Canvas } from '@react-three/fiber';
import { XR } from '@react-three/xr';
import { ReactNode } from 'react';

import useXRDetect from '../../hooks/useXRDetect';

type IGenericCanvasProps = {
  genericChildren: ReactNode;
  vrCanvasChildren: ReactNode;
  canvasChildren: ReactNode;
};

export default function GenericCanvas({
  genericChildren,
  vrCanvasChildren,
  canvasChildren,
}: IGenericCanvasProps) {
  const xrDetect = useXRDetect();

  return xrDetect.isVR ? (
    <Canvas>
      <XR>
        {vrCanvasChildren}
        {genericChildren}
      </XR>
    </Canvas>
  ) : (
    <Canvas>
      {canvasChildren}
      {genericChildren}
    </Canvas>
  );
}
