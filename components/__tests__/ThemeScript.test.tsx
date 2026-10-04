import { runInNewContext } from 'node:vm';
import { renderToStaticMarkup } from 'react-dom/server';

import ThemeScript from '@/components/ThemeScript';

const markup = renderToStaticMarkup(<ThemeScript />);
const script = new DOMParser().parseFromString(markup, 'text/html').querySelector('script');

describe('Theme script before hydration', () => {
  beforeEach(() => {
    document.documentElement.className = 'app-root light dark';
    document.documentElement.style.colorScheme = '';
  });

  afterEach(() => {
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
  });

  it.each([
    ['light', true, 'light'],
    ['dark', false, 'dark'],
    ['system', false, 'light'],
    ['system', true, 'dark'],
    [null, false, 'light'],
    [null, true, 'dark'],
  ])('resolves %s with system dark=%s to %s', (preference, prefersDark, resolved) => {
    const storage = { getItem: jest.fn(() => preference) };

    expect(script).not.toBeNull();
    runInNewContext(script?.textContent ?? '', {
      document,
      localStorage: storage,
      window: { matchMedia: () => ({ matches: prefersDark }) },
    });

    expect(storage.getItem).toHaveBeenCalledWith('theme');
    expect(document.documentElement).toHaveClass('app-root', resolved as string);
    expect(document.documentElement).not.toHaveClass(resolved === 'dark' ? 'light' : 'dark');
    expect(document.documentElement.style.colorScheme).toBe(resolved);
  });

  it.each(['storage', 'system'])('contains failures from the %s API', (unavailable) => {
    const fail = () => {
      throw new Error('Browser API unavailable');
    };

    expect(() =>
      runInNewContext(script?.textContent ?? '', {
        document,
        localStorage: { getItem: unavailable === 'storage' ? fail : () => 'system' },
        window: { matchMedia: fail },
      }),
    ).not.toThrow();
    expect(document.documentElement.className).toBe('app-root light dark');
  });
});
