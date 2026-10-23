import type { MetadataRoute } from 'next';

import { SITE_CONFIG } from '@/utils/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: `${SITE_CONFIG.domain}/sitemap.xml`,
  };
}
