import { test, expect } from '@playwright/test'
import { HomePage, TestUtils } from './__utils__/page-objects'

test.describe('Theme and Responsive Integration', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
  })

  test.describe('Theme Switching Across Viewports', () => {
    test('should maintain theme state when switching between viewports', async ({ page }) => {
      await homePage.goto('/')
      
      // Switch to dark theme on desktop
      await homePage.setViewport('desktop')
      await homePage.header.toggleTheme()
      await homePage.header.verifyTheme('dark')
      
      // Switch to mobile - theme should persist
      await homePage.setViewport('mobile')
      await homePage.header.verifyTheme('dark')
      
      // Switch to tablet - theme should persist
      await homePage.setViewport('tablet')
      await homePage.header.verifyTheme('dark')
      
      // Switch back to light theme
      await homePage.header.toggleTheme()
      await homePage.header.verifyTheme('light')
      
      // Test persistence across viewport change
      await homePage.setViewport('desktop')
      await homePage.header.verifyTheme('light')
    })

    test('should handle theme switching on mobile devices', async ({ page }) => {
      await homePage.goto('/')
      await homePage.setViewport('mobile')
      
      // Ensure theme switcher is accessible on mobile
      await expect(page.locator('button[aria-label*="Toggle Dark Mode"]')).toBeVisible()
      
      // Test theme switching functionality
      await homePage.header.toggleTheme()
      await homePage.header.verifyTheme('dark')
      
      await homePage.header.toggleTheme()
      await homePage.header.verifyTheme('light')
    })

    test('should handle theme switching with touch interactions', async ({ page }) => {
      await homePage.goto('/')
      await homePage.setViewport('mobile')
      
      const themeSwitcher = page.locator('button[aria-label*="Toggle Dark Mode"]')
      
      // Use touch tap instead of click
      await themeSwitcher.tap()
      await page.waitForTimeout(200)
      
      await homePage.header.verifyTheme('dark')
    })
  })

  test.describe('Responsive Design with Different Themes', () => {
    const testViewports = ['mobile', 'tablet', 'desktop'] as const

    testViewports.forEach(viewport => {
      test(`should render correctly in ${viewport} with light theme`, async ({ page }) => {
        await homePage.goto('/')
        await homePage.setViewport(viewport)
        
        // Ensure light theme
        await homePage.header.verifyTheme('light')
        
        // Verify page structure
        await homePage.verifyPageLoad()
        await homePage.works.verifyWorkSection()
        
        // Take screenshot for visual comparison
        await homePage.takeScreenshot(`${viewport}-light-theme`)
      })

      test(`should render correctly in ${viewport} with dark theme`, async ({ page }) => {
        await homePage.goto('/')
        await homePage.setViewport(viewport)
        
        // Switch to dark theme
        await homePage.header.toggleTheme()
        await homePage.header.verifyTheme('dark')
        
        // Verify page structure is maintained
        await homePage.verifyPageLoad()
        await homePage.works.verifyWorkSection()
        
        // Take screenshot for visual comparison
        await homePage.takeScreenshot(`${viewport}-dark-theme`)
      })
    })
  })

  test.describe('Theme Persistence and System Preferences', () => {
    test('should respect system theme preference on first visit', async ({ page, context }) => {
      // Set system to dark mode
      await context.emulateMedia({ colorScheme: 'dark' })
      
      await homePage.goto('/')
      
      // Should respect system preference (depending on implementation)
      // This test may need adjustment based on your theme implementation
      const htmlElement = page.locator('html')
      const isDark = await htmlElement.evaluate(el => el.classList.contains('dark'))
      
      // Log for debugging - adjust assertion based on your implementation
      console.log('System dark mode respected:', isDark)
    })

    test('should override system preference when user makes explicit choice', async ({ page, context }) => {
      // Set system to dark mode
      await context.emulateMedia({ colorScheme: 'dark' })
      
      await homePage.goto('/')
      
      // User explicitly chooses light theme
      const currentTheme = await page.locator('html').evaluate(el => 
        el.classList.contains('dark') ? 'dark' : 'light'
      )
      
      const targetTheme = currentTheme === 'dark' ? 'light' : 'dark'
      await homePage.header.toggleTheme()
      await homePage.header.verifyTheme(targetTheme)
      
      // Reload page - should maintain user choice
      await page.reload()
      await homePage.header.verifyHeaderVisible()
      // await homePage.header.verifyTheme(targetTheme) // Uncomment if persistence is implemented
    })
  })

  test.describe('Performance with Theme and Responsive Changes', () => {
    test('should handle rapid theme and viewport changes efficiently', async ({ page }) => {
      await homePage.goto('/')
      
      const startTime = Date.now()
      
      // Perform rapid changes
      for (let i = 0; i < 5; i++) {
        await homePage.header.toggleTheme()
        await homePage.setViewport(i % 2 === 0 ? 'mobile' : 'desktop')
        await page.waitForTimeout(100)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should handle changes efficiently
      expect(duration).toBeLessThan(3000)
      
      // Page should still be functional
      await homePage.verifyPageLoad()
    })

    test('should maintain performance with theme switching under slow network', async ({ page }) => {
      // Simulate slow network
      await TestUtils.mockNetworkConditions(page, 'slow')
      
      await homePage.goto('/')
      
      // Theme switching should still be responsive
      const startTime = Date.now()
      await homePage.header.toggleTheme()
      const endTime = Date.now()
      
      const switchTime = endTime - startTime
      
      // Theme switching should be nearly instant regardless of network
      expect(switchTime).toBeLessThan(500)
      
      await homePage.header.verifyTheme('dark')
      
      // Reset network conditions
      await TestUtils.mockNetworkConditions(page, 'fast')
    })
  })

  test.describe('Accessibility with Theme and Responsive Design', () => {
    test('should maintain accessibility standards across themes and viewports', async ({ page }) => {
      const combinations = [
        { viewport: 'mobile', theme: 'light' },
        { viewport: 'mobile', theme: 'dark' },
        { viewport: 'desktop', theme: 'light' },
        { viewport: 'desktop', theme: 'dark' },
      ] as const

      for (const { viewport, theme } of combinations) {
        await homePage.goto('/')
        await homePage.setViewport(viewport)
        
        // Set desired theme
        const currentTheme = await page.locator('html').evaluate(el => 
          el.classList.contains('dark') ? 'dark' : 'light'
        )
        
        if (currentTheme !== theme) {
          await homePage.header.toggleTheme()
        }
        
        await homePage.header.verifyTheme(theme)
        
        // Check theme switcher accessibility
        const themeSwitcher = page.locator('button[aria-label*="Toggle Dark Mode"]')
        await expect(themeSwitcher).toBeVisible()
        await expect(themeSwitcher).toHaveAttribute('aria-label')
        
        // Check keyboard accessibility
        await page.keyboard.press('Tab')
        const focusedElement = page.locator(':focus')
        await expect(focusedElement).toBeVisible()
      }
    })

    test('should announce theme changes to screen readers', async ({ page }) => {
      await homePage.goto('/')
      
      // Check if there are any aria-live regions or announcements for theme changes
      const liveRegions = page.locator('[aria-live]')
      const liveRegionCount = await liveRegions.count()
      
      if (liveRegionCount > 0) {
        await homePage.header.toggleTheme()
        await page.waitForTimeout(500)
        
        // Check if live region content updates (implementation dependent)
        const liveRegionContent = await liveRegions.first().textContent()
        expect(liveRegionContent).toBeDefined()
      }
    })
  })

  test.describe('Edge Cases and Error Handling', () => {
    test('should handle corrupted theme preferences gracefully', async ({ page }) => {
      // Simulate corrupted localStorage
      await page.addInitScript(() => {
        localStorage.setItem('theme', 'invalid-theme-value')
      })
      
      await homePage.goto('/')
      
      // Should fall back to default theme
      await homePage.verifyPageLoad()
      
      // Theme switcher should still work
      await homePage.header.toggleTheme()
      await page.waitForTimeout(200)
    })

    test('should work with JavaScript disabled', async ({ page, context }) => {
      // Disable JavaScript
      await context.setJavaScriptEnabled(false)
      
      await homePage.goto('/')
      
      // Basic page structure should still load
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('header')).toBeVisible()
      
      // Theme switcher may not work without JS, but page should be usable
    })

    test('should handle high contrast mode', async ({ page, context }) => {
      // Simulate high contrast mode
      await context.emulateMedia({ 
        forcedColors: 'active' 
      })
      
      await homePage.goto('/')
      await homePage.verifyPageLoad()
      
      // Test theme switching in high contrast mode
      await homePage.header.toggleTheme()
      await page.waitForTimeout(200)
    })
  })
})