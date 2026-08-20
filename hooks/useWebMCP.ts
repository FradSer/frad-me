'use client';

import '@mcp-b/global';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

const VALID_PATHS = ['/', '/work', '/resume'] as const;

const NavigateSchema = z.object({
  path: z.enum(VALID_PATHS),
});

const ReadWorkSchema = z.object({
  slug: z.string().min(1, 'Slug cannot be empty'),
});

const SearchWorksSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
});

export interface WebMCPActions {
  navigate: (path: string) => unknown;
  getWorks: () => unknown;
  readWork: (slug: string) => unknown;
  searchWorks: (query: string) => unknown;
  getResume: () => unknown;
}

export function useWebMCP(actions: WebMCPActions) {
  const [isReady, setIsReady] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const log = useCallback((msg: string) => {
    console.log(`[WebMCP] ${msg}`);
    setLogs((prev) => [...prev, msg].slice(-50));
  }, []);

  useEffect(() => {
    const mc =
      typeof document !== 'undefined' &&
      (document as unknown as Record<string, unknown>).modelContext
        ? ((document as unknown as Record<string, unknown>).modelContext as NonNullable<
            typeof navigator.modelContext
          >)
        : typeof navigator !== 'undefined'
          ? navigator.modelContext
          : undefined;

    if (!mc) {
      log('WebMCP API not available');
      return;
    }

    const controllers = [
      new AbortController(),
      new AbortController(),
      new AbortController(),
      new AbortController(),
      new AbortController(),
    ];

    const nav = mc.registerTool(
      {
        name: 'navigate',
        description: 'Navigate to a specific page on the website.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: "The path to navigate to (e.g., '/', '/work', '/resume').",
              enum: ['/', '/work', '/resume'],
            },
          },
          required: ['path'],
        },
        execute: async (params: unknown) => {
          try {
            const { path } = NavigateSchema.parse(params);
            const result = await actions.navigate(path);
            log(`navigate("${path}")`);
            return {
              content: [{ type: 'text', text: JSON.stringify(result) }],
            };
          } catch (error) {
            log(`navigate error: ${error}`);
            return {
              content: [{ type: 'text', text: JSON.stringify({ error: 'Invalid parameters' }) }],
            };
          }
        },
      },
      { signal: controllers[0].signal },
    );

    const works = mc.registerTool(
      {
        name: 'get_works',
        description: "Get a list of all Frad's portfolio projects and case studies.",
        inputSchema: { type: 'object', properties: {} },
        execute: async () => {
          try {
            const result = await actions.getWorks();
            log('get_works()');
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          } catch (error) {
            log(`get_works error: ${error}`);
            return {
              content: [{ type: 'text', text: JSON.stringify({ error: 'Failed to get works' }) }],
            };
          }
        },
      },
      { signal: controllers[1].signal },
    );

    const read = mc.registerTool(
      {
        name: 'read_work',
        description:
          'Get detailed information about a specific project by its slug, including a content summary extracted from the case study.',
        inputSchema: {
          type: 'object',
          properties: {
            slug: {
              type: 'string',
              description: "The project slug (e.g., 'bearychat', 'pachino', 'vivo-vision')",
            },
          },
          required: ['slug'],
        },
        execute: async (params: unknown) => {
          try {
            const { slug } = ReadWorkSchema.parse(params);
            const result = await actions.readWork(slug);
            log(`read_work("${slug}")`);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          } catch (error) {
            log(`read_work error: ${error}`);
            return {
              content: [{ type: 'text', text: JSON.stringify({ error: 'Invalid parameters' }) }],
            };
          }
        },
      },
      { signal: controllers[2].signal },
    );

    const search = mc.registerTool(
      {
        name: 'search_works',
        description:
          "Search Frad's portfolio projects by keyword. Matches against title, subtitle, and slug.",
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: "Search query (e.g., 'XR', 'design', 'product')",
            },
          },
          required: ['query'],
        },
        execute: async (params: unknown) => {
          try {
            const { query } = SearchWorksSchema.parse(params);
            const result = await actions.searchWorks(query);
            log(`search_works("${query}")`);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          } catch (error) {
            log(`search_works error: ${error}`);
            return {
              content: [{ type: 'text', text: JSON.stringify({ error: 'Invalid parameters' }) }],
            };
          }
        },
      },
      { signal: controllers[3].signal },
    );

    const resume = mc.registerTool(
      {
        name: 'get_resume',
        description:
          "Get Frad's structured resume data including experience, skills, patents, and contact information.",
        inputSchema: { type: 'object', properties: {} },
        execute: async () => {
          try {
            const result = await actions.getResume();
            log('get_resume()');
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          } catch (error) {
            log(`get_resume error: ${error}`);
            return {
              content: [{ type: 'text', text: JSON.stringify({ error: 'Failed to get resume' }) }],
            };
          }
        },
      },
      { signal: controllers[4].signal },
    );

    void nav;
    void works;
    void read;
    void search;
    void resume;

    setIsReady(true);
    log('Tools registered (navigate, get_works, read_work, search_works, get_resume).');

    return () => {
      for (const c of controllers) c.abort();
      setIsReady(false);
      log('Tools unregistered.');
    };
  }, [actions, log]);

  return { isReady, logs };
}
