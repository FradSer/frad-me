import { Canvas } from '@react-three/fiber';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { WebXRViewProvider } from '@/contexts/WebXR/WebXRViewContext';
import WipBadge from '../WipBadge';

jest.mock('@/utils/performance', () => ({
  measureChunkLoad: jest.fn((_name, fn) => fn()),
}));

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => function MockDynamic(props: any) {
    return <div data-testid="html-badge" {...props}>{props.children}</div>;
  },
}));

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
  it('renders badge when show is true and view is work', () => {
    render(
      <TestWrapper view="work">
        <WipBadge show />
      </TestWrapper>,
    );
    expect(screen.getByTestId('html-badge')).toHaveTextContent('WIP');
  });

  it('does not render when show is false', () => {
    render(
      <TestWrapper view="work">
        <WipBadge show={false} />
      </TestWrapper>,
    );
    expect(screen.queryByTestId('html-badge')).toBeNull();
  });

  it('does not render when current view is home', () => {
    render(
      <TestWrapper view="home">
        <WipBadge show />
      </TestWrapper>,
    );
    expect(screen.queryByTestId('html-badge')).toBeNull();
  });
});
