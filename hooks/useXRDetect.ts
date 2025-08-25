import { useEffect, useState } from 'react';

type XRDetectResult = {
  isVR: boolean;
  isAR?: boolean;
  isLoading: boolean;
};

interface NavigatorWithXR {
  xr?: {
    isSessionSupported: (mode: string) => Promise<boolean>;
  };
}

/**
 * Modern WebXR detection hook with improved error handling and TypeScript support
 * Detects browser support for WebXR VR sessions
 */
export default function useXRDetect(): XRDetectResult {
  const [isVR, setIsVR] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkVRSupport = async () => {
      try {
        const nav = navigator as NavigatorWithXR;

        if (!nav.xr) {
          setIsVR(false);
          return;
        }

        const vrSupported = await nav.xr.isSessionSupported('immersive-vr');

        if (isMounted) {
          setIsVR(vrSupported);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('WebXR detection failed:', error);
        }
        if (isMounted) {
          setIsVR(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkVRSupport();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isVR, isLoading };
}
