'use client';

import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

const VALID_PATHS = ['/', '/work', '/resume'] as const;

export interface WebMCPLogEntry {
  id: number;
  message: string;
}

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

type ToolOutcome = {
  log: string;
  value: unknown;
  pretty?: boolean;
};

// Structural mirror of the WebMCP InputSchema accepted by registerTool.
type ToolInputSchema = {
  type?: unknown;
  properties?: Readonly<Record<string, unknown>>;
  required?: readonly string[];
  [keyword: string]: unknown;
};

const textContent = (text: string) => ({ content: [{ type: 'text', text }] });

export function useWebMCP(actions: WebMCPActions) {
  const [isReady, setIsReady] = useState(false);
  const [logs, setLogs] = useState<WebMCPLogEntry[]>([]);

  const log = useCallback((msg: string) => {
    console.log(`[WebMCP] ${msg}`);
    setLogs((prev) => {
      const entry = { id: (prev.at(-1)?.id ?? 0) + 1, message: msg };
      return [...prev, entry].slice(-50);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setIsReady(false);

    const register = async () => {
      // Deferred: @mcp-b/global is large and only useful to agent visitors,
      // so it must not sit on the initial-load critical path.
      await import('@mcp-b/global');
      if (cancelled) return;

      const mc = document.modelContext || navigator.modelContext;

      if (!mc) {
        log('WebMCP API not available');
        return;
      }

      type ToolSpec = {
        name: string;
        description: string;
        inputSchema: ToolInputSchema;
        failureText: string;
        run: (params: unknown) => Promise<ToolOutcome>;
      };

      const specs: ToolSpec[] = [
        {
          name: 'navigate',
          description: 'Navigate to a specific page on the website.',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: "The path to navigate to (e.g., '/', '/work', '/resume').",
                enum: [...VALID_PATHS],
              },
            },
            required: ['path'],
          },
          failureText: 'Invalid parameters',
          run: async (params) => {
            const { path } = NavigateSchema.parse(params);
            return { log: `navigate("${path}")`, value: await actions.navigate(path) };
          },
        },
        {
          name: 'get_works',
          description: "Get a list of all Frad's portfolio projects and case studies.",
          inputSchema: { type: 'object', properties: {} },
          failureText: 'Failed to get works',
          run: async () => ({ log: 'get_works()', value: await actions.getWorks(), pretty: true }),
        },
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
          failureText: 'Invalid parameters',
          run: async (params) => {
            const { slug } = ReadWorkSchema.parse(params);
            return {
              log: `read_work("${slug}")`,
              value: await actions.readWork(slug),
              pretty: true,
            };
          },
        },
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
          failureText: 'Invalid parameters',
          run: async (params) => {
            const { query } = SearchWorksSchema.parse(params);
            return {
              log: `search_works("${query}")`,
              value: await actions.searchWorks(query),
              pretty: true,
            };
          },
        },
        {
          name: 'get_resume',
          description:
            "Get Frad's structured resume data including experience, skills, patents, and contact information.",
          inputSchema: { type: 'object', properties: {} },
          failureText: 'Failed to get resume',
          run: async () => ({
            log: 'get_resume()',
            value: await actions.getResume(),
            pretty: true,
          }),
        },
      ];

      await Promise.all(
        specs.map((spec) =>
          mc.registerTool(
            {
              name: spec.name,
              description: spec.description,
              inputSchema: spec.inputSchema,
              execute: async (params: unknown) => {
                try {
                  const { log: entry, value, pretty } = await spec.run(params);
                  log(entry);
                  return textContent(JSON.stringify(value, null, pretty ? 2 : undefined));
                } catch (error) {
                  log(`${spec.name} error: ${error}`);
                  return textContent(JSON.stringify({ error: spec.failureText }));
                }
              },
            },
            { signal: controller.signal },
          ),
        ),
      );

      if (cancelled) return;
      setIsReady(true);
      log('Tools registered (navigate, get_works, read_work, search_works, get_resume).');
    };

    void register().catch((error: unknown) => {
      controller.abort();
      if (cancelled) return;
      setIsReady(false);
      log(`Tool registration failed: ${error}`);
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [actions, log]);

  return { isReady, logs };
}
