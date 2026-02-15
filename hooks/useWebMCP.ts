"use client";

import { useEffect, useState, useCallback } from "react";

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
    setLogs((prev) => [...prev, msg].slice(-20));
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.modelContext) {
      log("WebMCP API not found (navigator.modelContext)");
      return;
    }

    const mc = navigator.modelContext;

    // 1. navigate
    mc.registerTool({
      name: "navigate",
      description: "Navigate to a specific page on the website.",
      inputSchema: {
        type: "object",
        properties: {
          path: { 
            type: "string", 
            description: "The path to navigate to (e.g., '/', '/work', '/resume').",
            enum: ["/", "/work", "/resume", "/blog"] 
          },
        },
        required: ["path"],
      },
      // @ts-expect-error
      execute: async ({ path }) => {
        const result = await actions.navigate(path);
        log(`navigate("${path}")`);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      },
    });

    // 2. get_works
    mc.registerTool({
      name: "get_works",
      description: "Get a list of Frad's projects and case studies.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => {
        const result = await actions.getWorks();
        log("get_works()");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    });

    // 3. read_work
    mc.registerTool({
      name: "read_work",
      description: "Get details about a specific project by its slug.",
      inputSchema: {
        type: "object",
        properties: {
          slug: { type: "string", description: "The project slug (e.g., 'vivo-vision')" },
        },
        required: ["slug"],
      },
      // @ts-expect-error
      execute: async ({ slug }) => {
        const result = await actions.readWork(slug);
        log(`read_work("${slug}")`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    });

    setIsReady(true);
    log("Tools registered successfully.");

  }, [actions, log]);

  return { isReady, logs };
}
