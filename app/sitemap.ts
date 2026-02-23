import type { MetadataRoute } from 'next';

import { SITE_CONFIG } from '@/utils/constants';
import { getAllWorkSlugs } from '@/utils/workList';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  let slugs: string[] = [];
  try {
    slugs = getAllWorkSlugs();
  } catch (error) {
    console.error('Failed to get works for sitemap:', error);
    // Continue with empty works array to prevent build failure
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_CONFIG.domain}/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${SITE_CONFIG.domain}/webxr`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  const workPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_CONFIG.domain}/works/${encodeURIComponent(slug)}`,
    lastModified: currentDate,
    changeFrequency: 'yearly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...workPages];
}
