import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type WebXRView = 'home' | 'work'

interface WebXRViewContextValue {
  currentView: WebXRView
  isTransitioning: boolean
  navigationVisible: boolean
  footerLinksVisible: boolean
  isVisionPro: boolean
  webXRSupported: boolean
  navigateToView: (view: WebXRView) => void
  setTransitioning: (transitioning: boolean) => void
}

const WebXRViewContext = createContext<WebXRViewContextValue | null>(null)

interface WebXRViewProviderProps {
  children: ReactNode
}

export function WebXRViewProvider({ children }: WebXRViewProviderProps) {
  const [currentView, setCurrentView] = useState<WebXRView>('home')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [navigationVisible] = useState(true) // Always visible in this implementation
  const [isVisionPro, setIsVisionPro] = useState(false)
  const [webXRSupported, setWebXRSupported] = useState(false)
  
  // Auto-managed: footer links visible only on home view
  const footerLinksVisible = currentView === 'home'
  
  // Detect Vision Pro and WebXR support
  useEffect(() => {
    const detectCapabilities = async () => {
      // Check WebXR support
      if (typeof navigator !== 'undefined' && 'xr' in navigator && navigator.xr) {
        try {
          const vrSupported = await navigator.xr.isSessionSupported('immersive-vr')
          setWebXRSupported(vrSupported)
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.log('WebXR detection failed:', error)
          }
          setWebXRSupported(false)
        }
      }

      // Detect Vision Pro (reports as iPad with WebXR support)
      if (typeof navigator !== 'undefined') {
        const isIpad = /iPad/.test(navigator.platform) || 
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
        const hasWebXR = 'xr' in navigator
        setIsVisionPro(isIpad && hasWebXR)
      }
    }

    detectCapabilities()
  }, [])
  
  const navigateToView = (view: WebXRView) => {
    setCurrentView(view)
  }

  const contextValue: WebXRViewContextValue = {
    currentView,
    isTransitioning,
    navigationVisible,
    footerLinksVisible,
    isVisionPro,
    webXRSupported,
    navigateToView,
    setTransitioning: setIsTransitioning,
  }

  return (
    <WebXRViewContext.Provider value={contextValue}>
      {children}
    </WebXRViewContext.Provider>
  )
}

export function useWebXRView() {
  const context = useContext(WebXRViewContext)
  if (!context) {
    throw new Error('useWebXRView must be used within a WebXRViewProvider')
  }
  return context
}