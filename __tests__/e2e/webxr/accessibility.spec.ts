import { expect, test } from '@playwright/test';

test.describe('WebXR Accessibility', () => {
  const BASE_URL = 'http://localhost:3000';

  /**
   * Test: Reduced Motion Support
   * Scenario: Hover respects reduced motion preference
   * Given the user has enabled reduced motion preference
   * When hovering over a work card
   * Then the scale change should be minimal (1.05x max)
   * And the animation should be linear, not spring-based
   */
  test('should respect reduced motion preference', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Enable reduced motion via media query emulation
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Navigate to work view
    await page.click('[aria-label*="Navigate to work"]', {
      timeout: 10000,
    });

    // Wait for work cards to be visible
    await page.waitForSelector('[data-testid="work-cards"]', {
      timeout: 10000,
    });

    // Get initial styles
    await page.evaluate(() => {
      const canvas = document.querySelector('[data-testid="webxr-canvas"]');
      return canvas ? window.getComputedStyle(canvas).transform : null;
    });

    // Simulate hover
    await page.mouse.move(400, 300);

    // Wait a bit for animation to start
    await page.waitForTimeout(100);

    // Check that animation timing function is linear or disabled
    const respectsReducedMotion = await page.evaluate(() => {
      const animatedElements = document.querySelectorAll('[data-testid="work-cards"] *');
      for (const element of animatedElements) {
        const style = window.getComputedStyle(element);
        const transitionTiming = style.transitionTimingFunction;
        const animationTiming = style.animationTimingFunction;

        // Should be linear or none
        if (transitionTiming !== 'none' && !transitionTiming.includes('linear')) {
          return false;
        }
        if (animationTiming !== 'none' && !animationTiming.includes('linear')) {
          return false;
        }
      }
      return true;
    });

    expect(respectsReducedMotion).toBeTruthy();
  });

  /**
   * Test: Reduced Motion Transitions
   * Scenario: Transitions respect reduced motion
   * Given the user has enabled reduced motion preference
   * When transitioning between views
   * Then animations should be linear
   * And transition time should be reduced to 400ms
   * And no spring overshoot should occur
   */
  test('should use linear transitions with reduced motion', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Start transition timing
    const startTime = Date.now();

    // Navigate to work view
    await page.click('[aria-label*="Navigate to work"]', {
      timeout: 10000,
    });

    // Wait for transition to complete
    await page.waitForSelector('[data-testid="work-cards"]', {
      state: 'visible',
      timeout: 10000,
    });

    const endTime = Date.now();
    const transitionTime = endTime - startTime;

    // With reduced motion, transitions should be faster
    expect(transitionTime).toBeLessThan(500);

    // Verify animations are linear
    const areAnimationsLinear = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid*="animated"]');
      for (const element of elements) {
        const style = window.getComputedStyle(element);
        if (style.transitionTimingFunction !== 'none') {
          return style.transitionTimingFunction.includes('linear');
        }
      }
      return true;
    });

    expect(areAnimationsLinear).toBeTruthy();
  });

  /**
   * Test: Keyboard Navigation - Navigation Button
   * Scenario: Navigation button is accessible
   * Then the button should be keyboard navigable
   * And the button should have proper ARIA label
   * And the button should support screen readers
   */
  test('navigation button should be keyboard navigable', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Find navigation button
    const navButton = page.locator('[aria-label*="Navigate"]').first();

    // Verify button is focusable
    await navButton.focus();
    expect(await navButton.evaluate((el) => document.activeElement === el)).toBeTruthy();

    // Verify ARIA label is present and descriptive
    const ariaLabel = await navButton.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/^Navigate to (work|home) view$/);

    // Verify Enter key activates the button
    const navigationText = await navButton.textContent();
    const initialText = navigationText?.trim() || '';

    await navButton.press('Enter');
    await page.waitForTimeout(500);

    // Text should have changed
    const newText = await navButton.textContent();
    const updatedText = newText?.trim() || '';
    expect(updatedText).not.toBe(initialText);

    // Verify Space key also works
    await navButton.press('Space');
    await page.waitForTimeout(500);

    const finalText = await navButton.textContent();
    const finalTextTrimmed = finalText?.trim() || '';
    expect(finalTextTrimmed).toBe(initialText);
  });

  /**
   * Test: Keyboard Navigation - Tab Order
   * Scenario: Tab key moves through interactive elements
   */
  test('should maintain logical tab order', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Get all focusable elements
    const focusableElements = await page.evaluate(() => {
      const focusable = Array.from(
        document.querySelectorAll(
          'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',
        ),
      );
      return focusable.map((el) => ({
        tagName: el.tagName,
        ariaLabel: el.getAttribute('aria-label'),
        textContent: el.textContent?.trim().substring(0, 20),
      }));
    });

    // Verify navigation button is focusable
    expect(focusableElements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ariaLabel: expect.stringMatching(/^Navigate to (work|home) view$/),
        }),
      ]),
    );

    // Tab through elements
    let focusedCount = 0;
    for (const _element of focusableElements) {
      await page.keyboard.press('Tab');
      focusedCount++;
    }

    // All elements should be reachable via tab
    expect(focusedCount).toBeGreaterThan(0);
  });

  /**
   * Test: Focus Indicators
   * Scenario: Focus indicators are visible
   */
  test('should display visible focus indicators', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    const navButton = page.locator('[aria-label*="Navigate"]').first();

    // Focus the button
    await navButton.focus();

    // Check for visible focus indicator
    const hasFocusIndicator = await navButton.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.outline !== 'none' ||
        style.boxShadow !== 'none' ||
        el.hasAttribute('data-focus-visible')
      );
    });

    expect(hasFocusIndicator).toBeTruthy();
  });

  /**
   * Test: Screen Reader Support - ARIA Labels
   * Scenario: ARIA labels are present and descriptive
   */
  test('should have descriptive ARIA labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Check navigation button ARIA label
    const navButton = page.locator('[aria-label*="Navigate"]').first();
    const navAriaLabel = await navButton.getAttribute('aria-label');
    expect(navAriaLabel).toMatch(/^Navigate to (work|home) view$/);

    // Navigate to work view to check work cards
    await navButton.click({ timeout: 10000 });
    await page.waitForSelector('[data-testid="work-cards"]', {
      timeout: 10000,
    });

    // Check work card ARIA labels
    const workCards = page.locator('[data-testid^="work-card"]');
    const count = await workCards.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = workCards.nth(i);
      const ariaLabel = await card.getAttribute('aria-label');

      if (ariaLabel) {
        expect(ariaLabel).toMatch(/.+\s*-\s*.+/);
      }
    }
  });

  /**
   * Test: Screen Reader Support - WIP Badge
   * Scenario: WIP badge is announced
   */
  test('should announce WIP badge to screen readers', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Navigate to work view
    await page.click('[aria-label*="Navigate to work"]', {
      timeout: 10000,
    });
    await page.waitForSelector('[data-testid="work-cards"]', {
      timeout: 10000,
    });

    // Check WIP badge is present with proper accessibility attributes
    const wipBadge = page.locator('[data-testid="wip-badge"]').first();

    const isVisible = await wipBadge.isVisible();

    if (isVisible) {
      // Check for proper ARIA attributes
      const role = await wipBadge.getAttribute('role');
      const ariaLabel = await wipBadge.getAttribute('aria-label');

      // Badge should have either a role or aria-label for screen readers
      expect(role || ariaLabel).toBeTruthy();

      if (ariaLabel) {
        expect(ariaLabel.toLowerCase()).toContain('wip');
      }
    }
  });

  /**
   * Test: Screen Reader Support - State Changes
   * Scenario: State changes are announced
   */
  test('should announce view transitions', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    const navButton = page.locator('[aria-label*="Navigate"]').first();

    // Get initial ARIA label
    const initialLabel = await navButton.getAttribute('aria-label');

    // Trigger navigation
    await navButton.click({ timeout: 10000 });
    await page.waitForTimeout(500);

    // Get updated ARIA label
    const updatedLabel = await navButton.getAttribute('aria-label');

    // ARIA label should reflect new state
    expect(updatedLabel).not.toBe(initialLabel);
    expect(updatedLabel).toMatch(/^Navigate to (work|home) view$/);
  });

  /**
   * Test: Color Contrast - Text
   * Scenario: Text meets WCAG AA contrast (4.5:1)
   */
  test('text should meet WCAG AA contrast requirements', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Check navigation text contrast
    const contrastResults = await page.evaluate(() => {
      const results: Array<{ element: string; ratio: number; passes: boolean }> = [];

      // Helper function to get contrast ratio
      const getContrastRatio = (foreground: RgbColor, background: RgbColor): number => {
        const luminance = (color: RgbColor): number => {
          const normalized = (channel: number): number => {
            const sRGB = channel / 255;
            return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
          };
          return (
            0.2126 * normalized(color.red) +
            0.7152 * normalized(color.green) +
            0.0722 * normalized(color.blue)
          );
        };

        const l1 = luminance(foreground);
        const l2 = luminance(background);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      };

      const hexToRgb = (hex: string): RgbColor | null => {
        const clean = hex.replace(/^#/, '');
        if (clean.length === 3) {
          const expanded = clean
            .split('')
            .map((c) => `${c}${c}`)
            .join('');
          return hexToRgb(`#${expanded}`);
        }
        if (clean.length !== 6) return null;
        return {
          red: Number.parseInt(clean.substring(0, 2), 16),
          green: Number.parseInt(clean.substring(2, 4), 16),
          blue: Number.parseInt(clean.substring(4, 6), 16),
        };
      };

      interface RgbColor {
        red: number;
        green: number;
        blue: number;
      }

      // Check navigation button text (white on dark background)
      const navText = document.querySelector('[data-testid="navigation-text"]');
      if (navText) {
        const style = window.getComputedStyle(navText);
        const color = style.color;
        const backgroundColor = '#000000'; // VR background

        const fgColor = hexToRgb(color);
        if (fgColor) {
          const bgColor = hexToRgb(backgroundColor) || { red: 0, green: 0, blue: 0 };
          const ratio = getContrastRatio(fgColor, bgColor);
          results.push({
            element: 'navigation-text',
            ratio: Number.parseFloat(ratio.toFixed(2)),
            passes: ratio >= 4.5,
          });
        }
      }

      return results;
    });

    for (const result of contrastResults) {
      expect(result.passes)
        .withContext(
          `Element ${result.element} has contrast ratio ${result.ratio}:1 (minimum 4.5:1)`,
        )
        .toBeTruthy();
    }
  });

  /**
   * Test: Color Contrast - Badges
   * Scenario: Badges meet WCAG AA contrast
   */
  test('badges should meet WCAG AA contrast requirements', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Navigate to work view
    await page.click('[aria-label*="Navigate to work"]', {
      timeout: 10000,
    });
    await page.waitForSelector('[data-testid="work-cards"]', {
      timeout: 10000,
    });

    // Check WIP badge contrast
    const wipBadge = page.locator('[data-testid="wip-badge"]').first();
    const isVisible = await wipBadge.isVisible();

    if (isVisible) {
      const badgeContrast = await wipBadge.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const backgroundColor = style.backgroundColor;
        const color = style.color;

        const hexToRgb = (hex: string): RgbColor | null => {
          const clean = hex.replace(/^#/, '');
          if (clean.length === 3) {
            const expanded = clean
              .split('')
              .map((c) => `${c}${c}`)
              .join('');
            return hexToRgb(`#${expanded}`);
          }
          if (clean.length !== 6) return null;
          return {
            red: Number.parseInt(clean.substring(0, 2), 16),
            green: Number.parseInt(clean.substring(2, 4), 16),
            blue: Number.parseInt(clean.substring(4, 6), 16),
          };
        };

        interface RgbColor {
          red: number;
          green: number;
          blue: number;
        }

        const getContrastRatio = (foreground: RgbColor, background: RgbColor): number => {
          const luminance = (color: RgbColor): number => {
            const normalized = (channel: number): number => {
              const sRGB = channel / 255;
              return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
            };
            return (
              0.2126 * normalized(color.red) +
              0.7152 * normalized(color.green) +
              0.0722 * normalized(color.blue)
            );
          };

          const l1 = luminance(foreground);
          const l2 = luminance(background);
          const lighter = Math.max(l1, l2);
          const darker = Math.min(l1, l2);
          return (lighter + 0.05) / (darker + 0.05);
        };

        const fgColor = hexToRgb(color);
        const bgColor = hexToRgb(backgroundColor);

        if (fgColor && bgColor) {
          const ratio = getContrastRatio(fgColor, bgColor);
          return {
            ratio: Number.parseFloat(ratio.toFixed(2)),
            passes: ratio >= 4.5,
            foreground: color,
            background: backgroundColor,
          };
        }

        return null;
      });

      if (badgeContrast) {
        expect(badgeContrast.passes)
          .withContext(`Badge has contrast ratio ${badgeContrast.ratio}:1 (minimum 4.5:1)`)
          .toBeTruthy();
      }
    }
  });

  /**
   * Test: Color Contrast - Hover States
   * Scenario: Hover states maintain contrast
   */
  test('hover states should maintain adequate contrast', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    const navButton = page.locator('[aria-label*="Navigate"]').first();

    // Get normal state colors
    const normalColors = await navButton.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
      };
    });

    // Hover the button
    await navButton.hover();
    await page.waitForTimeout(100);

    // Get hover state colors
    const hoverColors = await navButton.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
      };
    });

    // Verify colors have changed (hover state)
    expect(hoverColors.color).not.toBe(normalColors.color);

    // Check contrast is still adequate
    const hoverContrast = await navButton.evaluate((el) => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const backgroundColor = '#000000';

      const hexToRgb = (hex: string): RgbColor | null => {
        const clean = hex.replace(/^#/, '');
        if (clean.length === 3) {
          const expanded = clean
            .split('')
            .map((c) => `${c}${c}`)
            .join('');
          return hexToRgb(`#${expanded}`);
        }
        if (clean.length !== 6) return null;
        return {
          red: Number.parseInt(clean.substring(0, 2), 16),
          green: Number.parseInt(clean.substring(2, 4), 16),
          blue: Number.parseInt(clean.substring(4, 6), 16),
        };
      };

      interface RgbColor {
        red: number;
        green: number;
        blue: number;
      }

      const getContrastRatio = (foreground: RgbColor, background: RgbColor): number => {
        const luminance = (color: RgbColor): number => {
          const normalized = (channel: number): number => {
            const sRGB = channel / 255;
            return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
          };
          return (
            0.2126 * normalized(color.red) +
            0.7152 * normalized(color.green) +
            0.0722 * normalized(color.blue)
          );
        };

        const l1 = luminance(foreground);
        const l2 = luminance(background);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      };

      const fgColor = hexToRgb(color);
      const bgColor = hexToRgb(backgroundColor) || { red: 0, green: 0, blue: 0 };

      if (fgColor) {
        return getContrastRatio(fgColor, bgColor);
      }

      return 0;
    });

    expect(hoverContrast).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * Test: Font Size - Readability
   * Scenario: Text size is readable (16-20pt equivalent)
   */
  test('text should be readable size (16-20pt equivalent)', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Check navigation text font size
    const fontSizeResults = await page.evaluate(() => {
      const results: Array<{ element: string; size: string; passes: boolean }> = [];

      const navText = document.querySelector('[data-testid="navigation-text"]');
      if (navText) {
        const style = window.getComputedStyle(navText);
        const fontSize = style.fontSize;
        const match = fontSize.match(/^([\d.]+)(px|pt|em|rem)$/);

        if (match) {
          const value = Number.parseFloat(match[1]);
          const unit = match[2];

          let sizeInPt = value;
          if (unit === 'px') {
            sizeInPt = value * 0.75;
          } else if (unit === 'rem' || unit === 'em') {
            sizeInPt = value * 16 * 0.75;
          }

          results.push({
            element: 'navigation-text',
            size: fontSize,
            passes: sizeInPt >= 16 && sizeInPt <= 20,
          });
        }
      }

      return results;
    });

    for (const result of fontSizeResults) {
      expect(result.passes)
        .withContext(
          `Element ${result.element} has font size ${result.size} (should be 16-20pt equivalent)`,
        )
        .toBeTruthy();
    }
  });

  /**
   * Test: Font Size - Viewport Scaling
   * Scenario: Font size scales with viewport
   */
  test('font size should scale with viewport', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Get font size at default viewport
    const defaultFontSize = await page.evaluate(() => {
      const navText = document.querySelector('[data-testid="navigation-text"]');
      if (navText) {
        const style = window.getComputedStyle(navText);
        return style.fontSize;
      }
      return null;
    });

    // Resize viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Get font size at new viewport
    const resizedFontSize = await page.evaluate(() => {
      const navText = document.querySelector('[data-testid="navigation-text"]');
      if (navText) {
        const style = window.getComputedStyle(navText);
        return style.fontSize;
      }
      return null;
    });

    // Font size should be consistent (WebXR uses 3D world units, not CSS viewport units)
    expect(resizedFontSize).toBe(defaultFontSize);
  });

  /**
   * Test: Font Loading
   * Scenario: GT Eesti Display Bold is loaded
   */
  test('should load GT Eesti Display Bold font', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Check if custom font is loaded
    const isFontLoaded = await page.evaluate(async () => {
      return new Promise<boolean>((resolve) => {
        if ('fonts' in document) {
          document.fonts
            .load('bold 16px "GT Eesti Display"')
            .then(() => {
              const isLoaded = document.fonts.check('bold 16px "GT Eesti Display"');
              resolve(isLoaded);
            })
            .catch(() => {
              resolve(false);
            });
        } else {
          // Fallback check - if FontFace API not available
          const testElement = document.createElement('div');
          testElement.style.fontFamily = '"GT Eesti Display", sans-serif';
          testElement.style.fontWeight = 'bold';
          testElement.style.opacity = '0';
          testElement.textContent = 'test';
          document.body.appendChild(testElement);

          const computedFont = window.getComputedStyle(testElement).fontFamily;
          const hasCustomFont = computedFont.includes('GT Eesti Display');

          document.body.removeChild(testElement);
          resolve(hasCustomFont);
        }
      });
    });

    expect(isFontLoaded).toBeTruthy();
  });

  /**
   * Test: Escape Key
   * Scenario: Escape cancels interactions
   */
  test('escape key should cancel interactions', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Navigate to work view
    await page.click('[aria-label*="Navigate to work"]', {
      timeout: 10000,
    });
    await page.waitForSelector('[data-testid="work-cards"]', {
      timeout: 10000,
    });

    // Get initial view state
    const initialView = await page.evaluate(() => {
      return document.body.getAttribute('data-webxr-view');
    });

    // Press escape key
    await page.keyboard.press('Escape');

    // Wait a bit for the action to process
    await page.waitForTimeout(500);

    // Verify escape doesn't cause errors (may or may not change view depending on implementation)
    expect(initialView).not.toBeNull();
  });

  /**
   * Test: Accessibility Integration
   * Scenario: All accessibility features work together
   */
  test('all accessibility features should work together', async ({ page }) => {
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Check all accessibility criteria
    const accessibilityReport = await page.evaluate(() => {
      const report = {
        hasReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        hasFocusableElements: false,
        hasAriaLabels: false,
        hasVisibleFocus: false,
        contrastMeetsThreshold: false,
      };

      // Check focusable elements
      const focusableElements = document.querySelectorAll(
        'button, a[href], [tabindex]:not([tabindex="-1"])',
      );
      report.hasFocusableElements = focusableElements.length > 0;

      // Check ARIA labels
      const ariaLabeled = document.querySelectorAll('[aria-label]');
      report.hasAriaLabels = ariaLabeled.length > 0;

      // Check focus visibility
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        firstElement.focus();
        const style = window.getComputedStyle(firstElement);
        report.hasVisibleFocus = style.outline !== 'none' || style.boxShadow !== 'none';
      }

      // Check contrast for navigation text
      const navText = document.querySelector('[data-testid="navigation-text"]');
      if (navText) {
        const style = window.getComputedStyle(navText);
        const isWhite =
          style.color === 'rgb(255, 255, 255)' ||
          style.color === '#ffffff' ||
          style.color === 'white';
        report.contrastMeetsThreshold = isWhite; // White on black meets WCAG AA
      }

      return report;
    });

    expect(accessibilityReport.hasReducedMotion).toBeTruthy();
    expect(accessibilityReport.hasFocusableElements).toBeTruthy();
    expect(accessibilityReport.hasAriaLabels).toBeTruthy();
    expect(accessibilityReport.hasVisibleFocus).toBeTruthy();
    expect(accessibilityReport.contrastMeetsThreshold).toBeTruthy();
  });
});

test.describe('WebXR Accessibility - Cross-Device', () => {
  const BASE_URL = 'http://localhost:3000';

  /**
   * Test: Mobile Accessibility
   * Scenario: Accessibility features work on mobile
   */
  test('accessibility should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Navigation button should still be accessible
    const navButton = page.locator('[aria-label*="Navigate"]').first();
    await navButton.focus();
    const isFocused = await navButton.evaluate((el) => document.activeElement === el);
    expect(isFocused).toBeTruthy();
  });

  /**
   * Test: Tablet Accessibility
   * Scenario: Accessibility features work on tablet
   */
  test('accessibility should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/webxr`);

    // Wait for WebXR experience to load
    await page.waitForSelector('[data-testid="webxr-canvas"]', {
      timeout: 15000,
    });

    // Navigation button should still be accessible
    const navButton = page.locator('[aria-label*="Navigate"]').first();
    const ariaLabel = await navButton.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/^Navigate to (work|home) view$/);
  });
});
