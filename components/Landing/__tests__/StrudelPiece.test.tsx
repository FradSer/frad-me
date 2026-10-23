import { act, fireEvent, render, screen } from '@testing-library/react';

import { STRUDEL_COMPOSER } from '@/content/strudelPiece';
import { prefetchStrudel, startStrudel, stopStrudel } from '@/utils/strudelPlayback';
import StrudelPiece from '../StrudelPiece';

jest.mock('@/utils/strudelPlayback', () => ({
  prefetchStrudel: jest.fn(),
  startStrudel: jest.fn(),
  stopStrudel: jest.fn(),
}));

const start = jest.mocked(startStrudel);

describe('StrudelPiece lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    start.mockReset().mockResolvedValue(undefined);
  });

  it('shows attribution without starting or prefetching on mount', () => {
    render(<StrudelPiece />);
    expect(screen.getByRole('heading', { name: 'sonics' })).toBeVisible();
    expect(screen.getByText(STRUDEL_COMPOSER)).toBeVisible();
    expect(STRUDEL_COMPOSER).toBe('GPT-6.1 Sol');
    expect(screen.getByRole('link', { name: 'strudel.cc' })).toHaveAttribute(
      'href',
      'https://strudel.cc',
    );
    expect(screen.getByRole('button', { name: 'Play music' })).toHaveTextContent('play');
    expect(start).not.toHaveBeenCalled();
    expect(prefetchStrudel).not.toHaveBeenCalled();
  });

  it('prefetches on hover and focus without starting playback', () => {
    render(<StrudelPiece />);
    const button = screen.getByRole('button', { name: 'Play music' });
    fireEvent.pointerEnter(button);
    fireEvent.focus(button);
    expect(prefetchStrudel).toHaveBeenCalledTimes(2);
    expect(start).not.toHaveBeenCalled();
  });

  it('shows loading until playback succeeds and prevents duplicate starts', async () => {
    let finish: () => void = () => {};
    start.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    render(<StrudelPiece />);
    fireEvent.click(screen.getByRole('button', { name: 'Play music' }));
    expect(start).toHaveBeenCalledTimes(1);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('loading');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(start).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish();
    });
    expect(screen.getByRole('button', { name: 'Pause music' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('pauses and allows playback to restart', async () => {
    render(<StrudelPiece />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Play music' }));
    });
    fireEvent.click(screen.getByRole('button', { name: 'Pause music' }));
    expect(stopStrudel).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Play music' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Play music' }));
    });
    expect(start).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button', { name: 'Pause music' })).toBeEnabled();
  });

  it('offers a retry with a friendly live status after failure', async () => {
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    start.mockRejectedValueOnce(new Error('internal runtime failure'));
    try {
      render(<StrudelPiece />);
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Play music' }));
      });
      expect(screen.getByRole('button')).toHaveTextContent('retry');
      expect(screen.getByRole('status').textContent).toMatch(/try|retry|could|unable/i);
      expect(screen.getByRole('status')).not.toHaveTextContent('internal runtime failure');
      await act(async () => {
        fireEvent.click(screen.getByRole('button'));
      });
      expect(screen.getByRole('button', { name: 'Pause music' })).toBeEnabled();
    } finally {
      errorLog.mockRestore();
    }
  });

  it('cancels a pending start on unmount and stops global playback', async () => {
    let finish: () => void = () => {};
    start.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const { unmount } = render(<StrudelPiece />);
    fireEvent.click(screen.getByRole('button', { name: 'Play music' }));
    const isCancelled = start.mock.calls[0][0];
    expect(isCancelled()).toBe(false);
    unmount();
    expect(isCancelled()).toBe(true);
    expect(stopStrudel).toHaveBeenCalled();
    await act(async () => {
      finish();
    });
    expect(start).toHaveBeenCalledTimes(1);
  });
});
