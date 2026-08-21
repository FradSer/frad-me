import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import ThemeScript from '@/components/ThemeScript';
import ClientLayout from './client-layout';

import '@/styles/globals.css';

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
});

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
});

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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  other: {
    'google-adsense-account': 'ca-pub-6009006635541295',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${gtEestiText.variable} ${gtEestiDisplay.variable} bg-white dark:bg-black`}
    >
      <body
        className="antialiased min-h-screen bg-white text-black dark:bg-black dark:text-white"
        // Keep native UI controls in sync with theme
        style={{ colorScheme: 'light dark' }}
      >
        {/* next-themes renders a <script> inside the React tree via
            dangerouslySetInnerHTML, which React 19 flags as
            "Encountered a script tag while rendering React component"
            (https://github.com/pacocoursey/next-themes/issues/169).
            The inline script is required for FOUC-free theming, but it
            must not be rendered from inside a Client Component.
            Render it here as a Server Component so the error disappears. */}
        <ThemeScript attribute="class" storageKey="theme" defaultTheme="system" enableSystem />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6009006635541295"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <Script
          src="https://datafa.st/js/script.js"
          data-website-id="dfid_nTTmz1kSbCyWa9RcxQOB7"
          data-domain="frad.me"
          strategy="afterInteractive"
        />
        <ClientLayout>
          {children}
          <SpeedInsights />
          <Analytics />
        </ClientLayout>
      </body>
    </html>
  );
}
