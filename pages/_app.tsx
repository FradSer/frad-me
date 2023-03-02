import { AppProps } from 'next/app'
import dynamic from 'next/dynamic'

import { Analytics } from '@vercel/analytics/react'

import { ThemeProvider } from 'next-themes'

import DotRing from '@/components/Mouse/DotRing'
import LayoutWrapper from '@/components/common/LayoutWrapper'

import useXRDetect from '@/hooks/useXRDetect'

import MouseContextProvider from '@/contexts/Mouse/MouseContextProvider'

import '@/styles/globals.css'

const WebXR = dynamic(() => import('./webxr'), { ssr: false })

function MyApp({ Component, pageProps }: AppProps) {
  // * Hooks
  const xrDetect = useXRDetect()

  // * Render
  return xrDetect.isVR ? (
    <div className="flex h-screen w-screen flex-col">
      <WebXR />
      <Analytics />
    </div>
  ) : (
    <MouseContextProvider>
      <ThemeProvider forcedTheme={undefined} attribute="class">
        <DotRing />
        <LayoutWrapper>
          <Component {...pageProps} />
          <Analytics />
        </LayoutWrapper>
      </ThemeProvider>
    </MouseContextProvider>
  )
}

export default MyApp
