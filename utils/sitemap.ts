import { SITE_CONFIG } from './constants';
import { getAllPosts } from './mdx';

interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'yearly' | 'monthly' | 'weekly' | 'daily';
  priority: number;
}

export function generateSitemap(): string {
  const posts = getAllPosts();
  const currentDate = new Date().toISOString().split('T')[0];

  const staticPages: SitemapEntry[] = [
    {
      url: `${SITE_CONFIG.domain}/`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 1.0,
    },
    {
      url: `${SITE_CONFIG.domain}/webxr`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8,
    },
  ];

  const workPages: SitemapEntry[] = posts.map((post) => ({
    url: `${SITE_CONFIG.domain}/works/${encodeURIComponent(post.slug)}`,
    lastmod: currentDate,
    changefreq: 'yearly' as const,
    priority: 0.9,
  }));

  const allPages = [...staticPages, ...workPages];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return sitemapXml;
}
