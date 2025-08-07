import { createContext, useContext, useState, ReactNode } from 'react'

export type WebXRView = 'home' | 'work'

interface WebXRViewContextValue {
  currentView: WebXRView
  isTransitioning: boolean
  navigationVisible: boolean
  footerLinksVisible: boolean
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
  
  // Auto-managed: footer links visible only on home view
  const footerLinksVisible = currentView === 'home'
  
  const navigateToView = (view: WebXRView) => {
    setCurrentView(view)
  }

  const contextValue: WebXRViewContextValue = {
    currentView,
    isTransitioning,
    navigationVisible,
    footerLinksVisible,
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