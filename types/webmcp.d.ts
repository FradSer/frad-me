export {};

declare global {
  interface ModelContext {
    registerTool(tool: {
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
      execute: (params: unknown) => { content: { type: string; text: string }[] } | Promise<{ content: { type: string; text: string }[] }>;
    }): void;
  }

  interface Navigator {
    modelContext?: ModelContext;
  }

  // Extend the native Event interface to include WebMCP properties
  interface Event {
    agentInvoked?: boolean;
    respondWith?: (promise: Promise<unknown>) => void;
  }
}

declare module 'react' {
  interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
  }

  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    toolparamdescription?: string;
  }

  interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
    toolparamdescription?: string;
  }
}
