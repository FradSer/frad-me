import { SITE_CONFIG } from './constants'

interface SEOMetaData {
  title: string
  description: string
  image?: string
  type?: 'website' | 'article'
  canonical?: string
  robots?: string
}

export function generateMetaTags({ 
  title, 
  description, 
  image, 
  type = 'article', 
  canonical, 
  robots = 'index, follow' 
}: SEOMetaData) {
  const fullTitle = `${title} | ${SITE_CONFIG.title}`
  const fullImageUrl = image ? `${SITE_CONFIG.domain}${image}` : undefined

  return {
    title: fullTitle,
    description,
    robots,
    canonical,
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