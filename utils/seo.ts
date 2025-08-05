import { SITE_CONFIG } from './constants'

interface SEOMetaData {
  title: string
  description: string
  image?: string
  type?: 'website' | 'article'
}

export function generateMetaTags({ title, description, image, type = 'article' }: SEOMetaData) {
  const fullTitle = `${title} | ${SITE_CONFIG.title}`
  const fullImageUrl = image ? `${SITE_CONFIG.domain}${image}` : undefined

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type,
      ...(fullImageUrl && { image: fullImageUrl }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      ...(fullImageUrl && { image: fullImageUrl }),
    },
  }
}