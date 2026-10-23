import { tool } from 'ai';
import { z } from 'zod';
import resumeData from '@/content/resume';
import { getChatWorks, readChatWork, searchChatWorks } from '@/utils/chatKnowledge';
import { getRecentRepos } from '@/utils/githubActivity';

export function needsRecentActivity(question: string): boolean {
  return (
    /github|repositor(?:y|ies)|\brepos?\b|open.source|开源|仓库/i.test(question) &&
    /recent|latest|current|today|\bnow\b|push|最近|近期|最新|提交|活跃/i.test(question)
  );
}

export function createChatTools() {
  return {
    get_works: tool({
      description:
        "Discover Frad's curated current projects and historical case studies with public source links.",
      inputSchema: z.object({}),
      execute: async () => getChatWorks(),
    }),
    read_work: tool({
      description:
        'Read public evidence for a named project or case study. Accepts Code Terrier, Open DeskOS, pi-packages, Apple Events, Pachino, and historical portfolio names.',
      inputSchema: z.object({ slug: z.string().trim().min(1).max(120) }),
      execute: async ({ slug }) => readChatWork(slug),
    }),
    search_works: tool({
      description:
        'Search current projects and historical case studies by name, skills, or keyword.',
      inputSchema: z.object({ query: z.string().trim().min(1).max(120) }),
      execute: async ({ query }) => searchChatWorks(query),
    }),
    get_resume: tool({
      description:
        "Read Frad's current public profile, career history, skills, selected projects, contact details, and patent publications.",
      inputSchema: z.object({}),
      execute: async () => resumeData,
    }),
    get_recent_activity: tool({
      description:
        'Supplement curated projects with recent public GitHub activity (cached about 10 minutes). Pushes do not establish priorities, adoption, revenue, or release status. Fallback entries are curated portfolio data, not live activity.',
      inputSchema: z.object({}),
      execute: async (_input, { abortSignal }) => getRecentRepos(abortSignal),
    }),
  };
}
