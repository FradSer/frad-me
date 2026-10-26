import type { Metadata } from 'next';

import { notFound } from 'next/navigation';
import type { ComponentType } from 'react';
import BearyChat, { metadata as bearyChatMetadata } from '@/markdown/works/bearychat.mdx';
import EyeProtection, {
  metadata as eyeProtectionMetadata,
} from '@/markdown/works/eye-protection-design-handbook.mdx';
import Pachino, { metadata as pachinoMetadata } from '@/markdown/works/pachino.mdx';
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

// Static MDX imports keep client references available to instant validation.
const works = new Map<string, LoadedWork>([
  ['bearychat', { Content: BearyChat, metadata: bearyChatMetadata }],
  ['eye-protection-design-handbook', { Content: EyeProtection, metadata: eyeProtectionMetadata }],
  ['pachino', { Content: Pachino, metadata: pachinoMetadata }],
]);

function loadWork(slug: string): LoadedWork | null {
  return works.get(slug) ?? null;
}

export function generateStaticParams() {
  return getAllWorkSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = loadWork(slug);

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
  const work = loadWork(slug);

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
