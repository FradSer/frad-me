import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WebXRErrorBoundary from '@/components/common/WebXRErrorBoundary';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('WebXRErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <WebXRErrorBoundary>
        <ThrowError shouldThrow={false} />
      </WebXRErrorBoundary>,
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    render(
      <WebXRErrorBoundary>
        <ThrowError shouldThrow={true} />
      </WebXRErrorBoundary>,
    );

    expect(
      screen.getByText('Unable to load 3D experience'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The WebXR components failed to load/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Try Again' }),
    ).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <WebXRErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </WebXRErrorBoundary>,
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(
      screen.queryByText('Unable to load 3D experience'),
    ).not.toBeInTheDocument();
  });

  it('handles retry button click', () => {
    let throwError = true;
    const DynamicThrowError = () => <ThrowError shouldThrow={throwError} />;

    const { rerender } = render(
      <WebXRErrorBoundary>
        <DynamicThrowError />
      </WebXRErrorBoundary>,
    );

    const retryButton = screen.getByRole('button', { name: 'Try Again' });
    expect(retryButton).toBeInTheDocument();

    // Change the error condition and click retry
    throwError = false;
    fireEvent.click(retryButton);

    // Re-render with the new state
    rerender(
      <WebXRErrorBoundary>
        <DynamicThrowError />
      </WebXRErrorBoundary>,
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Try Again' }),
    ).not.toBeInTheDocument();
  });
});
