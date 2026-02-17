'use client';

import { useRouter } from 'next/navigation';
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import workLinks from '@/content/workLinks';
import { useWebMCP } from '@/hooks/useWebMCP';

interface WebMCPContextType {
  isReady: boolean;
  logs: string[];
  messageSent: boolean;
  setMessageSent: (v: boolean) => void;
}

const WebMCPContext = createContext<WebMCPContextType | null>(null);

export function useWebMCPContext() {
  const context = useContext(WebMCPContext);
  if (!context) throw new Error('useWebMCPContext must be used within a WebMCPProvider');
  return context;
}

async function fetchContent(action: string, params?: Record<string, string>) {
  const url = new URL('/api/content', window.location.origin);
  url.searchParams.set('action', action);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString());
  return res.json();
}

export function WebMCPProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [messageSent, setMessageSent] = useState(false);

  const actions = useMemo(
    () => ({
      navigate: (path: string) => {
        if (path === 'work' || path === '/work') {
          router.push('/#work');
          return { success: true, message: 'Navigated to Work section' };
        }
        router.push(path);
        return { success: true, message: `Navigated to ${path}` };
      },

      getWorks: () => {
        const works = workLinks.map((w) => ({
          title: w.title,
          subtitle: w.subTitle,
          slug: w.slug,
          link: w.externalLink || `/works/${w.slug}`,
        }));
        return { success: true, count: works.length, works };
      },

      readWork: async (slug: string) => {
        const data = await fetchContent('read_work', { slug });
        if (!data.success) return data;

        const work = workLinks.find((w) => w.slug === slug);
        if (work && !work.externalLink) {
          router.push(`/works/${slug}`);
        } else if (work?.externalLink) {
          window.open(work.externalLink, '_blank');
        }

        return data;
      },

      searchWorks: async (query: string) => {
        return fetchContent('search_works', { query });
      },

      getResume: async () => {
        return fetchContent('get_resume');
      },
    }),
    [router],
  );

  const { isReady, logs } = useWebMCP(actions);

  return (
    <WebMCPContext.Provider value={{ isReady, logs, messageSent, setMessageSent }}>
      {children}
    </WebMCPContext.Provider>
  );
}
