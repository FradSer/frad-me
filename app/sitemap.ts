import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/utils/constants';
import { getAllPosts } from '@/utils/mdx';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  let posts: ReturnType<typeof getAllPosts> = [];
  try {
    posts = getAllPosts();
  } catch (error) {
    console.error('Failed to get posts for sitemap:', error);
    // Continue with empty posts array to prevent build failure
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

  const workPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_CONFIG.domain}/works/${encodeURIComponent(post.slug)}`,
    lastModified: currentDate,
    changeFrequency: 'yearly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...workPages];
}
