import type { Metadata } from 'next';

import { notFound } from 'next/navigation';
import { getAllPosts, getSinglePost } from '@/utils/mdx';
import WorkPageClient from './work-page-client';

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

// Wraps mdx-bundler (uses crypto.randomUUID) in cache for static generation
async function getCachedPostData(slug: string) {
  'use cache';
  return await getSinglePost(slug);
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { frontmatter } = await getCachedPostData(slug);
    return {
      title: frontmatter.title,
      description: frontmatter.description || `Work showcase: ${frontmatter.title}`,
      openGraph: {
        title: frontmatter.title,
        description: frontmatter.description,
        images: frontmatter.cover ? [{ url: frontmatter.cover }] : [],
      },
    };
  } catch {
    return {
      title: 'Work Not Found',
    };
  }
}

export default async function WorkPage({ params }: WorkPageProps) {
  try {
    const { slug } = await params;
    const { code, frontmatter } = await getCachedPostData(slug);
    return <WorkPageClient code={code} frontmatter={frontmatter} />;
  } catch {
    notFound();
  }
}
