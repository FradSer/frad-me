import { Metadata } from 'next'

import WorkPageClient from './work-page-client'

import { getAllPosts, getSinglePost } from '@/utils/mdx'


type WorkPageProps = {
  params: { slug: string }
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const work = await getSinglePost(params.slug)
  return {
    title: `${work.frontmatter.title} | Work by Frad`,
  }
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { code, frontmatter } = await getSinglePost(params.slug)
  
  return <WorkPageClient code={code} frontmatter={frontmatter} />
}