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

function getFileLastModified(filePath: string): string {
  try {
    const stats = fs.statSync(filePath)
    return stats.mtime.toISOString().split('T')[0]
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

export function generateSitemap(): string {
  const posts = getAllPosts()
  const currentDate = new Date().toISOString().split('T')[0]

  // Get last modified dates for static pages
  const indexLastMod = getFileLastModified(path.join(process.cwd(), 'pages/index.tsx'))
  const webxrLastMod = getFileLastModified(path.join(process.cwd(), 'pages/webxr.tsx'))

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

  const workPages: SitemapEntry[] = posts.map((post) => {
    const mdxFilePath = path.join(process.cwd(), 'content/works', `${post.slug}.mdx`)
    const lastmod = getFileLastModified(mdxFilePath)
    
    return {
      url: `${SITE_CONFIG.domain}/works/${post.slug}`,
      lastmod,
      changefreq: 'yearly' as const,
      priority: 0.9,
    }
  })

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