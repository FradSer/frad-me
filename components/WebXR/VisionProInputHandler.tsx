import { useXR } from '@react-three/xr';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import type {
  VisionProEventHandlers,
  XRInputSourceEvent,
  XRInputSourcesChangeEvent,
  XRSessionEvent,
  XRTargetRayMode,
} from '@/types/webxr';

const TRANSIENT_POINTER: XRTargetRayMode = 'transient-pointer';

const isDevelopment = process.env.NODE_ENV === 'development';

interface VisionProInputHandlerProps extends VisionProEventHandlers {}

const VisionProInputHandlerInternal = memo<VisionProInputHandlerProps>(
  function VisionProInputHandlerInternal({
    onTransientPointerSelect,
    onHandTrackingStart,
    onHandTrackingEnd,
  }) {
    const { session } = useXR();
    const { isVisionPro } = useWebXRView();

    const handleInputSourcesChange = useCallback(
      (event: XRInputSourcesChangeEvent) => {
        if (!isVisionPro) return;

        const transientInputs = event.session.inputSources.filter(
          (source) => source.targetRayMode === TRANSIENT_POINTER,
        );

        if (transientInputs.length > 0 && isDevelopment) {
          console.log('Vision Pro transient pointer detected:', transientInputs.length);
        }
      },
      [isVisionPro],
    );

    const handleSelectStart = useCallback(
      (event: XRInputSourceEvent) => {
        if (!isVisionPro) return;

        const { inputSource } = event;

        if (inputSource.targetRayMode === TRANSIENT_POINTER) {
          if (isDevelopment) {
            console.log('Vision Pro gaze + pinch interaction started');
          }
          onTransientPointerSelect?.(event);
        }
      },
      [isVisionPro, onTransientPointerSelect],
    );

    const handleSelectEnd = useCallback(
      (event: XRInputSourceEvent) => {
        if (!isVisionPro) return;

        const { inputSource } = event;

        if (inputSource.targetRayMode === TRANSIENT_POINTER && isDevelopment) {
          console.log('Vision Pro gaze + pinch interaction ended');
        }
      },
      [isVisionPro],
    );

    const handleSessionStart = useCallback(
      (event: XRSessionEvent) => {
        if (!isVisionPro) return;

        if (isDevelopment) {
          console.log('WebXR session started on Vision Pro');
        }

        if (event.session.enabledFeatures?.includes('hand-tracking')) {
          if (isDevelopment) {
            console.log('Hand tracking enabled on Vision Pro');
          }
          onHandTrackingStart?.(event);
        }
      },
      [isVisionPro, onHandTrackingStart],
    );

    const handleSessionEnd = useCallback(
      (event: XRSessionEvent) => {
        if (!isVisionPro) return;

        if (isDevelopment) {
          console.log('WebXR session ended on Vision Pro');
        }
        onHandTrackingEnd?.(event);
      },
      [isVisionPro, onHandTrackingEnd],
    );

    const eventHandlers = useMemo(
      () => ({
        inputsourceschange: handleInputSourcesChange,
        selectstart: handleSelectStart,
        selectend: handleSelectEnd,
        sessionstart: handleSessionStart,
        sessionend: handleSessionEnd,
      }),
      [
        handleInputSourcesChange,
        handleSelectStart,
        handleSelectEnd,
        handleSessionStart,
        handleSessionEnd,
      ],
    );

    useEffect(() => {
      if (!session || !isVisionPro) return;

      Object.entries(eventHandlers).forEach(([eventName, handler]) => {
        session.addEventListener(eventName, handler as EventListener);
      });

      return () => {
        Object.entries(eventHandlers).forEach(([eventName, handler]) => {
          session.removeEventListener(eventName, handler as EventListener);
        });
      };
    }, [session, isVisionPro, eventHandlers]);

    return null;
  },
);

const VisionProInputHandler = memo<VisionProInputHandlerProps>(
  function VisionProInputHandler(props) {
    const { webXRSupported, isVisionPro } = useWebXRView();

    if (!webXRSupported || !isVisionPro) {
      return null;
    }

    return <VisionProInputHandlerInternal {...props} />;
  },
);

export default VisionProInputHandler;
