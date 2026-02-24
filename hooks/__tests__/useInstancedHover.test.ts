import { act, renderHook } from '@testing-library/react';
import * as THREE from 'three';
import {
  __testing__,
  useInstancedHover,
  useUniversalHover,
  useXRHover,
} from '../useInstancedHover';

// Mock PointerEvent
if (typeof PointerEvent === 'undefined') {
  (globalThis as any).PointerEvent = class PointerEvent extends Event {
    public clientX: number;
    public clientY: number;
    public pointerId = 0;
    public pointerType = 'mouse';

    constructor(type: string, options: any = {}) {
      super(type, options);
      this.clientX = options.clientX ?? 0;
      this.clientY = options.clientY ?? 0;
    }
  };
}

jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn((callback) => {
    if (typeof window !== 'undefined') {
      const callbacks = (window as any).__useFrameCallbacks ?? [];
      callbacks.push(callback);
      (window as any).__useFrameCallbacks = callbacks;
    }
  }),
  useThree: jest.fn(() => ({
    camera: new THREE.PerspectiveCamera(),
    pointer: new THREE.Vector2(0, 0),
  })),
}));

jest.mock('@/contexts/WebXR/WebXRViewContext', () => ({
  useWebXRView: jest.fn(() => ({
    currentView: 'home',
    webXRSupported: false,
  })),
}));

const createMockInstancedMesh = (instanceCount = 10): THREE.InstancedMesh => {
  const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial(), instanceCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < instanceCount; i++) {
    dummy.position.set(i * 1.5, 0, -5);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  return mesh;
};

const triggerUseFrame = (delta = 0.016, time = 0) => {
  const callbacks = (window as any).__useFrameCallbacks ?? [];
  callbacks.forEach((callback: any) => {
    act(() => callback({ clock: { elapsedTime: time } }, delta));
  });
};

describe('useInstancedHover', () => {
  let mockMeshRef: React.RefObject<THREE.InstancedMesh>;

  beforeEach(() => {
    jest.clearAllMocks();
    (window as any).__useFrameCallbacks = [];
    mockMeshRef = { current: createMockInstancedMesh() };
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useInstancedHover(mockMeshRef));
    expect(result.current.hoveredInstanceId).toBeNull();
  });

  it('handles clicks', () => {
    const onClick = jest.fn();
    renderHook(() => useInstancedHover(mockMeshRef, { events: { onClick } }));
    window.dispatchEvent(new MouseEvent('click'));
    expect(onClick).toHaveBeenCalledWith(null);
  });
});

describe('useXRHover Hook', () => {
  let mockMeshRef: React.RefObject<THREE.InstancedMesh>;

  beforeEach(() => {
    jest.clearAllMocks();
    clearUseFrameCallbacks();
    mockMeshRef = { current: createMockInstancedMesh() };
  });

  afterEach(() => {
    clearUseFrameCallbacks();
  });

  describe('Given WebXR is active', () => {
    beforeEach(() => {
      const { useWebXRView } = require('@/contexts/WebXR/WebXRViewContext');
      (useWebXRView as jest.Mock).mockReturnValue({
        currentView: 'home',
        isTransitioning: false,
        navigationVisible: true,
        footerLinksVisible: true,
        isVisionPro: false,
        webXRSupported: true,
        navigateToView: jest.fn(),
        setTransitioning: jest.fn(),
      });
    });

    it('should initialize without errors', () => {
      const { result } = renderHook(() => useXRHover(mockMeshRef, { enabled: true }));

      expect(result.current).toBeDefined();
      // Controller position is set during useFrame
      triggerUseFrame();
    });
  });

  describe('Given WebXR is not active', () => {
    beforeEach(() => {
      const { useWebXRView } = require('@/contexts/WebXR/WebXRViewContext');
      (useWebXRView as jest.Mock).mockReturnValue({
        currentView: 'home',
        isTransitioning: false,
        navigationVisible: true,
        footerLinksVisible: true,
        isVisionPro: false,
        webXRSupported: false,
        navigateToView: jest.fn(),
        setTransitioning: jest.fn(),
      });
    });

    it('should return null controller position', () => {
      const { result } = renderHook(() => useXRHover(mockMeshRef, { enabled: true }));

      expect(result.current.controllerPosition).toBeNull();
    });
  });

  describe('Given XR is active but no controller is present', () => {
    beforeEach(() => {
      const { useWebXRView } = require('@/contexts/WebXR/WebXRViewContext');
      (useWebXRView as jest.Mock).mockReturnValue({
        currentView: 'home',
        isTransitioning: false,
        navigationVisible: true,
        footerLinksVisible: true,
        isVisionPro: false,
        webXRSupported: true,
        navigateToView: jest.fn(),
        setTransitioning: jest.fn(),
      });
    });

    it('should not throw errors', () => {
      expect(() => {
        renderHook(() => useXRHover(mockMeshRef, { enabled: true }));
        triggerUseFrame();
      }).not.toThrow();
    });
  });
});

describe('useUniversalHover Hook', () => {
  let mockMeshRef: React.RefObject<THREE.InstancedMesh>;

  beforeEach(() => {
    jest.clearAllMocks();
    clearUseFrameCallbacks();
    mockMeshRef = { current: createMockInstancedMesh() };
  });

  afterEach(() => {
    clearUseFrameCallbacks();
  });

  describe('Cross-device consistency', () => {
    describe('Given WebXR is active', () => {
      beforeEach(() => {
        const { useWebXRView } = require('@/contexts/WebXR/WebXRViewContext');
        (useWebXRView as jest.Mock).mockReturnValue({
          currentView: 'home',
          isTransitioning: false,
          navigationVisible: true,
          footerLinksVisible: true,
          isVisionPro: true,
          webXRSupported: true,
          navigateToView: jest.fn(),
          setTransitioning: jest.fn(),
        });
      });

      it('should initialize correctly', () => {
        const { result } = renderHook(() =>
          useUniversalHover(mockMeshRef, {
            enabled: true,
          }),
        );

        expect(result.current).toBeDefined();
        expect(result.current.hoveredInstanceId).toBeNull();
      });
    });

    describe('Given WebXR is not active', () => {
      beforeEach(() => {
        const { useWebXRView } = require('@/contexts/WebXR/WebXRViewContext');
        (useWebXRView as jest.Mock).mockReturnValue({
          currentView: 'home',
          isTransitioning: false,
          navigationVisible: true,
          footerLinksVisible: true,
          isVisionPro: false,
          webXRSupported: false,
          navigateToView: jest.fn(),
          setTransitioning: jest.fn(),
        });
      });

      it('should use standard hover detection', () => {
        const { result } = renderHook(() =>
          useUniversalHover(mockMeshRef, {
            enabled: true,
          }),
        );

        expect(result.current).toBeDefined();
        expect(result.current.raycaster).toBeInstanceOf(THREE.Raycaster);
      });
    });
  });
});

describe('Testing Utilities', () => {
  describe('__testing__.getReducedMotionPreference', () => {
    it('should return false by default', () => {
      expect(__testing__.getReducedMotionPreference()).toBe(false);
    });
  });

  describe('__testing__.getPointerFromEvent', () => {
    it('should convert pointer event to normalized device coordinates', () => {
      const event = new PointerEvent('pointermove', {
        clientX: window.innerWidth / 2,
        clientY: window.innerHeight / 2,
      });

      const result = __testing__.getPointerFromEvent(event);

      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(0, 5);
    });

    it('should handle top-left corner', () => {
      const event = new PointerEvent('pointermove', { clientX: 0, clientY: 0 });

      const result = __testing__.getPointerFromEvent(event);

      expect(result.x).toBeCloseTo(-1, 5);
      expect(result.y).toBeCloseTo(1, 5);
    });

    it('should handle bottom-right corner', () => {
      const event = new PointerEvent('pointermove', {
        clientX: window.innerWidth,
        clientY: window.innerHeight,
      });

      const result = __testing__.getPointerFromEvent(event);

      expect(result.x).toBeCloseTo(1, 5);
      expect(result.y).toBeCloseTo(-1, 5);
    });
  });

  describe('__testing__.setupRaycaster', () => {
    it('should configure raycaster with optimized parameters', () => {
      const raycaster = new THREE.Raycaster();
      __testing__.setupRaycaster(raycaster);

      expect(raycaster.params.Points?.threshold).toBe(0.2);
      expect(raycaster.params.Line?.threshold).toBe(0.2);
      expect(raycaster.far).toBe(100);
    });

    it('should preserve existing parameters not in config', () => {
      const raycaster = new THREE.Raycaster();
      raycaster.params.Mesh = { threshold: 0.1 };

      __testing__.setupRaycaster(raycaster);

      expect(raycaster.params.Mesh?.threshold).toBe(0.1);
    });
  });

  describe('__testing__.DEFAULT_HOVER_STATE', () => {
    it('should have correct default values', () => {
      expect(__testing__.DEFAULT_HOVER_STATE.currentIndex).toBe(-1);
      expect(__testing__.DEFAULT_HOVER_STATE.lastIndex).toBe(-1);
      expect(__testing__.DEFAULT_HOVER_STATE.lastUpdateTime).toBe(0);
    });
  });

  describe('__testing__.HOVER_CONFIG', () => {
    it('should have correct configuration', () => {
      expect(__testing__.HOVER_CONFIG.raycasterParams.Points?.threshold).toBe(0.2);
      expect(__testing__.HOVER_CONFIG.raycasterParams.Line?.threshold).toBe(0.2);
      expect(__testing__.HOVER_CONFIG.updateThreshold).toBe(0.01);
    });
  });
});
