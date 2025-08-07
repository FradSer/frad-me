import { createContext, useContext, useReducer, ReactNode } from 'react'

export type WebXRView = 'home' | 'work'

export interface WebXRViewState {
  currentView: WebXRView
  isTransitioning: boolean
  transitionProgress: number
  navigationVisible: boolean
  footerLinksVisible: boolean
}

type WebXRViewAction =
  | { type: 'NAVIGATE_TO_HOME' }
  | { type: 'NAVIGATE_TO_WORK' }
  | { type: 'SET_TRANSITION_PROGRESS'; payload: number }
  | { type: 'SET_TRANSITIONING'; payload: boolean }
  | { type: 'SET_NAVIGATION_VISIBLE'; payload: boolean }
  | { type: 'SET_FOOTER_LINKS_VISIBLE'; payload: boolean }

const initialState: WebXRViewState = {
  currentView: 'home',
  isTransitioning: false,
  transitionProgress: 0,
  navigationVisible: true,
  footerLinksVisible: true,
}

function webxrViewReducer(state: WebXRViewState, action: WebXRViewAction): WebXRViewState {
  switch (action.type) {
    case 'NAVIGATE_TO_HOME':
      return {
        ...state,
        currentView: 'home',
        footerLinksVisible: true,
      }
    case 'NAVIGATE_TO_WORK':
      return {
        ...state,
        currentView: 'work',
        footerLinksVisible: false,
      }
    case 'SET_TRANSITION_PROGRESS':
      return {
        ...state,
        transitionProgress: action.payload,
      }
    case 'SET_TRANSITIONING':
      return {
        ...state,
        isTransitioning: action.payload,
      }
    case 'SET_NAVIGATION_VISIBLE':
      return {
        ...state,
        navigationVisible: action.payload,
      }
    case 'SET_FOOTER_LINKS_VISIBLE':
      return {
        ...state,
        footerLinksVisible: action.payload,
      }
    default:
      return state
  }
}

interface WebXRViewContextValue {
  state: WebXRViewState
  navigateToHome: () => void
  navigateToWork: () => void
  setTransitionProgress: (progress: number) => void
  setTransitioning: (transitioning: boolean) => void
  setNavigationVisible: (visible: boolean) => void
  setFooterLinksVisible: (visible: boolean) => void
}

const WebXRViewContext = createContext<WebXRViewContextValue | null>(null)

interface WebXRViewProviderProps {
  children: ReactNode
}

export function WebXRViewProvider({ children }: WebXRViewProviderProps) {
  const [state, dispatch] = useReducer(webxrViewReducer, initialState)

  const contextValue: WebXRViewContextValue = {
    state,
    navigateToHome: () => dispatch({ type: 'NAVIGATE_TO_HOME' }),
    navigateToWork: () => dispatch({ type: 'NAVIGATE_TO_WORK' }),
    setTransitionProgress: (progress: number) => dispatch({ type: 'SET_TRANSITION_PROGRESS', payload: progress }),
    setTransitioning: (transitioning: boolean) => dispatch({ type: 'SET_TRANSITIONING', payload: transitioning }),
    setNavigationVisible: (visible: boolean) => dispatch({ type: 'SET_NAVIGATION_VISIBLE', payload: visible }),
    setFooterLinksVisible: (visible: boolean) => dispatch({ type: 'SET_FOOTER_LINKS_VISIBLE', payload: visible }),
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