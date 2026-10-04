import { act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import Rectangle from '../Rectangle';

jest.unmock('motion/react');

describe('original rectangle hydration', () => {
  it('hydrates server markup without a transform mismatch and still follows the pointer', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = renderToString(<Rectangle />);
    let root: Root | undefined;

    try {
      expect(container.querySelector('.bg-black')).toHaveStyle({ transform: 'none' });
      await act(async () => {
        root = hydrateRoot(container, <Rectangle />);
      });
      const hydrationErrors = error.mock.calls.filter((args) =>
        args.some((value) => String(value).includes('hydrated')),
      );
      expect(hydrationErrors).toEqual([]);

      await act(async () => {
        document.dispatchEvent(
          new MouseEvent('mousemove', { clientX: window.innerWidth, clientY: window.innerHeight }),
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
      });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });
      const rectangle = container.querySelector('.bg-black');
      expect(rectangle).toHaveStyle({ transform: 'skewX(-2deg) skewY(2deg)' });
    } finally {
      await act(async () => root?.unmount());
      container.remove();
      error.mockRestore();
    }
  });
});
