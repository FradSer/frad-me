import { render, screen } from '@testing-library/react';

import LayoutWrapper from '@/components/common/LayoutWrapper';
import ThemeModeProvider from '@/contexts/Theme/ThemeModeProvider';

jest.mock('@/hooks/useLoading', () => ({
  __esModule: true,
  default: () => ({
    isLoading: false,
    startTransition: jest.fn(),
  }),
}));

describe('LayoutWrapper', () => {
  it('centers the fixed header container', () => {
    const { container } = render(
      <ThemeModeProvider>
        <LayoutWrapper>
          <div>content</div>
        </LayoutWrapper>
      </ThemeModeProvider>,
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('inset-x-0');
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('justify-center');

    const root = header.parentElement as HTMLElement;
    expect(root).toHaveClass('bg-white');
    expect(root).toHaveClass('dark:bg-black');

    const innerContainer = header.firstChild as HTMLElement;
    expect(innerContainer).toHaveClass('layout-wrapper');
    expect(innerContainer).toHaveClass('mx-auto');
    expect(innerContainer).toHaveClass('pointer-events-auto');
  });
});
