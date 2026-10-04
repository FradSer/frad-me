import { act, fireEvent, render, screen } from '@testing-library/react';

import StrudelPiece from '../StrudelPiece';

const mockLoad = jest.fn();
jest.mock('@strudel/web', () => {
  mockLoad();
  return {};
});

it('loads the music runtime on play intent rather than page idle', async () => {
  jest.useFakeTimers();
  const { unmount } = render(<StrudelPiece />);
  try {
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockLoad).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.focus(screen.getByRole('button', { name: /play/i }));
    });
    expect(mockLoad).toHaveBeenCalledTimes(1);
  } finally {
    unmount();
    jest.useRealTimers();
  }
});
