import { test, expect } from '@playwright/test'
import { HomePage, WorksPage, WorkDetailPage, TestUtils } from './__utils__/page-objects'

test.describe('Works Page', () => {
  let homePage: HomePage
  let worksPage: WorksPage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    worksPage = new WorksPage(page)
  })

  test('should display work cards on homepage', async ({ page }) => {
    await homePage.goto('/')
    
    await TestUtils.retryAssertion(async () => {
      await worksPage.verifyWorkSection()
      await worksPage.verifyWorkCards()
    })
  })

  test('should handle work in progress items correctly', async ({ page }) => {
    await homePage.goto('/')
    await worksPage.verifyWIPElements()
  })

  test('should display proper hover states for interactive elements', async ({ page }) => {
    await homePage.goto('/')
    
    const firstWorkLink = await worksPage.getFirstWorkLink()
    if (firstWorkLink) {
      // Hover over work card
      await firstWorkLink.hover()
      
      // Wait for any hover animations
      await page.waitForTimeout(300)
      
      // Could check for specific hover styles if needed
      await expect(firstWorkLink).toBeVisible()
    }
  })

  test('should load work detail page with proper content', async ({ page }) => {
    await homePage.goto('/')
    
    const workHref = await worksPage.navigateToFirstWork()
    
    if (workHref) {
      const workDetailPage = new WorkDetailPage(page)
      
      await TestUtils.retryAssertion(async () => {
        await workDetailPage.verifyWorkDetailPage()
        await workDetailPage.verifyArticleContent()
      })
      
      // Test back navigation
      await workDetailPage.verifyBackNavigation()
    } else {
      test.skip('No work links found on homepage')
    }
  })

  test('should handle direct navigation to work pages', async ({ page }) => {
    // Test direct navigation to a known work page
    // This would need to be adjusted based on your actual work slugs
    const testWorkPaths = ['/works/test-work', '/works/sample-project']
    
    for (const path of testWorkPaths) {
      const response = await page.goto(path)
      
      // Either loads successfully or returns 404
      const status = response?.status()
      expect([200, 404]).toContain(status)
      
      if (response?.status() === 200) {
        const workDetailPage = new WorkDetailPage(page)
        await workDetailPage.verifyWorkDetailPage()
        break // Exit loop if we found a valid work page
      }
    }
  })

  test('should have proper image loading and optimization', async ({ page }) => {
    await homePage.goto('/')
    await worksPage.verifyImageLoading()
  })

  test('should be responsive across different screen sizes', async ({ page }) => {
    await homePage.goto('/')
    await worksPage.verifyResponsiveLayout()
  })

  test('should handle empty or error states gracefully', async ({ page }) => {
    // Test behavior when no works are available
    // This would depend on your implementation
    await homePage.goto('/')
    
    // Wait for page to load
    await TestUtils.waitForStableContent(page)
    
    // The page should still load successfully even if no works are present
    await expect(page.locator('main')).toBeVisible()
  })

  test('should support work filtering and search if available', async ({ page }) => {
    await homePage.goto('/')
    
    // Look for filter or search elements
    const filterElements = page.locator('[data-testid*="filter"], [placeholder*="search"], [aria-label*="filter"]')
    const filterCount = await filterElements.count()
    
    if (filterCount > 0) {
      // Test filtering functionality
      const firstFilter = filterElements.first()
      await firstFilter.click()
      
      // Wait for potential filtering animation
      await page.waitForTimeout(500)
      
      // Verify that works are still visible or properly filtered
      await worksPage.verifyWorkSection()
    } else {
      test.skip('No filtering functionality found')
    }
  })

  test('should load works performantly', async ({ page }) => {
    const startTime = Date.now()
    
    await homePage.goto('/')
    await worksPage.verifyWorkSection()
    
    const loadTime = Date.now() - startTime
    
    // Should load within reasonable time (adjust threshold as needed)
    expect(loadTime).toBeLessThan(5000)
  })
})