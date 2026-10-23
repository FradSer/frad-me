import { fireEvent, render, screen } from '@testing-library/react';

import DotCircle from '../DotCircle';

const mockReducedMotion = jest.fn(() => false);

jest.mock('motion/react', () => {
  const React = require('react');
  const wrapper = (tag: string) =>
    React.forwardRef(
      (
        {
          children,
          animate,
          transition,
          initial,
          whileInView,
          viewport,
          ...props
        }: {
          children?: React.ReactNode;
          animate?: unknown;
          transition?: unknown;
          initial?: unknown;
          whileInView?: unknown;
          viewport?: unknown;
        },
        ref: React.Ref<HTMLElement>,
      ) =>
        React.createElement(
          tag,
          {
            ...props,
            ref,
            'data-motion-animate': JSON.stringify(animate),
            'data-motion-transition': JSON.stringify(transition),
          },
          children,
        ),
    );
  return {
    motion: { button: wrapper('button'), div: wrapper('div'), span: wrapper('span') },
    useReducedMotion: () => mockReducedMotion(),
  };
});

function feedback(container: HTMLElement) {
  return container.querySelector('[data-hero-arrow]');
}

describe('Hero circle control', () => {
  beforeEach(() => {
    mockReducedMotion.mockReturnValue(false);
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

  it('keeps touch-generated hover inactive while preserving focus feedback', () => {
    const media = window.matchMedia('');
    jest.mocked(window.matchMedia).mockReturnValue({ ...media, matches: false });
    const { container } = render(<DotCircle />);
    const button = screen.getByRole('button', { name: 'View selected work' });
    fireEvent.mouseEnter(button);
    expect(feedback(container)).toHaveAttribute('data-active', 'false');
    fireEvent.focus(button);
    expect(feedback(container)).toHaveAttribute('data-active', 'true');
  });

  it('is a named native button with no nested buttons', () => {
    render(<DotCircle />);
    const button = screen.getByRole('button', { name: 'View selected work' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('rounded-full');
    expect(button.querySelector('button')).toBeNull();
  });

  it('keeps feedback active while either hover or focus remains', () => {
    const { container } = render(<DotCircle />);
    const button = screen.getByRole('button', { name: 'View selected work' });
    expect(feedback(container)).toHaveAttribute('data-active', 'false');
    fireEvent.mouseEnter(button);
    expect(feedback(container)).toHaveAttribute('data-active', 'true');
    fireEvent.focus(button);
    fireEvent.mouseLeave(button);
    expect(feedback(container)).toHaveAttribute('data-active', 'true');
    fireEvent.blur(button);
    expect(feedback(container)).toHaveAttribute('data-active', 'false');
    fireEvent.mouseEnter(button);
    fireEvent.focus(button);
    fireEvent.blur(button);
    expect(feedback(container)).toHaveAttribute('data-active', 'true');
    fireEvent.mouseLeave(button);
    expect(feedback(container)).toHaveAttribute('data-active', 'false');
  });

  it('gives the arrow and circle motion feedback without resizing layout', () => {
    const { container } = render(<DotCircle />);
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'View selected work' }));
    const arrow = JSON.parse(feedback(container)?.getAttribute('data-motion-animate') ?? '{}');
    const circle = JSON.parse(
      container.querySelector('[data-hero-circle]')?.getAttribute('data-motion-animate') ?? '{}',
    );
    expect(arrow).toMatchObject({ scale: 1.1, y: [0, 6, 0] });
    expect(circle).toMatchObject({ scale: 1.12 });
    expect(circle).not.toHaveProperty('width');
    expect(circle).not.toHaveProperty('height');
  });

  it.each([false, true])('scrolls to work with reduced motion set to %s', (reduced) => {
    mockReducedMotion.mockReturnValue(reduced);
    const { container } = render(
      <>
        <DotCircle />
        <section id="work" />
      </>,
    );
    const work = container.querySelector('#work') as HTMLElement;
    work.scrollIntoView = jest.fn();
    const button = screen.getByRole('button', { name: 'View selected work' });
    fireEvent.focus(button);
    fireEvent.click(button);
    expect(work.scrollIntoView).toHaveBeenCalledWith({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    });
    expect(work.scrollIntoView).toHaveBeenCalledTimes(1);
    if (reduced) {
      const arrow = JSON.parse(feedback(container)?.getAttribute('data-motion-animate') ?? '{}');
      const transition = JSON.parse(
        feedback(container)?.getAttribute('data-motion-transition') ?? '{}',
      );
      expect(arrow.y).not.toEqual(expect.any(Array));
      expect(JSON.stringify(transition)).not.toContain('repeat');
    }
  });
});
