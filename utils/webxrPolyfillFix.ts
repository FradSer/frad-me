// WebXR Polyfill conflict prevention utility - Complete isolation approach

interface SafeWebGLContext {
  context: WebGLRenderingContext | WebGL2RenderingContext | null
  isIsolated: boolean
}

// Store original WebGL constructors before any polyfill can touch them
const ORIGINAL_WEBGL_CONTEXT = typeof window !== 'undefined' ? {
  getContext: HTMLCanvasElement.prototype.getContext,
  WebGLRenderingContext: window.WebGLRenderingContext,
  WebGL2RenderingContext: window.WebGL2RenderingContext
} : null

/**
 * Creates a completely isolated WebGL context that bypasses all polyfills
 */
export const createIsolatedWebGLContext = (canvas: HTMLCanvasElement, contextAttributes?: WebGLContextAttributes): SafeWebGLContext => {
  if (!ORIGINAL_WEBGL_CONTEXT) {
    return { context: null, isIsolated: false }
  }

  try {
    // Create context using original, unmodified getContext
    const context = ORIGINAL_WEBGL_CONTEXT.getContext.call(
      canvas,
      'webgl2',
      contextAttributes
    ) || ORIGINAL_WEBGL_CONTEXT.getContext.call(
      canvas,
      'webgl',
      contextAttributes
    )

    if (!context) {
      return { context: null, isIsolated: false }
    }

    // Wrap critical methods to prevent null shader source errors
    const safeContext = context as any
    const originalGetShaderSource = safeContext.getShaderSource
    safeContext.getShaderSource = function(shader: WebGLShader): string | null {
      try {
        const source = originalGetShaderSource.call(this, shader)
        return source === null ? '' : source
      } catch (e) {
        console.warn('Shader source retrieval failed, returning empty string', e)
        return ''
      }
    }

    // Wrap getParameter to handle polyfill interference
    const originalGetParameter = safeContext.getParameter
    safeContext.getParameter = function(pname: number): any {
      try {
        return originalGetParameter.call(this, pname)
      } catch (e) {
        console.warn('getParameter failed, returning safe default', e)
        // Return safe defaults for common parameters
        switch (pname) {
          case safeContext.MAX_TEXTURE_SIZE: return 4096
          case safeContext.MAX_VERTEX_ATTRIBS: return 16
          case safeContext.MAX_VARYING_VECTORS: return 8
          default: return null
        }
      }
    }

    return { context: safeContext, isIsolated: true }
  } catch (error) {
    console.error('Failed to create isolated WebGL context:', error)
    return { context: null, isIsolated: false }
  }
}

/**
 * Detects WebXR polyfill presence more reliably
 */
export const detectWebXRPolyfill = (): boolean => {
  if (typeof window === 'undefined') return false
  
  // Multiple detection strategies
  const checks = [
    // Direct window property
    () => !!(window as any).WebXRPolyfill,
    // Chrome extension injection pattern
    () => !!(window as any).__webxr_polyfill__,
    // Modified navigator.xr
    () => {
      const xr = (navigator as any).xr
      return xr && xr.constructor && xr.constructor.name === 'WebXRPolyfill'
    },
    // Check for polyfill-specific methods
    () => {
      const gl = document.createElement('canvas').getContext('webgl')
      return gl && (gl as any).__polyfill_injected
    }
  ]

  return checks.some(check => {
    try {
      return check()
    } catch {
      return false
    }
  })
}

/**
 * Complete isolation strategy for Three.js/R3F
 */
export const disableWebXRPolyfillConflicts = (): void => {
  if (typeof window === 'undefined') return

  const hasPolyfill = detectWebXRPolyfill()
  
  if (hasPolyfill) {
    console.warn('WebXR Polyfill detected - applying complete isolation strategy')
    
    // Strategy 1: Prevent XR API access entirely
    try {
      Object.defineProperty(navigator, 'xr', {
        get: () => undefined,
        configurable: false
      })
    } catch (e) {
      console.warn('Could not override navigator.xr:', e)
    }

    // Strategy 2: Wrap all WebGL prototype methods defensively
    const wrapWebGLMethods = (prototype: any) => {
      if (!prototype) return
      
      const methodsToWrap = [
        'getShaderSource',
        'getShaderParameter',
        'getProgramParameter',
        'getActiveAttrib',
        'getActiveUniform',
        'getUniformLocation',
        'getAttribLocation'
      ]

      methodsToWrap.forEach(method => {
        if (typeof prototype[method] === 'function') {
          const original = prototype[method]
          prototype[method] = function(...args: any[]) {
            try {
              const result = original.apply(this, args)
              // Handle null returns that could cause .trim() errors
              if (method === 'getShaderSource' && result === null) {
                return ''
              }
              return result
            } catch (e) {
              console.warn(`WebGL method ${method} failed:`, e)
              // Return safe defaults
              if (method === 'getShaderSource') return ''
              if (method.includes('Parameter')) return false
              return null
            }
          }
        }
      })
    }

    wrapWebGLMethods(WebGLRenderingContext.prototype)
    if (typeof WebGL2RenderingContext !== 'undefined') {
      wrapWebGLMethods(WebGL2RenderingContext.prototype)
    }

    console.log('WebXR polyfill complete isolation applied')
  } else {
    console.log('No WebXR polyfill detected - running in clean environment')
  }
}

// Call this function to restore original behavior if needed
export const restoreWebXRPolyfill = (): void => {
  if (typeof window === 'undefined') return
  
  try {
    if ((window as any).__originalWebXRPolyfill) {
      ;(window as any).WebXRPolyfill = (window as any).__originalWebXRPolyfill
      delete (window as any).__originalWebXRPolyfill
    }
  } catch (error) {
    console.warn('Failed to restore WebXR polyfill:', error)
  }
}