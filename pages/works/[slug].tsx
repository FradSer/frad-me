import { getMDXComponent } from 'mdx-bundler/client';
import Head from 'next/head';
import { useMemo } from 'react';

import { H1, H2, HR, P } from '../../components/WorkPage/MDXComponents';
import WorkImage from '../../components/WorkPage/WorkImage';
import WorkInfomation from '../../components/WorkPage/WorkInfomation';
import WorkSite from '../../components/WorkPage/WorkSite';
import { getAllPosts, getSinglePost } from '../../utils/mdx';

type IWorkProps = {
  slug: string;
  code: string;
  frontmatter: {
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
  WorkImage,
};

export default function WorkPage({ code, frontmatter }: IWorkProps) {
  const Component = useMemo(() => getMDXComponent(code), [code]);

  return (
    <>
      <Head>
        <title>{frontmatter.title} | Work by Frad</title>
      </Head>

      <div className="mt-24 flex items-center justify-center bg-white dark:bg-black">
        <div className="center grid w-full grid-cols-16 gap-y-4 md:gap-y-8">
          <p className="col-span-16 mt-24 text-3xl text-gray-500 dark:text-gray-700 md:col-span-12">
            <strong className="font-black text-black dark:text-white">
              {frontmatter.title}
            </strong>{' '}
            {frontmatter.description}
          </p>
          <div className="md:col-span-0 col-span-4 hidden md:flex"></div>

          <WorkInfomation title="platforms" data={frontmatter.platforms} />
          <WorkInfomation
            title="contributors"
            data={frontmatter.contributors}
          />
          <WorkSite href={frontmatter.site} />

          <Component components={mdxComponents} />
          <span className="col-span-16 h-16"></span>
        </div>
      </div>
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
