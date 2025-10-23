import { render, screen } from '@testing-library/react';

import Header from '@/components/Header';
import ThemeModeProvider from '@/contexts/Theme/ThemeModeProvider';

describe('Header', () => {
  it('renders navigation with inverse blending styles for contrast', () => {
    render(
      <ThemeModeProvider>
        <Header />
      </ThemeModeProvider>,
    );

    const navigation = screen.getByRole('navigation');

    expect(navigation).toHaveClass('text-black');
    expect(navigation).toHaveClass('dark:text-white');
    expect(navigation).toHaveClass('dark:mix-blend-difference');

    const workLink = screen.getByRole('link', { name: /work/i });
    expect(workLink).toHaveClass('text-black');
    expect(workLink).toHaveClass('dark:text-white');
    expect(workLink).toHaveClass('dark:mix-blend-difference');

    const themeToggle = screen.getByLabelText('Toggle Dark Mode');
    expect(themeToggle).toHaveClass('text-black');
    expect(themeToggle).toHaveClass('dark:text-white');
    expect(themeToggle).toHaveClass('dark:mix-blend-difference');
  });
});
