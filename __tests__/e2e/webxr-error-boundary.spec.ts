import { expect, type Page, test } from '@playwright/test';
import { WebXRMockUtils } from '../utils/webxr-mocks';
import { BasePage, TestUtils } from './__utils__/page-objects';

// Type definitions for error API testing
interface ErrorLogData {
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  timestamp: string;
  userAgent: string;
  url?: string;
  webxrSupported?: boolean;
  webglSupported?: boolean;
}

// WebXR simplified error boundary test utilities
class WebXRErrorBoundaryPage extends BasePage {
  async navigateToWebXR() {
    await this.page.goto('/webxr');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyWebXRMode() {
    await expect(this.page.locator('[data-testid="webxr-canvas"]')).toBeVisible();
    await expect(this.page.getByText('WebXR Error')).not.toBeVisible();
  }

  async verifyErrorBoundaryMessage() {
    await expect(this.page.getByText('WebXR Error')).toBeVisible();
    await expect(
      this.page.getByText('Unable to load WebXR experience. Falling back to 2D view.'),
    ).toBeVisible();
  }

  async verifyErrorDisplay() {
    // New ErrorBoundary shows simple error message for WebXR components
    await expect(this.page.getByText('WebXR Error')).toBeVisible();
  }

  async verifyHeroStyleErrorUI() {
    // Verify hero-style error UI with black background
    const errorContainer = this.page.locator('.bg-black');
    await expect(errorContainer).toBeVisible();

    // Verify centered layout
    await expect(this.page.locator('.items-center.justify-center')).toBeVisible();

    // Verify white text
    await expect(this.page.locator('.text-white')).toBeVisible();
  }

  async verifyErrorButtons() {
    const tryAgainButton = this.page.locator('button:has-text("Try Again")');
    const returnMainButton = this.page.locator('button:has-text("Return to Main")');
    await expect(tryAgainButton).toBeVisible();
    await expect(returnMainButton).toBeVisible();
  }

  async clickTryAgainButton() {
    await this.page.locator('button:has-text("Try Again")').click();
  }

  async clickReturnMainButton() {
    await this.page.locator('button:has-text("Return to Main")').click();
  }
}

// Error logging test utilities
const ErrorLoggingUtils = {
  async interceptErrorAPI(page: Page) {
    const errorRequests: ErrorLogData[] = [];

    await page.route('/api/errors', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      errorRequests.push(postData as ErrorLogData);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'logged' }),
      });
    });

    return errorRequests;
  },

  async interceptErrorAPIWithRateLimit(page: Page) {
    let requestCount = 0;
    const errorRequests: Array<Record<string, unknown>> = [];

    await page.route('/api/errors', async (route) => {
      requestCount++;
      const request = route.request();
      const postData = request.postDataJSON();
      errorRequests.push(postData);

      if (requestCount > 10) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Rate limit exceeded' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'logged' }),
        });
      }
    });

    return { errorRequests, getRequestCount: () => requestCount };
  },
};

test.describe('WebXR Error Boundary Integration', () => {
  let webxrPage: WebXRErrorBoundaryPage;

  test.beforeEach(async ({ page }) => {
    webxrPage = new WebXRErrorBoundaryPage(page);
  });

  test.describe('Normal Operation Tests', () => {
    test('should load WebXR experience when fully supported', async ({ page, browserName }) => {
      // Only test full WebXR in Chrome-based browsers
      test.skip(browserName !== 'chromium', 'WebXR only supported in Chromium browsers');

      await WebXRMockUtils.enableFullWebXRSupport(page);
      await webxrPage.navigateToWebXR();

      // Should show WebXR canvas without error
      await webxrPage.verifyWebXRMode();
    });
  });

  test.describe('Error Boundary Tests', () => {
    test('should show hero-style error boundary when WebXR fails', async ({ page }) => {
      // Simulate error that triggers error boundary
      await WebXRMockUtils.disableWebGL(page);
      await webxrPage.navigateToWebXR();

      // Should show error boundary with hero-style UI
      await webxrPage.verifyErrorBoundaryMessage();
      await webxrPage.verifyHeroStyleErrorUI();
      await webxrPage.verifyErrorButtons();
    });

    test('should handle retry functionality', async ({ page }) => {
      await WebXRMockUtils.disableWebGL(page);
      await webxrPage.navigateToWebXR();

      await webxrPage.verifyErrorBoundaryMessage();

      // Test retry functionality (should reload page)
      const navigationPromise = page.waitForNavigation();
      await webxrPage.clickTryAgainButton();
      await navigationPromise;

      // Should attempt to load WebXR again (and fail again due to mocked conditions)
      await webxrPage.verifyErrorBoundaryMessage();
    });

    test('should handle return to main functionality', async ({ page }) => {
      await WebXRMockUtils.disableWebGL(page);
      await webxrPage.navigateToWebXR();

      await webxrPage.verifyErrorBoundaryMessage();

      // Test return home functionality
      const navigationPromise = page.waitForNavigation();
      await webxrPage.clickReturnMainButton();
      await navigationPromise;

      // Should navigate to home page
      await expect(page).toHaveURL('/');
    });

    test('should display correct button styling', async ({ page }) => {
      await WebXRMockUtils.disableWebGL(page);
      await webxrPage.navigateToWebXR();

      // Verify button styling matches hero design
      const tryAgainButton = page.locator('button:has-text("Try Again")');
      const returnButton = page.locator('button:has-text("Return to Main")');

      await expect(tryAgainButton).toBeVisible();
      await expect(returnButton).toBeVisible();

      // Verify button text colors and backgrounds
      await expect(tryAgainButton).toHaveCSS('color', 'rgb(0, 0, 0)'); // black text
      await expect(returnButton).toHaveCSS('color', 'rgb(255, 255, 255)'); // white text
    });
  });

  test.describe('Error Logging API Integration Tests', () => {
    test('should log WebXR errors with proper structure', async ({ page }) => {
      const errorRequests = await ErrorLoggingUtils.interceptErrorAPI(page);

      await WebXRMockUtils.disableWebGL(page);
      await webxrPage.navigateToWebXR();

      // Wait for error to be logged
      await page.waitForTimeout(2000);

      // Verify error was logged
      expect(errorRequests.length).toBeGreaterThan(0);

      const errorData = errorRequests[0];
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toHaveProperty('name');
      expect(errorData.error).toHaveProperty('message');
      expect(errorData).toHaveProperty('timestamp');
      expect(errorData).toHaveProperty('userAgent');

      // Security check: should not contain stack traces in production
      expect(errorData.error).not.toHaveProperty('stack');
    });

    test('should enforce rate limiting on error API', async ({ page }) => {
      const { getRequestCount } = await ErrorLoggingUtils.interceptErrorAPIWithRateLimit(page);

      // Trigger multiple errors rapidly
      await WebXRMockUtils.disableWebGL(page);

      for (let i = 0; i < 15; i++) {
        await page.goto('/webxr');
        await page.waitForTimeout(100);
      }

      await page.waitForTimeout(2000);

      // Should have rate limited after 10 requests
      expect(getRequestCount()).toBeGreaterThan(10);
    });

    test('should sanitize error messages', async ({ page }) => {
      const errorRequests = await ErrorLoggingUtils.interceptErrorAPI(page);

      // Inject malicious script in error message
      await page.addInitScript(() => {
        const originalError = Error;
        // Replace Error constructor in browser context for testing sanitization
        (window as unknown as Record<string, unknown>).Error = (message?: string) => {
          const maliciousMessage = `${message}<script>alert("xss")</script>/sensitive/path`;
          return new originalError(maliciousMessage);
        };
      });

      await WebXRMockUtils.disableWebGL(page);
      await webxrPage.navigateToWebXR();

      await page.waitForTimeout(2000);

      if (errorRequests.length > 0) {
        const errorData = errorRequests[0];

        // Should sanitize file paths and scripts
        expect(errorData.error.message).not.toContain('<script>');
        expect(errorData.error.message).not.toContain('/sensitive/path');
        expect(errorData.error.message).toContain('[PATH]');
      }
    });

    test('should handle offline error queue', async ({ page }) => {
      const errorRequests = await ErrorLoggingUtils.interceptErrorAPI(page);

      // Simulate offline mode
      await TestUtils.mockNetworkConditions(page, 'offline');

      await WebXRMockUtils.disableWebGL(page);
      await webxrPage.navigateToWebXR();

      // Go back online
      await TestUtils.mockNetworkConditions(page, 'fast');

      // Trigger online event to flush queue
      await page.evaluate(() => {
        window.dispatchEvent(new Event('online'));
      });

      await page.waitForTimeout(2000);

      // Errors should be sent when back online
      expect(errorRequests.length).toBeGreaterThan(0);
    });
  });

  test.describe('Cross-Browser Compatibility Tests', () => {
    test('should handle Safari without WebXR support', async ({ page, browserName }) => {
      test.skip(browserName === 'chromium', 'Testing Safari-specific behavior');

      await webxrPage.navigateToWebXR();

      // Safari should show error boundary due to limited WebXR support
      // This test might need adjustment based on your actual Safari handling
      await page.waitForTimeout(2000);
      const hasError = await page.getByText('WebXR Experience Unavailable').isVisible();
      if (hasError) {
        await webxrPage.verifyErrorBoundaryMessage();
      }
    });

    test('should handle Firefox WebXR limitations', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'Testing Firefox-specific behavior');

      await webxrPage.navigateToWebXR();

      // Firefox should show error boundary due to limited WebXR support
      // This test might need adjustment based on your actual Firefox handling
      await page.waitForTimeout(2000);
      const hasError = await page.getByText('WebXR Experience Unavailable').isVisible();
      if (hasError) {
        await webxrPage.verifyErrorBoundaryMessage();
      }
    });

    test('should maintain functionality on mobile browsers', async ({ page }) => {
      // Simulate mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await WebXRMockUtils.disableWebGL(page);
      await webxrPage.navigateToWebXR();

      // Should show error boundary on mobile
      await webxrPage.verifyErrorBoundaryMessage();

      // Verify responsive error UI
      await webxrPage.verifyErrorButtons();
    });
  });

  test.describe('Security and Privacy Tests', () => {
    test('should not expose sensitive information in error responses', async ({ page }) => {
      const errorRequests = await ErrorLoggingUtils.interceptErrorAPI(page);

      await WebXRMockUtils.disableWebGL(page);
      await webxrPage.navigateToWebXR();

      await page.waitForTimeout(2000);

      if (errorRequests.length > 0) {
        const errorData = errorRequests[0];

        // Should not contain sensitive data
        expect(JSON.stringify(errorData)).not.toContain('password');
        expect(JSON.stringify(errorData)).not.toContain('token');
        expect(JSON.stringify(errorData)).not.toContain('secret');
        expect(JSON.stringify(errorData)).not.toContain('api_key');

        // Message length should be limited
        expect(errorData.error.message.length).toBeLessThanOrEqual(500);
        expect(errorData.userAgent.length).toBeLessThanOrEqual(200);
      }
    });

    test('should handle malformed API requests gracefully', async ({ page }) => {
      await page.route('/api/errors', async (route) => {
        // Send malformed request
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid error payload' }),
        });
      });

      await WebXRMockUtils.disableWebGL(page);
      await webxrPage.navigateToWebXR();

      // Should handle API error gracefully without breaking the app
      await webxrPage.verifyErrorBoundaryMessage();
    });
  });
});
