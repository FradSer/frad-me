import { Page, Locator, expect } from '@playwright/test'

// Common selectors
const selectors = {
  navigation: {
    header: 'header',
    themeSwitcher: '[aria-label="Toggle Dark Mode"]',
    logo: '[data-testid="logo"]',
  },
  works: {
    workCard: '[class*="work-card"], a[href^="/works/"]',
    workTitle: 'h1, h2, h3',
    workImage: 'img[alt*="Cover"]',
  },
  layout: {
    main: 'main',
    footer: 'footer',
  },
}

// Common viewports
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1200, height: 800 },
}

// Base page object with common functionality
export class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(path: string = '/') {
    await this.page.goto(path)
    await this.waitForPageLoad()
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
    await expect(this.page.locator(selectors.layout.main).first()).toBeVisible()
  }

  async setViewport(viewport: keyof typeof viewports) {
    const { width, height } = viewports[viewport]
    await this.page.setViewportSize({ width, height })
  }

  async takeScreenshot(name: string) {
    return await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    })
  }
}

// Header component page object
export class HeaderPage extends BasePage {
  readonly header: Locator
  readonly themeSwitcher: Locator

  constructor(page: Page) {
    super(page)
    this.header = page.locator(selectors.navigation.header)
    this.themeSwitcher = page.locator(selectors.navigation.themeSwitcher)
  }

  async toggleTheme() {
    await this.themeSwitcher.click()
    // Wait for theme transition
    await this.page.waitForTimeout(100)
  }

  async verifyTheme(theme: 'light' | 'dark') {
    const htmlElement = this.page.locator('html')
    if (theme === 'dark') {
      await expect(htmlElement).toHaveClass(/dark/)
    } else {
      await expect(htmlElement).not.toHaveClass(/dark/)
    }
  }

  async verifyHeaderVisible() {
    await expect(this.header).toBeVisible()
  }

  async verifyResponsiveHeader() {
    // Test desktop
    await this.setViewport('desktop')
    await expect(this.header).toBeVisible()

    // Test mobile
    await this.setViewport('mobile')
    await expect(this.header).toBeVisible()
  }
}

// Works section page object
export class WorksPage extends BasePage {
  readonly workSection: Locator
  readonly workCards: Locator
  readonly workLinks: Locator
  readonly wipElements: Locator
  readonly images: Locator

  constructor(page: Page) {
    super(page)
    this.workSection = page
      .locator('section')
      .filter({ hasText: /work/i })
      .or(page.locator('section').nth(1))
    this.workCards = page.locator(selectors.works.workCard)
    this.workLinks = page.locator('a[href^="/works/"]')
    this.wipElements = page.locator('[class*="wip"], [class*="not-allowed"]')
    this.images = page.locator('img')
  }

  async verifyWorkSection() {
    await expect(this.workSection).toBeVisible()
  }

  async verifyWorkCards() {
    const cardCount = await this.workCards.count()
    if (cardCount > 0) {
      await expect(this.workCards.first()).toBeVisible()
    }
  }

  async getFirstWorkLink() {
    const linkCount = await this.workLinks.count()
    if (linkCount > 0) {
      return this.workLinks.first()
    }
    return null
  }

  async navigateToFirstWork() {
    const firstLink = await this.getFirstWorkLink()
    if (firstLink) {
      const href = await firstLink.getAttribute('href')
      await firstLink.click()
      await this.waitForPageLoad()
      return href
    }
    return null
  }

  async verifyWIPElements() {
    const wipCount = await this.wipElements.count()
    if (wipCount > 0) {
      await expect(this.wipElements.first()).toBeVisible()
      // WIP elements should not be clickable links
      const wipElement = this.wipElements.first()
      const tagName = await wipElement.evaluate((el) =>
        el.tagName.toLowerCase(),
      )
      expect(tagName).not.toBe('a')
    }
  }

  async verifyImageLoading() {
    await this.page.waitForLoadState('networkidle')

    const imageCount = await this.images.count()
    if (imageCount > 0) {
      const firstImage = this.images.first()
      await expect(firstImage).toBeVisible()

      // Check alt text
      const altText = await firstImage.getAttribute('alt')
      expect(altText).toBeTruthy()
      expect(altText?.length).toBeGreaterThan(0)
    }
  }

  async verifyResponsiveLayout() {
    const viewportSizes = ['mobile', 'tablet', 'desktop'] as const

    for (const viewport of viewportSizes) {
      await this.setViewport(viewport)
      await this.verifyWorkSection()

      // Take screenshot for visual comparison if needed
      await this.takeScreenshot(`works-${viewport}`)
    }
  }
}

// Work detail page object
export class WorkDetailPage extends BasePage {
  readonly workContent: Locator
  readonly article: Locator

  constructor(page: Page) {
    super(page)
    this.workContent = page.locator('article, [class*="work"], main')
    this.article = page.locator('article')
  }

  async verifyWorkDetailPage() {
    await expect(this.workContent).toBeVisible()
  }

  async verifyArticleContent() {
    const articleCount = await this.article.count()
    if (articleCount > 0) {
      await expect(this.article.first()).toBeVisible()
    }
  }

  async verifyBackNavigation() {
    await this.page.goBack()
    await this.waitForPageLoad()
    await expect(this.page).toHaveURL('/')
  }
}

// Homepage combined page object
export class HomePage extends BasePage {
  readonly header: HeaderPage
  readonly works: WorksPage

  constructor(page: Page) {
    super(page)
    this.header = new HeaderPage(page)
    this.works = new WorksPage(page)
  }

  async verifyPageLoad() {
    // Check page title
    await expect(this.page).toHaveTitle(/Frad LEE/)

    // Verify main sections
    await this.header.verifyHeaderVisible()
    await expect(this.page.locator(selectors.layout.main).first()).toBeVisible()
  }

  async performCompleteUITest() {
    // Test theme switching
    await this.header.toggleTheme()
    await this.header.verifyTheme('dark')

    await this.header.toggleTheme()
    await this.header.verifyTheme('light')

    // Test responsive design
    await this.header.verifyResponsiveHeader()

    // Test works section
    await this.works.verifyWorkSection()
    await this.works.verifyWorkCards()
    await this.works.verifyImageLoading()

    // Test work navigation if available
    const workHref = await this.works.navigateToFirstWork()
    if (workHref) {
      const workDetail = new WorkDetailPage(this.page)
      await workDetail.verifyWorkDetailPage()

      // Navigate back
      await workDetail.verifyBackNavigation()
    }
  }
}

// Test utilities
export class TestUtils {
  static async waitForStableContent(page: Page, timeout: number = 5000) {
    let lastContent = ''
    let stableCount = 0
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const currentContent = await page.textContent('body')
      if (currentContent === lastContent) {
        stableCount++
        if (stableCount >= 3) break
      } else {
        stableCount = 0
        lastContent = currentContent || ''
      }
      await page.waitForTimeout(100)
    }
  }

  static async retryAssertion(
    assertion: () => Promise<void>,
    maxRetries: number = 3,
    delay: number = 1000,
  ) {
    let lastError: Error

    for (let i = 0; i < maxRetries; i++) {
      try {
        await assertion()
        return
      } catch (error) {
        lastError = error as Error
        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError!
  }

  static async mockNetworkConditions(
    page: Page,
    condition: 'slow' | 'fast' | 'offline',
  ) {
    const conditions = {
      slow: {
        downloadThroughput: 50000,
        uploadThroughput: 20000,
        latency: 200,
      },
      fast: {
        downloadThroughput: 10000000,
        uploadThroughput: 5000000,
        latency: 20,
      },
      offline: {
        offline: true,
        downloadThroughput: 0,
        uploadThroughput: 0,
        latency: 0,
      },
    }

    const cdp = await page.context().newCDPSession(page)
    if (condition === 'offline') {
      await cdp.send('Network.emulateNetworkConditions', conditions.offline)
    } else {
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        ...conditions[condition],
      })
    }
  }
}
