import { render, screen } from '@testing-library/react';

import Patents from '../Patents';

describe('Patents component', () => {
  it('applies theme-aware text colors', () => {
    render(<Patents />);

    const list = screen.getByRole('list');
    expect(list).toHaveClass('text-black');
    expect(list).toHaveClass('dark:text-white');
  });
});
