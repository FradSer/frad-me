/**
 * BDD: tests/features/landing/strudel-piece.feature
 *
 * @strudel/web is dynamically imported on first click. We mock the module
 * entirely — jsdom can't run the real runtime (it touches AudioContext +
 * AudioWorklet) and we don't need to: the contract under test is the
 * component's lifecycle, not strudel's audio output.
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { STRUDEL_COMPOSER, STRUDEL_PIECE } from '@/content/strudelPiece';
import StrudelPiece from '../StrudelPiece';

// Hoisted stubs the mock factory can reach (jest.mock is hoisted above
// imports, so we can't reference outer let bindings directly).
const strudelMocks = {
  initStrudel: jest.fn(),
  evaluate: jest.fn(),
  hush: jest.fn(),
  samples: jest.fn(),
};

jest.mock('@strudel/web', () => strudelMocks);

function setupHappyPathMocks() {
  strudelMocks.initStrudel.mockImplementation(async (opts) => {
    if (opts?.prebake) await opts.prebake();
    return undefined;
  });
  strudelMocks.evaluate.mockResolvedValue(undefined);
  strudelMocks.samples.mockResolvedValue(undefined);
}

describe('StrudelPiece', () => {
  beforeEach(() => {
    strudelMocks.initStrudel.mockReset();
    strudelMocks.evaluate.mockReset();
    strudelMocks.hush.mockReset();
    strudelMocks.samples.mockReset();
    setupHappyPathMocks();
  });

  it('renders the listen heading with attribution and no module loaded yet', () => {
    render(<StrudelPiece />);

    expect(screen.getByRole('heading', { name: 'listen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play music' })).toHaveTextContent('play');
    expect(screen.getByText(STRUDEL_COMPOSER)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'strudel.cc' })).toHaveAttribute(
      'href',
      'https://strudel.cc',
    );
    expect(strudelMocks.initStrudel).not.toHaveBeenCalled();
  });

  it('first click awaits initStrudel (with drum-machines prebake) before evaluating', async () => {
    // Verifies the bug fix: initStrudel must fully resolve — including the
    // user-supplied prebake that loads the RolandTR909 pack — before
    // evaluate runs, otherwise the pattern is scheduled before samples are
    // registered and plays silence.
    const callOrder: string[] = [];
    strudelMocks.samples.mockImplementation(async (...args) => {
      callOrder.push(`samples:${args[0]}`);
    });
    strudelMocks.initStrudel.mockImplementation(async (opts) => {
      callOrder.push('initStrudel:start');
      if (opts?.prebake) await opts.prebake();
      callOrder.push('initStrudel:end');
    });
    strudelMocks.evaluate.mockImplementation(async (code: string) => {
      callOrder.push(`evaluate:${code.length}`);
    });

    render(<StrudelPiece />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Play music' }));
    });

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('pause');
    });

    expect(strudelMocks.initStrudel).toHaveBeenCalledTimes(1);
    expect(strudelMocks.samples).toHaveBeenCalledWith(
      'https://strudel.b-cdn.net/tidal-drum-machines.json',
      'https://strudel.b-cdn.net/tidal-drum-machines/machines/',
    );
    expect(strudelMocks.evaluate).toHaveBeenCalledWith(STRUDEL_PIECE);

    // evaluate must come AFTER initStrudel has fully resolved.
    const initEndIdx = callOrder.indexOf('initStrudel:end');
    const evalIdx = callOrder.findIndex((s) => s.startsWith('evaluate:'));
    expect(initEndIdx).toBeGreaterThan(-1);
    expect(evalIdx).toBeGreaterThan(initEndIdx);
  });

  it('pointer-enter on the button prefetches the runtime before click', async () => {
    // The module promise is cached at module scope, so a hover before click
    // should warm it. We can't observe `import()` directly, but we can
    // verify the click path still works after a hover and that no extra
    // initStrudel calls happen.
    render(<StrudelPiece />);

    const button = screen.getByRole('button', { name: 'Play music' });
    fireEvent.pointerEnter(button);

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('pause');
    });

    expect(strudelMocks.initStrudel).toHaveBeenCalledTimes(1);
  });

  it('second click pauses without re-initializing the runtime', async () => {
    render(<StrudelPiece />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Play music' }));
    });
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('pause');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Pause music' }));

    expect(strudelMocks.hush).toHaveBeenCalledTimes(1);
    expect(strudelMocks.initStrudel).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toHaveTextContent('play');
  });

  it('shows retry when initStrudel rejects', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    strudelMocks.initStrudel.mockRejectedValueOnce(new Error('boom'));

    render(<StrudelPiece />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Play music' }));
    });

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('retry');
    });
    expect(strudelMocks.evaluate).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('hushes playback on unmount', async () => {
    const { unmount } = render(<StrudelPiece />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Play music' }));
    });
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('pause');
    });

    unmount();
    expect(strudelMocks.hush).toHaveBeenCalled();
  });
});
