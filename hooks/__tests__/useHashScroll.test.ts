import { act, renderHook } from '@testing-library/react';
import useHashScroll from '../useHashScroll';

let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
const scroll = jest.fn();
const originalScroll = Element.prototype.scrollIntoView;

function changeHash(hash: string) {
  window.history.replaceState(null, '', `/${hash}`);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}
function flushFrames() {
  const pending = [...frames.values()];
  frames.clear();
  for (const callback of pending) callback(0);
}
async function insertTarget(id: string) {
  const target = document.createElement('section');
  target.id = id;
  await act(async () => {
    document.body.append(target);
  });
  act(flushFrames);
  return target;
}

beforeEach(() => {
  frames = new Map();
  nextFrame = 0;
  scroll.mockReset();
  Element.prototype.scrollIntoView = scroll;
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
  });
  jest.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);
  window.history.replaceState(null, '', '/#ask');
});
afterEach(() => {
  document.querySelectorAll('section').forEach((element) => {
    element.remove();
  });
  Element.prototype.scrollIntoView = originalScroll;
  jest.restoreAllMocks();
});

describe('Hash scrolling for client islands', () => {
  it('waits for a late Ask island and stops observing after scrolling once', async () => {
    const disconnect = jest.spyOn(MutationObserver.prototype, 'disconnect');
    renderHook(() => useHashScroll());
    act(flushFrames);
    expect(scroll).not.toHaveBeenCalled();
    await insertTarget('ask');
    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(disconnect).toHaveBeenCalled();
    await insertTarget('unrelated');
    expect(scroll).toHaveBeenCalledTimes(1);
  });

  it('scrolls an existing target on the next frame with reduced motion', async () => {
    await insertTarget('ask');
    jest.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    renderHook(() => useHashScroll());
    expect(scroll).not.toHaveBeenCalled();
    act(flushFrames);
    expect(scroll).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' });
  });

  it('cancels the old observer when the hash changes', async () => {
    const disconnect = jest.spyOn(MutationObserver.prototype, 'disconnect');
    renderHook(() => useHashScroll());
    act(flushFrames);
    act(() => changeHash('#experience'));
    act(flushFrames);
    await insertTarget('ask');
    expect(scroll).not.toHaveBeenCalled();
    await insertTarget('experience');
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalled();
  });

  it('cancels queued frames and observation when unmounted', async () => {
    const disconnect = jest.spyOn(MutationObserver.prototype, 'disconnect');
    const { unmount } = renderHook(() => useHashScroll());
    act(flushFrames);
    await act(async () => {
      const section = document.createElement('section');
      section.id = 'ask';
      document.body.append(section);
    });
    unmount();
    act(flushFrames);
    expect(scroll).not.toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });

  it('cancels a queued scroll when the hash is cleared', async () => {
    await insertTarget('ask');
    renderHook(() => useHashScroll());
    act(() => changeHash(''));
    act(flushFrames);
    expect(scroll).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });
});
