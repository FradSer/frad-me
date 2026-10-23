import type { MetadataRoute } from 'next';

import { SITE_CONFIG } from '@/utils/constants';
import { getAllWorkSlugs } from '@/utils/workList';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  return [
    {
      url: `${SITE_CONFIG.domain}/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    ...getAllWorkSlugs().map((slug) => ({
      url: `${SITE_CONFIG.domain}/works/${encodeURIComponent(slug)}`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.9,
    })),
  ];
}
