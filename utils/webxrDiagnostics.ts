// WebXR Polyfill Diagnostic Utilities
export interface WebXRPolyfillDetection {
  detected: boolean
  methods: string[]
  extensionId?: string
  confidence: number
}

export interface WebGLContextState {
  version: string
  vendor: string
  renderer: string
  extensions: string[]
  maxTextureSize: number
  isHealthy: boolean
}

export const detectWebXRPolyfill = (): WebXRPolyfillDetection => {
  const detectionMethods: string[] = []
  let detected = false
  let confidence = 0

  try {
    // Method 1: Check for WebXR Polyfill extension specific markers
    if (typeof window !== 'undefined') {
      // Check for extension-specific global variables
      if ((window as any).WebXRPolyfill) {
        detected = true
        detectionMethods.push('WebXRPolyfill global')
        confidence += 30
      }

      // Check for modified navigator.xr
      if (navigator.xr && (navigator.xr as any).__polyfilled) {
        detected = true
        detectionMethods.push('navigator.xr polyfilled')
        confidence += 25
      }

      // Check for extension injection markers in DOM
      const extensionScripts = document.querySelectorAll(
        'script[src*="webxr-polyfill"]',
      )
      if (extensionScripts.length > 0) {
        detected = true
        detectionMethods.push('extension script tags')
        confidence += 20
      }

      // Check for modified WebGL context prototypes
      const originalGetShaderSource =
        WebGLRenderingContext.prototype.getShaderSource
      if (
        originalGetShaderSource.toString().includes('polyfill') ||
        originalGetShaderSource.toString().includes('extension')
      ) {
        detected = true
        detectionMethods.push('WebGL prototype modified')
        confidence += 25
      }
    }
  } catch (error) {
    console.warn('WebXR polyfill detection error:', error)
  }

  return {
    detected,
    methods: detectionMethods,
    extensionId: detected ? 'cgffilbpcibhmcfbgggfhfolhkfbhmik' : undefined,
    confidence,
  }
}

export const getWebGLContextState = (
  gl: WebGLRenderingContext | null,
): WebGLContextState | null => {
  if (!gl) return null

  try {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : 'Unknown'
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : 'Unknown'

    return {
      version: gl.getParameter(gl.VERSION),
      vendor: vendor,
      renderer: renderer,
      extensions: gl.getSupportedExtensions() || [],
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      isHealthy: gl.getError() === gl.NO_ERROR,
    }
  } catch (error) {
    console.error('Failed to get WebGL context state:', error)
    return null
  }
}

export const runDiagnosticTests = (): {
  polyfillDetection: WebXRPolyfillDetection
  webglState: WebGLContextState | null
  recommendations: string[]
} => {
  const polyfillDetection = detectWebXRPolyfill()

  // Create a test canvas to check WebGL state
  const testCanvas = document.createElement('canvas')
  testCanvas.width = 1
  testCanvas.height = 1
  const gl =
    testCanvas.getContext('webgl') ||
    testCanvas.getContext('experimental-webgl')
  const webglState = getWebGLContextState(gl as WebGLRenderingContext)

  const recommendations: string[] = []

  if (polyfillDetection.detected) {
    recommendations.push(
      'WebXR polyfill extension detected - using isolated mode',
    )
    if (polyfillDetection.confidence > 50) {
      recommendations.push(
        'High confidence polyfill detection - disable extension for best experience',
      )
    }
  }

  if (webglState && !webglState.isHealthy) {
    recommendations.push('WebGL context has errors - check for conflicts')
  }

  if (!webglState) {
    recommendations.push('WebGL not available - falling back to safe mode')
  }

  // Cleanup
  testCanvas.remove()

  return {
    polyfillDetection,
    webglState,
    recommendations,
  }
}
