import workLinks from '@/content/workLinks';
import { normalizeSlug } from '@/utils/slugMapping';

export type WorkSummary = {
  title: string;
  subtitle: string;
  slug: string;
  link: string;
  isWIP: boolean;
};

type WorkLink = {
  title: string;
  subTitle: string;
  slug: string;
  cover: string;
  isFullScreen?: boolean;
  isCenter?: boolean;
  isWIP?: boolean;
  externalLink?: string;
};

const works: WorkLink[] = workLinks;

export const WORK_NOT_FOUND_MESSAGE = `Project not found. Available projects: ${works
  .map((work) => work.title)
  .join(', ')}`;

export function toWorkSummary(work: WorkLink): WorkSummary {
  return {
    title: work.title,
    subtitle: work.subTitle,
    slug: work.slug,
    link: work.externalLink || `/works/${work.slug}`,
    isWIP: work.isWIP ?? false,
  };
}

export function listWorks(): WorkSummary[] {
  return works.map(toWorkSummary);
}

export function findWork(slug: string): WorkLink | null {
  const normalized = normalizeSlug(slug);
  if (!normalized) return null;
  return works.find((work) => work.slug === normalized) ?? null;
}

export function searchWorks(query: string): WorkSummary[] {
  const normalizedQuery = query.toLowerCase();
  return works
    .filter((work) =>
      `${work.title} ${work.subTitle} ${work.slug}`.toLowerCase().includes(normalizedQuery),
    )
    .map(toWorkSummary);
}
