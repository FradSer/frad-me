/**
 * WebXR Fallback Constants
 *
 * Large static arrays and configurations for 3D fallback components.
 * This file is code-split from the main WebXR bundle to reduce initial load size.
 * Only loaded when WebXR fails and 3D fallback is needed.
 */

import type { Vector3 } from 'three';

// Type definitions for fallback elements
export interface FloatingShape {
  geometry: {
    type: 'box' | 'sphere' | 'torus';
    args: [number, number, number] | [number, number, number] | [number, number, number, number];
  };
  position: [number, number, number];
  rotation: [number, number, number];
  material: {
    color: string;
    transparent: boolean;
    opacity: number;
    wireframe?: boolean;
  };
}

export interface TextPlane {
  text: string;
  position: [number, number, number];
  fontSize: number;
  color: string;
  maxWidth?: number;
  font?: string;
}

export interface PlatformElement {
  type: 'ground' | 'wall' | 'ceiling';
  dimensions: [number, number, number];
  position: [number, number, number];
  material: {
    color: string;
    roughness: number;
    metalness: number;
  };
}

export interface QualityConfig {
  antialias: boolean;
  shadows: boolean;
  pixelRatio: number;
  powerPreference?: 'high-performance' | 'low-power' | 'default';
  maxLights?: number;
}

// Static arrays for 3D fallback scene - these are large and only loaded when needed
export const FLOATING_SHAPES: FloatingShape[] = [
  {
    geometry: {
      type: 'box',
      args: [1.5, 1.5, 1.5]
    },
    position: [-3, 2, -2],
    rotation: [0.5, 0.8, 0.2],
    material: {
      color: '#4F46E5',
      transparent: true,
      opacity: 0.7,
      wireframe: false
    }
  },
  {
    geometry: {
      type: 'sphere',
      args: [0.8, 16, 16]
    },
    position: [2.5, 1.5, -1],
    rotation: [0, 0, 0],
    material: {
      color: '#06B6D4',
      transparent: true,
      opacity: 0.6,
      wireframe: true
    }
  },
  {
    geometry: {
      type: 'torus',
      args: [0.8, 0.3, 8, 16]
    },
    position: [0, 3.5, -3],
    rotation: [1.2, 0.5, 0.8],
    material: {
      color: '#EC4899',
      transparent: true,
      opacity: 0.8,
      wireframe: false
    }
  }
];

export const TEXT_PLANES: TextPlane[] = [
  {
    text: 'WebXR Experience Unavailable',
    position: [0, 4, -4],
    fontSize: 0.8,
    color: '#FFFFFF',
    maxWidth: 8,
    font: 'GT Eesti Display Bold'
  },
  {
    text: 'Falling back to 3D navigation',
    position: [0, 3, -4],
    fontSize: 0.4,
    color: '#94A3B8',
    maxWidth: 6,
    font: 'GT Eesti'
  },
  {
    text: 'Use mouse to look around',
    position: [-2, 1, -3],
    fontSize: 0.3,
    color: '#64748B',
    maxWidth: 4,
    font: 'GT Eesti'
  },
  {
    text: 'Click and drag to rotate view',
    position: [2, 1, -3],
    fontSize: 0.3,
    color: '#64748B',
    maxWidth: 4,
    font: 'GT Eesti'
  },
  {
    text: 'Scroll to zoom',
    position: [0, 0.5, -2.5],
    fontSize: 0.3,
    color: '#64748B',
    maxWidth: 3,
    font: 'GT Eesti'
  },
  {
    text: 'Experience optimized for desktop',
    position: [-1.5, -0.5, -2],
    fontSize: 0.25,
    color: '#475569',
    maxWidth: 5,
    font: 'GT Eesti'
  },
  {
    text: 'Try refreshing for WebXR',
    position: [1.5, -0.5, -2],
    fontSize: 0.25,
    color: '#475569',
    maxWidth: 4,
    font: 'GT Eesti'
  }
];

export const PLATFORM_ELEMENTS: PlatformElement[] = [
  {
    type: 'ground',
    dimensions: [20, 0.1, 20],
    position: [0, -2, -5],
    material: {
      color: '#1E293B',
      roughness: 0.8,
      metalness: 0.1
    }
  },
  {
    type: 'wall',
    dimensions: [20, 8, 0.2],
    position: [0, 2, -10],
    material: {
      color: '#0F172A',
      roughness: 0.9,
      metalness: 0.05
    }
  },
  {
    type: 'ceiling',
    dimensions: [20, 0.1, 20],
    position: [0, 6, -5],
    material: {
      color: '#334155',
      roughness: 0.7,
      metalness: 0.2
    }
  }
];

export const QUALITY_CONFIGS: Record<'low' | 'medium' | 'high', QualityConfig> = {
  low: {
    antialias: false,
    shadows: false,
    pixelRatio: 1,
    powerPreference: 'low-power',
    maxLights: 2
  },
  medium: {
    antialias: true,
    shadows: false,
    pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1.5,
    powerPreference: 'default',
    maxLights: 4
  },
  high: {
    antialias: true,
    shadows: true,
    pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 2,
    powerPreference: 'high-performance',
    maxLights: 8
  }
};

/**
 * Detect device performance level for quality selection
 */
export const detectPerformanceLevel = (): keyof typeof QUALITY_CONFIGS => {
  // Check for various performance indicators
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator?.userAgent || ''
  );

  const hasHighDPR = (window?.devicePixelRatio || 1) > 1.5;
  const hasLowMemory = (navigator as any)?.deviceMemory ? (navigator as any).deviceMemory < 4 : false;
  const isLowEndDevice = isMobile && (hasLowMemory || !hasHighDPR);

  if (isLowEndDevice) {
    return 'low';
  }

  // Check WebGL capabilities
  const canvas = document.createElement('canvas');
  try {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) {
      return 'low';
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';

    // High-end GPU indicators
    const isHighEndGPU = /RTX|GTX|Radeon RX|AMD|Intel Iris|Apple M[0-9]|Apple GPU/.test(renderer);

    if (isHighEndGPU && !isMobile) {
      return 'high';
    }

    return 'medium';
  } finally {
    // Clean up canvas to prevent memory leak
    canvas.remove();
  }
};

/**
 * Get quality configuration based on detected performance level
 */
export const getQualityConfig = (): QualityConfig => {
  const performanceLevel = detectPerformanceLevel();
  return QUALITY_CONFIGS[performanceLevel];
};