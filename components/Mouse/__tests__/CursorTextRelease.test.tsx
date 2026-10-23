import { act, fireEvent, render, screen } from '@testing-library/react';

import MouseContextProvider from '@/contexts/Mouse/MouseContextProvider';
import DotRing from '../DotRing';

const rect = (left = 40, width = 10) => ({
  x: left,
  y: 20,
  left,
  top: 20,
  right: left + width,
  bottom: 44,
  width,
  height: 24,
  toJSON: () => ({}),
});
const mockCaret = jest.fn();
const originalCaret = Object.getOwnPropertyDescriptor(document, 'caretRangeFromPoint');

function glyphRange(node: Text): Range {
  const range = document.createRange();
  range.setStart(node, 0);
  range.collapse(true);
  range.getClientRects = () => Object.assign([rect()], { item: () => rect() });
  range.getBoundingClientRect = () => rect();
  range.cloneRange = () => glyphRange(node);
  return range;
}

function setup() {
  const view = render(
    <MouseContextProvider>
      <DotRing />
      <p>Selectable</p>
      <button type="button">Control</button>
      <div>Outside</div>
    </MouseContextProvider>,
  );
  const paragraph = screen.getByText('Selectable');
  mockCaret.mockImplementation(() => glyphRange(paragraph.firstChild as Text));
  const control = screen.getByRole('button');
  control.getBoundingClientRect = () => rect(100, 80);
  const shape = () => view.container.querySelector('[data-cursor-shape]') as SVGPathElement;
  const flush = () =>
    act(() => {
      jest.advanceTimersByTime(0);
    });
  const move = (element: Element, x = 45, buttons = 0) => {
    fireEvent.pointerMove(element, { clientX: x, clientY: 30, buttons });
    flush();
  };
  return { ...view, paragraph, control, shape, move, flush };
}

beforeAll(() => {
  Object.defineProperty(document, 'caretRangeFromPoint', { configurable: true, value: mockCaret });
});
afterAll(() => {
  if (originalCaret) Object.defineProperty(document, 'caretRangeFromPoint', originalCaret);
  else Reflect.deleteProperty(document, 'caretRangeFromPoint');
});
beforeEach(() => {
  jest.useFakeTimers();
  jest
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => window.setTimeout(() => callback(performance.now()), 0));
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => window.clearTimeout(id));
  jest.mocked(window.matchMedia).mockImplementation((query) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('Text cursor release stability', () => {
  it('holds text for 159 milliseconds after departure and releases at 160', () => {
    const { paragraph, shape, move } = setup();
    move(paragraph);
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    move(paragraph, 80);
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    expect(shape()).toHaveAttribute('data-cursor-x', '80');
    act(() => {
      jest.advanceTimersByTime(159);
    });
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(shape()).toHaveAttribute('data-cursor-shape', 'dot');
  });

  it('allows 8 pixels of edge tolerance only after strict glyph entry', () => {
    const { paragraph, shape, move } = setup();
    move(paragraph, 57);
    expect(shape()).toHaveAttribute('data-cursor-shape', 'dot');
    move(paragraph);
    move(paragraph, 58);
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    move(paragraph, 59);
    act(() => {
      jest.advanceTimersByTime(160);
    });
    expect(shape()).toHaveAttribute('data-cursor-shape', 'dot');
  });

  it('does not restart the exit deadline on repeated pointer movement', () => {
    const { paragraph, shape, move } = setup();
    move(paragraph);
    move(paragraph, 80);
    act(() => {
      jest.advanceTimersByTime(100);
    });
    move(paragraph, 90);
    act(() => {
      jest.advanceTimersByTime(59);
    });
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(shape()).toHaveAttribute('data-cursor-shape', 'dot');
  });

  it('preserves the original release deadline through unrelated DOM updates', async () => {
    const { paragraph, shape, move, flush } = setup();
    const unrelated = document.createElement('aside');
    try {
      move(paragraph);
      move(paragraph, 80);
      act(() => {
        jest.advanceTimersByTime(100);
      });
      await act(async () => {
        document.body.appendChild(unrelated);
      });
      flush();
      expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
      act(() => {
        jest.advanceTimersByTime(59);
      });
      expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(shape()).toHaveAttribute('data-cursor-shape', 'dot');
    } finally {
      unrelated.remove();
    }
  });

  it('also delays release when leaving the text element for ordinary blank content', () => {
    const { paragraph, shape, move } = setup();
    move(paragraph);
    move(screen.getByText('Outside'), 80);
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    act(() => {
      jest.advanceTimersByTime(160);
    });
    expect(shape()).toHaveAttribute('data-cursor-shape', 'dot');
  });

  it('starts the release deadline after a text drag ends on blank space', () => {
    const { paragraph, shape, move } = setup();
    move(paragraph);
    fireEvent.pointerDown(paragraph, { button: 0, buttons: 1, clientX: 45, clientY: 30 });
    move(screen.getByText('Outside'), 80, 1);
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    fireEvent.pointerUp(document, { button: 0, buttons: 0, clientX: 80, clientY: 30 });
    move(screen.getByText('Outside'), 80);
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    act(() => {
      jest.advanceTimersByTime(159);
    });
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(shape()).toHaveAttribute('data-cursor-shape', 'dot');
  });

  it('can start a selection drag from an already active glyph-edge tolerance', () => {
    const { paragraph, control, shape, move } = setup();
    move(paragraph);
    move(paragraph, 58);
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    fireEvent.pointerDown(paragraph, { button: 0, buttons: 1, clientX: 58, clientY: 30 });
    move(control, 120, 1);
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    fireEvent.pointerUp(document, { button: 0, buttons: 0, clientX: 120, clientY: 30 });
    move(control, 120);
    expect(shape()).toHaveAttribute('data-cursor-shape', 'control');
  });

  it('cancels release on glyph re-entry and gives controls immediate priority', () => {
    const { paragraph, control, shape, move } = setup();
    move(paragraph);
    move(paragraph, 80);
    act(() => {
      jest.advanceTimersByTime(100);
    });
    move(paragraph);
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    move(paragraph, 80);
    move(control, 120);
    expect(shape()).toHaveAttribute('data-cursor-shape', 'control');
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(shape()).toHaveAttribute('data-cursor-shape', 'control');
  });

  it.each(['hidden', 'nonselectable', 'blur', 'scroll', 'leave', 'unmount'] as const)(
    'clears a pending release on %s',
    (event) => {
      const { paragraph, shape, move, unmount, container, flush } = setup();
      move(paragraph);
      move(paragraph, 80);
      expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
      if (event === 'hidden') {
        paragraph.hidden = true;
        move(paragraph, 80);
      } else if (event === 'nonselectable') {
        paragraph.style.userSelect = 'none';
        move(paragraph, 80);
      } else if (event === 'blur') fireEvent.blur(window);
      else if (event === 'scroll') fireEvent.scroll(window);
      else if (event === 'leave') fireEvent.pointerLeave(document);
      else unmount();
      flush();
      if (event !== 'unmount') expect(shape()).toHaveAttribute('data-cursor-shape', 'dot');
      act(() => {
        jest.advanceTimersByTime(500);
      });
      if (event === 'unmount') expect(container).toBeEmptyDOMElement();
      else expect(shape()).toHaveAttribute('data-cursor-shape', 'dot');
    },
  );
});
