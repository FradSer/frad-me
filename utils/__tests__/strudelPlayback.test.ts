import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { STRUDEL_COMPOSER, STRUDEL_PIECE } from '@/content/strudelPiece';

const mockLoad = jest.fn();
const mockRuntime = {
  initStrudel: jest.fn(),
  initAudio: jest.fn(),
  evaluate: jest.fn(),
  hush: jest.fn(),
  samples: jest.fn(),
};

jest.mock('@strudel/web', () => {
  mockLoad();
  return mockRuntime;
});

const mockContext = {
  state: 'suspended',
  resume: jest.fn(),
};
const mockAudioContext = jest.fn(() => mockContext);
const originalContext = window.AudioContext;

type Playback = typeof import('../strudelPlayback');
let playback: Playback;

beforeEach(async () => {
  jest.resetModules();
  mockLoad.mockReset();
  for (const stub of Object.values(mockRuntime)) stub.mockReset();
  mockRuntime.initStrudel.mockResolvedValue(undefined);
  mockRuntime.initAudio.mockResolvedValue(undefined);
  mockRuntime.evaluate.mockResolvedValue(undefined);
  mockContext.state = 'suspended';
  mockContext.resume.mockReset().mockImplementation(async () => {
    mockContext.state = 'running';
  });
  mockAudioContext.mockClear();
  window.AudioContext = mockAudioContext as unknown as typeof AudioContext;
  playback = await import('../strudelPlayback');
});

afterAll(() => {
  window.AudioContext = originalContext;
});

describe('Strudel audio playback boundary', () => {
  it('keeps the standalone score and composer credit aligned with the canonical piece', () => {
    const mirror = readFileSync(join(process.cwd(), 'docs/strudel/frad-me.strudel.js'), 'utf8');
    expect(mirror.trim()).toBe(STRUDEL_PIECE.trim());
    expect(STRUDEL_COMPOSER).toBe('GPT-6.1 Sol');
  });

  it('resumes audio synchronously before awaiting the runtime', async () => {
    expect(mockLoad).not.toHaveBeenCalled();
    const started = playback.startStrudel(() => false);
    expect(mockAudioContext).toHaveBeenCalledTimes(1);
    expect(mockContext.resume).toHaveBeenCalledTimes(1);
    expect(mockRuntime.initStrudel).not.toHaveBeenCalled();
    await started;
    expect(mockRuntime.initStrudel).toHaveBeenCalledWith(
      expect.objectContaining({
        audioContext: mockContext,
        onEvalError: expect.any(Function),
      }),
    );
    expect(mockRuntime.initAudio).toHaveBeenCalledTimes(1);
    expect(mockRuntime.evaluate).toHaveBeenCalledWith(STRUDEL_PIECE);
    expect(mockRuntime.samples).not.toHaveBeenCalled();
    expect(mockRuntime.initStrudel.mock.invocationCallOrder[0]).toBeLessThan(
      mockRuntime.initAudio.mock.invocationCallOrder[0],
    );
    expect(mockRuntime.initAudio.mock.invocationCallOrder[0]).toBeLessThan(
      mockRuntime.evaluate.mock.invocationCallOrder[0],
    );
  });

  it('prefetches without unlocking audio and reuses initialization across starts', async () => {
    playback.prefetchStrudel();
    await Promise.resolve();
    expect(mockAudioContext).not.toHaveBeenCalled();
    expect(mockRuntime.initStrudel).not.toHaveBeenCalled();
    await playback.startStrudel(() => false);
    playback.stopStrudel();
    await playback.startStrudel(() => false);
    expect(mockLoad).toHaveBeenCalledTimes(1);
    expect(mockAudioContext).toHaveBeenCalledTimes(1);
    expect(mockRuntime.initStrudel).toHaveBeenCalledTimes(1);
    expect(mockRuntime.initAudio).toHaveBeenCalledTimes(1);
    expect(mockRuntime.evaluate).toHaveBeenCalledTimes(2);
    expect(mockRuntime.hush).toHaveBeenCalled();
  });

  it('retries a rejected module import', async () => {
    mockLoad.mockImplementationOnce(() => {
      throw new Error('bundle unavailable');
    });
    await expect(playback.startStrudel(() => false)).rejects.toThrow('bundle unavailable');
    await expect(playback.startStrudel(() => false)).resolves.toBeUndefined();
    expect(mockLoad).toHaveBeenCalledTimes(2);
    expect(mockRuntime.evaluate).toHaveBeenCalledTimes(1);
  });

  it('retries initialization after a failure without evaluating prematurely', async () => {
    mockRuntime.initStrudel.mockRejectedValueOnce(new Error('initialization failed'));
    await expect(playback.startStrudel(() => false)).rejects.toThrow('initialization failed');
    expect(mockRuntime.evaluate).not.toHaveBeenCalled();
    await playback.startStrudel(() => false);
    expect(mockRuntime.evaluate).toHaveBeenCalledTimes(1);
  });

  it('rejects evaluation errors delivered through the runtime callback', async () => {
    const failure = new Error('invalid pattern');
    mockRuntime.evaluate.mockImplementationOnce(async () => {
      const options = mockRuntime.initStrudel.mock.calls[0][0];
      options.onEvalError(failure);
    });
    await expect(playback.startStrudel(() => false)).rejects.toThrow('invalid pattern');
  });

  it('does not evaluate when the resumed context remains suspended', async () => {
    mockContext.resume.mockResolvedValue(undefined);
    await expect(playback.startStrudel(() => false)).rejects.toThrow();
    expect(mockRuntime.evaluate).not.toHaveBeenCalled();
  });

  it('cancels playback while initialization is pending', async () => {
    let complete: () => void = () => {};
    let cancelled = false;
    mockRuntime.initStrudel.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          complete = resolve;
        }),
    );
    const started = playback.startStrudel(() => cancelled);
    for (let turn = 0; turn < 10 && !mockRuntime.initStrudel.mock.calls.length; turn++)
      await Promise.resolve();
    expect(mockRuntime.initStrudel).toHaveBeenCalled();
    cancelled = true;
    complete();
    await started;
    expect(mockRuntime.evaluate).not.toHaveBeenCalled();
  });

  it('hushes an evaluation that completes after cancellation', async () => {
    let complete: () => void = () => {};
    let cancelled = false;
    mockRuntime.evaluate.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          complete = resolve;
        }),
    );
    const started = playback.startStrudel(() => cancelled);
    for (let turn = 0; turn < 20 && !mockRuntime.evaluate.mock.calls.length; turn++)
      await Promise.resolve();
    expect(mockRuntime.evaluate).toHaveBeenCalled();
    cancelled = true;
    complete();
    await started;
    expect(mockRuntime.hush).toHaveBeenCalled();
  });

  it('finishes a cancelled evaluation before starting a newer player', async () => {
    let complete: () => void = () => {};
    let cancelled = false;
    mockRuntime.evaluate.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          complete = resolve;
        }),
    );
    const oldPlayer = playback.startStrudel(() => cancelled);
    for (let turn = 0; turn < 20 && !mockRuntime.evaluate.mock.calls.length; turn++)
      await Promise.resolve();
    expect(mockRuntime.evaluate).toHaveBeenCalledTimes(1);

    cancelled = true;
    const newPlayer = playback.startStrudel(() => false);
    for (let turn = 0; turn < 20; turn++) await Promise.resolve();
    expect(mockRuntime.evaluate).toHaveBeenCalledTimes(1);
    expect(mockRuntime.hush).not.toHaveBeenCalled();

    complete();
    await Promise.all([oldPlayer, newPlayer]);
    expect(mockRuntime.evaluate).toHaveBeenCalledTimes(2);
    expect(mockRuntime.hush).toHaveBeenCalledTimes(1);
    expect(mockRuntime.hush.mock.invocationCallOrder[0]).toBeLessThan(
      mockRuntime.evaluate.mock.invocationCallOrder[1],
    );
  });
});
