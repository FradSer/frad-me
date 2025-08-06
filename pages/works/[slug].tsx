import { useMemo } from 'react'

import Head from 'next/head'
import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'

import classNames from 'classnames'
import { getMDXComponent } from 'mdx-bundler/client'

import Topography from '@/components/WorkPage/BearyChat/Topography'
import ComfortableFontSFormula from '@/components/WorkPage/EyeProtectionDesignHandbook/ComfortableFontSFormula'
import ComfortableFontYong from '@/components/WorkPage/EyeProtectionDesignHandbook/ComfortableFontYong'
import EyeComfortDFormula from '@/components/WorkPage/EyeProtectionDesignHandbook/EyeComfortDFormula'
import {
  Blockquote,
  H1,
  H2,
  H3,
  Line,
  OL,
  P,
  UL,
} from '@/components/WorkPage/MDXComponents'
import NextWork from '@/components/WorkPage/NextWork'
import WorkCover from '@/components/WorkPage/WorkCover'
import {
  WorkSingleImage,
  WorkBeforeAfterImages,
} from '@/components/WorkPage/WorkImage'
import WorkInformation from '@/components/WorkPage/WorkInformation'
import WorkSite from '@/components/WorkPage/WorkSite'

import { getAllPosts, getSinglePost } from '@/utils/mdx'
import { generateMetaTags } from '@/utils/seo'
import { WorkPageProps } from '@/types/work'
import { GRID_CLASSES } from '@/utils/constants'

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
}

export default function WorkPage({ code, frontmatter }: Readonly<WorkPageProps>) {
  const router = useRouter()
  const Component = useMemo(() => getMDXComponent(code), [code])
  
  const metaTags = generateMetaTags({
    title: frontmatter.title,
    description: frontmatter.description,
    image: frontmatter.cover,
    canonical: `https://frad.me${router.asPath}`,
  })

  return (
    <>
      <Head>
        <title>{metaTags.title}</title>
        <meta name="description" content={metaTags.description} />
        <meta name="robots" content={metaTags.robots} />
        {metaTags.canonical && <link rel="canonical" href={metaTags.canonical} />}
        <meta property="og:title" content={metaTags.openGraph.title} />
        <meta property="og:description" content={metaTags.openGraph.description} />
        <meta property="og:type" content={metaTags.openGraph.type} />
        {metaTags.openGraph.image && (
          <meta property="og:image" content={metaTags.openGraph.image} />
        )}
        <meta name="twitter:card" content={metaTags.twitter.card} />
        <meta name="twitter:title" content={metaTags.twitter.title} />
        <meta name="twitter:description" content={metaTags.twitter.description} />
        {metaTags.twitter.image && (
          <meta name="twitter:image" content={metaTags.twitter.image} />
        )}
      </Head>

      <main className="flex flex-col items-center justify-center">
        <WorkCover
          src={frontmatter.cover}
          title={frontmatter.title}
          coverBackground={frontmatter.coverBackground}
        />

        <section className="layout-wrapper flex flex-col gap-y-3 md:gap-y-6">
          <article className={GRID_CLASSES.base}>
            <h1 className="col-span-16 mt-12 text-3xl text-gray-500 dark:text-gray-400 md:col-span-12">
              <strong className="font-black text-black dark:text-white">
                {frontmatter.title}
              </strong>{' '}
              {frontmatter.description}
            </h1>
            <div className="md:col-span-0 col-span-4 hidden md:flex"></div>
          </article>

          <div className={GRID_CLASSES.base}>
            <WorkInformation title="platforms" data={frontmatter.platforms} />
            <WorkInformation
              title="contributors"
              data={frontmatter.contributors}
            />
            <WorkSite href={frontmatter.site} />
          </div>

          <Line />

          <article className={classNames('text-lg', GRID_CLASSES.base)}>
            <Component components={mdxComponents} />
          </article>

          <Line />

          <NextWork href={frontmatter.nextWork} />

          <span className="col-span-16 h-16" />
        </section>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPosts().map(({ slug }) => ({ params: { slug } }))
  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<WorkPageProps, { slug: string }> = async ({ params }) => {
  if (!params?.slug) {
    return {
      notFound: true,
    }
  }

  const work = await getSinglePost(params.slug)
  return {
    props: work as WorkPageProps,
  }
}
