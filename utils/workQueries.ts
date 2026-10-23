import { findWork, toWorkSummary, type WorkSummary } from '@/utils/workCatalog';
import { getWorkSummary } from '@/utils/workContent';

type WorkDetail = WorkSummary & { summary: string };

export function readWork(slug: string): WorkDetail | null {
  const work = findWork(slug);
  if (!work) return null;

  return {
    ...toWorkSummary(work),
    summary: getWorkSummary(work.slug) || work.subTitle,
  };
}
