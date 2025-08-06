import fs from 'fs'
import path from 'path'
import { getAllPosts } from './mdx'
import { SITE_CONFIG } from './constants'

interface SitemapEntry {
  url: string
  lastmod: string
  changefreq: 'yearly' | 'monthly' | 'weekly' | 'daily'
  priority: number
}

async function getFileLastModified(filePath: string): Promise<string> {
  try {
    // Validate and sanitize file path
    const normalizedPath = path.normalize(filePath)
    if (!normalizedPath.startsWith(process.cwd())) {
      throw new Error('Invalid file path - outside project directory')
    }
    
    const stats = await fs.promises.stat(normalizedPath)
    return stats.mtime.toISOString().split('T')[0]
  } catch (error) {
    console.warn(`Failed to get modification time for ${filePath}:`, error instanceof Error ? error.message : String(error))
    return new Date().toISOString().split('T')[0]
  }
}

export async function generateSitemap(): Promise<string> {
  const posts = getAllPosts()

  // Get last modified dates for static pages
  const indexLastMod = await getFileLastModified(path.join(process.cwd(), 'pages/index.tsx'))
  const webxrLastMod = await getFileLastModified(path.join(process.cwd(), 'pages/webxr.tsx'))

  const staticPages: SitemapEntry[] = [
    {
      url: `${SITE_CONFIG.domain}/`,
      lastmod: indexLastMod,
      changefreq: 'monthly',
      priority: 1.0,
    },
    {
      url: `${SITE_CONFIG.domain}/webxr`,
      lastmod: webxrLastMod,
      changefreq: 'monthly', 
      priority: 0.8,
    },
  ]

  const workPages: SitemapEntry[] = await Promise.all(
    posts.map(async (post) => {
      const mdxFilePath = path.join(process.cwd(), 'content/works', `${encodeURIComponent(post.slug)}.mdx`)
      const lastmod = await getFileLastModified(mdxFilePath)
      
      return {
        url: `${SITE_CONFIG.domain}/works/${encodeURIComponent(post.slug)}`,
        lastmod,
        changefreq: 'yearly' as const,
        priority: 0.9,
      }
    })
  )

  const allPages = [...staticPages, ...workPages]

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return sitemapXml
}