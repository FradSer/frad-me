import React from 'react'
import { motion } from 'framer-motion'
import { 
  FALLBACK_STYLES, 
  FALLBACK_ANIMATIONS, 
  ERROR_REASONS,
  TEST_IDS,
  DECORATIVE_SHAPES,
  FALLBACK_CONTENT
} from '@/utils/webxr/fallbackConfig'

// Shared navigation handlers
export const navigationHandlers = {
  reload: () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  },
  
  goHome: () => {
    if (typeof window !== 'undefined') {
      const homeUrl = new URL('/', window.location.origin)
      window.location.href = homeUrl.toString()
    }
  }
} as const

// Error Icon Component
export const ErrorIcon: React.FC = () => (
  <svg 
    className="w-16 h-16 mx-auto mb-4 text-red-400" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
    />
  </svg>
)

// Action Button Component
interface ActionButtonProps {
  text: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  testId?: string
  className?: string
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  text, 
  onClick, 
  variant = 'primary',
  testId,
  className = ''
}) => {
  const baseStyles = FALLBACK_STYLES.buttonBase
  const variantStyles = variant === 'primary' 
    ? FALLBACK_STYLES.buttonPrimary 
    : FALLBACK_STYLES.buttonSecondary
  
  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      data-testid={testId}
      onClick={onClick}
    >
      {text}
    </button>
  )
}

// Loading Spinner Component
export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`${FALLBACK_STYLES.loadingSpinner} ${className}`} />
)

// Quality Indicator Component
interface QualityIndicatorProps {
  quality: string
  isVisible?: boolean
}

export const QualityIndicator: React.FC<QualityIndicatorProps> = ({ quality, isVisible = true }) => 
  isVisible && quality !== 'high' ? (
    <div 
      className={FALLBACK_STYLES.qualityIndicator}
      data-testid={TEST_IDS.qualityIndicator}
    >
      Performance Mode: {quality.toUpperCase()}
    </div>
  ) : null

// Loading Overlay Component
interface LoadingOverlayProps {
  isVisible: boolean
  text?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  text = 'Loading 3D experience...' 
}) =>
  isVisible ? (
    <div 
      className={FALLBACK_STYLES.loadingOverlay}
      data-testid={TEST_IDS.fallback3DLoading}
    >
      <div className="text-white">{text}</div>
    </div>
  ) : null

// Error Details Component
interface ErrorDetailsProps {
  error?: Error
  isDevMode?: boolean
  sanitizeError: (error: Error) => string
}

export const ErrorDetails: React.FC<ErrorDetailsProps> = ({ 
  error, 
  isDevMode = false, 
  sanitizeError 
}) =>
  isDevMode && error ? (
    <details className="mt-6 text-left">
      <summary className="cursor-pointer text-sm text-gray-400">
        Error Details (Development)
      </summary>
      <pre className="mt-2 overflow-auto bg-gray-800 p-2 text-xs text-red-300">
        {sanitizeError(error)}
      </pre>
    </details>
  ) : null

// Error Fallback Container
interface ErrorFallbackProps {
  title?: string
  error?: Error
  onRetry?: () => void
  onGoHome?: () => void
  sanitizeError?: (error: Error) => string
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  title = 'WebXR Experience Unavailable',
  error,
  onRetry = navigationHandlers.reload,
  onGoHome = navigationHandlers.goHome,
  sanitizeError = (err: Error) => err.message
}) => {
  const isDevMode = process.env.NODE_ENV === 'development'
  
  return (
    <div 
      className={`${FALLBACK_STYLES.fullScreenContainer} ${FALLBACK_STYLES.errorBackground}`}
      data-testid={TEST_IDS.webxrErrorFallback}
    >
      <div className={FALLBACK_STYLES.maxWidthContainer}>
        <ErrorIcon />
        
        <h1 
          className="mb-4 text-2xl font-bold"
          data-testid={TEST_IDS.errorTitle}
        >
          {title}
        </h1>
        
        <p className="mb-6 text-gray-300">
          We encountered an issue loading the 3D experience. This might be due to:
          {ERROR_REASONS.map(reason => (
            <React.Fragment key={reason}>
              <br />• {reason}
            </React.Fragment>
          ))}
        </p>
        
        <div className="space-y-3">
          <ActionButton
            text="Try Again"
            onClick={onRetry}
            testId={TEST_IDS.errorTryAgainButton}
            className="w-full"
          />
          <ActionButton
            text="Return to Main Site"
            onClick={onGoHome}
            variant="secondary"
            testId={TEST_IDS.errorReturnButton}
            className="w-full"
          />
        </div>
        
        <ErrorDetails 
          error={error} 
          isDevMode={isDevMode} 
          sanitizeError={sanitizeError} 
        />
      </div>
    </div>
  )
}

// Decorative Shapes for 2D Fallback
export const DecorativeShapes: React.FC = () => (
  <motion.div className="mb-8 flex justify-center space-x-6" variants={FALLBACK_ANIMATIONS.fadeInUp}>
    {DECORATIVE_SHAPES.map((shape, index) => (
      <motion.div
        key={index}
        className={shape.className}
        animate={FALLBACK_ANIMATIONS.float}
        style={{ animationDelay: `${shape.delay}s` }}
      />
    ))}
  </motion.div>
)

// Personal Info Content for 2D Fallback
export const PersonalInfo: React.FC = () => (
  <>
    <motion.h1
      className="mb-6 text-6xl font-black leading-tight md:text-7xl"
      variants={FALLBACK_ANIMATIONS.fadeInUp}
    >
      {FALLBACK_CONTENT.name}
    </motion.h1>

    {FALLBACK_CONTENT.descriptions.map((text, index) => (
      <motion.p
        key={index}
        className="mb-4 text-xl text-gray-300 md:text-2xl"
        variants={FALLBACK_ANIMATIONS.fadeInUp}
      >
        {text}
      </motion.p>
    ))}
  </>
)

// Fallback Action Buttons for 2D fallback
export const FallbackActions: React.FC = () => (
  <motion.div className="space-y-4" variants={FALLBACK_ANIMATIONS.fadeInUp}>
    <p className="text-sm text-gray-400">
      This is a 2D version of the WebXR experience
    </p>
    <div className="flex flex-col items-center space-y-3 md:flex-row md:justify-center md:space-x-4 md:space-y-0">
      <ActionButton
        text="Try WebXR Again"
        onClick={navigationHandlers.reload}
        testId={TEST_IDS.fallback2DRetry}
      />
      <ActionButton
        text="Explore Portfolio"
        onClick={navigationHandlers.goHome}
        variant="secondary"
        testId={TEST_IDS.fallback2DHome}
      />
    </div>
  </motion.div>
)