import { Canvas, useFrame } from '@react-three/fiber';
import { Controllers, XR, XRButton } from '@react-three/xr';
import { ReactNode, useRef } from 'react';

import useMousePosition from '../../hooks/useMousePosition';
import useWindowSize from '../../hooks/useWindowSize';
import useXRDetect from '../../hooks/useXRDetect';

type IGenericCanvasProps = {
  children: ReactNode;
};

function MouseMove({ children }: IGenericCanvasProps) {
  const mousePosition = useMousePosition();
  const windowSize = useWindowSize();

  const ref = useRef<any>();

  useFrame(() => {
    const positionX = mousePosition.x / windowSize.width;
    const positionY = mousePosition.y / windowSize.height;

    const delta = 0.1;

    ref.current.position.x = positionX * delta;
    ref.current.position.y = positionY * delta;
  });

  return <mesh ref={ref}>{children}</mesh>;
}

function GenericCanvas({ children }: IGenericCanvasProps) {
  const xrDetect = useXRDetect();

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
      <MouseMove>{children}</MouseMove>
    </Canvas>
  );
}

export default GenericCanvas;
