import type React from 'react';
import { useCallback, useState } from 'react';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { xrStore } from './WebXRCanvas';

interface ImmersiveButtonProps {
  className?: string;
}

const ImmersiveButton: React.FC<ImmersiveButtonProps> = ({ className = '' }) => {
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
    return (
      <div
        className={`px-4 py-2 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed ${className}`}
      >
        {isVisionPro ? 'Enable WebXR in Safari Settings' : 'WebXR Not Supported'}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={enterImmersiveMode}
        disabled={isLoading}
        className={`
          px-6 py-3 rounded-full font-medium transition-all duration-200
          ${
            isLoading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-md'
          }
          text-white border border-white border-opacity-30
          flex items-center gap-2
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <span className="text-xl">🥽</span>
            {isVisionPro ? 'Enter Immersive Space' : 'Enter VR'}
          </>
        )}
      </button>

      {error && (
        <div className="absolute top-full mt-2 left-0 right-0 px-3 py-2 bg-red-900 bg-opacity-90 text-red-200 text-sm rounded-lg backdrop-blur-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImmersiveButton;
