'use client';

import { Line } from '@/components/WorkPage/MDXComponents';
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

      <section className="layout-wrapper flex flex-col gap-y-3 md:gap-y-6">
        <header className={GRID_CLASSES.container}>
          <h1 className="col-span-16 mt-12 text-3xl text-gray-500 dark:text-gray-400 md:col-span-12">
            <strong className="font-black text-black dark:text-white">{metadata.title}</strong>{' '}
            {metadata.description}
          </h1>
          <div className="md:col-span-0 col-span-4 hidden md:flex"></div>
        </header>

        <div className={GRID_CLASSES.container}>
          <WorkInformation title="platforms" data={metadata.platforms} />
          <WorkInformation title="contributors" data={metadata.contributors} />
          {metadata.site && <WorkSite href={metadata.site} />}
        </div>

        <Line />

        <article className={`${GRID_CLASSES.container} text-lg`}>{children}</article>

        <Line />

        {metadata.nextWork && <NextWork href={metadata.nextWork} />}

        <span className="col-span-16 h-16" />
      </section>
    </div>
  );
}
