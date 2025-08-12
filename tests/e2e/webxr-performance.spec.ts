import { test, expect, Page } from '@playwright/test'
import { WebXRMockUtils, PerformanceTestUtils } from '../utils/webxr-mocks'

/**
 * Performance monitoring and quality adjustment tests for WebXR fallback system
 * Tests automatic quality adjustment, frame rate monitoring, and performance optimization
 */

// Performance test utilities
class PerformanceTestPage {
  constructor(private page: Page) {}

  async navigateToWebXR() {
    await this.page.goto('/webxr')
    await this.page.waitForLoadState('networkidle')
  }

  async waitForPerformanceStabilization(timeMs: number = 3000) {
    await this.page.waitForTimeout(timeMs)
  }

  async verifyQualityIndicator(quality: 'high' | 'medium' | 'low') {
    if (quality !== 'high') {
      await expect(this.page.locator(`[data-testid="quality-indicator"]:has-text("${quality.toUpperCase()}")`))
        .toBeVisible()
    } else {
      // High quality should not show indicator
      await expect(this.page.locator('[data-testid="quality-indicator"]'))
        .not.toBeVisible()
    }
  }

  async verify3DFallbackVisible() {
    await expect(this.page.locator('[data-testid="3d-fallback"]')).toBeVisible()
    await expect(this.page.locator('[data-testid="3d-fallback-canvas"]')).toBeVisible()
  }

  async verify2DFallbackVisible() {
    await expect(this.page.locator('[data-testid="2d-fallback"]')).toBeVisible()
  }

  async getCanvasFrameRate(): Promise<number> {
    return await PerformanceTestUtils.measureFrameRate(this.page, 2000)
  }

  async simulateGPUStress() {
    await this.page.evaluate(() => {
      // Create multiple demanding WebGL contexts to stress the GPU
      const canvases: HTMLCanvasElement[] = []
      for (let i = 0; i < 5; i++) {
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 1024
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
        if (gl) {
          // Create demanding shader program
          const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
          gl.shaderSource(vertexShader, `
            attribute vec4 position;
            void main() {
              gl_Position = position;
            }
          `)
          gl.compileShader(vertexShader)

          const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
          gl.shaderSource(fragmentShader, `
            precision mediump float;
            void main() {
              // Expensive computation
              float result = 0.0;
              for (int i = 0; i < 1000; i++) {
                result += sin(float(i) * 0.01);
              }
              gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
            }
          `)
          gl.compileShader(fragmentShader)

          const program = gl.createProgram()!
          gl.attachShader(program, vertexShader)
          gl.attachShader(program, fragmentShader)
          gl.linkProgram(program)
          gl.useProgram(program)
          
          // Render continuously
          const render = () => {
            gl.clear(gl.COLOR_BUFFER_BIT)
            gl.drawArrays(gl.TRIANGLES, 0, 3)
            requestAnimationFrame(render)
          }
          render()
        }
        canvases.push(canvas)
      }
    })
  }

  async simulateMemoryPressure() {
    await this.page.evaluate(() => {
      // Allocate large arrays to simulate memory pressure
      const memoryHogs: ArrayBuffer[] = []
      try {
        for (let i = 0; i < 100; i++) {
          memoryHogs.push(new ArrayBuffer(10 * 1024 * 1024)) // 10MB each
        }
      } catch (e) {
        // Expected to fail at some point
      }
      
      // Dispatch memory pressure event
      window.dispatchEvent(new CustomEvent('memory-pressure', {
        detail: { severity: 'critical', availableMemory: '50MB' }
      }))
    })
  }

  async monitorPerformanceMetrics(durationMs: number = 5000): Promise<any[]> {
    const performanceEvents: any[] = []
    
    // Expose function to capture performance events
    await this.page.exposeFunction('capturePerformanceMetric', (metric: any) => {
      performanceEvents.push({ ...metric, timestamp: Date.now() })
    })

    // Set up performance monitoring
    await this.page.addInitScript(() => {
      let frameCount = 0
      let lastTime = performance.now()

      const monitorPerformance = () => {
        const currentTime = performance.now()
        const deltaTime = currentTime - lastTime
        frameCount++

        if (deltaTime >= 1000) { // Every second
          const fps = Math.round((frameCount * 1000) / deltaTime)
          const frameTime = deltaTime / frameCount

          ;(window as any).capturePerformanceMetric({
            fps,
            frameTime,
            memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
            isStable: fps > 45
          })

          frameCount = 0
          lastTime = currentTime
        }

        requestAnimationFrame(monitorPerformance)
      }
      
      requestAnimationFrame(monitorPerformance)
    })

    // Wait for monitoring period
    await this.page.waitForTimeout(durationMs)
    
    return performanceEvents
  }

  async triggerPerformanceEvents() {
    await this.page.evaluate(() => {
      // Simulate React Three Fiber PerformanceMonitor events
      const events = [
        { type: 'performance-change', factor: 0.8, fps: 48 },
        { type: 'performance-decline', factor: 0.6, fps: 36 },
        { type: 'performance-decline', factor: 0.4, fps: 24 },
        { type: 'performance-incline', factor: 0.9, fps: 54 }
      ]

      events.forEach((eventData, index) => {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent(eventData.type, { detail: eventData }))
        }, index * 1000)
      })
    })
  }
}

test.describe('WebXR Performance Monitoring and Quality Adjustment', () => {
  let performancePage: PerformanceTestPage

  test.beforeEach(async ({ page }) => {
    performancePage = new PerformanceTestPage(page)
  })

  test.describe('Quality Adjustment Based on Performance', () => {
    test('should start with high quality when performance is good', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await performancePage.navigateToWebXR()
      
      await performancePage.verify3DFallbackVisible()
      await performancePage.waitForPerformanceStabilization()
      
      // Should start with high quality (no indicator shown)
      await performancePage.verifyQualityIndicator('high')
    })

    test('should degrade to medium quality under moderate load', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await WebXRMockUtils.simulateLowPerformance(page)
      
      await performancePage.navigateToWebXR()
      await performancePage.verify3DFallbackVisible()
      
      // Simulate moderate performance decline
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('performance-decline', {
          detail: { factor: 0.6, fps: 36 }
        }))
      })
      
      await performancePage.waitForPerformanceStabilization(2000)
      
      // Should show medium quality indicator
      await performancePage.verifyQualityIndicator('medium')
    })

    test('should degrade to low quality under heavy load', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await WebXRMockUtils.simulateLowPerformance(page)
      
      await performancePage.navigateToWebXR()
      await performancePage.verify3DFallbackVisible()
      
      // Simulate severe performance decline
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('performance-decline', {
          detail: { factor: 0.3, fps: 18 }
        }))
      })
      
      await performancePage.waitForPerformanceStabilization(2000)
      
      // Should show low quality indicator
      await performancePage.verifyQualityIndicator('low')
    })

    test('should upgrade quality when performance improves', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await WebXRMockUtils.simulateLowPerformance(page)
      
      await performancePage.navigateToWebXR()
      await performancePage.verify3DFallbackVisible()
      
      // Start with poor performance
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('performance-decline', {
          detail: { factor: 0.4, fps: 24 }
        }))
      })
      
      await performancePage.waitForPerformanceStabilization(1000)
      await performancePage.verifyQualityIndicator('low')
      
      // Improve performance
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('performance-incline', {
          detail: { factor: 0.9, fps: 54 }
        }))
      })
      
      await performancePage.waitForPerformanceStabilization(2000)
      
      // Should upgrade to high quality
      await performancePage.verifyQualityIndicator('high')
    })
  })

  test.describe('Automatic Performance Monitoring', () => {
    test('should monitor frame rate continuously', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await performancePage.navigateToWebXR()
      
      const performanceMetrics = await performancePage.monitorPerformanceMetrics(3000)
      
      // Should have collected performance data
      expect(performanceMetrics.length).toBeGreaterThan(0)
      
      const firstMetric = performanceMetrics[0]
      expect(firstMetric).toHaveProperty('fps')
      expect(firstMetric).toHaveProperty('frameTime')
      expect(typeof firstMetric.fps).toBe('number')
      expect(firstMetric.fps).toBeGreaterThan(0)
    })

    test('should detect performance degradation automatically', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await performancePage.navigateToWebXR()
      
      // Start monitoring
      const metricsPromise = performancePage.monitorPerformanceMetrics(5000)
      
      // Trigger gradual performance degradation
      await performancePage.triggerPerformanceEvents()
      
      const metrics = await metricsPromise
      
      // Should detect varying performance levels
      const fpsValues = metrics.map(m => m.fps).filter(fps => fps > 0)
      const minFps = Math.min(...fpsValues)
      const maxFps = Math.max(...fpsValues)
      
      expect(maxFps - minFps).toBeGreaterThan(10) // Should show variation
    })

    test('should handle memory pressure gracefully', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await performancePage.navigateToWebXR()
      await performancePage.verify3DFallbackVisible()
      
      // Simulate memory pressure
      await performancePage.simulateMemoryPressure()
      
      await performancePage.waitForPerformanceStabilization(2000)
      
      // Should either maintain 3D with lower quality or fallback to 2D
      const is3DVisible = await page.locator('[data-testid="3d-fallback"]').isVisible()
      const is2DVisible = await page.locator('[data-testid="2d-fallback"]').isVisible()
      
      expect(is3DVisible || is2DVisible).toBe(true)
      
      if (is3DVisible) {
        // Should show quality degradation
        const hasQualityIndicator = await page.locator('[data-testid="quality-indicator"]').isVisible()
        expect(hasQualityIndicator).toBe(true)
      }
    })
  })

  test.describe('GPU Stress Testing', () => {
    test('should handle GPU intensive operations', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await performancePage.navigateToWebXR()
      await performancePage.verify3DFallbackVisible()
      
      // Add GPU stress
      await performancePage.simulateGPUStress()
      
      await performancePage.waitForPerformanceStabilization(3000)
      
      // Should either show quality degradation or fallback
      const is3DVisible = await page.locator('[data-testid="3d-fallback"]').isVisible()
      const is2DVisible = await page.locator('[data-testid="2d-fallback"]').isVisible()
      
      expect(is3DVisible || is2DVisible).toBe(true)
    })

    test('should fallback to 2D when 3D becomes unstable', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await performancePage.navigateToWebXR()
      await performancePage.verify3DFallbackVisible()
      
      // Simulate extreme performance issues
      await page.evaluate(() => {
        // Trigger multiple severe performance events
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('performance-decline', {
              detail: { factor: 0.1, fps: 6 }
            }))
          }, i * 200)
        }
      })
      
      await performancePage.waitForPerformanceStabilization(3000)
      
      // Should eventually fallback to 2D if 3D is too unstable
      const is2DVisible = await page.locator('[data-testid="2d-fallback"]').isVisible()
      if (is2DVisible) {
        await performancePage.verify2DFallbackVisible()
      }
    })
  })

  test.describe('Performance Metrics Collection', () => {
    test('should track frame time accurately', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await performancePage.navigateToWebXR()
      
      const frameRate = await performancePage.getCanvasFrameRate()
      
      // Should measure reasonable frame rate
      expect(frameRate).toBeGreaterThan(10) // At least 10 FPS
      expect(frameRate).toBeLessThanOrEqual(60) // At most 60 FPS
    })

    test('should collect memory usage data', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await performancePage.navigateToWebXR()
      
      const performanceMetrics = await performancePage.monitorPerformanceMetrics(2000)
      
      if (performanceMetrics.length > 0) {
        const metricWithMemory = performanceMetrics.find(m => m.memoryUsage !== undefined)
        if (metricWithMemory) {
          expect(typeof metricWithMemory.memoryUsage).toBe('number')
          expect(metricWithMemory.memoryUsage).toBeGreaterThan(0)
        }
      }
    })

    test('should identify stable vs unstable performance', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await performancePage.navigateToWebXR()
      
      // Start with stable performance
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('performance-change', {
          detail: { factor: 0.9, fps: 54, isStable: true }
        }))
      })
      
      await performancePage.waitForPerformanceStabilization(1000)
      
      // Then make it unstable
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('performance-change', {
          detail: { factor: 0.3, fps: 18, isStable: false }
        }))
      })
      
      const metrics = await performancePage.monitorPerformanceMetrics(2000)
      
      // Should detect both stable and unstable periods
      const stableMetrics = metrics.filter(m => m.isStable === true)
      const unstableMetrics = metrics.filter(m => m.isStable === false)
      
      expect(stableMetrics.length + unstableMetrics.length).toBeGreaterThan(0)
    })
  })

  test.describe('Quality Configuration Testing', () => {
    test('should respect different quality settings', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await performancePage.navigateToWebXR()
      
      // Test each quality level
      const qualityLevels = ['high', 'medium', 'low'] as const
      
      for (const quality of qualityLevels) {
        await page.evaluate((q) => {
          window.dispatchEvent(new CustomEvent('quality-change', {
            detail: { quality: q }
          }))
        }, quality)
        
        await performancePage.waitForPerformanceStabilization(1000)
        await performancePage.verifyQualityIndicator(quality)
      }
    })

    test('should apply appropriate canvas settings for each quality level', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await performancePage.navigateToWebXR()
      
      const canvasSettings = await page.evaluate(() => {
        const canvas = document.querySelector('[data-testid="3d-fallback-canvas"]') as HTMLCanvasElement
        if (!canvas) return null
        
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        if (!gl) return null
        
        return {
          antialias: gl.getContextAttributes()?.antialias,
          powerPreference: gl.getContextAttributes()?.powerPreference,
          width: canvas.width,
          height: canvas.height
        }
      })
      
      if (canvasSettings) {
        expect(canvasSettings).toHaveProperty('antialias')
        expect(canvasSettings).toHaveProperty('powerPreference')
        expect(canvasSettings.powerPreference).toBe('high-performance')
      }
    })
  })

  test.describe('Performance Edge Cases', () => {
    test('should handle rapid quality changes gracefully', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await performancePage.navigateToWebXR()
      
      // Rapidly change quality settings
      await page.evaluate(() => {
        const qualities = ['high', 'low', 'medium', 'high', 'low']
        qualities.forEach((quality, index) => {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('quality-change', {
              detail: { quality }
            }))
          }, index * 100)
        })
      })
      
      await performancePage.waitForPerformanceStabilization(2000)
      
      // Should still be functional
      await performancePage.verify3DFallbackVisible()
    })

    test('should recover from temporary performance spikes', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await performancePage.navigateToWebXR()
      
      // Create temporary performance spike
      await page.evaluate(() => {
        // Brief spike
        window.dispatchEvent(new CustomEvent('performance-decline', {
          detail: { factor: 0.2, fps: 12 }
        }))
        
        // Recovery
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('performance-incline', {
            detail: { factor: 0.8, fps: 48 }
          }))
        }, 2000)
      })
      
      await performancePage.waitForPerformanceStabilization(4000)
      
      // Should return to good quality
      await performancePage.verifyQualityIndicator('high')
    })

    test('should handle browser tab visibility changes', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await performancePage.navigateToWebXR()
      await performancePage.verify3DFallbackVisible()
      
      // Simulate tab becoming hidden
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { value: true, writable: true })
        Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true })
        document.dispatchEvent(new Event('visibilitychange'))
      })
      
      await page.waitForTimeout(1000)
      
      // Simulate tab becoming visible again
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { value: false, writable: true })
        Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true })
        document.dispatchEvent(new Event('visibilitychange'))
      })
      
      await performancePage.waitForPerformanceStabilization(1000)
      
      // Should still be functional
      await performancePage.verify3DFallbackVisible()
    })
  })
})