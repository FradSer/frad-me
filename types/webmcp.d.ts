export interface WebMCPFormEvent extends Event {
  agentInvoked?: boolean;
  respondWith?: (promise: Promise<unknown>) => void;
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

declare global {
  interface Navigator {
    readonly modelContext?: {
      registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => Promise<void>;
    };
  }
}
