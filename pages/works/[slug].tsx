import classNames from 'classnames';
import { getMDXComponent } from 'mdx-bundler/client';
import Head from 'next/head';
import { useMemo } from 'react';

import Topography from '../../components/WorkPage/BearyChat/Topography';
import {
  Blockquote,
  H1,
  H2,
  H3,
  HR,
  OL,
  P,
  UL,
} from '../../components/WorkPage/MDXComponents';
import NextWork from '../../components/WorkPage/NextWork';
import WorkCover from '../../components/WorkPage/WorkCover';
import WorkImage from '../../components/WorkPage/WorkImage';
import WorkInfomation from '../../components/WorkPage/WorkInfomation';
import WorkSite from '../../components/WorkPage/WorkSite';
import { getAllPosts, getSinglePost } from '../../utils/mdx';

type IWorkProps = {
  slug: string;
  code: string;
  frontmatter: {
    cover?: string;
    title: string;
    description: string;
    platforms?: [string];
    contributors?: [string];
    site?: string;
    nextWork?: string;
  };
};

const mdxComponents = {
  blockquote: Blockquote,
  h1: H1,
  h2: H2,
  h3: H3,
  hr: HR,
  p: P,
  ol: OL,
  ul: UL,
  WorkImage,
  Topography,
};

export default function WorkPage({ code, frontmatter }: IWorkProps) {
  const Component = useMemo(() => getMDXComponent(code), [code]);

  const girdClass = classNames('grid grid-cols-16 gap-y-3 md:gap-y-6');

  return (
    <div className="flex flex-col items-center justify-center">
      <Head>
        <title>{frontmatter.title} | Work by Frad</title>
      </Head>

      <WorkCover src={frontmatter.cover} title={frontmatter.title} />

      <section className="layout-wrapper flex flex-col gap-y-3 md:gap-y-6">
        <article className={girdClass}>
          <h1 className="col-span-16 mt-12 text-3xl text-gray-500 dark:text-gray-400 md:col-span-12">
            <strong className="font-black text-black dark:text-white">
              {frontmatter.title}
            </strong>{' '}
            {frontmatter.description}
          </h1>
          <div className="md:col-span-0 col-span-4 hidden md:flex"></div>
        </article>

        <div className={girdClass}>
          <WorkInfomation title="platforms" data={frontmatter.platforms} />
          <WorkInfomation
            title="contributors"
            data={frontmatter.contributors}
          />
          <WorkSite href={frontmatter.site} />
        </div>

        <HR />

        <article className={classNames('text-lg', girdClass)}>
          <Component components={mdxComponents} />
        </article>

        <HR />

        <NextWork href={frontmatter.nextWork} />

        <span className="col-span-16 h-16" />
      </section>
    </div>
  );
}

export const getStaticPaths = async () => {
  const paths = getAllPosts().map(({ slug }) => ({ params: { slug } }));
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async ({ params }: any) => {
  const work = await getSinglePost(params.slug);
  return {
    props: { ...work },
  };
};
