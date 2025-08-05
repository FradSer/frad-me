'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('App Router Error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
          Oops! Something went wrong
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          We encountered an unexpected error. This could be a temporary issue.
        </p>
        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Go Home
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
