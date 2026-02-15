export {};

declare global {
  interface ModelContext {
    registerTool(tool: {
      name: string;
      description: string;
      inputSchema: any;
      execute: (params: any) => { content: { type: string; text: string }[] } | Promise<{ content: { type: string; text: string }[] }>;
    }): void;
  }

  interface Navigator {
    modelContext?: ModelContext;
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
