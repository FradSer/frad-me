'use client';

import NextWork from '@/components/WorkPage/NextWork';
import WorkCover from '@/components/WorkPage/WorkCover';
import WorkInformation from '@/components/WorkPage/WorkInformation';
import WorkSite from '@/components/WorkPage/WorkSite';
import type { WorkFrontmatter } from '@/types/work';

import { GRID_CLASSES } from '@/utils/constants';

interface WorkPageClientProps {
  children: React.ReactNode;
  metadata: WorkFrontmatter;
}

export default function WorkPageClient({ children, metadata }: Readonly<WorkPageClientProps>) {
  return (
    <div className="flex flex-col items-center justify-center">
      <WorkCover
        src={metadata.cover}
        title={metadata.title}
        coverBackground={metadata.coverBackground}
      />

      <section className="layout-wrapper flex flex-col pb-16 md:pb-24">
        <header className="border-b border-gray-200 py-12 dark:border-neutral-800 md:py-20">
          <h1 className="max-w-[18ch] font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            {metadata.title}
          </h1>
          <p className="mt-6 max-w-[45ch] text-xl leading-relaxed text-gray-600 dark:text-gray-300 md:text-2xl">
            {metadata.description}
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-12">
            <WorkInformation title="Platforms" data={metadata.platforms} />
            <WorkInformation title="My role" data={metadata.contributors} />
            {metadata.site && <WorkSite href={metadata.site} />}
          </dl>
        </header>
        <article
          className={`${GRID_CLASSES.container} py-12 text-base leading-relaxed md:py-20 md:text-lg`}
        >
          {children}
        </article>
        <NextWork href={metadata.nextWork} />
      </section>
    </div>
  );
}
