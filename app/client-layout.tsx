'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

import { ThemeProvider } from 'next-themes'

import DotRing from '@/components/Mouse/DotRing'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import LayoutWrapper from '@/components/common/LayoutWrapper'

import useXRDetect from '@/hooks/useXRDetect'

import MouseContextProvider from '@/contexts/Mouse/MouseContextProvider'

const WebXR = dynamic(() => import('./webxr/page'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <div className="text-2xl font-bold text-white">Loading XR...</div>
    </div>
  ),
})

type ClientLayoutProps = {
  children: React.ReactNode
}

const StandardLayout = ({ children }: ClientLayoutProps) => (
  <ErrorBoundary>
    <MouseContextProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <DotRing />
        <LayoutWrapper>{children}</LayoutWrapper>
      </ThemeProvider>
    </MouseContextProvider>
  </ErrorBoundary>
)

const WebXRLayout = ({ children }: ClientLayoutProps) => (
  <ErrorBoundary>
    <MouseContextProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <div className="h-screen w-screen bg-black">{children}</div>
      </ThemeProvider>
    </MouseContextProvider>
  </ErrorBoundary>
)

const VRLayout = () => (
  <ErrorBoundary>
    <div className="flex h-screen w-screen flex-col bg-black">
      <WebXR />
    </div>
  </ErrorBoundary>
)

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isVR } = useXRDetect()
  const pathname = usePathname()

  // Force dark theme and no header for WebXR route
  const isWebXRRoute = pathname === '/webxr'

  if (isVR) {
    return <VRLayout />
  }

  if (isWebXRRoute) {
    return <WebXRLayout>{children}</WebXRLayout>
  }

  return <StandardLayout>{children}</StandardLayout>
}
