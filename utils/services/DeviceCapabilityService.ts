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
    const canvas = this.createCanvas();
    const webglContext = canvas.getContext('webgl');
    const webgl2Context = canvas.getContext('webgl2');

    const hasWebGL = !!webglContext;
    const hasWebGL2 = !!webgl2Context;

    // Clean up canvas
    canvas.remove();

    return { hasWebGL, hasWebGL2 };
  }

  private static detectWebXRSupport(): boolean {
    return 'xr' in navigator && !!(navigator as any).xr;
  }

  private static detectPerformanceLevel(): 'low' | 'medium' | 'high' {
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
  }

  public static detectCapabilities(): DeviceCapabilities {
    const { hasWebGL, hasWebGL2 } = this.detectWebGLSupport();
    const hasWebXR = this.detectWebXRSupport();
    const performanceLevel = this.detectPerformanceLevel();

    return {
      hasWebGL,
      hasWebGL2,
      hasWebXR,
      performanceLevel,
    };
  }
}