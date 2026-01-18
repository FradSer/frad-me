import { memo, useCallback, useState } from 'react';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { xrStore } from './WebXRCanvas';

interface ImmersiveButtonProps {
  className?: string;
}

const BUTTON_TEXT = {
  loading: 'Starting...',
  visionPro: 'Enter Immersive Space',
  default: 'Enter VR',
} as const;

const FALLBACK_TEXT = {
  visionPro: 'Enable WebXR in Safari Settings',
  default: 'WebXR Not Supported',
} as const;

const BUTTON_CLASSES = {
  base: 'px-6 py-3 rounded-full font-medium transition-all duration-200 text-white border border-white border-opacity-30 flex items-center gap-2',
  loading: 'bg-gray-600 cursor-not-allowed',
  active: 'bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-md',
  disabled: 'px-4 py-2 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed',
} as const;

const ERROR_CLASSES =
  'absolute top-full mt-2 left-0 right-0 px-3 py-2 bg-red-900 bg-opacity-90 text-red-200 text-sm rounded-lg backdrop-blur-md';

const SPINNER_CLASSES =
  'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin';

const ImmersiveButton = memo<ImmersiveButtonProps>(function ImmersiveButton({ className = '' }) {
  const { webXRSupported, isVisionPro } = useWebXRView();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enterImmersiveMode = useCallback(async () => {
    if (!webXRSupported) {
      setError('WebXR not supported');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await xrStore.enterVR();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to enter immersive mode:', err);
      }
      setError('Failed to start immersive experience');
    } finally {
      setIsLoading(false);
    }
  }, [webXRSupported]);

  if (!webXRSupported) {
    const fallbackText = isVisionPro ? FALLBACK_TEXT.visionPro : FALLBACK_TEXT.default;
    return <div className={`${BUTTON_CLASSES.disabled} ${className}`}>{fallbackText}</div>;
  }

  const buttonText = isLoading
    ? BUTTON_TEXT.loading
    : isVisionPro
      ? BUTTON_TEXT.visionPro
      : BUTTON_TEXT.default;

  const buttonClasses = `${BUTTON_CLASSES.base} ${isLoading ? BUTTON_CLASSES.loading : BUTTON_CLASSES.active} ${className}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={enterImmersiveMode}
        disabled={isLoading}
        className={buttonClasses}
      >
        {isLoading ? (
          <>
            <div className={SPINNER_CLASSES} />
            {buttonText}
          </>
        ) : (
          <>
            <span className="text-xl">🥽</span>
            {buttonText}
          </>
        )}
      </button>

      {error && <div className={ERROR_CLASSES}>{error}</div>}
    </div>
  );
});

export default ImmersiveButton;
