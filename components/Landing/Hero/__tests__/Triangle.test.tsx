import { renderToStaticMarkup } from 'react-dom/server';

import Triangle from '@/components/Landing/Hero/Triangle';

describe('Hero decoration prerender', () => {
  it('renders identically across server renders', () => {
    const first = renderToStaticMarkup(<Triangle />);
    const second = renderToStaticMarkup(<Triangle />);

    expect(first).toBe(second);
    expect(first).not.toContain('NaN');
  });
});
