"use client";

import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useWebMCP } from '@/hooks/useWebMCP';
import workLinks from '@/content/workLinks';

interface WebMCPContextType {
  isReady: boolean;
  logs: string[];
  messageSent: boolean;
  setMessageSent: (v: boolean) => void;
}

const WebMCPContext = createContext<WebMCPContextType | null>(null);

export function useWebMCPContext() {
  const context = useContext(WebMCPContext);
  if (!context) throw new Error("useWebMCPContext must be used within a WebMCPProvider");
  return context;
}

export function WebMCPProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [messageSent, setMessageSent] = useState(false);

  // --- Imperative Actions ---
  const actions = useMemo(() => ({
    navigate: (path: string) => {
      // Handle 'work' as section scroll if on home, or route change
      if (path === 'work' || path === '/work') {
        router.push('/#work'); // Assuming work is a section on home based on headerLinks
        return { success: true, message: "Navigated to Work section" };
      }
      router.push(path);
      return { success: true, message: `Navigated to ${path}` };
    },

    getWorks: () => {
      const works = workLinks.map(w => ({
        title: w.title,
        subtitle: w.subTitle,
        slug: w.slug,
        link: w.externalLink || `/works/${w.slug}`
      }));
      return { success: true, count: works.length, works };
    },

    readWork: (slug: string) => {
      const work = workLinks.find(w => w.slug === slug);
      if (!work) return { success: false, error: "Project not found" };
      
      // Navigate to the work page if it's internal
      if (!work.externalLink) {
        router.push(`/works/${slug}`);
      } else {
        window.open(work.externalLink, '_blank');
      }

      return { 
        success: true, 
        work: {
          title: work.title,
          subtitle: work.subTitle,
          slug: work.slug,
          isWIP: work.isWIP,
          description: "Full case study available on the page."
        }
      };
    }
  }), [router]);

  // --- Connect to WebMCP ---
  const { isReady, logs } = useWebMCP(actions);

  return (
    <WebMCPContext.Provider value={{ isReady, logs, messageSent, setMessageSent }}>
      {children}
    </WebMCPContext.Provider>
  );
}
