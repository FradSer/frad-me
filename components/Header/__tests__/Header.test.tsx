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

    expect(navigation).toHaveClass('mix-blend-difference');
    expect(navigation).toHaveClass('text-white');
  });
});
