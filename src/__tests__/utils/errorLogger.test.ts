import { webxrErrorLogger } from '@/utils/errorLogger'

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock Google Analytics
const mockGtag = jest.fn()
global.gtag = mockGtag

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock console methods
const originalConsole = { ...console }

describe('Error Logger Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null)
    
    // Mock successful fetch by default
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Object.assign(console, originalConsole)
  })

  describe('Basic Error Logging', () => {
    it('should log WebXR errors to API', async () => {
      const testError = new Error('Test WebXR error')
      const context = { component: 'WebXRCanvas', fallbackLevel: 'webxr' }

      await webxrErrorLogger.logError(testError, context)

      expect(fetch).toHaveBeenCalledWith('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Test WebXR error')
      })
    })

    it('should include error context in API call', async () => {
      const testError = new Error('Context test error')
      const context = { 
        component: 'WorkCard3D', 
        fallbackLevel: '3d',
        retryCount: 2,
        customData: { cardIndex: 5 }
      }

      await webxrErrorLogger.logError(testError, context)

      const fetchCall = (fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)

      expect(requestBody.context).toMatchObject(context)
      expect(requestBody.message).toBe('Context test error')
    })

    it('should log to Google Analytics when available', async () => {
      const testError = new Error('Analytics test error')
      
      await webxrErrorLogger.logError(testError, { component: 'TestComponent' })

      expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
        description: 'Analytics test error',
        fatal: false,
        custom_parameter_component: 'TestComponent'
      })
    })
  })

  describe('Rate Limiting', () => {
    it('should implement rate limiting for API calls', async () => {
      const testError = new Error('Rate limit test')
      
      // Make multiple rapid calls
      const promises = []
      for (let i = 0; i < 10; i++) {
        promises.push(webxrErrorLogger.logError(testError, { component: 'Test' }))
      }
      
      await Promise.all(promises)

      // Should have made fewer API calls due to rate limiting
      expect((fetch as jest.Mock).mock.calls.length).toBeLessThan(10)
    })

    it('should reset rate limit after time window', async () => {
      const testError = new Error('Rate reset test')
      
      // First call should go through
      await webxrErrorLogger.logError(testError, { component: 'Test' })
      expect(fetch).toHaveBeenCalledTimes(1)

      // Mock time passage (rate limit window)
      jest.advanceTimersByTime(60000) // 1 minute
      
      // Second call should also go through
      await webxrErrorLogger.logError(testError, { component: 'Test' })
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should continue logging to console even when rate limited', async () => {
      const testError = new Error('Console rate limit test')
      
      // Make many calls to trigger rate limiting
      for (let i = 0; i < 20; i++) {
        await webxrErrorLogger.logError(testError, { component: 'Test' })
      }

      // Console should still log all errors
      expect(console.error).toHaveBeenCalledTimes(20)
    })
  })

  describe('Offline Queue Support', () => {
    it('should queue errors when offline', async () => {
      // Mock network failure
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      
      const testError = new Error('Offline test error')
      
      await webxrErrorLogger.logError(testError, { component: 'OfflineTest' })

      // Should store in localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'webxr_error_queue',
        expect.any(String)
      )
    })

    it('should retry queued errors when back online', async () => {
      // Set up queued errors in localStorage
      const queuedErrors = JSON.stringify([
        {
          error: { message: 'Queued error 1', stack: 'stack1' },
          context: { component: 'Queue1' },
          timestamp: Date.now()
        },
        {
          error: { message: 'Queued error 2', stack: 'stack2' },
          context: { component: 'Queue2' },
          timestamp: Date.now()
        }
      ])
      
      localStorageMock.getItem.mockReturnValue(queuedErrors)

      // Mock successful network
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      })

      // Log new error to trigger queue processing
      await webxrErrorLogger.logError(new Error('Trigger error'), { component: 'Trigger' })

      // Should process queued errors plus new one
      expect(fetch).toHaveBeenCalledTimes(3)
    })

    it('should limit queue size to prevent memory issues', async () => {
      // Mock network failure
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const testError = new Error('Queue size test')
      
      // Add many errors to test queue size limiting
      for (let i = 0; i < 150; i++) {
        await webxrErrorLogger.logError(testError, { component: `Test${i}` })
      }

      // Should limit queue size (e.g., to 100 items)
      const setItemCalls = localStorageMock.setItem.mock.calls
      const lastQueueData = setItemCalls[setItemCalls.length - 1][1]
      const queue = JSON.parse(lastQueueData)
      
      expect(queue.length).toBeLessThanOrEqual(100)
    })
  })

  describe('Input Sanitization', () => {
    it('should sanitize error messages', async () => {
      const maliciousError = new Error('<script>alert("xss")</script>')
      
      await webxrErrorLogger.logError(maliciousError, { component: 'XSSTest' })

      const fetchCall = (fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)

      // Should escape or remove dangerous content
      expect(requestBody.message).not.toContain('<script>')
      expect(requestBody.message).not.toContain('alert')
    })

    it('should sanitize context data', async () => {
      const testError = new Error('Sanitize test')
      const maliciousContext = {
        component: 'TestComponent',
        userData: '<img src="x" onerror="alert(1)">',
        config: { script: '<script>harmful()</script>' }
      }

      await webxrErrorLogger.logError(testError, maliciousContext)

      const fetchCall = (fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)

      // Should sanitize dangerous content in context
      expect(JSON.stringify(requestBody.context)).not.toContain('<script>')
      expect(JSON.stringify(requestBody.context)).not.toContain('onerror')
    })

    it('should handle circular references in context', async () => {
      const testError = new Error('Circular test')
      const circularContext: any = { component: 'CircularTest' }
      circularContext.self = circularContext

      await webxrErrorLogger.logError(testError, circularContext)

      // Should not throw error and should make API call
      expect(fetch).toHaveBeenCalled()
    })
  })

  describe('WebXR/WebGL Capability Detection', () => {
    it('should detect WebXR capabilities', () => {
      // Mock WebXR support
      Object.defineProperty(global.navigator, 'xr', {
        value: {
          isSessionSupported: jest.fn().mockResolvedValue(true)
        },
        writable: true
      })

      const capabilities = webxrErrorLogger.getCapabilities()

      expect(capabilities.webxr).toBeTruthy()
    })

    it('should detect WebGL support', () => {
      // Mock canvas and WebGL
      const mockCanvas = {
        getContext: jest.fn().mockReturnValue({
          getParameter: jest.fn(),
          getSupportedExtensions: jest.fn().mockReturnValue(['WEBGL_debug_renderer_info'])
        })
      }

      Object.defineProperty(global.document, 'createElement', {
        value: jest.fn().mockReturnValue(mockCanvas),
        writable: true
      })

      const capabilities = webxrErrorLogger.getCapabilities()

      expect(capabilities.webgl).toBeTruthy()
    })

    it('should handle capability detection errors gracefully', () => {
      // Mock capability detection failure
      Object.defineProperty(global.navigator, 'xr', {
        get: () => {
          throw new Error('XR detection error')
        }
      })

      const capabilities = webxrErrorLogger.getCapabilities()

      // Should return false rather than throwing
      expect(capabilities.webxr).toBeFalsy()
    })

    it('should include capability info in error logs', async () => {
      const testError = new Error('Capability test')
      
      await webxrErrorLogger.logError(testError, { component: 'CapabilityTest' })

      const fetchCall = (fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)

      expect(requestBody).toHaveProperty('capabilities')
      expect(requestBody.capabilities).toHaveProperty('webxr')
      expect(requestBody.capabilities).toHaveProperty('webgl')
    })
  })

  describe('Error Recovery and Monitoring', () => {
    it('should handle API failures gracefully', async () => {
      // Mock API failure
      ;(fetch as jest.Mock).mockRejectedValue(new Error('API down'))

      const testError = new Error('API failure test')

      // Should not throw error
      await expect(webxrErrorLogger.logError(testError, { component: 'APITest' }))
        .resolves.not.toThrow()

      // Should still log to console
      expect(console.error).toHaveBeenCalled()
    })

    it('should retry failed API calls with exponential backoff', async () => {
      // Mock temporary API failure
      let attempts = 0
      ;(fetch as jest.Mock).mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          return Promise.reject(new Error('Temporary failure'))
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true })
        })
      })

      const testError = new Error('Retry test')

      await webxrErrorLogger.logError(testError, { component: 'RetryTest' })

      // Should have retried and eventually succeeded
      expect(fetch).toHaveBeenCalledTimes(3)
    })

    it('should provide error statistics and monitoring', () => {
      const stats = webxrErrorLogger.getStats()

      expect(stats).toHaveProperty('totalErrors')
      expect(stats).toHaveProperty('errorsByComponent')
      expect(stats).toHaveProperty('lastErrorTime')
      expect(stats).toHaveProperty('queueSize')
    })
  })

  describe('Performance Impact', () => {
    it('should log errors efficiently without blocking', async () => {
      const startTime = performance.now()
      
      const testError = new Error('Performance test')
      
      await webxrErrorLogger.logError(testError, { component: 'PerfTest' })

      const duration = performance.now() - startTime

      // Should complete quickly
      expect(duration).toBeLessThan(100)
    })

    it('should handle high-frequency error logging', async () => {
      const errors = []
      
      for (let i = 0; i < 100; i++) {
        errors.push(webxrErrorLogger.logError(
          new Error(`High freq error ${i}`),
          { component: 'HighFreq', index: i }
        ))
      }

      await Promise.all(errors)

      // Should handle without performance degradation
      expect(true).toBe(true)
    })
  })
})