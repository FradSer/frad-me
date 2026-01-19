import { Canvas } from '@react-three/fiber';
import { createXRStore, XR } from '@react-three/xr';
import { memo, useEffect, useMemo, useState } from 'react';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import type { XRStoreState } from '@/types/webxr';

interface WebXRCanvasProps {
  children: React.ReactNode;
}

export const xrStore = createXRStore();

const CAMERA_CONFIG = {
  visionPro: {
    fov: 65,
    near: 0.1,
    far: 1000,
    position: [0, 0, 5] as [number, number, number],
  },
  default: {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: [0, 0, 5] as [number, number, number],
  },
} as const;

const GL_CONFIG = {
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance' as const,
  stencil: false,
  depth: true,
} as const;

const WebXRCanvas = memo<WebXRCanvasProps>(function WebXRCanvas({ children }) {
  const { webXRSupported, isVisionPro } = useWebXRView();
  const [isXRActive, setIsXRActive] = useState(false);

  useEffect(() => {
    return xrStore.subscribe((state: XRStoreState) => {
      setIsXRActive(!!state.session);
    });
  }, []);

  const canvasSettings = useMemo(() => {
    const cameraConfig = isVisionPro ? CAMERA_CONFIG.visionPro : CAMERA_CONFIG.default;

    return {
      gl: GL_CONFIG,
      shadows: true,
      camera: cameraConfig,
      style: {
        background: isXRActive ? 'transparent' : 'black',
        width: '100%',
        height: '100%',
      },
    };
  }, [isVisionPro, isXRActive]);

  return (
    <Canvas {...canvasSettings} data-testid="webxr-canvas">
      {webXRSupported ? <XR store={xrStore}>{children}</XR> : children}
    </Canvas>
  );
});

export default WebXRCanvas;
