import { GetServerSideProps } from 'next'
import { generateSitemap } from '@/utils/sitemap'

export default function Sitemap() {
  // This component is never rendered
  return null
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = await generateSitemap()

  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800')
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}