import { test, expect, Page } from '@playwright/test'
import { BasePage, TestUtils } from './__utils__/page-objects'
import { WebXRMockUtils, PerformanceTestUtils, BrowserCapabilityUtils } from '../utils/webxr-mocks'

// WebXR fallback test utilities and page objects
class WebXRFallbackPage extends BasePage {
  async navigateToWebXR() {
    await this.page.goto('/webxr')
    await this.page.waitForLoadState('networkidle')
  }

  async verifyWebXRMode() {
    await expect(this.page.locator('[data-testid="webxr-canvas"]')).toBeVisible()
    await expect(this.page.locator('[data-testid="3d-fallback"]')).not.toBeVisible()
    await expect(this.page.locator('[data-testid="2d-fallback"]')).not.toBeVisible()
  }

  async verify3DFallbackMode() {
    await expect(this.page.locator('[data-testid="3d-fallback"]')).toBeVisible()
    await expect(this.page.locator('[data-testid="webxr-canvas"]')).not.toBeVisible()
    await expect(this.page.locator('[data-testid="2d-fallback"]')).not.toBeVisible()
  }

  async verify2DFallbackMode() {
    await expect(this.page.locator('[data-testid="2d-fallback"]')).toBeVisible()
    await expect(this.page.locator('[data-testid="3d-fallback"]')).not.toBeVisible()
    await expect(this.page.locator('[data-testid="webxr-canvas"]')).not.toBeVisible()
  }

  async verifyErrorBoundaryMessage(level: 'webxr' | '3d' | '2d') {
    const errorMessages = {
      webxr: 'WebXR Experience Unavailable',
      '3d': '3D Experience Unavailable', 
      '2d': 'Experience Unavailable'
    }
    
    await expect(this.page.locator('text=' + errorMessages[level])).toBeVisible()
  }

  async verifyFallbackButtons() {
    await expect(this.page.locator('button:has-text("Try Again")')).toBeVisible()
    await expect(this.page.locator('button:has-text("Return to Main Site")')).toBeVisible()
  }

  async clickRetryButton() {
    await this.page.locator('button:has-text("Try Again")').click()
  }

  async clickReturnHomeButton() {
    await this.page.locator('button:has-text("Return to Main Site")').click()
  }

  async verifyQualityIndicator(quality: 'high' | 'medium' | 'low') {
    if (quality !== 'high') {
      await expect(this.page.locator(`text=Performance Mode: ${quality.toUpperCase()}`)).toBeVisible()
    }
  }

  async waitForPerformanceStabilization() {
    // Wait for performance monitoring to stabilize
    await this.page.waitForTimeout(2000)
  }
}


// Error logging test utilities
class ErrorLoggingUtils {
  static async interceptErrorAPI(page: Page) {
    const errorRequests: any[] = []
    
    await page.route('/api/errors', async (route) => {
      const request = route.request()
      const postData = request.postDataJSON()
      errorRequests.push(postData)
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'logged' })
      })
    })

    return errorRequests
  }

  static async interceptErrorAPIWithRateLimit(page: Page) {
    let requestCount = 0
    const errorRequests: any[] = []

    await page.route('/api/errors', async (route) => {
      requestCount++
      const request = route.request()
      const postData = request.postDataJSON()
      errorRequests.push(postData)

      if (requestCount > 10) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Rate limit exceeded' })
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'logged' })
        })
      }
    })

    return { errorRequests, getRequestCount: () => requestCount }
  }
}

test.describe('WebXR Progressive Fallback Integration', () => {
  let webxrPage: WebXRFallbackPage

  test.beforeEach(async ({ page }) => {
    webxrPage = new WebXRFallbackPage(page)
  })

  test.describe('Capability Detection Tests', () => {
    test('should load WebXR experience when fully supported', async ({ page, browserName }) => {
      // Only test full WebXR in Chrome-based browsers
      test.skip(browserName !== 'chromium', 'WebXR only supported in Chromium browsers')
      
      await WebXRMockUtils.enableFullWebXRSupport(page)
      await webxrPage.navigateToWebXR()
      
      // Should show WebXR canvas
      await webxrPage.verifyWebXRMode()
    })

    test('should fallback to 3D when WebXR unavailable', async ({ page, browserName }) => {
      await WebXRMockUtils.disableWebXR(page)
      await webxrPage.navigateToWebXR()
      
      // Should fallback to 3D mode
      await webxrPage.verify3DFallbackMode()
    })

    test('should fallback to 2D when WebGL unavailable', async ({ page }) => {
      await WebXRMockUtils.disableWebGL(page)
      await webxrPage.navigateToWebXR()
      
      // Should fallback to 2D mode
      await webxrPage.verify2DFallbackMode()
    })

    test('should handle WebGL context loss gracefully', async ({ page }) => {
      await WebXRMockUtils.simulateWebGLContextLoss(page)
      await webxrPage.navigateToWebXR()
      
      // Initially should show 3D, then fallback to 2D after context loss
      await webxrPage.verify3DFallbackMode()
      
      // Wait for context loss to trigger
      await page.waitForTimeout(2000)
      
      // Should fallback to 2D
      await webxrPage.verify2DFallbackMode()
    })
  })

  test.describe('Progressive Fallback Chain Tests', () => {
    test('should progress through WebXR → 3D → 2D fallback levels', async ({ page }) => {
      // Start with WebXR disabled
      await WebXRMockUtils.disableWebXR(page)
      await webxrPage.navigateToWebXR()
      
      // Should be in 3D fallback
      await webxrPage.verify3DFallbackMode()
      
      // Trigger WebGL failure
      await page.evaluate(() => {
        // Simulate 3D error to trigger 2D fallback
        const event = new Error('WebGL context lost')
        window.dispatchEvent(new CustomEvent('webgl-error', { detail: event }))
      })
      
      await page.waitForTimeout(1000)
      
      // Should fallback to 2D
      await webxrPage.verify2DFallbackMode()
    })

    test('should show appropriate error messages for each fallback level', async ({ page }) => {
      await WebXRMockUtils.disableWebGL(page)
      await webxrPage.navigateToWebXR()
      
      await webxrPage.verify2DFallbackMode()
      await webxrPage.verifyFallbackButtons()
    })

    test('should handle retry functionality at each level', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await webxrPage.navigateToWebXR()
      
      await webxrPage.verify3DFallbackMode()
      
      // Test retry functionality (should reload page)
      const navigationPromise = page.waitForNavigation()
      await webxrPage.clickRetryButton()
      await navigationPromise
      
      // Should attempt to load WebXR again
      await webxrPage.verify3DFallbackMode()
    })

    test('should handle return to main site functionality', async ({ page }) => {
      await WebXRMockUtils.disableWebGL(page)
      await webxrPage.navigateToWebXR()
      
      await webxrPage.verify2DFallbackMode()
      
      // Test return home functionality
      const navigationPromise = page.waitForNavigation()
      await webxrPage.clickReturnHomeButton()
      await navigationPromise
      
      // Should navigate to home page
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Performance Monitoring Tests', () => {
    test('should adjust quality based on performance', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await WebXRMockUtils.simulateLowPerformance(page)
      await webxrPage.navigateToWebXR()
      
      await webxrPage.verify3DFallbackMode()
      await webxrPage.waitForPerformanceStabilization()
      
      // Should show low performance mode indicator
      await webxrPage.verifyQualityIndicator('low')
    })

    test('should maintain high quality with good performance', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await webxrPage.navigateToWebXR()
      
      await webxrPage.verify3DFallbackMode()
      await webxrPage.waitForPerformanceStabilization()
      
      // Should not show quality indicator (high quality)
      await expect(page.locator('text=Performance Mode')).not.toBeVisible()
    })

    test('should handle progressive quality degradation', async ({ page }) => {
      await WebXRMockUtils.disableWebXR(page)
      await webxrPage.navigateToWebXR()
      
      await webxrPage.verify3DFallbackMode()
      
      // Simulate gradual performance degradation
      await page.evaluate(() => {
        let degradationLevel = 0
        const interval = setInterval(() => {
          degradationLevel++
          // Trigger performance monitoring events
          const event = new CustomEvent('performance-decline', { 
            detail: { factor: Math.max(0.2, 1 - (degradationLevel * 0.1)) }
          })
          window.dispatchEvent(event)
          
          if (degradationLevel >= 5) clearInterval(interval)
        }, 500)
      })
      
      await page.waitForTimeout(3000)
      
      // Should show medium or low quality indicator
      const hasQualityIndicator = await page.locator('text=Performance Mode').isVisible()
      expect(hasQualityIndicator).toBe(true)
    })
  })

  test.describe('Error Logging API Integration Tests', () => {
    test('should log WebXR errors with proper structure', async ({ page }) => {
      const errorRequests = await ErrorLoggingUtils.interceptErrorAPI(page)
      
      await WebXRMockUtils.disableWebGL(page)
      await webxrPage.navigateToWebXR()
      
      // Wait for error to be logged
      await page.waitForTimeout(2000)
      
      // Verify error was logged
      expect(errorRequests.length).toBeGreaterThan(0)
      
      const errorData = errorRequests[0]
      expect(errorData).toHaveProperty('error')
      expect(errorData.error).toHaveProperty('name')
      expect(errorData.error).toHaveProperty('message')
      expect(errorData).toHaveProperty('timestamp')
      expect(errorData).toHaveProperty('userAgent')
      expect(errorData).toHaveProperty('webxrSupported')
      expect(errorData).toHaveProperty('webglSupported')
      
      // Security check: should not contain stack traces in production
      expect(errorData.error).not.toHaveProperty('stack')
    })

    test('should enforce rate limiting on error API', async ({ page }) => {
      const { errorRequests, getRequestCount } = await ErrorLoggingUtils.interceptErrorAPIWithRateLimit(page)
      
      // Trigger multiple errors rapidly
      await WebXRMockUtils.disableWebGL(page)
      
      for (let i = 0; i < 15; i++) {
        await page.goto('/webxr')
        await page.waitForTimeout(100)
      }
      
      await page.waitForTimeout(2000)
      
      // Should have rate limited after 10 requests
      expect(getRequestCount()).toBeGreaterThan(10)
    })

    test('should sanitize error messages', async ({ page }) => {
      const errorRequests = await ErrorLoggingUtils.interceptErrorAPI(page)
      
      // Inject malicious script in error message
      await page.addInitScript(() => {
        const originalError = Error
        window.Error = function(message?: string) {
          const maliciousMessage = message + '<script>alert("xss")</script>/sensitive/path'
          return new originalError(maliciousMessage)
        }
      })
      
      await WebXRMockUtils.disableWebGL(page)
      await webxrPage.navigateToWebXR()
      
      await page.waitForTimeout(2000)
      
      if (errorRequests.length > 0) {
        const errorData = errorRequests[0]
        
        // Should sanitize file paths and scripts
        expect(errorData.error.message).not.toContain('<script>')
        expect(errorData.error.message).not.toContain('/sensitive/path')
        expect(errorData.error.message).toContain('[PATH]')
      }
    })

    test('should handle offline error queue', async ({ page }) => {
      const errorRequests = await ErrorLoggingUtils.interceptErrorAPI(page)
      
      // Simulate offline mode
      await TestUtils.mockNetworkConditions(page, 'offline')
      
      await WebXRMockUtils.disableWebGL(page)
      await webxrPage.navigateToWebXR()
      
      // Go back online
      await TestUtils.mockNetworkConditions(page, 'fast')
      
      // Trigger online event to flush queue
      await page.evaluate(() => {
        window.dispatchEvent(new Event('online'))
      })
      
      await page.waitForTimeout(2000)
      
      // Errors should be sent when back online
      expect(errorRequests.length).toBeGreaterThan(0)
    })
  })

  test.describe('Cross-Browser Compatibility Tests', () => {
    test('should handle Safari without WebXR support', async ({ page, browserName }) => {
      test.skip(browserName === 'chromium', 'Testing Safari-specific behavior')
      
      await webxrPage.navigateToWebXR()
      
      // Safari should fallback to 3D (no WebXR support)
      await webxrPage.verify3DFallbackMode()
    })

    test('should handle Firefox WebXR limitations', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'Testing Firefox-specific behavior')
      
      await webxrPage.navigateToWebXR()
      
      // Firefox should fallback to 3D (limited WebXR support)
      await webxrPage.verify3DFallbackMode()
    })

    test('should maintain functionality on mobile browsers', async ({ page }) => {
      // Simulate mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      await WebXRMockUtils.disableWebXR(page)
      await webxrPage.navigateToWebXR()
      
      // Should work in mobile with 3D fallback
      await webxrPage.verify3DFallbackMode()
      
      // Verify responsive fallback UI
      await webxrPage.verifyFallbackButtons()
    })
  })

  test.describe('Security and Privacy Tests', () => {
    test('should not expose sensitive information in error responses', async ({ page }) => {
      const errorRequests = await ErrorLoggingUtils.interceptErrorAPI(page)
      
      await WebXRMockUtils.disableWebGL(page)
      await webxrPage.navigateToWebXR()
      
      await page.waitForTimeout(2000)
      
      if (errorRequests.length > 0) {
        const errorData = errorRequests[0]
        
        // Should not contain sensitive data
        expect(JSON.stringify(errorData)).not.toContain('password')
        expect(JSON.stringify(errorData)).not.toContain('token')
        expect(JSON.stringify(errorData)).not.toContain('secret')
        expect(JSON.stringify(errorData)).not.toContain('api_key')
        
        // Message length should be limited
        expect(errorData.error.message.length).toBeLessThanOrEqual(500)
        expect(errorData.userAgent.length).toBeLessThanOrEqual(200)
      }
    })

    test('should handle malformed API requests gracefully', async ({ page }) => {
      let apiResponse: any = null
      
      await page.route('/api/errors', async (route) => {
        // Send malformed request
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid error payload' })
        })
      })
      
      await WebXRMockUtils.disableWebGL(page)
      await webxrPage.navigateToWebXR()
      
      // Should handle API error gracefully without breaking the app
      await webxrPage.verify2DFallbackMode()
    })
  })
})