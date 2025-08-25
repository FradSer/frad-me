import type React from 'react';
import { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import type { XRStoreState } from '@/types/webxr';

interface WebXRCanvasProps {
  children: React.ReactNode;
}

// Create a shared XR store for the entire application
export const xrStore = createXRStore();

const WebXRCanvas: React.FC<WebXRCanvasProps> = ({ children }) => {
  const { webXRSupported, isVisionPro } = useWebXRView();
  const [isXRActive, setIsXRActive] = useState(false);

  useEffect(() => {
    // Listen to XR state changes with properly typed callback
    return xrStore.subscribe((state: XRStoreState) => {
      setIsXRActive(!!state.session);
    });
  }, []);

  // Enhanced WebGL settings for Vision Pro
  const canvasSettings = {
    gl: {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance' as const,
      stencil: false,
      depth: true,
    },
    shadows: true,
    camera: {
      fov: isVisionPro ? 65 : 75,
      near: 0.1,
      far: 1000,
      position: [0, 0, 5] as [number, number, number],
    },
    style: {
      background: isXRActive ? 'transparent' : 'black',
      width: '100%',
      height: '100%',
    },
  };

  return (
    <Canvas {...canvasSettings} data-testid="webxr-canvas">
      {webXRSupported ? <XR store={xrStore}>{children}</XR> : children}
    </Canvas>
  );
};

export default WebXRCanvas;
