import { ReadableStream } from 'node:stream/web';
import { safeValidateUIMessages } from 'ai';

import { readChatRequest } from '../chatRequest';

jest.mock('ai', () => ({
  safeValidateUIMessages: jest.fn(),
  convertToModelMessages: jest.fn(),
}));

describe('Chat request body limits', () => {
  it('cancels an oversized endless body before reading the remaining stream', async () => {
    const cancel = jest.fn();
    const pull = jest.fn((controller) => controller.enqueue(new Uint8Array(64 * 1024)));
    const body = new ReadableStream<Uint8Array>({ pull, cancel }, { highWaterMark: 0 });
    const request = {
      body,
      headers: { get: () => null },
    } as unknown as Request;

    const result = await readChatRequest(request, {});

    expect(result).toMatchObject({ status: 413, error: expect.any(String) });
    expect(pull).toHaveBeenCalledTimes(2);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(body.locked).toBe(false);
    expect(safeValidateUIMessages).not.toHaveBeenCalled();
  });
});
