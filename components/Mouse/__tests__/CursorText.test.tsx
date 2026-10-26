import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { motion } from 'motion/react';

import { CursorType } from '@/contexts/Mouse/MouseContext';
import MouseContextProvider from '@/contexts/Mouse/MouseContextProvider';
import useMouseContext from '@/hooks/useMouseContext';
import DotRing from '../DotRing';

const bounds = (left = 40, top = 20, width = 10, height = 24) => ({
  x: left,
  y: top,
  left,
  top,
  right: left + width,
  bottom: top + height,
  width,
  height,
  toJSON: () => ({}),
});
const mockCaret = jest.fn();
const originalCaret = Object.getOwnPropertyDescriptor(document, 'caretRangeFromPoint');

function glyphRange(node: Text): Range {
  const range = document.createRange();
  range.setStart(node, 0);
  range.collapse(true);
  range.getBoundingClientRect = () => bounds();
  range.getClientRects = () => Object.assign([bounds()], { item: () => bounds() });
  range.cloneRange = () => glyphRange(node);
  return range;
}

function CursorCard({ wip = false }: { wip?: boolean }) {
  const { cursorChangeHandler } = useMouseContext();
  return (
    <motion.div
      data-cursor="work-card"
      data-cursor-label={wip ? 'WIP' : 'READ'}
      onMouseEnter={() =>
        cursorChangeHandler(wip ? CursorType.workCardHoveredWIP : CursorType.workCardHovered)
      }
      onMouseLeave={() => cursorChangeHandler(CursorType.default)}
    >
      {wip ? 'Work in progress' : 'Published project'}
    </motion.div>
  );
}

function setup() {
  const { container } = render(
    <MouseContextProvider>
      <DotRing />
      <a href="/works/example">
        <code>Project link</code>
      </a>
      <p style={{ lineHeight: '24px' }}>Selectable words</p>
      <textarea aria-label="Question" />
      <div data-cursor="work-card">
        <p>Card words</p>
      </div>
      <CursorCard wip />
      <CursorCard />
      <div>Outside</div>
    </MouseContextProvider>,
  );
  const paragraph = screen.getByText('Selectable words');
  mockCaret.mockImplementation(() => glyphRange(paragraph.firstChild as Text));
  const link = screen.getByRole('link');
  link.getBoundingClientRect = () => bounds(10, 20, 30, 24);
  const input = screen.getByRole('textbox');
  input.getBoundingClientRect = () => bounds(10, 100, 120, 40);
  paragraph.getBoundingClientRect = () => bounds(40, 20, 240, 60);
  const shape = () => container.querySelector('[data-cursor-shape]') as SVGPathElement;
  const move = (element: Element, x = 45, y = 30, buttons = 0) =>
    fireEvent.pointerMove(element, { clientX: x, clientY: y, buttons });
  return { paragraph, link, input, shape, move };
}

beforeAll(() => {
  Object.defineProperty(document, 'caretRangeFromPoint', { configurable: true, value: mockCaret });
});
afterAll(() => {
  if (originalCaret) Object.defineProperty(document, 'caretRangeFromPoint', originalCaret);
  else Reflect.deleteProperty(document, 'caretRangeFromPoint');
});
beforeEach(() => {
  mockCaret.mockReset();
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

describe('Selectable text cursor', () => {
  it('morphs the same cursor path into a vertical line over a real glyph', async () => {
    const { paragraph, shape, move } = setup();
    move(paragraph);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'text'));
    expect(shape()).toHaveAttribute('data-cursor-width', '2');
    expect(shape()).toHaveAttribute('data-cursor-height', '24');
    expect(shape()).toHaveAttribute('data-cursor-radius', '1');
    expect(shape()).toHaveAttribute('data-cursor-grip', '0');
    expect(shape()).toHaveAttribute('data-cursor-x', '45');
    expect(shape()).toHaveAttribute('data-cursor-y', '30');
  });

  it('does not treat blank paragraph padding as selectable glyphs', async () => {
    const { paragraph, shape, move } = setup();
    move(paragraph);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'text'));
    move(paragraph, 200, 30);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'dot'));
  });

  it.each(['nonselectable', 'hidden'] as const)('ignores %s text', async (state) => {
    const { paragraph, shape, move } = setup();
    move(paragraph);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'text'));
    if (state === 'nonselectable') paragraph.style.userSelect = 'none';
    else paragraph.hidden = true;
    move(paragraph);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'dot'));
  });

  it('lets selectable text take over immediately from a nearby magnetic control', async () => {
    const { paragraph, link, shape, move } = setup();
    move(link, 25);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'control'));
    move(paragraph);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'text'));
    expect(shape()).toHaveAttribute('data-cursor-grip', '0');
  });

  it('preserves control and editable-field priority over text detection', async () => {
    const { link, input, shape, move } = setup();
    link.getBoundingClientRect = () => bounds(10, 20, 80, 24);
    const label = screen.getByText('Project link');
    mockCaret.mockImplementation(() => glyphRange(label.firstChild as Text));
    move(label);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'control'));
    move(input, 50, 110);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'input'));
    expect(shape()).toHaveAttribute('data-cursor-height', '2');
    expect(link).toHaveAttribute('href', '/works/example');
  });

  it('does not turn work card text into a selection cursor', async () => {
    const { paragraph, shape, move } = setup();
    move(paragraph);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'text'));
    const cardText = screen.getByText('Card words');
    mockCaret.mockImplementation(() => glyphRange(cardText.firstChild as Text));
    move(cardText);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'dot'));
  });

  it('keeps a selection drag vertical across links and outside text, then releases', async () => {
    const { paragraph, link, shape, move } = setup();
    move(paragraph);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'text'));
    fireEvent.pointerDown(paragraph, { button: 0, buttons: 1, clientX: 45, clientY: 30 });
    move(link, 25, 30, 1);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-x', '25'));
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    expect(shape()).toHaveAttribute('data-cursor-width', '2');
    move(screen.getByText('Outside'), 400, 300, 1);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-x', '400'));
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    fireEvent.pointerUp(document, { button: 0, buttons: 0, clientX: 400, clientY: 300 });
    move(link, 25);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'control'));
  });

  it('keeps the native cursor when custom pointer motion is unavailable', () => {
    const media = window.matchMedia('');
    jest.mocked(window.matchMedia).mockReturnValue({ ...media, matches: false });
    const { paragraph, shape, move } = setup();
    move(paragraph);
    expect(document.documentElement).not.toHaveAttribute('data-custom-cursor');
    expect(shape().closest('svg')).toHaveStyle({ display: 'none' });
  });

  it('clears text geometry and hides the cursor when the window blurs', async () => {
    const { paragraph, shape, move } = setup();
    move(paragraph);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'text'));
    fireEvent.blur(window);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'dot'));
    expect(shape().closest('svg')).toHaveStyle({ display: 'none' });
    expect(document.documentElement).not.toHaveAttribute('data-custom-cursor');
  });

  it('releases selection mode after pointer cancellation', async () => {
    const { paragraph, link, shape, move } = setup();
    move(paragraph);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'text'));
    fireEvent.pointerDown(paragraph, { button: 0, buttons: 1, clientX: 45, clientY: 30 });
    fireEvent.pointerCancel(document);
    move(link, 25);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'control'));
  });

  it('discards nearby link retention when crossing a WIP card div', async () => {
    const { link, shape, move } = setup();
    move(link, 25);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'control'));
    const card = screen.getByText('Work in progress');
    fireEvent.mouseEnter(card);
    move(card);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'work-card'));
    expect(shape()).toHaveAttribute('data-cursor-width', '64');
    expect(screen.getByText('WIP')).toBeVisible();
    fireEvent.mouseLeave(card);
    move(screen.getByText('Outside'));
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'dot'));
    expect(shape()).toHaveAttribute('data-cursor-width', '16');
  });

  it('keeps selection mode over a READ card until the drag is released', async () => {
    const { paragraph, shape, move } = setup();
    move(paragraph);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'text'));
    fireEvent.pointerDown(paragraph, { button: 0, buttons: 1, clientX: 45, clientY: 30 });
    const card = screen.getByText('Published project');
    fireEvent.mouseEnter(card);
    move(card, 200, 100, 1);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-x', '200'));
    expect(shape()).toHaveAttribute('data-cursor-shape', 'text');
    expect(shape()).toHaveAttribute('data-cursor-width', '2');
    expect(screen.queryByText('READ')).not.toBeInTheDocument();
    fireEvent.pointerUp(document, { button: 0, buttons: 0, clientX: 200, clientY: 100 });
    move(card, 200, 100);
    await waitFor(() => expect(shape()).toHaveAttribute('data-cursor-shape', 'work-card'));
    expect(shape()).toHaveAttribute('data-cursor-width', '64');
    expect(screen.getByText('READ')).toBeVisible();
  });
});
