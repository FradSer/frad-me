/**
 * Regression guard for commit 37f7098 (feat: add button hover for chat), which
 * deleted SPRING_CONFIG / TEXT_SPRING_CONFIG / BLEND_FACTOR but left the
 * references on lines 58, 59, 63, 64, 74 — causing every StandardLayout render
 * to throw `ReferenceError: SPRING_CONFIG is not defined`.
 *
 * If any of those identifiers go missing again the mere act of rendering will
 * throw, and this test will fail before the StandardLayout error surfaces in
 * production.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Hero from '@/components/Landing/Hero';
import DotCircle from '@/components/Landing/Hero/DotCircle';
import { CursorType } from '@/contexts/Mouse/MouseContext';
import MouseContextProvider from '@/contexts/Mouse/MouseContextProvider';
import useMouseContext from '@/hooks/useMouseContext';
import DotRing from '../DotRing';

const bounds = (width = 120, height = 40) => ({
  x: 10,
  y: 20,
  left: 10,
  top: 20,
  right: 10 + width,
  bottom: 20 + height,
  width,
  height,
  toJSON: () => ({}),
});

function WorkCard({ wip }: { wip: boolean }) {
  const { cursorChangeHandler } = useMouseContext();
  return (
    <a
      data-cursor="work-card"
      data-cursor-label={wip ? 'WIP' : 'READ'}
      href="/works/example"
      onMouseEnter={() =>
        cursorChangeHandler(wip ? CursorType.workCardHoveredWIP : CursorType.workCardHovered)
      }
      onMouseLeave={() => cursorChangeHandler(CursorType.default)}
    >
      Work
    </a>
  );
}

describe('DotRing', () => {
  beforeEach(() => {
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

  it('mounts without ReferenceError (spring configs are defined)', () => {
    expect(() => render(<DotRing />)).not.toThrow();
  });

  it('keeps the hero circle as one control without a wrapping scroll button', () => {
    render(
      <MouseContextProvider>
        <Hero />
      </MouseContextProvider>,
    );
    const button = screen.getByRole('button', { name: 'View selected work' });
    expect(button.parentElement?.closest('button')).toBeNull();
  });

  it('morphs one visible shape into an unwrapped button and back to the dot', async () => {
    const { container } = render(
      <MouseContextProvider>
        <DotRing />
        <button type="button">
          <span>Nested control</span>
        </button>
        <p>Outside</p>
      </MouseContextProvider>,
    );
    const button = screen.getByRole('button');
    button.getBoundingClientRect = () => bounds();
    fireEvent.pointerMove(screen.getByText('Nested control'), { clientX: 25, clientY: 30 });
    await waitFor(() =>
      expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
        'data-cursor-shape',
        'control',
      ),
    );
    expect(container.querySelectorAll('[data-cursor-shape]')).toHaveLength(1);
    expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute('fill', 'white');
    expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
      'data-cursor-width',
      '128',
    );
    expect(container.querySelector('svg')).toHaveClass('pointer-events-none');
    fireEvent.pointerMove(screen.getByText('Outside'), { clientX: 200, clientY: 200 });
    await waitFor(() =>
      expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
        'data-cursor-shape',
        'dot',
      ),
    );
  });

  it('joins the lower border of an editable field', async () => {
    const { container } = render(
      <MouseContextProvider>
        <DotRing />
        <textarea aria-label="Question" />
      </MouseContextProvider>,
    );
    const input = screen.getByRole('textbox');
    input.getBoundingClientRect = () => bounds(300, 100);
    fireEvent.pointerMove(input, { clientX: 50, clientY: 50 });
    await waitFor(() =>
      expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
        'data-cursor-shape',
        'input',
      ),
    );
    expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
      'data-cursor-width',
      '300',
    );
    expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
      'data-cursor-height',
      '2',
    );
  });

  it('fuses to the actual hero circle with circular corners and returns to a dot', async () => {
    const { motion } = require('motion/react');
    const pathRender = jest.spyOn(motion.path, 'render');
    try {
      const { container } = render(
        <MouseContextProvider>
          <DotRing />
          <DotCircle />
          <p>Outside circle</p>
        </MouseContextProvider>,
      );
      const button = screen.getByRole('button', { name: 'View selected work' });
      button.getBoundingClientRect = () => bounds(96, 96);
      button.style.borderTopLeftRadius = '9999px';
      const arrow = button.querySelector('[data-hero-arrow]') as HTMLElement;
      fireEvent.pointerMove(arrow, { clientX: 50, clientY: 50 });
      await waitFor(() =>
        expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
          'data-cursor-width',
          '104',
        ),
      );
      expect(container.querySelectorAll('[data-cursor-shape]')).toHaveLength(1);
      expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
        'data-cursor-height',
        '104',
      );
      const props = pathRender.mock.calls.at(-1)?.[0] as { animate: { d: string } };
      expect(props.animate.d).toContain('A 52 52');
      fireEvent.pointerMove(screen.getByText('Outside circle'), { clientX: 200, clientY: 200 });
      await waitFor(() =>
        expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
          'data-cursor-shape',
          'dot',
        ),
      );
    } finally {
      pathRender.mockRestore();
    }
  });

  it.each([
    [false, 'READ'],
    [true, 'WIP'],
  ])('retains the %s work card label %s', async (wip, label) => {
    const { container } = render(
      <MouseContextProvider>
        <DotRing />
        <WorkCard wip={wip} />
      </MouseContextProvider>,
    );
    const link = screen.getByRole('link');
    link.getBoundingClientRect = () => bounds(600, 300);
    fireEvent.pointerMove(link, { clientX: 50, clientY: 50 });
    fireEvent.mouseEnter(link);
    await waitFor(() => expect(screen.getByText(label)).toBeInTheDocument());
    expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
      'data-cursor-width',
      '64',
    );
    expect(container.querySelector('svg')).toHaveStyle({ mixBlendMode: 'normal' });
    fireEvent.mouseLeave(link);
    fireEvent.pointerMove(document.body, { clientX: 630, clientY: 100 });
    await waitFor(() =>
      expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
        'data-cursor-width',
        '16',
      ),
    );
    expect(screen.queryByText(label)).not.toBeInTheDocument();
  });

  it('clears geometry when navigation removes the hovered control', async () => {
    const { container, rerender } = render(
      <MouseContextProvider>
        <DotRing />
        <a href="/resume">Resume</a>
      </MouseContextProvider>,
    );
    const link = screen.getByRole('link');
    link.getBoundingClientRect = () => bounds();
    fireEvent.pointerMove(link, { clientX: 50, clientY: 50 });
    await waitFor(() =>
      expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
        'data-cursor-shape',
        'control',
      ),
    );
    rerender(
      <MouseContextProvider>
        <DotRing />
        <p>Next page</p>
      </MouseContextProvider>,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
        'data-cursor-shape',
        'dot',
      ),
    );
  });

  it('remeasures a hovered control when the page scrolls', async () => {
    const { container } = render(
      <MouseContextProvider>
        <DotRing />
        <button type="button">Moving target</button>
      </MouseContextProvider>,
    );
    const button = screen.getByRole('button');
    let width = 120;
    button.getBoundingClientRect = () => bounds(width);
    const previous = document.elementFromPoint;
    document.elementFromPoint = () => button;
    try {
      fireEvent.pointerMove(button, { clientX: 50, clientY: 50 });
      await waitFor(() =>
        expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
          'data-cursor-width',
          '128',
        ),
      );
      width = 200;
      fireEvent.scroll(window);
      await waitFor(() =>
        expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
          'data-cursor-width',
          '208',
        ),
      );
    } finally {
      document.elementFromPoint = previous;
    }
  });

  it('keeps the native cursor when fine-pointer motion is unavailable', async () => {
    const media = window.matchMedia('');
    jest.mocked(window.matchMedia).mockReturnValue({ ...media, matches: false });
    const { container } = render(
      <MouseContextProvider>
        <DotRing />
        <button type="button">Native</button>
      </MouseContextProvider>,
    );
    fireEvent.pointerMove(screen.getByRole('button'));
    expect(document.documentElement).not.toHaveAttribute('data-custom-cursor');
    expect(container.querySelector('svg')).toHaveStyle({ display: 'none' });
  });
});
