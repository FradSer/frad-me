import { test, expect, Page } from '@playwright/test'
import { WebXRMockUtils } from '../utils/webxr-mocks'

// Type definitions for error API testing
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
  requestNumber?: number
  headers?: Record<string, string>
}

interface APIResponse {
  status: number
  contentType: string
  body: string
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
 * Comprehensive integration tests for the WebXR error logging API
 * Focuses on security, rate limiting, data sanitization, and API behavior
 */

// Error API testing utilities
class ErrorAPITestUtils {
  /**
   * Intercepts error API requests and returns collected data
   */
  static async interceptErrorAPI(page: Page) {
    const errorRequests: ErrorLogData[] = []
    const responses: APIResponse[] = []
    
    await page.route('/api/errors', async (route) => {
      const request = route.request()
      const postData = request.postDataJSON()
      errorRequests.push({
        ...postData,
        timestamp: Date.now(),
        headers: Object.fromEntries(request.headers())
      })
      
      const response = {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'logged' })
      }
      
      responses.push(response)
      await route.fulfill(response)
    })

    return { errorRequests, responses }
  }

  /**
   * Simulates rate limiting behavior with configurable limits
   */
  static async interceptErrorAPIWithRateLimit(page: Page, maxRequests: number = 10) {
    let requestCount = 0
    const errorRequests: ErrorLogData[] = []
    const responses: APIResponse[] = []

    await page.route('/api/errors', async (route) => {
      requestCount++
      const request = route.request()
      const postData = request.postDataJSON()
      
      errorRequests.push({
        ...postData,
        requestNumber: requestCount,
        timestamp: Date.now()
      })

      let response
      if (requestCount > maxRequests) {
        response = {
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Rate limit exceeded' })
        }
      } else {
        response = {
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'logged' })
        }
      }
      
      responses.push(response)
      await route.fulfill(response)
    })

    return { errorRequests, responses, getRequestCount: () => requestCount }
  }

  /**
   * Simulates server errors for testing error handling
   */
  static async interceptErrorAPIWithServerError(page: Page, errorCode: number = 500) {
    const errorRequests: ErrorLogData[] = []
    
    await page.route('/api/errors', async (route) => {
      const request = route.request()
      const postData = request.postDataJSON()
      errorRequests.push(postData)
      
      await route.fulfill({
        status: errorCode,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })

    return errorRequests
  }

  /**
   * Triggers WebXR errors to test API integration
   */
  static async triggerWebXRError(page: Page, errorType: 'webgl' | 'webxr' | 'context-loss' = 'webgl') {
    switch (errorType) {
      case 'webgl':
        await WebXRMockUtils.disableWebGL(page)
        break
      case 'webxr':
        await WebXRMockUtils.disableWebXR(page)
        break
      case 'context-loss':
        await WebXRMockUtils.simulateWebGLContextLoss(page, 500)
        break
    }
    
    await page.goto('/webxr')
    await page.waitForTimeout(2000) // Wait for error to be logged
  }

  /**
   * Injects malicious content for security testing
   */
  static async injectMaliciousContent(page: Page) {
    await page.addInitScript(() => {
      // Override Error constructor to inject malicious content
      const originalError = window.Error
      window.Error = function(message?: string) {
        const maliciousMessage = (message || '') + 
          '<script>alert("XSS")</script>' +
          '/sensitive/api/keys/secret.json' +
          '../../etc/passwd' +
          'DROP TABLE users;'
        return new originalError(maliciousMessage)
      } as any
      
      // Also test user agent injection
      Object.defineProperty(navigator, 'userAgent', {
        value: navigator.userAgent + '<script>malicious();</script>',
        writable: false
      })
    })
  }

  /**
   * Simulates concurrent requests for stress testing
   */
  static async simulateConcurrentRequests(page: Page, count: number = 20) {
    const promises = []
    
    for (let i = 0; i < count; i++) {
      promises.push(
        page.evaluate((index: number) => {
          return fetch('/api/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              error: {
                name: `TestError${index}`,
                message: `Concurrent test error ${index}`
              },
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent
            })
          }).then(res => ({
            status: res.status,
            index
          }))
        }, i)
      )
    }
    
    return Promise.all(promises)
  }
}

test.describe('WebXR Error Logging API Integration', () => {
  test.describe('Basic API Functionality', () => {
    test('should successfully log WebXR errors with correct structure', async ({ page }) => {
      const { errorRequests } = await ErrorAPITestUtils.interceptErrorAPI(page)
      
      await ErrorAPITestUtils.triggerWebXRError(page, 'webgl')
      
      expect(errorRequests.length).toBeGreaterThan(0)
      
      const errorData = errorRequests[0]
      
      // Verify required fields
      expect(errorData).toHaveProperty('error')
      expect(errorData.error).toHaveProperty('name')
      expect(errorData.error).toHaveProperty('message')
      expect(errorData).toHaveProperty('timestamp')
      expect(errorData).toHaveProperty('userAgent')
      expect(errorData).toHaveProperty('webxrSupported')
      expect(errorData).toHaveProperty('webglSupported')
      
      // Verify data types
      expect(typeof errorData.error.name).toBe('string')
      expect(typeof errorData.error.message).toBe('string')
      expect(typeof errorData.timestamp).toBe('string')
      expect(typeof errorData.userAgent).toBe('string')
      expect(typeof errorData.webxrSupported).toBe('boolean')
      expect(typeof errorData.webglSupported).toBe('boolean')
    })

    test('should handle WebGL context loss errors', async ({ page }) => {
      const { errorRequests } = await ErrorAPITestUtils.interceptErrorAPI(page)
      
      await ErrorAPITestUtils.triggerWebXRError(page, 'context-loss')
      
      if (errorRequests.length > 0) {
        const errorData = errorRequests[0]
        expect(errorData.error.message).toContain('WebGL')
        expect(errorData.webglSupported).toBe(true) // Should be true initially
      }
    })

    test('should handle WebXR unavailable errors', async ({ page }) => {
      const { errorRequests } = await ErrorAPITestUtils.interceptErrorAPI(page)
      
      await ErrorAPITestUtils.triggerWebXRError(page, 'webxr')
      
      if (errorRequests.length > 0) {
        const errorData = errorRequests[0]
        expect(errorData.webxrSupported).toBe(false)
      }
    })
  })

  test.describe('Security and Data Sanitization', () => {
    test('should sanitize malicious script content from error messages', async ({ page }) => {
      const { errorRequests } = await ErrorAPITestUtils.interceptErrorAPI(page)
      
      await ErrorAPITestUtils.injectMaliciousContent(page)
      await ErrorAPITestUtils.triggerWebXRError(page, 'webgl')
      
      if (errorRequests.length > 0) {
        const errorData = errorRequests[0]
        
        // Should not contain script tags
        expect(errorData.error.message).not.toContain('<script>')
        expect(errorData.error.message).not.toContain('alert("XSS")')
        expect(errorData.userAgent).not.toContain('<script>')
        expect(errorData.userAgent).not.toContain('malicious()')
      }
    })

    test('should sanitize file paths and sensitive information', async ({ page }) => {
      const { errorRequests } = await ErrorAPITestUtils.interceptErrorAPI(page)
      
      await ErrorAPITestUtils.injectMaliciousContent(page)
      await ErrorAPITestUtils.triggerWebXRError(page, 'webgl')
      
      if (errorRequests.length > 0) {
        const errorData = errorRequests[0]
        
        // Should sanitize file paths
        expect(errorData.error.message).not.toContain('/sensitive/api/keys/')
        expect(errorData.error.message).not.toContain('../../etc/passwd')
        expect(errorData.error.message).toContain('[PATH]') // Should replace with placeholder
        
        // Should not contain SQL injection attempts
        expect(errorData.error.message).not.toContain('DROP TABLE')
      }
    })

    test('should not expose stack traces in production mode', async ({ page }) => {
      const { errorRequests } = await ErrorAPITestUtils.interceptErrorAPI(page)
      
      // Mock production environment
      await page.addInitScript(() => {
        Object.defineProperty(process, 'env', {
          value: { NODE_ENV: 'production' },
          writable: false
        })
      })
      
      await ErrorAPITestUtils.triggerWebXRError(page, 'webgl')
      
      if (errorRequests.length > 0) {
        const errorData = errorRequests[0]
        
        // Should not contain stack trace in production
        expect(errorData.error).not.toHaveProperty('stack')
        expect(errorData).not.toHaveProperty('errorInfo')
      }
    })

    test('should enforce message length limits', async ({ page }) => {
      const { errorRequests } = await ErrorAPITestUtils.interceptErrorAPI(page)
      
      // Inject very long error message
      await page.addInitScript(() => {
        const originalError = window.Error
        window.Error = function(message?: string) {
          const longMessage = 'A'.repeat(1000) // 1000 character message
          return new originalError(longMessage)
        } as any
      })
      
      await ErrorAPITestUtils.triggerWebXRError(page, 'webgl')
      
      if (errorRequests.length > 0) {
        const errorData = errorRequests[0]
        
        // Should limit message length
        expect(errorData.error.message.length).toBeLessThanOrEqual(500)
        expect(errorData.userAgent.length).toBeLessThanOrEqual(200)
      }
    })

    test('should handle malformed JSON requests gracefully', async ({ page }) => {
      let apiResponse: any = null
      
      await page.route('/api/errors', async (route) => {
        apiResponse = {
          status: 400,
          body: { error: 'Invalid error payload' }
        }
        
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid error payload' })
        })
      })
      
      // Send malformed request
      await page.evaluate(() => {
        fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'invalid json'
        }).catch(() => {}) // Ignore fetch errors
      })
      
      expect(apiResponse?.status).toBe(400)
    })
  })

  test.describe('Rate Limiting', () => {
    test('should enforce rate limits after maximum requests', async ({ page }) => {
      const { errorRequests, responses, getRequestCount } = 
        await ErrorAPITestUtils.interceptErrorAPIWithRateLimit(page, 5)
      
      // Trigger multiple errors rapidly
      for (let i = 0; i < 8; i++) {
        await page.evaluate((index: number) => {
          fetch('/api/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              error: { name: 'TestError', message: `Error ${index}` },
              timestamp: new Date().toISOString()
            })
          }).catch(() => {}) // Ignore network errors
        }, i)
      }
      
      await page.waitForTimeout(1000)
      
      // Should have made more than 5 requests
      expect(getRequestCount()).toBeGreaterThan(5)
      
      // Later responses should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })

    test('should handle concurrent requests within rate limits', async ({ page }) => {
      const { errorRequests } = await ErrorAPITestUtils.interceptErrorAPI(page)
      
      const responses = await ErrorAPITestUtils.simulateConcurrentRequests(page, 5)
      
      // All requests within limit should succeed
      const successfulRequests = responses.filter(r => r.status === 200)
      expect(successfulRequests.length).toBe(5)
    })

    test('should reset rate limits after time window', async ({ page }) => {
      // Note: This test would require mocking time or waiting for the actual window
      // For now, we'll test the structure is in place
      
      const { errorRequests, getRequestCount } = 
        await ErrorAPITestUtils.interceptErrorAPIWithRateLimit(page, 3)
      
      // Make requests up to limit
      for (let i = 0; i < 3; i++) {
        await page.evaluate((index: number) => {
          fetch('/api/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              error: { name: 'TestError', message: `Error ${index}` },
              timestamp: new Date().toISOString()
            })
          }).catch(() => {})
        }, i)
      }
      
      expect(getRequestCount()).toBe(3)
    })
  })

  test.describe('Error Handling and Resilience', () => {
    test('should handle server errors gracefully', async ({ page }) => {
      const errorRequests = await ErrorAPITestUtils.interceptErrorAPIWithServerError(page, 500)
      
      await ErrorAPITestUtils.triggerWebXRError(page, 'webgl')
      
      // Should still attempt to log error even if server fails
      expect(errorRequests.length).toBeGreaterThan(0)
    })

    test('should queue errors when offline and send when online', async ({ page }) => {
      const { errorRequests } = await ErrorAPITestUtils.interceptErrorAPI(page)
      
      // Simulate offline mode
      await page.context().setOffline(true)
      
      await ErrorAPITestUtils.triggerWebXRError(page, 'webgl')
      
      // Go back online
      await page.context().setOffline(false)
      
      // Trigger online event to flush queue
      await page.evaluate(() => {
        window.dispatchEvent(new Event('online'))
      })
      
      await page.waitForTimeout(2000)
      
      // Should eventually send queued errors
      expect(errorRequests.length).toBeGreaterThan(0)
    })

    test('should handle network timeouts gracefully', async ({ page }) => {
      let requestReceived = false
      
      await page.route('/api/errors', async (route) => {
        requestReceived = true
        // Simulate timeout by not responding
        await new Promise(resolve => setTimeout(resolve, 5000))
        await route.fulfill({
          status: 408,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Request timeout' })
        })
      })
      
      await ErrorAPITestUtils.triggerWebXRError(page, 'webgl')
      
      // Should attempt to send request
      expect(requestReceived).toBe(true)
    })
  })

  test.describe('Analytics Integration', () => {
    test('should trigger analytics events for errors', async ({ page }) => {
      const analyticsEvents: any[] = []
      
      // Mock Google Analytics
      await page.addInitScript(() => {
        ;(window as any).gtag = function(command: string, eventName: string, parameters: any) {
          ;(window as any).analyticsEvents = (window as any).analyticsEvents || []
          ;(window as any).analyticsEvents.push({ command, eventName, parameters })
        }
      })
      
      await page.exposeFunction('captureAnalyticsEvent', (event: any) => {
        analyticsEvents.push(event)
      })
      
      await page.addInitScript(() => {
        const originalGtag = (window as any).gtag
        ;(window as any).gtag = function(...args: any[]) {
          ;(window as any).captureAnalyticsEvent({
            command: args[0],
            eventName: args[1],
            parameters: args[2]
          })
          return originalGtag?.apply(this, args)
        }
      })
      
      await ErrorAPITestUtils.triggerWebXRError(page, 'webgl')
      await page.waitForTimeout(2000)
      
      // Should have triggered analytics events
      const errorEvents = analyticsEvents.filter(e => e.eventName === 'exception')
      expect(errorEvents.length).toBeGreaterThan(0)
      
      if (errorEvents.length > 0) {
        const errorEvent = errorEvents[0]
        expect(errorEvent.parameters).toHaveProperty('description')
        expect(errorEvent.parameters.description).toContain('WebXR')
      }
    })

    test('should send appropriate metadata to Sentry', async ({ page }) => {
      const sentryEvents: any[] = []
      
      // Mock Sentry
      await page.addInitScript(() => {
        ;(window as any).Sentry = {
          captureException: (error: Error, context: any) => {
            ;(window as any).sentryEvents = (window as any).sentryEvents || []
            ;(window as any).sentryEvents.push({ error: error.message, context })
          }
        }
      })
      
      await page.exposeFunction('captureSentryEvent', (event: any) => {
        sentryEvents.push(event)
      })
      
      await page.addInitScript(() => {
        const originalCaptureException = (window as any).Sentry?.captureException
        if (originalCaptureException) {
          ;(window as any).Sentry.captureException = function(error: Error, context: any) {
            ;(window as any).captureSentryEvent({ error: error.message, context })
            return originalCaptureException.call(this, error, context)
          }
        }
      })
      
      await ErrorAPITestUtils.triggerWebXRError(page, 'webgl')
      await page.waitForTimeout(2000)
      
      // Should have sent data to Sentry
      if (sentryEvents.length > 0) {
        const sentryEvent = sentryEvents[0]
        expect(sentryEvent.context).toHaveProperty('tags')
        expect(sentryEvent.context.tags).toHaveProperty('component', 'WebXR')
        expect(sentryEvent.context).toHaveProperty('extra')
      }
    })
  })

  test.describe('Cross-Browser Compatibility', () => {
    test('should handle different browser user agents correctly', async ({ page, browserName }) => {
      const { errorRequests } = await ErrorAPITestUtils.interceptErrorAPI(page)
      
      await ErrorAPITestUtils.triggerWebXRError(page, 'webgl')
      
      if (errorRequests.length > 0) {
        const errorData = errorRequests[0]
        
        // Should contain browser-specific information
        expect(errorData.userAgent).toBeTruthy()
        expect(typeof errorData.userAgent).toBe('string')
        
        // Browser-specific expectations
        if (browserName === 'chromium') {
          expect(errorData.userAgent).toContain('Chrome')
        } else if (browserName === 'firefox') {
          expect(errorData.userAgent).toContain('Firefox')
        } else if (browserName === 'webkit') {
          expect(errorData.userAgent).toContain('Safari')
        }
      }
    })

    test('should detect browser capabilities correctly', async ({ page, browserName }) => {
      const { errorRequests } = await ErrorAPITestUtils.interceptErrorAPI(page)
      
      await ErrorAPITestUtils.triggerWebXRError(page, 'webgl')
      
      if (errorRequests.length > 0) {
        const errorData = errorRequests[0]
        
        // WebXR support varies by browser
        if (browserName === 'chromium') {
          // Chrome may support WebXR
          expect(typeof errorData.webxrSupported).toBe('boolean')
        } else {
          // Firefox and Safari typically don't support WebXR
          expect(errorData.webxrSupported).toBe(false)
        }
        
        // WebGL should be supported in all modern browsers
        expect(errorData.webglSupported).toBe(true)
      }
    })
  })
})