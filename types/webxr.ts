/**
 * Comprehensive WebXR type definitions for better type safety
 * These types provide proper interfaces for WebXR events and input handling
 */

/**
 * WebXR input source target ray modes
 */
export type XRTargetRayMode =
  | 'gaze'
  | 'tracked-pointer'
  | 'screen'
  | 'transient-pointer';

/**
 * WebXR input source handedness
 */
export type XRHandedness = 'none' | 'left' | 'right';

/**
 * WebXR reference space types
 */
export type XRReferenceSpaceType =
  | 'viewer'
  | 'local'
  | 'local-floor'
  | 'bounded-floor'
  | 'unbounded';

/**
 * WebXR session features
 */
export type XRSessionFeature =
  | 'viewer'
  | 'local'
  | 'local-floor'
  | 'bounded-floor'
  | 'unbounded'
  | 'hand-tracking'
  | 'hit-test'
  | 'anchors'
  | 'plane-detection'
  | 'mesh-detection';

/**
 * WebXR input source interface
 */
export interface XRInputSource {
  readonly handedness: XRHandedness;
  readonly targetRayMode: XRTargetRayMode;
  readonly targetRaySpace: XRSpace;
  readonly gripSpace?: XRSpace;
  readonly gamepad?: Gamepad;
  readonly hand?: XRHand;
  readonly profiles: readonly string[];
}

/**
 * WebXR session interface with comprehensive properties
 */
export interface XRSession extends EventTarget {
  readonly environmentBlendMode: 'opaque' | 'alpha-blend' | 'additive';
  readonly interactionMode: 'screen-space' | 'world-space';
  readonly visibilityState: 'visible' | 'visible-blurred' | 'hidden';
  readonly frameRate?: number;
  readonly supportedFrameRates?: Float32Array;
  readonly renderState: XRRenderState;
  readonly inputSources: readonly XRInputSource[];
  readonly enabledFeatures?: readonly XRSessionFeature[];

  end(): Promise<void>;
  updateRenderState(state?: XRRenderStateInit): void;
  requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
  requestAnimationFrame(callback: XRFrameRequestCallback): number;
  cancelAnimationFrame(handle: number): void;

  // Event handlers
  onend: ((this: XRSession, ev: XRSessionEvent) => void) | null;
  oninputsourceschange:
    | ((this: XRSession, ev: XRInputSourcesChangeEvent) => void)
    | null;
  onselect: ((this: XRSession, ev: XRInputSourceEvent) => void) | null;
  onselectend: ((this: XRSession, ev: XRInputSourceEvent) => void) | null;
  onselectstart: ((this: XRSession, ev: XRInputSourceEvent) => void) | null;
  onsqueeze: ((this: XRSession, ev: XRInputSourceEvent) => void) | null;
  onsqueezeend: ((this: XRSession, ev: XRInputSourceEvent) => void) | null;
  onsqueezestart: ((this: XRSession, ev: XRInputSourceEvent) => void) | null;
  onvisibilitychange: ((this: XRSession, ev: XRSessionEvent) => void) | null;
}

/**
 * WebXR session event interface
 */
export interface XRSessionEvent extends Event {
  readonly session: XRSession;
}

/**
 * WebXR input source event interface
 */
export interface XRInputSourceEvent extends Event {
  readonly frame: XRFrame;
  readonly inputSource: XRInputSource;
}

/**
 * WebXR input sources change event interface
 */
export interface XRInputSourcesChangeEvent extends Event {
  readonly session: XRSession;
  readonly added: readonly XRInputSource[];
  readonly removed: readonly XRInputSource[];
}

/**
 * Vision Pro specific event handler types
 */
export interface VisionProEventHandlers {
  /**
   * Handler for Vision Pro transient pointer selection events
   * Triggered by gaze + pinch interactions
   */
  onTransientPointerSelect?: (event: XRInputSourceEvent) => void;

  /**
   * Handler for Vision Pro hand tracking start events
   * Triggered when hand tracking becomes available
   */
  onHandTrackingStart?: (event: XRSessionEvent) => void;

  /**
   * Handler for Vision Pro hand tracking end events
   * Triggered when hand tracking becomes unavailable
   */
  onHandTrackingEnd?: (event: XRSessionEvent) => void;
}

/**
 * WebXR store state interface for React Three XR
 */
export interface XRStoreState {
  session: XRSession | null;
  isPresenting: boolean;
  isHandTracking: boolean;
  mode: 'AR' | 'VR' | null;
}

/**
 * Extended XR capabilities detection interface
 */
export interface XRCapabilities {
  webXRSupported: boolean;
  webGLSupported: boolean;
  isVisionPro: boolean;
  supportedModes: ('immersive-vr' | 'immersive-ar' | 'inline')[];
  availableFeatures: XRSessionFeature[];
}

// Re-export common WebXR globals that might not be available in all environments
declare global {
  interface Navigator {
    xr?: XRSystem;
  }

  interface XRSystem {
    isSessionSupported(mode: XRSessionMode): Promise<boolean>;
    requestSession(
      mode: XRSessionMode,
      options?: XRSessionInit,
    ): Promise<XRSession>;
  }

  interface Window {
    XRSession?: typeof XRSession;
  }
}

export type XRSessionMode = 'inline' | 'immersive-vr' | 'immersive-ar';

export interface XRSessionInit {
  optionalFeatures?: XRSessionFeature[];
  requiredFeatures?: XRSessionFeature[];
}
