import { Page } from '@playwright/test'

// Type definitions for testing utilities
interface MockXRSystem {
  isSessionSupported: (mode: string) => Promise<boolean>
  requestSession: (mode: string, options?: XRSessionInit) => Promise<MockXRSession>
}

interface MockXRSession {
  mode: string
  inputSources: unknown[]
  visibilityState: string
  addEventListener: (type: string, listener: EventListener) => void
  removeEventListener: (type: string, listener: EventListener) => void
  requestReferenceSpace: (type: string) => Promise<MockXRReferenceSpace>
  requestAnimationFrame: (callback: XRFrameRequestCallback) => number
  end: () => Promise<void>
}

interface MockXRReferenceSpace {
  getOffsetReferenceSpace: () => void
  addEventListener: () => void
  removeEventListener: () => void
}

interface PerformanceEvent {
  factor: number
  fps: number
  frameTime?: number
  isStable?: boolean
  timestamp?: number
}

interface ErrorLogData {
  error: {
    name: string
    message: string
    stack?: string
  }
  timestamp: string
  userAgent: string
  url?: string
  webxrSupported?: boolean
  webglSupported?: boolean
}

interface AnalyticsEvent {
  command: string
  eventName: string
  parameters: Record<string, unknown>
}

interface SentryEvent {
  error: string
  context: {
    tags?: Record<string, unknown>
    extra?: Record<string, unknown>
  }
}

/**
 * WebXR and WebGL capability mocking utilities for comprehensive testing
 * of progressive fallback scenarios across different browser capabilities
 */
export class WebXRMockUtils {
  /**
   * Completely disables WebXR API by removing navigator.xr
   * Simulates browsers without WebXR support (Safari, older browsers)
   */
  static async disableWebXR(page: Page): Promise<void> {
    await page.addInitScript(() => {
      // Remove WebXR API completely
      delete (window.navigator as any).xr
      
      // Also mock XR detection functions
      Object.defineProperty(window.navigator, 'xr', {
        value: undefined,
        writable: false,
        configurable: false
      })
    })
  }

  /**
   * Disables WebGL by making context creation fail
   * Simulates devices with broken graphics drivers or very old hardware
   */
  static async disableWebGL(page: Page): Promise<void> {
    await page.addInitScript(() => {
      // Mock all WebGL context creation to fail
      const originalGetContext = HTMLCanvasElement.prototype.getContext.bind(HTMLCanvasElement.prototype)
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        value: function(contextType: string, contextAttributes?: WebGLContextAttributes | CanvasRenderingContext2DSettings) {
          if (contextType.toLowerCase().includes('webgl')) {
            return null
          }
          return originalGetContext.call(this, contextType, contextAttributes)
        },
        writable: true,
        configurable: true
      })
    })
  }

  /**
   * Simulates WebGL context loss after successful initialization
   * Tests runtime error handling and recovery
   */
  static async simulateWebGLContextLoss(page: Page, delayMs: number = 1000): Promise<void> {
    await page.addInitScript((delay: number) => {
      setTimeout(() => {
        // Find all canvas elements and trigger context loss
        const canvases = document.querySelectorAll('canvas')
        canvases.forEach(canvas => {
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
          if (gl && 'getExtension' in gl) {
            const loseContextExtension = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')
            if (loseContextExtension) {
              loseContextExtension.loseContext()
            }
          }
          
          // Also try WebGL2
          const gl2 = canvas.getContext('webgl2')
          if (gl2 && 'getExtension' in gl2) {
            const loseContextExtension = (gl2 as WebGL2RenderingContext).getExtension('WEBGL_lose_context')
            if (loseContextExtension) {
              loseContextExtension.loseContext()
            }
          }
        })
        
        // Dispatch custom event for error boundary testing
        window.dispatchEvent(new CustomEvent('webgl-context-lost', { 
          detail: { timestamp: Date.now() }
        }))
      }, delay)
    }, delayMs)
  }

  /**
   * Simulates low-end device performance
   * Forces performance monitoring to detect poor framerates
   */
  static async simulateLowPerformance(page: Page): Promise<void> {
    await page.addInitScript(() => {
      // Override performance.now to simulate slow frame rates
      const originalNow = performance.now.bind(performance)
      let frameCount = 0
      let lastTime = originalNow()
      
      performance.now = function(): number {
        frameCount++
        const currentTime = originalNow()
        
        // Simulate 15 FPS instead of 60 FPS (4x slower)
        const simulatedTime = lastTime + (frameCount * 66.67) // 66.67ms per frame = 15 FPS
        lastTime = Math.max(currentTime, simulatedTime)
        
        return lastTime
      }
      
      // Also override requestAnimationFrame timing
      const originalRAF = window.requestAnimationFrame
      window.requestAnimationFrame = function(callback: FrameRequestCallback): number {
        return originalRAF(() => {
          // Introduce artificial delay to simulate slow rendering
          setTimeout(() => callback(performance.now()), 50)
        })
      }
    })
  }

  /**
   * Simulates memory-constrained device
   * Triggers performance degradation due to memory pressure
   */
  static async simulateMemoryPressure(page: Page): Promise<void> {
    await page.addInitScript(() => {
      // Mock memory API to report low available memory
      if ('memory' in performance) {
        Object.defineProperty(performance, 'memory', {
          value: {
            usedJSHeapSize: 800 * 1024 * 1024, // 800MB used
            totalJSHeapSize: 900 * 1024 * 1024, // 900MB total
            jsHeapSizeLimit: 1024 * 1024 * 1024 // 1GB limit
          },
          writable: false
        })
      }
      
      // Simulate memory warnings
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('memory-pressure', {
          detail: { severity: 'high', availableMemory: '100MB' }
        }))
      }, 1500)
    })
  }

  /**
   * Enables full WebXR support for testing WebXR-capable browsers
   * Mocks Vision Pro, Meta Quest, or other XR device support
   */
  static async enableFullWebXRSupport(page: Page): Promise<void> {
    await page.addInitScript(() => {
      // Mock complete WebXR API
      const mockXRSystem = {
        isSessionSupported: (mode: string): Promise<boolean> => {
          const supportedModes = ['immersive-vr', 'immersive-ar', 'inline']
          return Promise.resolve(supportedModes.includes(mode))
        },
        
        requestSession: (mode: string, options?: XRSessionInit): Promise<MockXRSession> => {
          return Promise.resolve({
            mode,
            inputSources: [],
            visibilityState: 'visible',
            
            addEventListener: (type: string, listener: EventListener) => {},
            removeEventListener: (type: string, listener: EventListener) => {},
            
            requestReferenceSpace: (type: string) => Promise.resolve({
              getOffsetReferenceSpace: () => {},
              addEventListener: () => {},
              removeEventListener: () => {}
            }),
            
            requestAnimationFrame: (callback: XRFrameRequestCallback) => {
              return window.requestAnimationFrame(() => {
                const mockFrame = {
                  session: this,
                  getViewerPose: () => null,
                  getPose: () => null,
                  getInputSources: () => []
                }
                callback(0, mockFrame as any)
              })
            },
            
            end: (): Promise<void> => Promise.resolve()
          })
        }
      }
      
      Object.defineProperty(window.navigator, 'xr', {
        value: mockXRSystem,
        writable: false,
        configurable: true
      })
    })
  }

  /**
   * Simulates partial WebXR support (some features missing)
   * Tests graceful degradation when certain XR features are unavailable
   */
  static async enablePartialWebXRSupport(page: Page): Promise<void> {
    await page.addInitScript(() => {
      const mockXRSystem = {
        isSessionSupported: (mode: string): Promise<boolean> => {
          // Only support inline mode, not immersive
          return Promise.resolve(mode === 'inline')
        },
        
        requestSession: (mode: string): Promise<any> => {
          if (mode !== 'inline') {
            return Promise.reject(new Error('Session mode not supported'))
          }
          
          return Promise.resolve({
            mode: 'inline',
            addEventListener: () => {},
            removeEventListener: () => {},
            requestReferenceSpace: () => Promise.reject(new Error('Reference space not available')),
            end: () => Promise.resolve()
          })
        }
      }
      
      Object.defineProperty(window.navigator, 'xr', {
        value: mockXRSystem,
        writable: false,
        configurable: true
      })
    })
  }

  /**
   * Simulates WebXR session failure after initial success
   * Tests error handling during active XR sessions
   */
  static async simulateWebXRSessionFailure(page: Page, delayMs: number = 2000): Promise<void> {
    await page.addInitScript((delay: number) => {
      const originalRequestSession = navigator.xr?.requestSession
      if (originalRequestSession) {
        ;(navigator.xr as MockXRSystem).requestSession = function(mode: string, options?: XRSessionInit) {
          return originalRequestSession.call(this, mode, options).then(session => {
            // Simulate session failure after delay
            setTimeout(() => {
              const errorEvent = new Event('error')
              session.dispatchEvent(errorEvent)
              
              // Also trigger custom event for testing
              window.dispatchEvent(new CustomEvent('xr-session-error', {
                detail: { mode, error: 'Session terminated unexpectedly' }
              }))
            }, delay)
            
            return session
          })
        }
      }
    }, delayMs)
  }

  /**
   * Simulates progressive performance degradation
   * Tests automatic quality adjustment over time
   */
  static async simulateProgressivePerformanceDegradation(page: Page): Promise<void> {
    await page.addInitScript(() => {
      let performanceFactor = 1.0
      const degradationRate = 0.1
      
      const interval = setInterval(() => {
        performanceFactor = Math.max(0.2, performanceFactor - degradationRate)
        
        // Dispatch performance events for React Three Fiber PerformanceMonitor
        window.dispatchEvent(new CustomEvent('performance-change', {
          detail: { 
            factor: performanceFactor,
            fps: Math.round(60 * performanceFactor),
            frameTime: Math.round((1000 / (60 * performanceFactor)) * 100) / 100
          }
        }))
        
        if (performanceFactor <= 0.2) {
          clearInterval(interval)
        }
      }, 1000)
    })
  }

  /**
   * Mocks mobile browser characteristics
   * Tests mobile-specific WebXR behaviors and limitations
   */
  static async mockMobileBrowser(page: Page): Promise<void> {
    await page.addInitScript(() => {
      // Override user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        writable: false
      })
      
      // Mock touch interface
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5,
        writable: false
      })
      
      // Mock device memory (limited on mobile)
      if ('deviceMemory' in navigator) {
        Object.defineProperty(navigator, 'deviceMemory', {
          value: 2, // 2GB RAM (lower-end mobile device)
          writable: false
        })
      }
      
      // Mock connection (slower on mobile)
      if ('connection' in navigator) {
        Object.defineProperty(navigator, 'connection', {
          value: {
            effectiveType: '3g',
            downlink: 1.5,
            rtt: 300
          },
          writable: false
        })
      }
    })
  }

  /**
   * Simulates various browser security restrictions
   * Tests handling of security-related WebXR/WebGL failures
   */
  static async simulateSecurityRestrictions(page: Page): Promise<void> {
    await page.addInitScript(() => {
      // Mock HTTPS requirement failure
      if (location.protocol !== 'https:') {
        const originalRequestSession = navigator.xr?.requestSession
        if (originalRequestSession) {
          ;(navigator.xr as any).requestSession = function() {
            return Promise.reject(new DOMException(
              'WebXR requires a secure context (HTTPS)',
              'SecurityError'
            ))
          }
        }
      }
      
      // Mock permissions denial
      const originalGetContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function(type: string, attributes?: WebGLContextAttributes) {
        if (type.includes('webgl') && attributes?.xrCompatible) {
          throw new DOMException('WebGL creation failed due to security restrictions', 'SecurityError')
        }
        return originalGetContext.call(this, type, attributes)
      }
    })
  }

  /**
   * Resets all mocked APIs to their original state
   * Useful for cleanup between tests
   */
  static async resetAllMocks(page: Page): Promise<void> {
    await page.reload()
  }
}

/**
 * Performance testing utilities for WebXR fallback scenarios
 */
export class PerformanceTestUtils {
  /**
   * Measures frame rate over a specified duration
   */
  static async measureFrameRate(page: Page, durationMs: number = 5000): Promise<number> {
    return await page.evaluate((duration: number) => {
      return new Promise<number>((resolve) => {
        let frameCount = 0
        const startTime = performance.now()
        
        function countFrame() {
          frameCount++
          if (performance.now() - startTime < duration) {
            requestAnimationFrame(countFrame)
          } else {
            const actualDuration = (performance.now() - startTime) / 1000
            const fps = frameCount / actualDuration
            resolve(Math.round(fps))
          }
        }
        
        requestAnimationFrame(countFrame)
      })
    }, durationMs)
  }

  /**
   * Monitors performance events from React Three Fiber
   */
  static async capturePerformanceEvents(page: Page, durationMs: number = 3000): Promise<any[]> {
    const events: PerformanceEvent[] = []
    
    await page.exposeFunction('capturePerformanceEvent', (event: PerformanceEvent) => {
      events.push({ ...event, timestamp: Date.now() })
    })
    
    await page.addInitScript(() => {
      window.addEventListener('performance-change', (event: CustomEvent<PerformanceEvent>) => {
        ;(window as any).capturePerformanceEvent(event.detail)
      })
    })
    
    await page.waitForTimeout(durationMs)
    
    return events
  }

  /**
   * Stress tests WebGL context with high polygon counts
   */
  static async stressTestWebGL(page: Page): Promise<void> {
    await page.addInitScript(() => {
      // Create multiple canvases with complex scenes to stress GPU
      for (let i = 0; i < 10; i++) {
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 512
        const gl = canvas.getContext('webgl')
        
        if (gl) {
          // Create buffer with large amount of data
          const vertices = new Float32Array(100000) // Large vertex buffer
          const buffer = gl.createBuffer()
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
          gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
        }
      }
    })
  }
}

/**
 * Browser capability detection utilities
 */
export class BrowserCapabilityUtils {
  /**
   * Detects actual browser WebXR capabilities
   */
  static async detectWebXRSupport(page: Page): Promise<boolean> {
    return await page.evaluate(async () => {
      if (!navigator.xr) return false
      
      try {
        return await navigator.xr.isSessionSupported('immersive-vr')
      } catch {
        return false
      }
    })
  }

  /**
   * Detects WebGL capabilities and version
   */
  static async detectWebGLSupport(page: Page): Promise<{ webgl1: boolean; webgl2: boolean }> {
    return await page.evaluate(() => {
      const canvas = document.createElement('canvas')
      
      const webgl1 = !!(
        canvas.getContext('webgl') || 
        canvas.getContext('experimental-webgl')
      )
      
      const webgl2 = !!canvas.getContext('webgl2')
      
      return { webgl1, webgl2 }
    })
  }

  /**
   * Gets browser-specific information for test context
   */
  static async getBrowserInfo(page: Page): Promise<{
    userAgent: string
    vendor: string
    platform: string
    language: string
    cookieEnabled: boolean
  }> {
    return await page.evaluate(() => ({
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled
    }))
  }
}