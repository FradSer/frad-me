import { gateway } from '@ai-sdk/gateway';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  safeValidateUIMessages,
  streamText,
  tool,
  toUIMessageStream,
} from 'ai';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import resumeData from '@/content/resume';
import workLinks from '@/content/workLinks';
import { normalizeSlug } from '@/utils/slugMapping';
import { getWorkSummary } from '@/utils/workContent';
import { getRecentRepos } from '@/utils/githubActivity';

const DEFAULT_MODEL_ID = 'deepseek/deepseek-v3';
const FALLBACK_MODEL_ID = 'deepseek/deepseek-v3';

function getModel() {
  const modelId = process.env.AI_GATEWAY_MODEL_ID || DEFAULT_MODEL_ID;
  return gateway(modelId);
}

function getFallbackModel() {
  return gateway(FALLBACK_MODEL_ID);
}

// Simple in-memory rate limiter: max 20 requests per IP per minute.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const PRUNE_THRESHOLD = 500;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Prune expired entries when map grows large
  if (rateLimitMap.size > PRUNE_THRESHOLD) {
    rateLimitMap.forEach((val, key) => {
      if (now >= val.resetAt) rateLimitMap.delete(key);
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
  // Gateway authenticates via AI_GATEWAY_API_KEY (explicit) or OIDC (Vercel).
  // Treat either as "configured" so local dev without OIDC still works via key.
  return !!(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

/** Returns whether the chat feature is configured on the server. */
export async function GET() {
  return NextResponse.json({ enabled: isGatewayConfigured() });
}

const SYSTEM_PROMPT = `You are Frad LEE's AI assistant on his personal portfolio website frad.me.
You help visitors learn about Frad's work, experience, and skills.

Key facts about Frad:
- "T-shaped" Product Expert & Interactive Designer with 10+ years of experience
- Currently AI Product Manager at RayNeo, focusing on AI-native systems, Multi-modal interaction, and Long-term Memory (LTM) architectures
- Previously at vivo (Senior Interactive Designer), ByteDance (Product Designer), Huobi Global, and founded next Lab
- 8 published interaction design patents
- Skills span AI systems (Multi-Agent Systems, MCP servers), XR/VR design, and full-stack development
- GitHub: github.com/FradSer — "Designer who codes, with a focus on XR and AI"

Active open source (by stars):
- dotclaude (582 stars) — AI-agent dev environment for code review / security / tech leadership
- mcp-server-mas-sequential-thinking (305 stars) — Multi-Agent sequential thinking MCP server
- mcp-server-apple-events (183 stars) — macOS Apple Reminders/Calendar MCP server via EventKit
- event (49 stars) — Pure Swift CLI for Apple Reminders & Calendar
- FluidInterfacesSwiftUI (48 stars) — WWDC18 "Designing Fluid Interfaces" SwiftUI samples

Recent focus (as of August 2026): coding-agent tooling (codeterrier, pi-packages, skills), interactive HUD experiments (hud-playground), ESP32 firmware R&D (open-deskos, cerberus wearable), iOS intent engine (isLauncher), and this portfolio (frad-me).

You have tools to look up Frad's projects, resume, and live GitHub activity. Use get_recent_activity whenever visitors ask what Frad is working on lately or about current projects — it returns freshly fetched repository data. Use the other tools for specific questions.
Be helpful, concise, and friendly. Answer in the same language the user writes in.
If asked about things unrelated to Frad or his work, politely redirect the conversation.`;

export async function POST(req: NextRequest) {
  if (!isGatewayConfigured()) {
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

  const validated = await safeValidateUIMessages({
    messages: (body as { messages: unknown }).messages,
  });
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid messages format.' }, { status: 400 });
  }

  const messages = validated.data;
  const modelMessages = await convertToModelMessages(messages);

  const requestedModelId = process.env.AI_GATEWAY_MODEL_ID || DEFAULT_MODEL_ID;
  const shouldTryFallback = requestedModelId !== FALLBACK_MODEL_ID;

  const buildStream = (useModel: ReturnType<typeof gateway>) =>
    streamText({
      model: useModel,
      system: SYSTEM_PROMPT,
      messages: modelMessages,
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
          description:
            'Get detailed information about a specific project including content summary. Accepts natural language project names like "BearyChat", "vivo Vision", etc.',
          inputSchema: z.object({
            slug: z.string().describe('The project name or slug (natural language accepted)'),
          }),
          execute: async ({ slug }: { slug: string }) => {
            // Normalize the slug using our mapping utility
            const normalizedSlug = normalizeSlug(slug);

            if (!normalizedSlug) {
              return {
                error:
                  'Project not found. Available projects: BearyChat, vivo Vision, Pachino, Eye Protection Design Handbook, Interactive Cross-platform Mixed Reality Video Player, Usability Design for Xigua Video',
              };
            }

            const work = workLinks.find((w) => w.slug === normalizedSlug);
            if (!work) {
              return {
                error:
                  'Project not found. Available projects: BearyChat, vivo Vision, Pachino, Eye Protection Design Handbook, Interactive Cross-platform Mixed Reality Video Player, Usability Design for Xigua Video',
              };
            }

            const summary = getWorkSummary(normalizedSlug);
            return {
              title: work.title,
              subtitle: work.subTitle,
              slug: work.slug,
              link: work.externalLink || `/works/${normalizedSlug}`,
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
        get_recent_activity: tool({
          description:
            "Get Frad's recently active GitHub repositories (live data, cached ~10 min). Use for questions about what Frad is currently building or his latest open-source work.",
          inputSchema: z.object({}),
          execute: async () => getRecentRepos(),
        }),
      },
      stopWhen: isStepCount(3),
    });

  const streamFrom = (useModel: ReturnType<typeof gateway>) =>
    toUIMessageStream({ stream: buildStream(useModel).stream });

  if (!shouldTryFallback) {
    return createUIMessageStreamResponse({ stream: streamFrom(getModel()) });
  }

  const fallbackStream = new ReadableStream({
    async start(controller) {
      let didError = false;
      const primary = streamFrom(getModel());
      const reader = (primary as unknown as ReadableStream).getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = value as unknown as Record<string, unknown>;
          if (chunk?.type === 'error') {
            didError = true;
            break;
          }
          controller.enqueue(value as unknown as Uint8Array);
        }
      };
      try {
        await pump();
      } catch {
        didError = true;
      }
      if (didError) {
        const fb = streamFrom(getFallbackModel());
        const fbReader = (fb as unknown as ReadableStream).getReader();
        while (true) {
          const { done, value } = await fbReader.read();
          if (done) break;
          controller.enqueue(value as unknown as Uint8Array);
        }
        controller.close();
        return;
      }
      controller.close();
    },
  });

  return createUIMessageStreamResponse({
    stream: fallbackStream as unknown as ReadableStream<never>,
  });
}
