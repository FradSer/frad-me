import type { Metadata } from 'next';

import { notFound } from 'next/navigation';
import { getAllPosts, getSinglePost } from '@/utils/mdx';
import WorkPageClient from './work-page-client';

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const work = await getSinglePost(slug);
    return {
      title: work.frontmatter.title,
      description: work.frontmatter.description || `Work showcase: ${work.frontmatter.title}`,
      openGraph: {
        title: work.frontmatter.title,
        description: work.frontmatter.description,
        images: work.frontmatter.cover ? [{ url: work.frontmatter.cover }] : [],
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
    const { code, frontmatter } = await getSinglePost(slug);
    return <WorkPageClient code={code} frontmatter={frontmatter} />;
  } catch {
    notFound();
  }
}
