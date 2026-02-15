'use client';

import '@mcp-b/global';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

const VALID_PATHS = ['/', '/work', '/resume', 'work'] as const;

const NavigateSchema = z.object({
  path: z.enum(VALID_PATHS),
});

const ReadWorkSchema = z.object({
  slug: z.string().min(1, 'Slug cannot be empty'),
});

export interface WebMCPActions {
  navigate: (path: string) => unknown;
  getWorks: () => unknown;
  readWork: (slug: string) => unknown;
}

export function useWebMCP(actions: WebMCPActions) {
  const [isReady, setIsReady] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const log = useCallback((msg: string) => {
    console.log(`[WebMCP] ${msg}`);
    setLogs((prev) => [...prev, msg].slice(-50));
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.modelContext) {
      log('WebMCP API not available');
      return;
    }

    const mc = navigator.modelContext;

    const nav = mc.registerTool({
      name: 'navigate',
      description: 'Navigate to a specific page on the website.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: "The path to navigate to (e.g., '/', '/work', '/resume').",
            enum: ['/', '/work', '/resume', 'work'],
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
    });

    const works = mc.registerTool({
      name: 'get_works',
      description: "Get a list of Frad's projects and case studies.",
      inputSchema: { type: 'object', properties: {} },
      execute: async () => {
        const result = await actions.getWorks();
        log('get_works()');
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      },
    });

    const read = mc.registerTool({
      name: 'read_work',
      description: 'Get details about a specific project by its slug.',
      inputSchema: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            description: "The project slug (e.g., 'vivo-vision')",
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
    });

    setIsReady(true);
    log('Tools registered (navigate, get_works, read_work).');

    return () => {
      nav.unregister();
      works.unregister();
      read.unregister();
      setIsReady(false);
      log('Tools unregistered.');
    };
  }, [actions, log]);

  return { isReady, logs };
}
