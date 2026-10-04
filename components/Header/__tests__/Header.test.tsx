import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ThemeModeProvider from '@/contexts/Theme/ThemeModeProvider';

import Header from '../index';

describe('original mobile menu keyboard behavior', () => {
  it('closes on Escape, restores focus and preserves the existing scroll setting', async () => {
    document.body.style.overflow = 'clip';
    const { unmount } = render(
      <ThemeModeProvider>
        <Header />
      </ThemeModeProvider>,
    );
    try {
      const button = screen.getByRole('button', { name: 'Open menu' });
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(document.body.style.overflow).toBe('hidden');
      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'false'));
      expect(button).toHaveFocus();
      expect(document.body.style.overflow).toBe('clip');
    } finally {
      unmount();
      document.body.style.overflow = '';
    }
  });
});
