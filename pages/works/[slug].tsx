import classNames from 'classnames';
import { getMDXComponent } from 'mdx-bundler/client';
import Head from 'next/head';
import { useMemo } from 'react';

import { H1, H2, HR, P, OL, UL } from '../../components/WorkPage/MDXComponents';
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
  };
};

const mdxComponents = {
  h1: H1,
  h2: H2,
  hr: HR,
  p: P,
  ol: OL,
  ul: UL,
  WorkImage,
};

export default function WorkPage({ code, frontmatter }: IWorkProps) {
  const Component = useMemo(() => getMDXComponent(code), [code]);

  const girdClass = classNames('grid grid-cols-16 gap-y-3 md:gap-y-6');

  return (
    <>
      <Head>
        <title>{frontmatter.title} | Work by Frad</title>
      </Head>

      <WorkCover src={frontmatter.cover} title={frontmatter.title} />
      <section className="flex max-w-wrapper items-center justify-center bg-white px-4 dark:bg-black md:px-8 xl:px-0 ">
        <div className="flex w-full flex-col gap-y-3 md:gap-y-6">
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

          <article className={girdClass}>
            <Component components={mdxComponents} />
            <span className="col-span-16 h-16"></span>
          </article>
        </div>
      </section>
    </>
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
