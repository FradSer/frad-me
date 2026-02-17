import fs from 'node:fs';
import path from 'node:path';
import { anthropic } from '@ai-sdk/anthropic';
import { stepCountIs, streamText, tool } from 'ai';
import matter from 'gray-matter';
import { z } from 'zod';
import resumeData from '@/content/resume';
import workLinks from '@/content/workLinks';

const WORKS_PATH = path.join(process.cwd(), 'content', 'works');
const MAX_SUMMARY_LENGTH = 500;

function stripMdx(content: string): string {
  return content
    .replace(/<[^>]+\/>/g, '')
    .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, '')
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/^#+\s+.*/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function getWorkSummary(slug: string): string | null {
  try {
    const filePath = path.join(WORKS_PATH, `${slug}.mdx`);
    const source = fs.readFileSync(filePath, 'utf8');
    const { content } = matter(source);
    const plain = stripMdx(content);
    if (plain.length <= MAX_SUMMARY_LENGTH) return plain;
    const truncated = plain.slice(0, MAX_SUMMARY_LENGTH);
    const lastSpace = truncated.lastIndexOf(' ');
    return `${truncated.slice(0, lastSpace > 0 ? lastSpace : MAX_SUMMARY_LENGTH)}...`;
  } catch {
    return null;
  }
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

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
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
