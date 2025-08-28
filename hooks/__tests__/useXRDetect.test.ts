import { renderHook, act } from '@testing-library/react';
import useXRDetect from '../useXRDetect';

// Mock navigator.xr
const mockNavigator = {
  xr: {
    isSessionSupported: jest.fn(),
  },
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
});

describe('useXRDetect Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset navigator to have xr by default
    Object.defineProperty(window, 'navigator', {
      value: { ...mockNavigator },
      writable: true,
    });
  });

  describe('WebXR Support Detection', () => {
    it('should return isVR=true when WebXR VR is supported', async () => {
      mockNavigator.xr.isSessionSupported.mockResolvedValue(true);

      const { result } = renderHook(() => useXRDetect());

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isVR).toBe(false);

      // Wait for detection to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isVR).toBe(true);
    });

    it('should return isVR=false when WebXR VR is not supported', async () => {
      mockNavigator.xr.isSessionSupported.mockResolvedValue(false);

      const { result } = renderHook(() => useXRDetect());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isVR).toBe(false);
    });

    it('should handle WebXR API not available', async () => {
      // Remove xr from navigator
      delete (window.navigator as any).xr;

      const { result } = renderHook(() => useXRDetect());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isVR).toBe(false);
    });

    it('should handle WebXR detection errors gracefully', async () => {
      mockNavigator.xr.isSessionSupported.mockRejectedValue(new Error('WebXR error'));

      const { result } = renderHook(() => useXRDetect());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isVR).toBe(false);
    });
  });

  describe('Loading State Management', () => {
    it('should start with loading=true and transition to loading=false', async () => {
      mockNavigator.xr.isSessionSupported.mockResolvedValue(true);

      const { result } = renderHook(() => useXRDetect());

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle rapid re-renders during loading', async () => {
      let resolvePromise: (value: boolean) => void;
      const promise = new Promise<boolean>((resolve) => {
        resolvePromise = resolve;
      });

      mockNavigator.xr.isSessionSupported.mockReturnValue(promise);

      const { result, rerender } = renderHook(() => useXRDetect());

      // Trigger multiple re-renders while still loading
      expect(result.current.isLoading).toBe(true);
      rerender();
      expect(result.current.isLoading).toBe(true);
      rerender();
      expect(result.current.isLoading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise(true);
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isVR).toBe(true);
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should not update state after component unmount', async () => {
      let resolvePromise: (value: boolean) => void;
      const promise = new Promise<boolean>((resolve) => {
        resolvePromise = resolve;
      });

      mockNavigator.xr.isSessionSupported.mockReturnValue(promise);

      const { result, unmount } = renderHook(() => useXRDetect());

      expect(result.current.isLoading).toBe(true);

      // Unmount before promise resolves
      unmount();

      // Resolve promise after unmount
      await act(async () => {
        resolvePromise(true);
        await promise;
      });

      // State should not have been updated
      expect(result.current.isLoading).toBe(true); // Still true because unmounted
    });
  });

  describe('Browser Compatibility', () => {
    it('should work with different navigator.xr implementations', async () => {
      // Test with minimal xr implementation
      Object.defineProperty(window.navigator, 'xr', {
        value: {
          isSessionSupported: () => Promise.resolve(true),
        },
        writable: true,
      });

      const { result } = renderHook(() => useXRDetect());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isVR).toBe(true);
    });

    it('should handle navigator undefined', async () => {
      // Temporarily remove navigator
      const originalNavigator = window.navigator;
      delete (window as any).navigator;

      const { result } = renderHook(() => useXRDetect());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isVR).toBe(false);
      expect(result.current.isLoading).toBe(false);

      // Restore navigator
      (window as any).navigator = originalNavigator;
    });
  });

  describe('Type Safety', () => {
    it('should return correct types', async () => {
      const { result } = renderHook(() => useXRDetect());

      expect(typeof result.current.isVR).toBe('boolean');
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(result.current.isAR).toBeUndefined(); // Not implemented in current version

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(typeof result.current.isVR).toBe('boolean');
      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });
});
