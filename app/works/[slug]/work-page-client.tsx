'use client';

import { getMDXComponent } from 'mdx-bundler/client';
import { useMemo } from 'react';

import Topography from '@/components/WorkPage/BearyChat/Topography';
import ComfortableFontSFormula from '@/components/WorkPage/EyeProtectionDesignHandbook/ComfortableFontSFormula';
import ComfortableFontYong from '@/components/WorkPage/EyeProtectionDesignHandbook/ComfortableFontYong';
import EyeComfortDFormula from '@/components/WorkPage/EyeProtectionDesignHandbook/EyeComfortDFormula';
import { Blockquote, H1, H2, H3, Line, OL, P, UL } from '@/components/WorkPage/MDXComponents';
import NextWork from '@/components/WorkPage/NextWork';
import WorkCover from '@/components/WorkPage/WorkCover';
import { WorkBeforeAfterImages, WorkSingleImage } from '@/components/WorkPage/WorkImage';
import WorkInformation from '@/components/WorkPage/WorkInformation';
import WorkSite from '@/components/WorkPage/WorkSite';
import type { WorkFrontmatter } from '@/types/work';

import { GRID_CLASSES } from '@/utils/constants';

interface WorkPageClientProps {
  code: string;
  frontmatter: WorkFrontmatter;
}

const mdxComponents = {
  blockquote: Blockquote,
  h1: H1,
  h2: H2,
  h3: H3,
  line: Line,
  ol: OL,
  p: P,
  ul: UL,
  WorkSingleImage,
  WorkBeforeAfterImages,
  Topography,
  ComfortableFontSFormula,
  ComfortableFontYong,
  EyeComfortDFormula,
};

export default function WorkPageClient({ code, frontmatter }: Readonly<WorkPageClientProps>) {
  const Component = useMemo(() => getMDXComponent(code), [code]);

  return (
    <main className="flex flex-col items-center justify-center">
      <WorkCover
        src={frontmatter.cover}
        title={frontmatter.title}
        coverBackground={frontmatter.coverBackground}
      />

      <section className="layout-wrapper flex flex-col gap-y-3 md:gap-y-6">
        <header className={GRID_CLASSES.container}>
          <h1 className="col-span-16 mt-12 text-3xl text-gray-500 dark:text-gray-400 md:col-span-12">
            <strong className="font-black text-black dark:text-white">{frontmatter.title}</strong>{' '}
            {frontmatter.description}
          </h1>
          <div className="md:col-span-0 col-span-4 hidden md:flex"></div>
        </header>

        <div className={GRID_CLASSES.container}>
          <WorkInformation title="platforms" data={frontmatter.platforms} />
          <WorkInformation title="contributors" data={frontmatter.contributors} />
          {frontmatter.site && <WorkSite href={frontmatter.site} />}
        </div>

        <Line />

        <article className={`${GRID_CLASSES.container} text-lg`}>
          <Component components={mdxComponents} />
        </article>

        <Line />

        {frontmatter.nextWork && <NextWork href={frontmatter.nextWork} />}

        <span className="col-span-16 h-16" />
      </section>
    </main>
  );
}
