import fs from 'node:fs';
import type { WorkFrontmatter } from '@/types/work';
import { WORKS_PATH } from '@/utils/workContent';

export interface WorkListItem {
  slug: string;
  metadata: WorkFrontmatter;
}

const STATIC_WORKS = ['bearychat', 'eye-protection-design-handbook', 'pachino'] as const;

export function getAllWorkSlugs(): string[] {
  try {
    return fs
      .readdirSync(WORKS_PATH)
      .filter((fileName) => /\.mdx?$/.test(fileName))
      .map((fileName) => fileName.replace(/\.mdx?$/, ''));
  } catch {
    return [...STATIC_WORKS];
  }
}

export async function getWorkMetadata(slug: string): Promise<WorkFrontmatter> {
  try {
    const module = await import(`@/markdown/works/${slug}.mdx`);
    return module.metadata as WorkFrontmatter;
  } catch {
    throw new Error(`Work not found: ${slug}`);
  }
}
