import React from 'react';

interface LoadingSpinnerProps {
  message: string;
  size?: 'small' | 'medium' | 'large';
  theme?: 'light' | 'dark';
}

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface ErrorFallbackProps {
  title: string;
  message: string;
  suggestions?: string[];
  actions?: ActionButton[];
  theme?: 'light' | 'dark';
  severity?: 'warning' | 'error';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'medium',
  theme = 'dark',
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  const containerBg = theme === 'dark' ? 'bg-black' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const borderColor = theme === 'dark' ? 'border-white' : 'border-gray-900';

  return (
    <div className={`flex h-full w-full items-center justify-center ${containerBg} ${textColor}`}>
      <div className="text-center">
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 ${borderColor} mx-auto mb-2`}
        />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  title,
  message,
  suggestions = [],
  actions = [],
  theme = 'light',
  severity = 'warning',
}) => {
  const containerBg = theme === 'dark' ? 'bg-black' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  const iconBg = severity === 'error'
    ? 'bg-red-100 dark:bg-red-900/20'
    : 'bg-orange-100 dark:bg-orange-900/20';

  const iconColor = severity === 'error'
    ? 'text-red-600 dark:text-red-400'
    : 'text-orange-600 dark:text-orange-400';

  return (
    <div className={`flex min-h-screen items-center justify-center ${containerBg}`}>
      <div className="max-w-md text-center p-6">
        <div className="mb-6">
          <div className={`rounded-full ${iconBg} p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
            <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        <h2 className={`mb-4 text-2xl font-bold ${textPrimary}`}>{title}</h2>
        <p className={`mb-6 ${textSecondary}`}>{message}</p>

        {suggestions.length > 0 && (
          <div className="space-y-3 text-left mb-6">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                <span className={textSecondary}>{suggestion}</span>
              </div>
            ))}
          </div>
        )}

        {actions.length > 0 && (
          <div className="space-y-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={
                  action.variant === 'primary'
                    ? 'w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
                    : 'w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};