'use client'

import dynamic from 'next/dynamic'
import { ThemeProvider } from 'next-themes'

import DotRing from '@/components/Mouse/DotRing'
import LayoutWrapper from '@/components/common/LayoutWrapper'
import MouseContextProvider from '@/contexts/Mouse/MouseContextProvider'

import useXRDetect from '@/hooks/useXRDetect'

const WebXR = dynamic(() => import('./webxr/page'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-2xl font-bold text-white">Loading XR...</div>
    </div>
  ),
})

type ClientLayoutProps = {
  children: React.ReactNode
}

const StandardLayout = ({ children }: ClientLayoutProps) => (
  <MouseContextProvider>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DotRing />
      <LayoutWrapper>{children}</LayoutWrapper>
    </ThemeProvider>
  </MouseContextProvider>
)

const VRLayout = () => (
  <div className="flex h-screen w-screen flex-col bg-black">
    <WebXR />
  </div>
)

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isVR } = useXRDetect()

  return isVR ? <VRLayout /> : <StandardLayout>{children}</StandardLayout>
}