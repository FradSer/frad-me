import { webxrErrorLogger } from '@/utils/errorLogger';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock Google Analytics
const mockGtag = jest.fn();
global.gtag = mockGtag;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console methods
const originalConsole = { ...console };

describe('Error Logger Queue Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();

    // Mock successful fetch by default
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.assign(console, originalConsole);
  });

  describe('Queue Management', () => {
    it('should queue errors when offline', async () => {
      // Mock offline status
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      const testError = new Error('Offline error');

      await webxrErrorLogger.logError(testError, { component: 'TestComponent' });

      // Should not call fetch when offline
      expect(fetch).not.toHaveBeenCalled();

      // Should store in localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'webxr_error_queue',
        expect.any(String)
      );

      // Restore online status
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });
    });

    it('should send queued errors when back online', async () => {
      // Mock offline status
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      // Queue some errors while offline
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      await webxrErrorLogger.logError(error1, { component: 'Comp1' });
      await webxrErrorLogger.logError(error2, { component: 'Comp2' });

      // Should not call fetch when offline
      expect(fetch).not.toHaveBeenCalledTimes(2);

      // Mock coming back online
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });

      // Trigger online event
      window.dispatchEvent(new Event('online'));

      // Wait for queue processing
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should send queued errors
      expect(fetch).toHaveBeenCalledTimes(4); // 2 original + 2 from queue
    });

    it('should respect queue size limits', async () => {
      // Mock offline status
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      // Fill the queue beyond its limit (default 100)
      const promises = [];
      for (let i = 0; i < 105; i++) {
        const error = new Error(`Error ${i}`);
        promises.push(webxrErrorLogger.logError(error, { component: 'Test', index: i }));
      }

      await Promise.all(promises);

      // Check what was stored in localStorage
      const setItemCalls = localStorageMock.setItem.mock.calls;
      const lastQueueData = setItemCalls[setItemCalls.length - 1][1];
      const queue = JSON.parse(lastQueueData);

      // Should not exceed queue size limit
      expect(queue.length).toBeLessThanOrEqual(100);
      expect(queue.length).toBeGreaterThan(90); // Should keep recent errors

      // Restore online status
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });
    });

    it('should restore queue from localStorage on initialization', () => {
      const storedErrors = [
        {
          error: { name: 'Error', message: 'Stored error 1' },
          timestamp: new Date().toISOString(),
          context: { component: 'StoredComp1' },
        },
        {
          error: { name: 'Error', message: 'Stored error 2' },
          timestamp: new Date().toISOString(),
          context: { component: 'StoredComp2' },
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedErrors));

      // Create a new logger instance to test initialization
      const { webxrErrorLogger: newLogger } = require('@/utils/errorLogger');

      // Should load stored errors
      expect(newLogger.getQueueSize()).toBe(2);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Mock corrupted JSON
      localStorageMock.getItem.mockReturnValue('invalid json');

      const { webxrErrorLogger: newLogger } = require('@/utils/errorLogger');

      // Should not throw and should initialize empty queue
      expect(newLogger.getQueueSize()).toBe(0);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to load error queue from localStorage:',
        expect.any(SyntaxError)
      );
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Reset rate limiting by mocking Date.now
      jest.spyOn(Date, 'prototype', 'getTime').mockRestore();
    });

    it('should allow requests under rate limit', async () => {
      const testError = new Error('Rate limit test');

      await webxrErrorLogger.logError(testError, { component: 'Test' });

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should block requests over rate limit', async () => {
      const testError = new Error('Rate limit test');

      // Make requests up to the limit (first 5 are allowed)
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(webxrErrorLogger.logError(testError, { component: 'Test', index: i }));
      }

      await Promise.all(promises);

      // Should have made fewer API calls due to rate limiting
      expect(fetch).toHaveBeenCalledTimes(5); // Only first 5 should go through
    });

    it('should reset rate limit after time window', async () => {
      const testError = new Error('Rate limit reset test');

      // Mock time manipulation
      let currentTime = Date.now();

      jest.spyOn(Date, 'now').mockImplementation(() => currentTime);

      // Make requests up to limit
      for (let i = 0; i < 5; i++) {
        await webxrErrorLogger.logError(testError, { component: 'Test', index: i });
      }

      expect(fetch).toHaveBeenCalledTimes(5);

      // Advance time by 1 hour
      currentTime += 60 * 60 * 1000;

      // Should allow more requests after time window
      await webxrErrorLogger.logError(testError, { component: 'Test', index: 5 });

      expect(fetch).toHaveBeenCalledTimes(6);
    });

    it('should continue logging to console even when rate limited', async () => {
      const testError = new Error('Console logging test');

      // Make many requests to trigger rate limiting
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(webxrErrorLogger.logError(testError, { component: 'Test', index: i }));
      }

      await Promise.all(promises);

      // Console should still log all errors
      expect(console.error).toHaveBeenCalledTimes(20);
    });
  });

  describe('Offline Persistence', () => {
    it('should persist errors to localStorage when offline', async () => {
      // Mock offline status
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      const testError = new Error('Offline persistence test');

      await webxrErrorLogger.logError(testError, {
        component: 'OfflineComponent',
        userAction: 'click',
      });

      // Should store in localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'webxr_error_queue',
        expect.stringContaining('Offline persistence test')
      );

      // Restore online status
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });
    });

    it('should handle localStorage quota exceeded', async () => {
      // Mock localStorage.setItem to throw quota exceeded error
      localStorageMock.setItem.mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });

      // Mock offline status
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      const testError = new Error('Storage quota test');

      // Should not throw error despite localStorage failure
      await expect(webxrErrorLogger.logError(testError, { component: 'Test' })).resolves.toBeUndefined();

      // Should log warning
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to save error queue to localStorage:',
        expect.any(DOMException)
      );

      // Restore online status
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });
    });

    it('should retry failed localStorage operations', async () => {
      let callCount = 0;
      localStorageMock.setItem.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Temporary storage error');
        }
        // Succeed on retry
      });

      // Mock offline status
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      const testError = new Error('Retry test');

      await webxrErrorLogger.logError(testError, { component: 'RetryTest' });

      // Should have called setItem multiple times due to retry
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);

      // Restore online status
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });
    });
  });

  describe('Queue Processing', () => {
    it('should process queue in order when coming online', async () => {
      // Mock offline status
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      // Queue errors in specific order
      const errors = ['First', 'Second', 'Third'];
      for (const errorMsg of errors) {
        const error = new Error(errorMsg);
        await webxrErrorLogger.logError(error, { component: 'OrderedTest', order: errorMsg });
      }

      // Mock fetch to track call order
      const fetchCalls: string[] = [];
      (fetch as jest.Mock).mockImplementation(async (url, options) => {
        const body = JSON.parse(options.body);
        fetchCalls.push(body.error.message);
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        };
      });

      // Come back online
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });

      // Trigger online event
      window.dispatchEvent(new Event('online'));

      // Wait for queue processing
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should process errors in order
      expect(fetchCalls).toEqual(['First', 'Second', 'Third']);
    });

    it('should handle API failures during queue processing', async () => {
      // Mock offline status
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      // Queue some errors
      await webxrErrorLogger.logError(new Error('API Failure Test 1'), { component: 'APITest' });
      await webxrErrorLogger.logError(new Error('API Failure Test 2'), { component: 'APITest' });

      // Mock fetch to fail
      (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      // Come back online
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });

      // Trigger online event
      window.dispatchEvent(new Event('online'));

      // Wait for queue processing
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should have attempted to send but failed
      expect(fetch).toHaveBeenCalledTimes(2);

      // Errors should still be in queue after API failure
      expect(webxrErrorLogger.getQueueSize()).toBeGreaterThan(0);

      // Restore online status
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });
    });
  });

  describe('Memory Management', () => {
    it('should prevent memory leaks with large queues', async () => {
      // Mock offline status
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      // Create a large number of errors
      const promises = [];
      for (let i = 0; i < 200; i++) {
        const error = new Error(`Memory test error ${i}`);
        promises.push(webxrErrorLogger.logError(error, {
          component: 'MemoryTest',
          index: i,
          largeData: 'x'.repeat(1000), // Add some data to increase memory usage
        }));
      }

      await Promise.all(promises);

      // Should not exceed queue limit
      expect(webxrErrorLogger.getQueueSize()).toBeLessThanOrEqual(100);

      // Should still be functional
      expect(typeof webxrErrorLogger.clearQueue).toBe('function');

      // Restore online status
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });
    });

    it('should provide queue statistics', () => {
      const stats = webxrErrorLogger.getStats();

      expect(stats).toHaveProperty('totalErrors');
      expect(stats).toHaveProperty('queueSize');
      expect(stats).toHaveProperty('lastErrorTime');
      expect(typeof stats.totalErrors).toBe('number');
      expect(typeof stats.queueSize).toBe('number');
    });

    it('should allow manual queue clearing', async () => {
      // Mock offline status
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      // Add some errors to queue
      await webxrErrorLogger.logError(new Error('Clear test 1'), { component: 'ClearTest' });
      await webxrErrorLogger.logError(new Error('Clear test 2'), { component: 'ClearTest' });

      expect(webxrErrorLogger.getQueueSize()).toBe(2);

      // Clear queue
      webxrErrorLogger.clearQueue();

      expect(webxrErrorLogger.getQueueSize()).toBe(0);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('webxr_error_queue');

      // Restore online status
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });
    });
  });
});
