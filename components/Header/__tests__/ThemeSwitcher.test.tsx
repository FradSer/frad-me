import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ThemeModeProvider from '@/contexts/Theme/ThemeModeProvider';
import ThemeSwitcher from '../ThemeSwitcher';

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
    localStorage.clear();
  });

  it('toggles between light and dark classes on the html element', async () => {
    const user = userEvent.setup();

    render(
      <ThemeModeProvider>
        <ThemeSwitcher />
      </ThemeModeProvider>,
    );

    const toggleButton = screen.getByRole('button', {
      name: /toggle dark mode/i,
    });

    await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(false));

    await user.click(toggleButton);

    await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true));

    await user.click(toggleButton);

    await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(false));
  });
});
