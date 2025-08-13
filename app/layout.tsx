import { Metadata } from 'next'

import { Fira_Code } from 'next/font/google'
import localFont from 'next/font/local'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import ClientLayout from './client-layout'

import '@/styles/globals.css'

// Optimize Google Fonts loading
const firaCode = Fira_Code({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fira-code',
})

// Optimize GT Eesti font loading - only load necessary weights
const gtEestiText = localFont({
  src: [
    {
      path: '../public/fonts/GT-Eesti-Text-Regular-Trial.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/GT-Eesti-Text-Medium-Trial.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/GT-Eesti-Text-Bold-Trial.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-gt-eesti-text',
  display: 'swap',
})

// GT Eesti Display for 3D WebXR components
const gtEestiDisplay = localFont({
  src: [
    {
      path: '../public/fonts/GT-Eesti-Display-Regular-Trial.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/GT-Eesti-Display-Bold-Trial.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-gt-eesti-display',
  display: 'swap',
  preload: true, // Preload for WebXR components
})

export const metadata: Metadata = {
  metadataBase: new URL('https://frad.me'),
  title: {
    default: 'Frad LEE',
    template: '%s | Frad LEE',
  },
  description: 'Personal website of Frad LEE - UX Designer & Developer',
  icons: {
    icon: ['/favicon-16x16.png', '/favicon-32x32.png'],
    apple: '/apple-touch-icon.png',
  },
}

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="en" 
      className={`${firaCode.variable} ${gtEestiText.variable} ${gtEestiDisplay.variable}`}
    >
      <body className="antialiased">
        <ClientLayout>
          {children}
          <SpeedInsights />
          <Analytics />
        </ClientLayout>
      </body>
    </html>
  )
}
