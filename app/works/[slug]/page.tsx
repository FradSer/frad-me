import type { Metadata } from 'next';

import { notFound } from 'next/navigation';
import type { WorkFrontmatter } from '@/types/work';
import WorkPageClient from './work-page-client';

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

// Works list for generating static params
const WORKS = ['bearychat', 'eye-protection-design-handbook', 'pachino'];

export async function generateStaticParams() {
  return WORKS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const module = await import(`@/markdown/works/${slug}.mdx`);
    const workMetadata = module.metadata as WorkFrontmatter;

    return {
      title: workMetadata.title,
      description: workMetadata.description || `Work showcase: ${workMetadata.title}`,
      openGraph: {
        title: workMetadata.title,
        description: workMetadata.description,
        images: workMetadata.cover ? [{ url: workMetadata.cover }] : [],
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
    const module = await import(`@/markdown/works/${slug}.mdx`);
    const WorkContent = module.default;
    const workMetadata = module.metadata as WorkFrontmatter;

    return <WorkPageClient metadata={workMetadata}>{<WorkContent />}</WorkPageClient>;
  } catch {
    notFound();
  }
}
