import { ReadableStream, TransformStream } from 'node:stream/web';
import { TextDecoder, TextEncoder } from 'node:util';
import type { NextRequest } from 'next/server';
import resumeData from '@/content/resume';

const mockGateway = jest.fn((model: string) => ({ model }));
const mockStreamText = jest.fn();
const mockValidate = jest.fn();
const mockConvert = jest.fn();
const mockStepCount = jest.fn((count: number) => ({ count }));
const mockToUIStream = jest.fn();
const mockResponse = jest.fn();
const mockKnowledge = {
  buildChatSystemPrompt: jest.fn(() => 'Shared current public profile and scope rules'),
  getChatWorks: jest.fn(() => [{ title: 'Current project', url: '/works/current' }]),
  readChatWork: jest.fn(() => ({ title: 'Current project', url: '/works/current' })),
  searchChatWorks: jest.fn(() => [{ title: 'Current project', url: '/works/current' }]),
};
const mockActivity = jest.fn(async (_signal?: AbortSignal) => [{ name: 'current-repository' }]);
jest.mock('@ai-sdk/gateway', () => ({ gateway: mockGateway }));
jest.mock('ai', () => ({
  streamText: (...args: unknown[]) => mockStreamText(...args),
  safeValidateUIMessages: (...args: unknown[]) => mockValidate(...args),
  convertToModelMessages: (...args: unknown[]) => mockConvert(...args),
  isStepCount: (count: number) => mockStepCount(count),
  tool: (options: unknown) => options,
  toUIMessageStream: (...args: unknown[]) => mockToUIStream(...args),
  createUIMessageStreamResponse: (...args: unknown[]) => mockResponse(...args),
}));
jest.mock('@/utils/chatKnowledge', () => mockKnowledge);
jest.mock('@/utils/githubActivity', () => ({
  getRecentRepos: (signal?: AbortSignal) => mockActivity(signal),
}));
Object.assign(globalThis, { ReadableStream, TransformStream, TextEncoder, TextDecoder });
const { Request, Response, Headers } = require('next/dist/compiled/@edge-runtime/primitives/fetch');
Object.assign(globalThis, { Request, Response, Headers });
type Route = typeof import('../route');
let route: Route;
let requestNumber = 0;
const originalEnvironment = { ...process.env };
const question = { id: 'q1', role: 'user', parts: [{ type: 'text', text: 'Who is Frad?' }] };
type RequestOptions = { raw?: boolean; ip?: string; signal?: AbortSignal };
function request(
  body: unknown = { messages: [question] },
  options: RequestOptions = {},
): NextRequest {
  const headers = {
    'content-type': 'application/json',
    'x-forwarded-for': options.ip ?? `test-${++requestNumber}`,
  };
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers,
    body: options.raw ? String(body) : JSON.stringify(body),
    signal: options.signal,
  }) as NextRequest;
}
function chunks(...values: unknown[]) {
  return new ReadableStream({
    start(controller) {
      for (const value of values) controller.enqueue(value);
      controller.close();
    },
  });
}

beforeAll(async () => {
  route = await import('../route');
});
beforeEach(() => {
  jest.clearAllMocks();
  process.env.AI_GATEWAY_API_KEY = 'test-key';
  delete process.env.VERCEL_OIDC_TOKEN;
  delete process.env.AI_GATEWAY_MODEL_ID;
  mockValidate
    .mockReset()
    .mockImplementation(async ({ messages }) => ({ success: true, data: messages }));
  mockConvert.mockReset().mockResolvedValue([{ role: 'user', content: 'Converted question' }]);
  mockStreamText.mockReset().mockImplementation(() => ({
    stream: chunks({ type: 'text-delta', id: 't1', delta: 'Current answer' }),
  }));
  mockToUIStream.mockImplementation(({ stream, onError }) =>
    stream.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(
            chunk.type === 'error' ? { type: 'error', errorText: onError(chunk.error) } : chunk,
          );
        },
      }),
    ),
  );
  mockResponse.mockImplementation(
    ({ stream }) =>
      new Response(
        stream.pipeThrough(
          new TransformStream({
            transform(chunk, controller) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`));
            },
          }),
        ),
        { headers: { 'content-type': 'text/event-stream', 'x-vercel-ai-ui-message-stream': 'v1' } },
      ),
  );
});
afterAll(() => {
  process.env = originalEnvironment;
});
describe('POST /api/chat behavioral contract', () => {
  it('reports Gateway key or OIDC configuration and rejects unconfigured requests', async () => {
    delete process.env.AI_GATEWAY_API_KEY;
    expect(await (await route.GET()).json()).toEqual({ enabled: false });
    expect((await route.POST(request())).status).toBe(503);
    process.env.VERCEL_OIDC_TOKEN = 'test-oidc';
    expect(await (await route.GET()).json()).toEqual({ enabled: true });
    expect((await route.POST(request())).status).toBe(200);
    expect(mockStreamText).toHaveBeenCalledTimes(1);
  });
  it('streams converted messages with shared knowledge, bounded tools, and cancellation', async () => {
    const controller = new AbortController();
    const incoming = request(undefined, { signal: controller.signal });
    const response = await route.POST(incoming);
    expect(response.status).toBe(200);
    expect(response.headers.get('x-vercel-ai-ui-message-stream')).toBe('v1');
    expect(await response.text()).toContain('Current answer');
    expect(mockGateway).toHaveBeenCalledWith('alibaba/qwen3.7-flash');
    const options = mockStreamText.mock.calls[0][0];
    expect(options.system).toBe(mockKnowledge.buildChatSystemPrompt());
    expect(options.messages).toEqual([{ role: 'user', content: 'Converted question' }]);
    expect(options).toMatchObject({ maxOutputTokens: 2400, maxRetries: 1 });
    expect(mockStepCount).toHaveBeenCalledWith(4);
    expect(options.abortSignal).toBe(incoming.signal);
    controller.abort();
    expect(options.abortSignal.aborted).toBe(true);
    expect(mockValidate).toHaveBeenCalledWith(expect.objectContaining({ tools: options.tools }));
    expect(mockConvert).toHaveBeenCalledWith(
      [question],
      expect.objectContaining({ tools: options.tools, ignoreIncompleteToolCalls: true }),
    );
    expect(mockToUIStream).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: options.tools,
        sendReasoning: false,
        onError: expect.any(Function),
      }),
    );
  });
  it('respects a configured model without starting a fallback answer', async () => {
    process.env.AI_GATEWAY_MODEL_ID = 'provider/custom-model';
    const response = await route.POST(request());
    await response.text();
    expect(mockGateway).toHaveBeenCalledTimes(1);
    expect(mockGateway).toHaveBeenCalledWith('provider/custom-model');
  });
  it.each([
    ['请查询 Frad 的 GitHub 近期活动', { type: 'tool', toolName: 'get_recent_activity' }],
    ['介绍 Code Terrier', undefined],
  ])('routes explicit recent GitHub intent for %s', async (text, choice) => {
    const message = { ...question, parts: [{ type: 'text', text }] };
    await route.POST(request({ messages: [message] }));
    const prepare = mockStreamText.mock.calls[0][0].prepareStep;
    expect(prepare?.({ stepNumber: 0 })?.toolChoice).toEqual(choice);
    expect(prepare?.({ stepNumber: 1 })?.toolChoice).not.toEqual({
      type: 'tool',
      toolName: 'get_recent_activity',
    });
  });
  it.each([
    ['malformed JSON', '{bad', true],
    ['missing messages', {}, false],
    ['empty messages', { messages: [] }, false],
    ['system role', { messages: [{ ...question, role: 'system' }] }, false],
    ['assistant last', { messages: [{ ...question, role: 'assistant' }] }, false],
    [
      'empty question',
      { messages: [{ ...question, parts: [{ type: 'text', text: '  ' }] }] },
      false,
    ],
  ])('rejects %s before generation', async (_name, body, raw) => {
    const response = await route.POST(request(body, { raw }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: expect.any(String) });
    expect(mockStreamText).not.toHaveBeenCalled();
  });
  it('rejects messages rejected by SDK schema validation', async () => {
    mockValidate.mockResolvedValueOnce({ success: false, error: new Error('schema failure') });
    const response = await route.POST(request());
    expect(response.status).toBe(400);
    expect(mockStreamText).not.toHaveBeenCalled();
  });
  it.each([
    [
      'message count',
      Array.from({ length: 41 }, (_, index) => ({ ...question, id: String(index) })),
    ],
    ['individual text', [{ ...question, parts: [{ type: 'text', text: 'x'.repeat(4001) }] }]],
    [
      'total text',
      Array.from({ length: 9 }, (_, index) => ({
        ...question,
        id: String(index),
        parts: [{ type: 'text', text: 'x'.repeat(4000) }],
      })),
    ],
  ])('rejects oversized %s', async (_name, messages) => {
    const response = await route.POST(request({ messages }));
    expect(response.status).toBe(400);
    expect(mockStreamText).not.toHaveBeenCalled();
  });
  it('enforces actual UTF-8 body bytes without Content-Length', async () => {
    const incoming = request({ messages: [question], padding: '汉'.repeat(45000) });
    expect(incoming.headers.has('content-length')).toBe(false);
    expect((await route.POST(incoming)).status).toBe(413);
    expect(mockStreamText).not.toHaveBeenCalled();
  });
  it('preserves assistant tool history through validation and conversion', async () => {
    const history = [
      {
        id: 'a1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-get_resume',
            toolCallId: 'call1',
            state: 'output-available',
            input: {},
            output: resumeData,
          },
        ],
      },
      question,
    ];
    const response = await route.POST(request({ messages: history }));
    expect(response.status).toBe(200);
    expect(mockValidate.mock.calls[0][0].messages).toEqual(history);
    expect(mockConvert.mock.calls[0][0]).toEqual(history);
  });
  it('allows a follow-up after an assistant answer longer than the user input limit', async () => {
    const answer = { ...question, id: 'a1', role: 'assistant' };
    answer.parts = [{ type: 'text', text: 'x'.repeat(5000) }];
    expect((await route.POST(request({ messages: [answer, question] }))).status).toBe(200);
    expect(mockConvert.mock.calls[0][0]).toEqual([answer, question]);
  });
  it('keeps all public knowledge tools executable', async () => {
    await route.POST(request());
    const tools = mockStreamText.mock.calls[0][0].tools;
    expect(await tools.get_works.execute({})).toEqual(mockKnowledge.getChatWorks());
    expect(await tools.read_work.execute({ slug: 'Current project' })).toEqual(
      mockKnowledge.readChatWork(),
    );
    expect(mockKnowledge.readChatWork).toHaveBeenCalledWith('Current project');
    expect(await tools.search_works.execute({ query: 'agent' })).toEqual(
      mockKnowledge.searchChatWorks(),
    );
    expect(mockKnowledge.searchChatWorks).toHaveBeenCalledWith('agent');
    expect(await tools.get_resume.execute({})).toEqual(resumeData);
    const signal = new AbortController().signal;
    expect(await tools.get_recent_activity.execute({}, { abortSignal: signal })).toEqual([
      { name: 'current-repository' },
    ]);
    expect(mockActivity).toHaveBeenCalledWith(signal);
    for (const tool of Object.values(tools) as Array<{ inputSchema: unknown }>)
      expect(tool.inputSchema).toBeDefined();
  });
  it('sanitizes setup failures and permits a later successful retry', async () => {
    mockStreamText.mockImplementationOnce(() => {
      throw new Error('secret-provider-token');
    });
    const response = await route.POST(request());
    expect(response.status).toBeGreaterThanOrEqual(500);
    expect(response.status).toBeLessThan(600);
    expect(await response.text()).not.toContain('secret-provider-token');
    expect((await route.POST(request())).status).toBe(200);
  });
  it('sanitizes stream failures after partial output without appending a fallback', async () => {
    process.env.AI_GATEWAY_MODEL_ID = 'provider/custom-model';
    mockStreamText.mockReturnValueOnce({
      stream: chunks(
        { type: 'text-delta', id: 't1', delta: 'Partial answer' },
        { type: 'error', error: new Error('secret-provider-token') },
      ),
    });
    const text = await (await route.POST(request())).text();
    expect(text).toContain('Partial answer');
    expect(text).toContain('errorText');
    expect(text).not.toContain('secret-provider-token');
    expect(mockStreamText).toHaveBeenCalledTimes(1);
    expect(mockGateway).toHaveBeenCalledTimes(1);
  });
  it('returns Retry-After after 20 requests and isolates other IPs', async () => {
    for (let index = 0; index < 20; index++)
      expect((await route.POST(request(undefined, { ip: 'limited-ip' }))).status).toBe(200);
    const response = await route.POST(request(undefined, { ip: 'limited-ip' }));
    expect(response.status).toBe(429);
    expect(Number(response.headers.get('retry-after'))).toBeGreaterThan(0);
    expect((await route.POST(request(undefined, { ip: 'another-ip' }))).status).toBe(200);
  });
});
