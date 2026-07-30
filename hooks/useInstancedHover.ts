import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';

const HOVER_CONFIG = {
  raycasterParams: {
    Points: { threshold: 0.2 },
    Line: { threshold: 0.2 },
  },
  updateThreshold: 0.01,
} as const;

interface HoverState {
  currentIndex: number;
  lastIndex: number;
  lastUpdateTime: number;
}

export interface HoverDetectionEvents {
  onHoverChange?: (instanceId: number | null) => void;
  onClick?: (instanceId: number | null) => void;
}

export interface HoverDetectionConfig {
  enabled?: boolean;
  reducedMotion?: boolean;
  debounceMs?: number;
  events?: HoverDetectionEvents;
}

export interface HoverDetectionResult {
  hoveredInstanceId: number | null;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
}

const DEFAULT_HOVER_STATE: HoverState = {
  currentIndex: -1,
  lastIndex: -1,
  lastUpdateTime: 0,
};

const getReducedMotionPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const getPointerFromEvent = (event: PointerEvent): THREE.Vector2 => {
  const { clientX, clientY } = event;
  return new THREE.Vector2(
    (clientX / window.innerWidth) * 2 - 1,
    -(clientY / window.innerHeight) * 2 + 1,
  );
};

const setupRaycaster = (raycaster: THREE.Raycaster): THREE.Raycaster => {
  raycaster.params = {
    ...raycaster.params,
    ...HOVER_CONFIG.raycasterParams,
  };
  raycaster.far = 100;
  return raycaster;
};

export function useInstancedHover<T extends THREE.Object3D>(
  meshRef: React.RefObject<T | null>,
  config: HoverDetectionConfig = {},
): HoverDetectionResult {
  const { enabled = true, debounceMs = 16, events = {} } = config;

  const { camera } = useThree();
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const hoverStateRef = useRef<HoverState>({ ...DEFAULT_HOVER_STATE });
  const pointerRef = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    setupRaycaster(raycasterRef.current);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return;

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current = getPointerFromEvent(event);
    };

    const handleClick = () => {
      const { currentIndex } = hoverStateRef.current;
      if (currentIndex >= 0) {
        events.onClick?.(currentIndex);
      } else {
        events.onClick?.(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('click', handleClick);
    };
  }, [enabled, events]);

  useFrame(() => {
    if (!enabled || !meshRef.current) {
      hoverStateRef.current.currentIndex = -1;
      return;
    }

    const raycaster = raycasterRef.current;
    const mesh = meshRef.current;

    raycaster.setFromCamera(pointerRef.current, camera);

    const intersections = raycaster.intersectObject(mesh);

    let foundInstanceId = -1;
    if (intersections.length > 0) {
      const intersection = intersections[0];
      if (intersection.instanceId !== undefined) {
        foundInstanceId = intersection.instanceId;
      }
    }

    const now = performance.now();
    const timeSinceLastUpdate = now - hoverStateRef.current.lastUpdateTime;

    if (
      foundInstanceId !== hoverStateRef.current.currentIndex &&
      timeSinceLastUpdate >= debounceMs
    ) {
      hoverStateRef.current.lastIndex = hoverStateRef.current.currentIndex;
      hoverStateRef.current.currentIndex = foundInstanceId;
      hoverStateRef.current.lastUpdateTime = now;

      const instanceId = foundInstanceId >= 0 ? foundInstanceId : null;
      events.onHoverChange?.(instanceId);
    }
  });

  return {
    hoveredInstanceId:
      hoverStateRef.current.currentIndex >= 0 ? hoverStateRef.current.currentIndex : null,
    raycaster: raycasterRef.current,
    pointer: pointerRef.current,
  };
}

export function useXRHover<T extends THREE.Object3D>(
  meshRef: React.RefObject<T | null>,
  config: HoverDetectionConfig = {},
): HoverDetectionResult & { controllerPosition: THREE.Vector3 | null } {
  const { webXRSupported } = useWebXRView();
  const baseHover = useInstancedHover(meshRef, {
    ...config,
    enabled: config.enabled && !webXRSupported,
  });
  const controllerPositionRef = useRef<THREE.Vector3 | null>(null);
  const hoverStateRef = useRef<HoverState>({ ...DEFAULT_HOVER_STATE });

  useFrame(() => {
    if (!webXRSupported || !meshRef.current) {
      controllerPositionRef.current = null;
      return;
    }

    const raycaster = baseHover.raycaster;
    const mesh = meshRef.current;

    const { camera } = baseHover.raycaster;
    if (camera instanceof THREE.PerspectiveCamera) {
      const position = new THREE.Vector3();
      camera.getWorldPosition(position);
      controllerPositionRef.current = position;

      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(camera.quaternion);
      raycaster.set(position, direction);

      const intersections = raycaster.intersectObject(mesh);

      let foundInstanceId = -1;
      if (intersections.length > 0 && intersections[0].instanceId !== undefined) {
        foundInstanceId = intersections[0].instanceId;
      }

      const now = performance.now();
      if (
        foundInstanceId !== -1 &&
        foundInstanceId !== hoverStateRef.current.currentIndex &&
        now - hoverStateRef.current.lastUpdateTime >= 16
      ) {
        hoverStateRef.current.currentIndex = foundInstanceId;
        hoverStateRef.current.lastUpdateTime = now;
        config.events?.onHoverChange?.(foundInstanceId);
      } else if (foundInstanceId === -1 && hoverStateRef.current.currentIndex !== -1) {
        hoverStateRef.current.currentIndex = -1;
        hoverStateRef.current.lastUpdateTime = now;
        config.events?.onHoverChange?.(null);
      }
    }
  });

  return {
    ...baseHover,
    controllerPosition: controllerPositionRef.current,
  };
}

export function useUniversalHover<T extends THREE.Object3D>(
  meshRef: React.RefObject<T | null>,
  config: HoverDetectionConfig = {},
): HoverDetectionResult {
  const { webXRSupported } = useWebXRView();
  const xrHover = useXRHover(meshRef, config);
  const standardHover = useInstancedHover(meshRef, {
    ...config,
    enabled: config.enabled && !webXRSupported,
  });

  return webXRSupported ? xrHover : standardHover;
}

export const __testing__ = {
  getReducedMotionPreference,
  getPointerFromEvent,
  setupRaycaster,
  DEFAULT_HOVER_STATE,
  HOVER_CONFIG,
};
