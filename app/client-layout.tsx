'use client'

import dynamic from 'next/dynamic'

import { ThemeProvider } from 'next-themes'

import DotRing from '@/components/Mouse/DotRing'
import LayoutWrapper from '@/components/common/LayoutWrapper'

import useXRDetect from '@/hooks/useXRDetect'

import MouseContextProvider from '@/contexts/Mouse/MouseContextProvider'

const WebXR = dynamic(() => import('./webxr/page'), { ssr: false })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const xrDetect = useXRDetect()

  return xrDetect.isVR ? (
    <div className="flex h-screen w-screen flex-col">
      <WebXR />
    </div>
  ) : (
    <MouseContextProvider>
      <ThemeProvider forcedTheme={undefined} attribute="class">
        <DotRing />
        <LayoutWrapper>{children}</LayoutWrapper>
      </ThemeProvider>
    </MouseContextProvider>
  )
}