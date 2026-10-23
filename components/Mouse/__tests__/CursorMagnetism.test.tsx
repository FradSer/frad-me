import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import MouseContextProvider from '@/contexts/Mouse/MouseContextProvider';
import DotRing from '../DotRing';

const rect = (left = 10, width = 120, height = 40) => ({
  x: left,
  y: 20,
  left,
  top: 20,
  right: left + width,
  bottom: 20 + height,
  width,
  height,
  toJSON: () => ({}),
});
let mediaChange: () => void;
let media: MediaQueryList;

function surface(showOrigin = true) {
  return (
    <MouseContextProvider>
      <DotRing />
      {showOrigin && <button type="button">Origin</button>}
      <a href="/other">Other</a>
      <p>Outside</p>
    </MouseContextProvider>
  );
}

function setup() {
  const { container, rerender } = render(surface());
  const origin = screen.getByRole('button') as HTMLButtonElement;
  const other = screen.getByRole('link');
  origin.getBoundingClientRect = () => rect();
  other.getBoundingClientRect = () => rect(250, 80);
  const shape = () => container.querySelector('[data-cursor-shape]') as SVGPathElement;
  const value = (name: string) => Number(shape().getAttribute(`data-cursor-${name}`));
  const move = (element: Element, x: number, y = 40) =>
    fireEvent.pointerMove(element, { clientX: x, clientY: y });
  return {
    origin,
    other,
    outside: screen.getByText('Outside'),
    shape,
    value,
    move,
    removeOrigin: () => rerender(surface(false)),
  };
}

beforeEach(() => {
  media = {
    matches: true,
    media: '',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn((_event, listener) => {
      mediaChange = listener;
    }),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  } as unknown as MediaQueryList;
  jest.mocked(window.matchMedia).mockReturnValue(media);
});

describe('Cursor magnetic release', () => {
  it('tugs near the edge, blends toward the pointer, and releases at 48 pixels', async () => {
    const { origin, outside, shape, value, move } = setup();
    move(origin, 70);
    await waitFor(() => expect(value('width')).toBe(128));
    move(outside, 154);
    await waitFor(() => expect(value('width')).toBeLessThan(128));
    expect(shape()).toHaveAttribute('data-cursor-shape', 'control');
    expect(value('width')).toBeGreaterThan(16);
    expect(value('x')).toBeGreaterThan(70);
    expect(value('x')).toBeLessThan(154);
    expect(value('grip')).toBeGreaterThan(0);
    expect(value('grip')).toBeLessThan(1);
    const nearerWidth = value('width');
    move(outside, 166);
    await waitFor(() => expect(value('width')).toBeLessThan(nearerWidth));
    move(outside, 178);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'dot'));
    expect(value('width')).toBe(16);
  });

  it('restores full grip on re-entry and hands off immediately to a new target', async () => {
    const { origin, other, outside, value, move } = setup();
    move(origin, 70);
    await waitFor(() => expect(value('width')).toBe(128));
    move(outside, 154);
    await waitFor(() => expect(value('width')).toBeLessThan(128));
    move(origin, 70);
    await waitFor(() => expect(value('width')).toBe(128));
    expect(value('grip')).toBe(1);
    move(outside, 154);
    move(other, 290);
    await waitFor(() => expect(value('width')).toBe(88));
    expect(value('x')).toBe(290);
    expect(value('grip')).toBe(1);
  });

  it.each(['button', 'link'] as const)(
    'uses the same capsule radius for a %s regardless of CSS corners',
    async (role) => {
      const { origin, other, value, move } = setup();
      other.getBoundingClientRect = () => rect();
      const target = role === 'button' ? origin : other;
      target.style.borderTopLeftRadius = role === 'button' ? '0px' : '9999px';
      move(target, 70);
      await waitFor(() => expect(value('width')).toBe(128));
      expect(value('radius')).toBe(24);
      expect(value('height')).toBe(48);
    },
  );

  it.each(['disabled', 'removed'] as const)(
    'clears a retained control when it becomes %s',
    async (change) => {
      const { origin, outside, shape, value, move, removeOrigin } = setup();
      move(origin, 70);
      await waitFor(() => expect(value('width')).toBe(128));
      move(outside, 154);
      await waitFor(() => {
        expect(value('width')).toBeGreaterThan(16);
        expect(value('width')).toBeLessThan(128);
      });
      if (change === 'disabled') origin.disabled = true;
      else removeOrigin();
      await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'dot'));
    },
  );

  it.each(['blur', 'media', 'scroll'] as const)(
    'clears magnetic retention on %s',
    async (event) => {
      const { origin, outside, shape, value, move } = setup();
      move(origin, 70);
      await waitFor(() => expect(value('width')).toBe(128));
      move(outside, 154);
      await waitFor(() => {
        expect(value('width')).toBeGreaterThan(16);
        expect(value('width')).toBeLessThan(128);
      });
      const previous = document.elementFromPoint;
      try {
        document.elementFromPoint = () => outside;
        if (event === 'blur') fireEvent.blur(window);
        else if (event === 'scroll') fireEvent.scroll(window);
        else
          act(() => {
            Object.assign(media, { matches: false });
            mediaChange();
          });
        await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'dot'));
      } finally {
        document.elementFromPoint = previous;
      }
    },
  );
});
