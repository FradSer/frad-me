import { Metadata } from 'next'
import { Fira_Code } from 'next/font/google'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import ClientLayout from './client-layout'

import '@/styles/globals.css'

const firaCode = Fira_Code({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fira-code',
})

export const metadata: Metadata = {
  title: {
    default: 'Frad LEE',
    template: '%s | Frad LEE',
  },
  description: 'Personal website of Frad LEE - UX Designer & Developer',
  icons: {
    icon: ['/favicon-16x16.png', '/favicon-32x32.png'],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={firaCode.variable}>
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