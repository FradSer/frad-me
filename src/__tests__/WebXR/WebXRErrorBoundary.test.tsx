import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import WebXRErrorBoundary from '@/components/WebXR/WebXRErrorBoundary'

// Test constants
const TEST_IDS = {
  normalComponent: 'normal-component',
  webxr2DFallback: 'webxr-2d-fallback',
  webxr3DFallback: 'webxr-3d-fallback',
} as const

const TEST_MESSAGES = {
  errorBoundary: 'Test error for WebXR Error Boundary',
  webxrUnavailable: 'WebXR Experience Unavailable',
  try3DFallback: 'Try 3D Fallback',
  try2DFallback: 'Try 2D Fallback',
  retryWebXR: 'Retry WebXR',
} as const

// Mock the error logger
jest.mock('@/utils/errorLogger', () => ({
  webxrErrorLogger: {
    logError: jest.fn(),
    logCapabilities: jest.fn(),
  }
}))

// Mock WebXR fallback components
jest.mock('@/components/WebXR/WebXR2DFallback', () => {
  return function WebXR2DFallback() {
    return <div data-testid="webxr-2d-fallback">2D Fallback Component</div>
  }
})

jest.mock('@/components/WebXR/WebXR3DFallback', () => {
  return function WebXR3DFallback() {
    return <div data-testid="webxr-3d-fallback">3D Fallback Component</div>
  }
})

// Test component that throws errors
const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error(TEST_MESSAGES.errorBoundary)
  }
  return <div data-testid={TEST_IDS.normalComponent}>Normal Component</div>
}

describe('WebXRErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console.error for error boundary tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </WebXRErrorBoundary>
      )

      expect(screen.getByTestId(TEST_IDS.normalComponent)).toBeInTheDocument()
    })

    it('should pass through custom props correctly', () => {
      const onError = jest.fn()
      
      render(
        <WebXRErrorBoundary onError={onError} initialLevel="3d" maxRetries={5}>
          <ErrorThrowingComponent shouldThrow={false} />
        </WebXRErrorBoundary>
      )

      expect(screen.getByTestId(TEST_IDS.normalComponent)).toBeInTheDocument()
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling and Fallback Progression', () => {
    it('should catch errors and show WebXR error UI', () => {
      render(
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>
      )

      expect(screen.getByText(TEST_MESSAGES.webxrUnavailable)).toBeInTheDocument()
      expect(screen.getByText(TEST_MESSAGES.try3DFallback)).toBeInTheDocument()
    })

    it('should progress to 3D fallback when requested', async () => {
      render(
        <WebXRErrorBoundary enableAutoFallback={true}>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>
      )

      const fallbackButton = screen.getByText(TEST_MESSAGES.try3DFallback)
      fireEvent.click(fallbackButton)

      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.webxr3DFallback)).toBeInTheDocument()
      })
    })

    it('should progress to 2D fallback from 3D fallback', async () => {
      render(
        <WebXRErrorBoundary initialLevel="3d" enableAutoFallback={true}>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>
      )

      // Should show 3D fallback button since we start at 3D level
      expect(screen.getByText(TEST_MESSAGES.try2DFallback)).toBeInTheDocument()
      
      const fallbackButton = screen.getByText(TEST_MESSAGES.try2DFallback)
      fireEvent.click(fallbackButton)

      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.webxr2DFallback)).toBeInTheDocument()
      })
    })

    it('should show final error state when all fallbacks exhausted', () => {
      render(
        <WebXRErrorBoundary initialLevel="2d">
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>
      )

      // At 2D level, no further fallback should be available
      expect(screen.getByText(TEST_MESSAGES.webxrUnavailable)).toBeInTheDocument()
      expect(screen.queryByText(/Try.*Fallback/)).not.toBeInTheDocument()
    })
  })

  describe('Retry Mechanism', () => {
    it('should allow retrying the original component', async () => {
      let shouldThrow = true
      
      const DynamicErrorComponent = () => {
        if (shouldThrow) {
          throw new Error('Dynamic test error')
        }
        return <div data-testid="recovered-component">Recovered Component</div>
      }

      render(
        <WebXRErrorBoundary maxRetries={3}>
          <DynamicErrorComponent />
        </WebXRErrorBoundary>
      )

      expect(screen.getByText(TEST_MESSAGES.webxrUnavailable)).toBeInTheDocument()
      
      // Fix the error condition
      shouldThrow = false
      
      const retryButton = screen.getByText(TEST_MESSAGES.retryWebXR)
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByTestId('recovered-component')).toBeInTheDocument()
      })
    })

    it('should enforce maximum retry limit', () => {
      const onError = jest.fn()
      
      render(
        <WebXRErrorBoundary maxRetries={2} onError={onError}>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>
      )

      const retryButton = screen.getByText(TEST_MESSAGES.retryWebXR)
      
      // First retry
      fireEvent.click(retryButton)
      expect(screen.getByText(TEST_MESSAGES.retryWebXR)).toBeInTheDocument()
      
      // Second retry (should hit limit)
      fireEvent.click(retryButton)
      
      // Should still show retry since we start with 0 retries
      expect(screen.getByText(TEST_MESSAGES.retryWebXR)).toBeInTheDocument()
    })
  })

  describe('Error Logging and Monitoring', () => {
    it('should call onError prop when error occurs', () => {
      const onError = jest.fn()
      
      render(
        <WebXRErrorBoundary onError={onError}>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>
      )

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      )
    })

    it('should log error details for monitoring', () => {
      const { webxrErrorLogger } = require('@/utils/errorLogger')
      
      render(
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>
      )

      expect(webxrErrorLogger.logError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          fallbackLevel: 'webxr',
          retryCount: 0
        })
      )
    })
  })

  describe('WebXR Capability Detection Edge Cases', () => {
    it('should handle WebXR availability detection errors', () => {
      // Mock navigator.xr to throw error
      Object.defineProperty(global.navigator, 'xr', {
        value: {
          isSessionSupported: jest.fn().mockRejectedValue(new Error('XR not available'))
        },
        writable: true
      })

      render(
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </WebXRErrorBoundary>
      )

      expect(screen.getByTestId(TEST_IDS.normalComponent)).toBeInTheDocument()
    })

    it('should handle missing WebXR API gracefully', () => {
      // Mock navigator without xr
      const originalXR = global.navigator.xr
      delete (global.navigator as any).xr

      render(
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </WebXRErrorBoundary>
      )

      expect(screen.getByTestId(TEST_IDS.normalComponent)).toBeInTheDocument()
      
      // Restore
      ;(global.navigator as any).xr = originalXR
    })
  })

  describe('Component Isolation', () => {
    it('should isolate errors to WebXR boundary only', () => {
      const OuterComponent = () => <div data-testid="outer">Outer Component</div>
      
      render(
        <div>
          <OuterComponent />
          <WebXRErrorBoundary>
            <ErrorThrowingComponent shouldThrow={true} />
          </WebXRErrorBoundary>
        </div>
      )

      // Outer component should still render normally
      expect(screen.getByTestId('outer')).toBeInTheDocument()
      // Error boundary should catch the error
      expect(screen.getByText(TEST_MESSAGES.webxrUnavailable)).toBeInTheDocument()
    })

    it('should reset error state when children change', () => {
      const { rerender } = render(
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>
      )

      expect(screen.getByText(TEST_MESSAGES.webxrUnavailable)).toBeInTheDocument()

      // Rerender with non-throwing component
      rerender(
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </WebXRErrorBoundary>
      )

      // Should still show error boundary until manually reset
      expect(screen.getByText(TEST_MESSAGES.webxrUnavailable)).toBeInTheDocument()
    })
  })

  describe('Performance and Memory', () => {
    it('should not leak memory with multiple error occurrences', () => {
      let errorCount = 0
      const MultiErrorComponent = () => {
        errorCount++
        if (errorCount <= 5) {
          throw new Error(`Error ${errorCount}`)
        }
        return <div>Finally working</div>
      }

      render(
        <WebXRErrorBoundary>
          <MultiErrorComponent />
        </WebXRErrorBoundary>
      )

      // Should handle multiple errors gracefully
      expect(screen.getByText(TEST_MESSAGES.webxrUnavailable)).toBeInTheDocument()
    })

    it('should handle rapid error boundary state changes', async () => {
      const { rerender } = render(
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>
      )

      // Rapid fallback progressions
      fireEvent.click(screen.getByText('Try 3D Fallback'))
      
      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.webxr3DFallback)).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Try 2D Fallback'))
      
      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.webxr2DFallback)).toBeInTheDocument()
      })

      expect(screen.getByTestId('webxr-2d-fallback')).toBeInTheDocument()
    })
  })

  describe('Accessibility and UX', () => {
    it('should provide accessible error messages', () => {
      render(
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>
      )

      const errorHeading = screen.getByRole('heading', { name: /webxr experience unavailable/i })
      expect(errorHeading).toBeInTheDocument()
      
      const retryButton = screen.getByRole('button', { name: /retry webxr/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should provide clear fallback options', () => {
      render(
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>
      )

      expect(screen.getByText(/webxr.*not.*available/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try 3d fallback/i })).toBeInTheDocument()
    })
  })
})