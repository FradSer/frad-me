import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import WorkCard from '@/components/Landing/Work/WorkCard';
import { CursorType } from '@/contexts/Mouse/MouseContext';
import MouseContextProvider from '@/contexts/Mouse/MouseContextProvider';
import useMouseContext from '@/hooks/useMouseContext';
import DotRing from '../DotRing';

function Card({ wip = false }: { wip?: boolean }) {
  const { cursorChangeHandler } = useMouseContext();
  return (
    <a
      href="/works/example"
      data-cursor="work-card"
      data-cursor-label={wip ? 'WIP' : 'READ'}
      onMouseEnter={() =>
        cursorChangeHandler(wip ? CursorType.workCardHoveredWIP : CursorType.workCardHovered)
      }
    >
      <span>{wip ? 'WIP cover' : 'Published cover'}</span>
      <span>{wip ? 'WIP caption' : 'Published caption'}</span>
    </a>
  );
}

describe('Work card cursor during scrolling', () => {
  const originalHitTest = document.elementFromPoint;
  beforeEach(() => {
    jest.mocked(window.matchMedia).mockImplementation((media) => ({
      matches: true,
      media,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });
  afterEach(() => {
    document.elementFromPoint = originalHitTest;
  });

  it.each([false, true])(
    'keeps the label when a different descendant of the same card is hit (WIP: %s)',
    async (wip) => {
      const { container } = render(
        <MouseContextProvider>
          <DotRing />
          <Card wip={wip} />
        </MouseContextProvider>,
      );
      const cover = screen.getByText(wip ? 'WIP cover' : 'Published cover');
      const caption = screen.getByText(wip ? 'WIP caption' : 'Published caption');
      const label = wip ? 'WIP' : 'READ';
      document.elementFromPoint = () => cover;
      fireEvent.pointerMove(cover, { clientX: 50, clientY: 60 });
      fireEvent.mouseEnter(cover.closest('a') as Element);
      await screen.findByText(label);
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 35));
      });
      const hitTest = jest.fn(() => caption);
      document.elementFromPoint = hitTest;
      fireEvent.scroll(window);
      await waitFor(() => expect(hitTest).toHaveBeenCalled());
      await waitFor(() =>
        expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
          'data-cursor-shape',
          'work-card',
        ),
      );
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 80));
      });
      expect(screen.getByText(label)).toBeVisible();
      expect(container.querySelector('[data-cursor-width]')).toHaveAttribute(
        'data-cursor-width',
        '64',
      );
    },
  );

  it('derives another card label without pointer movement, then clears it over blank content and controls', async () => {
    const { container } = render(
      <MouseContextProvider>
        <DotRing />
        <Card />
        <Card wip />
        <div>Blank area</div>
        <button type="button">Other control</button>
      </MouseContextProvider>,
    );
    const cover = screen.getByText('Published cover');
    document.elementFromPoint = () => cover;
    fireEvent.pointerMove(cover, { clientX: 50, clientY: 60 });
    fireEvent.mouseEnter(cover.closest('a') as Element);
    await screen.findByText('READ');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 35));
    });
    document.elementFromPoint = () => screen.getByText('WIP caption');
    fireEvent.scroll(window);
    await screen.findByText('WIP');
    expect(screen.queryByText('READ')).not.toBeInTheDocument();
    document.elementFromPoint = () => screen.getByText('Blank area');
    fireEvent.scroll(window);
    await waitFor(() =>
      expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
        'data-cursor-shape',
        'dot',
      ),
    );
    expect(screen.queryByText('WIP')).not.toBeInTheDocument();
    const button = screen.getByRole('button');
    button.getBoundingClientRect = () =>
      ({ left: 10, top: 20, right: 110, bottom: 70, width: 100, height: 50 }) as DOMRect;
    document.elementFromPoint = () => button;
    fireEvent.scroll(window);
    await waitFor(() =>
      expect(container.querySelector('[data-cursor-shape]')).toHaveAttribute(
        'data-cursor-shape',
        'control',
      ),
    );
    expect(container.querySelector('[data-cursor-width]')).toHaveAttribute(
      'data-cursor-width',
      '108',
    );
  });

  it('resolves the scroll hit even while the initial pointer frame is pending', async () => {
    render(
      <MouseContextProvider>
        <DotRing />
        <Card />
        <Card wip />
      </MouseContextProvider>,
    );
    const cover = screen.getByText('Published cover');
    fireEvent.pointerMove(cover, { clientX: 50, clientY: 60 });
    fireEvent.mouseEnter(cover.closest('a') as Element);
    document.elementFromPoint = () => screen.getByText('WIP cover');
    fireEvent.scroll(window);
    expect(await screen.findByText('WIP')).toBeVisible();
    expect(screen.queryByText('READ')).not.toBeInTheDocument();
  });

  it.each(['disabled', 'navigation'] as const)(
    'clears a work card after %s without pointer movement',
    async (change) => {
      const { container, rerender } = render(
        <MouseContextProvider>
          <DotRing />
          <Card />
        </MouseContextProvider>,
      );
      const cover = screen.getByText('Published cover');
      document.elementFromPoint = () => cover;
      fireEvent.pointerMove(cover, { clientX: 50, clientY: 60 });
      await screen.findByText('READ');
      if (change === 'disabled') cover.closest('a')?.setAttribute('aria-disabled', 'true');
      else
        rerender(
          <MouseContextProvider>
            <DotRing />
            <p>Next page</p>
          </MouseContextProvider>,
        );
      await waitFor(() => expect(screen.queryByText('READ')).not.toBeInTheDocument());
      expect(container.querySelector('[data-cursor-width]')).toHaveAttribute(
        'data-cursor-width',
        '16',
      );
    },
  );

  it.each([
    { wip: false, externalLink: undefined, label: 'READ' },
    { wip: false, externalLink: 'https://example.com', label: 'READ' },
    { wip: true, externalLink: undefined, label: 'WIP' },
  ])(
    'derives $label from the actual work card wrapper (external: $externalLink)',
    async ({ wip, externalLink, label }) => {
      render(
        <MouseContextProvider>
          <DotRing />
          <WorkCard
            title="Real case"
            subTitle="Case study"
            slug="example"
            cover="/works/example.png"
            isWIP={wip}
            externalLink={externalLink}
          />
        </MouseContextProvider>,
      );
      fireEvent.pointerMove(screen.getByAltText('Cover for Real case'), {
        clientX: 50,
        clientY: 60,
      });
      expect(await screen.findByText(label)).toBeVisible();
    },
  );
});
