import type { MetadataRoute } from 'next';

import { SITE_CONFIG } from '@/utils/constants';
import { getAllWorkSlugs } from '@/utils/workList';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  const slugs = getAllWorkSlugs();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_CONFIG.domain}/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 1.0,
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
