import { generateSitemap } from '@/utils/sitemap'

export default function sitemap() {
  const sitemapXml = generateSitemap()
  
  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}

export const dynamic = 'force-static'