import { createOpenAI } from '@ai-sdk/openai';
import { stepCountIs, streamText, tool } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import resumeData from '@/content/resume';
import workLinks from '@/content/workLinks';
import { getWorkSummary } from '@/utils/workContent';

// Configure via Vercel environment variables:
//   AI_BASE_URL   Base URL of the OpenAI-compatible API (optional, defaults to OpenAI)
//   AI_API_KEY    API key  (required)
//   AI_MODEL_ID   Model ID (optional, defaults to gpt-4o-mini)
function getModel() {
  const baseURL = process.env.AI_BASE_URL;
  const apiKey = process.env.AI_API_KEY || '';
  const modelId = process.env.AI_MODEL_ID || 'gpt-4o-mini';

  const provider = createOpenAI({ baseURL, apiKey });
  return provider(modelId);
}

// Simple in-memory rate limiter: max 20 requests per IP per minute.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

/** Returns whether the chat feature is configured on the server. */
export async function GET() {
  return NextResponse.json({ enabled: !!process.env.AI_API_KEY });
}

const SYSTEM_PROMPT = `You are Frad LEE's AI assistant on his personal portfolio website frad.me.
You help visitors learn about Frad's work, experience, and skills.

Key facts about Frad:
- "T-shaped" Product Expert & Interactive Designer with 10+ years of experience
- Currently Senior Interactive Designer at vivo, working on XR/VR operating systems
- Previously at ByteDance (Product Designer), Huobi Global, and founded next Lab
- 8 published interaction design patents
- Skills span AI systems (Multi-Agent Systems, MCP servers), XR/VR design, and full-stack development
- Active open source contributor on GitHub

You have tools to look up Frad's projects and resume. Use them when visitors ask specific questions.
Be helpful, concise, and friendly. Answer in the same language the user writes in.
If asked about things unrelated to Frad or his work, politely redirect the conversation.`;

const MessagesSchema = z.array(
  z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.union([z.string(), z.array(z.unknown())]),
  }),
);

export async function POST(req: NextRequest) {
  if (!process.env.AI_API_KEY) {
    return NextResponse.json({ error: 'Chat is not configured.' }, { status: 503 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || !('messages' in body)) {
    return NextResponse.json({ error: 'Missing messages field.' }, { status: 400 });
  }

  const parsed = MessagesSchema.safeParse((body as { messages: unknown }).messages);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid messages format.' }, { status: 400 });
  }

  const { messages } = { messages: parsed.data };

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages,
    tools: {
      get_works: tool({
        description: "Get a list of all Frad's portfolio projects",
        inputSchema: z.object({}),
        execute: async () => {
          return workLinks.map((w) => ({
            title: w.title,
            subtitle: w.subTitle,
            slug: w.slug,
            link: w.externalLink || `/works/${w.slug}`,
            isWIP: w.isWIP ?? false,
          }));
        },
      }),
      read_work: tool({
        description: 'Get detailed information about a specific project including content summary',
        inputSchema: z.object({
          slug: z.string().describe('The project slug'),
        }),
        execute: async ({ slug }: { slug: string }) => {
          const work = workLinks.find((w) => w.slug === slug);
          if (!work) return { error: 'Project not found' };
          const summary = getWorkSummary(slug);
          return {
            title: work.title,
            subtitle: work.subTitle,
            slug: work.slug,
            link: work.externalLink || `/works/${slug}`,
            isWIP: work.isWIP ?? false,
            summary: summary || work.subTitle,
          };
        },
      }),
      search_works: tool({
        description: 'Search portfolio projects by keyword',
        inputSchema: z.object({
          query: z.string().describe('Search keyword'),
        }),
        execute: async ({ query }: { query: string }) => {
          const q = query.toLowerCase();
          return workLinks
            .filter((w) => `${w.title} ${w.subTitle} ${w.slug}`.toLowerCase().includes(q))
            .map((w) => ({
              title: w.title,
              subtitle: w.subTitle,
              slug: w.slug,
              link: w.externalLink || `/works/${w.slug}`,
            }));
        },
      }),
      get_resume: tool({
        description: "Get Frad's structured resume including experience, skills, and patents",
        inputSchema: z.object({}),
        execute: async () => resumeData,
      }),
    },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
