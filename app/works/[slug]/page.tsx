import type { Metadata } from 'next';

import { notFound } from 'next/navigation';
import type { ComponentType } from 'react';
import type { WorkFrontmatter } from '@/types/work';
import { getAllWorkSlugs } from '@/utils/workList';
import WorkPageClient from './work-page-client';

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

type LoadedWork = {
  Content: ComponentType;
  metadata: WorkFrontmatter;
};

async function loadWork(slug: string): Promise<LoadedWork | null> {
  try {
    const module = await import(`@/markdown/works/${slug}.mdx`);
    return {
      Content: module.default,
      metadata: module.metadata as WorkFrontmatter,
    };
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return getAllWorkSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = await loadWork(slug);

  if (!work) {
    return { title: 'Work Not Found' };
  }

  const { metadata } = work;

  return {
    title: metadata.title,
    description: metadata.description || `Work showcase: ${metadata.title}`,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      images: metadata.cover ? [{ url: metadata.cover }] : [],
    },
  };
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const work = await loadWork(slug);

  if (!work) {
    notFound();
  }

  const { Content, metadata } = work;

  return (
    <WorkPageClient metadata={metadata}>
      <Content />
    </WorkPageClient>
  );
}
