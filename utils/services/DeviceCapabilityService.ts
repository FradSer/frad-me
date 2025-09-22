export interface DeviceCapabilities {
  hasWebGL: boolean;
  hasWebGL2: boolean;
  hasWebXR: boolean;
  performanceLevel: 'low' | 'medium' | 'high';
}

export class DeviceCapabilityService {
  private static createCanvas(): HTMLCanvasElement {
    return document.createElement('canvas');
  }

  private static detectWebGLSupport(): { hasWebGL: boolean; hasWebGL2: boolean } {
    // Add SSR compatibility check
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return { hasWebGL: false, hasWebGL2: false };
    }

    let canvas: HTMLCanvasElement | null = null;
    try {
      canvas = this.createCanvas();
      const webglContext = canvas.getContext('webgl');
      const webgl2Context = canvas.getContext('webgl2');

      const hasWebGL = !!webglContext;
      const hasWebGL2 = !!webgl2Context;

      return { hasWebGL, hasWebGL2 };
    } catch (error) {
      console.warn('Failed to detect WebGL support:', error);
      return { hasWebGL: false, hasWebGL2: false };
    } finally {
      // Ensure canvas cleanup in all cases
      if (canvas) {
        try {
          canvas.remove();
        } catch (cleanupError) {
          console.warn('Failed to cleanup canvas:', cleanupError);
        }
      }
    }
  }

  private static detectWebXRSupport(): boolean {
    // Add SSR compatibility check
    if (typeof navigator === 'undefined') {
      return false;
    }

    try {
      return 'xr' in navigator && !!(navigator as any).xr;
    } catch (error) {
      console.warn('Failed to detect WebXR support:', error);
      return false;
    }
  }

  private static detectPerformanceLevel(): 'low' | 'medium' | 'high' {
    // Add SSR compatibility check
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
      return 'medium'; // Default to medium performance on server
    }

    try {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator?.userAgent || ''
      );
      const deviceMemory = (navigator as any)?.deviceMemory || 4;
      const pixelRatio = window?.devicePixelRatio || 1;

      if (isMobile && deviceMemory < 4) {
        return 'low';
      }

      const { hasWebGL2 } = this.detectWebGLSupport();
      if (!isMobile && hasWebGL2 && pixelRatio > 1.5) {
        return 'high';
      }

      return 'medium';
    } catch (error) {
      console.warn('Failed to detect performance level:', error);
      return 'medium';
    }
  }

  public static detectCapabilities(): DeviceCapabilities {
    try {
      const { hasWebGL, hasWebGL2 } = this.detectWebGLSupport();
      const hasWebXR = this.detectWebXRSupport();
      const performanceLevel = this.detectPerformanceLevel();

      return {
        hasWebGL,
        hasWebGL2,
        hasWebXR,
        performanceLevel,
      };
    } catch (error) {
      console.warn('Failed to detect device capabilities:', error);
      // Return safe defaults on error
      return {
        hasWebGL: false,
        hasWebGL2: false,
        hasWebXR: false,
        performanceLevel: 'low',
      };
    }
  }
}