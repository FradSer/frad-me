import { gateway } from '@ai-sdk/gateway';
import { createUIMessageStreamResponse, isStepCount, streamText, toUIMessageStream } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';
import { buildChatSystemPrompt } from '@/utils/chatKnowledge';
import { readChatRequest } from '@/utils/chatRequest';
import { createChatTools, needsRecentActivity } from '@/utils/chatTools';

const DEFAULT_MODEL_ID = 'alibaba/qwen3.7-flash';
const STREAM_ERROR = "The assistant couldn't finish this answer. Please try again.";
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 500) {
    rateLimitMap.forEach((value, key) => {
      if (now >= value.resetAt) rateLimitMap.delete(key);
    });
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function isGatewayConfigured(): boolean {
  return !!(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

export async function GET() {
  return NextResponse.json({ enabled: isGatewayConfigured() });
}

function createAnswer(
  req: NextRequest,
  request: Extract<Awaited<ReturnType<typeof readChatRequest>>, { modelMessages: unknown }>,
  tools: ReturnType<typeof createChatTools>,
) {
  const question =
    request.messages
      .at(-1)
      ?.parts.filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join(' ') ?? '';
  const result = streamText({
    model: gateway(process.env.AI_GATEWAY_MODEL_ID || DEFAULT_MODEL_ID),
    system: buildChatSystemPrompt(),
    messages: request.modelMessages,
    tools,
    stopWhen: isStepCount(4),
    prepareStep: ({ stepNumber }) =>
      stepNumber === 0 && needsRecentActivity(question)
        ? { toolChoice: { type: 'tool', toolName: 'get_recent_activity' } }
        : undefined,
    abortSignal: req.signal,
    maxOutputTokens: 2400,
    maxRetries: 1,
  });
  // A failed partial answer ends as an error. Starting a second model stream
  // here would concatenate independent message IDs and corrupt the response.
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      tools,
      originalMessages: request.messages,
      sendReasoning: false,
      onError: () => STREAM_ERROR,
    }),
  });
}

export async function POST(req: NextRequest) {
  if (!isGatewayConfigured()) {
    return NextResponse.json({ error: 'Chat is not configured.' }, { status: 503 });
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }
  const tools = createChatTools();
  const request = await readChatRequest(req, tools);
  if ('error' in request) {
    return NextResponse.json({ error: request.error }, { status: request.status });
  }
  try {
    return createAnswer(req, request, tools);
  } catch {
    return NextResponse.json({ error: STREAM_ERROR }, { status: 502 });
  }
}
