// WebXR Polyfill conflict prevention utility
export const disableWebXRPolyfillConflicts = (): void => {
  if (typeof window === 'undefined') return

  try {
    // Override problematic WebXR polyfill methods that cause shader conflicts
    const originalGetShaderSource = WebGLRenderingContext.prototype.getShaderSource
    WebGLRenderingContext.prototype.getShaderSource = function(shader: WebGLShader): string | null {
      const source = originalGetShaderSource.call(this, shader)
      // Ensure source is never null to prevent .trim() errors
      return source || ''
    }

    // Also handle WebGL2 context
    if (WebGL2RenderingContext) {
      const originalGetShaderSource2 = WebGL2RenderingContext.prototype.getShaderSource
      WebGL2RenderingContext.prototype.getShaderSource = function(shader: WebGLShader): string | null {
        const source = originalGetShaderSource2.call(this, shader)
        return source || ''
      }
    }

    // Disable WebXR polyfill if it's causing issues
    if ((window as any).WebXRPolyfill) {
      console.warn('WebXR polyfill detected, attempting to prevent conflicts...')
      
      // Store original but don't completely remove (might break other functionality)
      ;(window as any).__originalWebXRPolyfill = (window as any).WebXRPolyfill
      
      // Override problematic methods
      if ((window as any).WebXRPolyfill.prototype) {
        const polyfill = (window as any).WebXRPolyfill.prototype
        if (polyfill.getShaderSource) {
          polyfill.getShaderSource = function(shader: any) {
            return ''
          }
        }
      }
    }

    console.log('WebXR polyfill conflicts prevention applied')
  } catch (error) {
    console.warn('Failed to apply WebXR polyfill fixes:', error)
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