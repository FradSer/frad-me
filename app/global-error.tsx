'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-red-50">
          <div className="max-w-md text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-800">
              Critical Error
            </h2>
            <p className="mb-6 text-red-600">
              A critical error occurred that prevented the application from
              loading properly.
            </p>
            <div className="space-y-4">
              <button
                type="button"
                onClick={reset}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}
                className="w-full rounded-lg border border-red-300 px-4 py-2 text-red-700 transition-colors hover:bg-red-50"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
