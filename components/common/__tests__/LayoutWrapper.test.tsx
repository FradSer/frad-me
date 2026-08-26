import { render, screen } from '@testing-library/react';
import type React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import LayoutWrapper from '@/components/common/LayoutWrapper';
import ThemeModeProvider from '@/contexts/Theme/ThemeModeProvider';

function renderServerMarkup(children: React.ReactNode): string {
  return renderToStaticMarkup(
    <ThemeModeProvider>
      <LayoutWrapper>{children}</LayoutWrapper>
    </ThemeModeProvider>,
  );
}

describe('LayoutWrapper', () => {
  it('centers the fixed header container', () => {
    render(
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

  it('server-renders children without a loading gate', () => {
    const markup = renderServerMarkup(<div>hero content</div>);

    expect(markup).toContain('hero content');
    expect(markup).not.toMatch(/\bloading\b/);
  });

  it('renders shell elements without hydration-gated entrance styles', () => {
    const markup = renderServerMarkup(<div>hero content</div>);
    const doc = new DOMParser().parseFromString(markup, 'text/html');

    const header = doc.querySelector('header');
    const main = doc.querySelector('main');
    expect(header).not.toBeNull();
    expect(main).not.toBeNull();

    for (const element of [header as HTMLElement, main as HTMLElement]) {
      expect(element.style.opacity).toBe('');
      expect(element.style.transform).toBe('');
    }
  });
});
