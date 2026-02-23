import { Canvas } from '@react-three/fiber';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { WebXRViewProvider } from '@/contexts/WebXR/WebXRViewContext';
import WipBadge from '../WipBadge';

// Mock performance measurement
jest.mock('@/utils/performance', () => ({
  measureChunkLoad: jest.fn((_name, fn) => fn()),
}));

// Mock Next.js dynamic import to return a simple component
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: function dynamicImport() {
    const Component = function Component(props: any) {
      return React.createElement(
        'div',
        {
          'data-testid': 'html-badge',
          'data-position': JSON.stringify(props.position || []),
          'data-transform': String(props.transform ?? false),
          'data-occlude': String(props.occlude ?? false),
          'data-distance-factor': String(props.distanceFactor ?? 8),
          'data-z-index': props.style?.zIndex ?? 1000,
          className: props.className,
          style: props.style,
        },
        props.children,
      );
    };
    return Component;
  },
}));

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

const TestWrapper = ({
  children,
  view = 'work',
}: {
  children: React.ReactNode;
  view?: 'home' | 'work';
}) => (
  <WebXRViewProvider initialView={view}>
    <Canvas>{children}</Canvas>
  </WebXRViewProvider>
);

describe('WipBadge Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing when show is true', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );
      expect(document.body).toBeTruthy();
    });

    it('does not render when show is false', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show={false} />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      expect(badge).toBeNull();
    });

    it('does not render when current view is not work', () => {
      render(
        <TestWrapper view="home">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      expect(badge).toBeNull();
    });

    it('renders badge when show is true and view is work', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      expect(badge).not.toBeNull();
    });

    it('renders WIP text in badge', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      expect(badge).toHaveTextContent('WIP');
    });
  });

  describe('Badge Styling', () => {
    it('has yellow-500 background class', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      const innerDiv = badge?.querySelector('.bg-yellow-500');
      expect(innerDiv).not.toBeNull();
    });

    it('has black text color class', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      const innerDiv = badge?.querySelector('.text-black');
      expect(innerDiv).not.toBeNull();
    });

    it('has font-bold class', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      const innerDiv = badge?.querySelector('.font-bold');
      expect(innerDiv).not.toBeNull();
    });

    it('has text-xs class', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      const innerDiv = badge?.querySelector('.text-xs');
      expect(innerDiv).not.toBeNull();
    });

    it('has proper padding classes', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      const innerDiv = badge?.querySelector('.px-2, .py-1');
      expect(innerDiv).not.toBeNull();
    });

    it('has rounded class', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      const innerDiv = badge?.querySelector('.rounded');
      expect(innerDiv).not.toBeNull();
    });

    it('has shadow-lg class', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      const innerDiv = badge?.querySelector('.shadow-lg');
      expect(innerDiv).not.toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('has high contrast between background and text', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      const innerDiv = badge?.querySelector('.bg-yellow-500');
      expect(innerDiv?.classList.contains('bg-yellow-500')).toBe(true);
      expect(badge?.querySelector('.text-black')).not.toBeNull();
    });

    it('has visible text for screen readers', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      expect(badge?.textContent).toBe('WIP');
    });
  });

  describe('Positioning', () => {
    it('has correct position attribute', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      const position = JSON.parse(badge?.getAttribute('data-position') || '[]');
      expect(position).toEqual([2, 1.2, 0.2]);
    });

    it('has transform attribute set to true', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      expect(badge?.getAttribute('data-transform')).toBe('true');
    });

    it('has correct distanceFactor', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      expect(badge?.getAttribute('data-distance-factor')).toBe('8');
    });

    it('has zIndex in style', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      expect(badge?.getAttribute('data-z-index')).toBe('1000');
    });

    it('has occlude attribute set to false', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const badge = screen.queryByTestId('html-badge');
      expect(badge?.getAttribute('data-occlude')).toBe('false');
    });
  });

  describe('Conditional Rendering', () => {
    it('toggles visibility based on show prop', () => {
      const { rerender } = render(
        <TestWrapper view="work">
          <WipBadge show={false} />
        </TestWrapper>,
      );

      expect(screen.queryByTestId('html-badge')).toBeNull();

      rerender(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      expect(screen.queryByTestId('html-badge')).not.toBeNull();

      rerender(
        <TestWrapper view="work">
          <WipBadge show={false} />
        </TestWrapper>,
      );

      expect(screen.queryByTestId('html-badge')).toBeNull();
    });

    it('respects initial view from context', () => {
      const { rerender } = render(
        <TestWrapper view="home">
          <WipBadge show />
        </TestWrapper>,
      );

      expect(screen.queryByTestId('html-badge')).toBeNull();

      rerender(
        <TestWrapper view="home">
          <WipBadge show={true} />
        </TestWrapper>,
      );

      expect(screen.queryByTestId('html-badge')).toBeNull();
    });

    it('respects work view from context', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      expect(screen.queryByTestId('html-badge')).not.toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid show/hide toggles', () => {
      const { rerender } = render(
        <TestWrapper view="work">
          <WipBadge show={false} />
        </TestWrapper>,
      );

      for (let i = 0; i < 5; i++) {
        rerender(
          <TestWrapper view="work">
            <WipBadge show={i % 2 === 0} />
          </TestWrapper>,
        );
      }

      expect(document.body).toBeTruthy();
    });

    it('handles different context configurations', () => {
      render(
        <TestWrapper view="work">
          <WipBadge show={true} />
        </TestWrapper>,
      );

      expect(screen.queryByTestId('html-badge')).not.toBeNull();
    });
  });

  describe('Performance', () => {
    it('uses memo to prevent unnecessary re-renders', () => {
      const { rerender } = render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const initialBadge = screen.queryByTestId('html-badge');

      rerender(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const updatedBadge = screen.queryByTestId('html-badge');
      expect(initialBadge).toBe(updatedBadge);
    });

    it('does not re-render when show prop does not change', () => {
      const { rerender } = render(
        <TestWrapper view="work">
          <WipBadge show />
        </TestWrapper>,
      );

      const initialBadge = screen.queryByTestId('html-badge');

      for (let i = 0; i < 3; i++) {
        rerender(
          <TestWrapper view="work">
            <WipBadge show />
          </TestWrapper>,
        );
      }

      const finalBadge = screen.queryByTestId('html-badge');
      expect(initialBadge).toBe(finalBadge);
    });
  });
});
