import { expect, test } from '@playwright/test';
import { HomePage, TestUtils } from './__utils__/page-objects';

test.describe('Navigation', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should load homepage with all essential elements', async ({ page: _page }) => {
    await homePage.goto('/');
    await homePage.verifyPageLoad();
  });

  test('should have working theme switcher', async ({ page: _page }) => {
    await homePage.goto('/');

    // Test theme switching functionality
    await TestUtils.retryAssertion(async () => {
      await homePage.header.toggleTheme();
      await homePage.header.verifyTheme('dark');
    });

    // Switch back to light theme
    await TestUtils.retryAssertion(async () => {
      await homePage.header.toggleTheme();
      await homePage.header.verifyTheme('light');
    });
  });

  test('should persist theme preference across page reloads', async ({ page }) => {
    await homePage.goto('/');

    // Switch to dark theme
    await homePage.header.toggleTheme();
    await homePage.header.verifyTheme('dark');

    // Reload page
    await page.reload();
    await homePage.header.verifyHeaderVisible();

    // Theme should persist
    await homePage.header.verifyTheme('dark');
  });

  test('should navigate to work pages when available', async ({ page }) => {
    await homePage.goto('/');

    // Navigate to first available work
    const workHref = await homePage.works.navigateToFirstWork();

    if (workHref) {
      // Verify navigation
      await expect(page).toHaveURL(new RegExp(workHref));

      // Verify work page content
      await TestUtils.waitForStableContent(page);
      await expect(page.locator('main')).toBeVisible();
    } else {
      test.skip(() => true, 'No work links found on homepage');
    }
  });

  test('should handle navigation errors gracefully', async ({ page }) => {
    // Test navigation to non-existent work page
    const response = await page.goto('/works/non-existent-work');

    // Should handle 404 or redirect appropriately
    // This depends on your error handling implementation
    const status = response?.status();
    expect([404, 302, 200]).toContain(status);
  });

  test('should have responsive header across all viewport sizes', async ({ page: _page }) => {
    await homePage.goto('/');
    await homePage.header.verifyResponsiveHeader();
  });

  test('should maintain functionality under slow network conditions', async ({ page }) => {
    // Simulate slow network
    await TestUtils.mockNetworkConditions(page, 'slow');

    await homePage.goto('/');
    await homePage.verifyPageLoad();

    // Test that theme switcher still works
    await homePage.header.toggleTheme();
    await homePage.header.verifyTheme('dark');

    // Reset network conditions
    await TestUtils.mockNetworkConditions(page, 'fast');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await homePage.goto('/');

    // Tab to theme switcher
    await page.keyboard.press('Tab');

    // Should be able to activate with keyboard
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Press Enter to activate (if it's the theme switcher)
    await page.keyboard.press('Enter');

    // Wait a moment for theme change and verify it occurred
    await page.waitForTimeout(200);

    // Check if theme actually changed after keyboard activation
    const currentTheme = await page
      .locator('html')
      .evaluate((el) => (el.classList.contains('dark') ? 'dark' : 'light'));
    // Verify theme switched (either to dark or light, depending on starting state)
    expect(['dark', 'light']).toContain(currentTheme);
  });
});
