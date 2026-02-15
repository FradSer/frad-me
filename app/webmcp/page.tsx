'use client';

import { ContactForm } from '@/components/webmcp/ContactForm';
import { useWebMCPContext, WebMCPProvider } from '@/contexts/WebMCP/WebMCPContext';

function StatusBadge({ isReady }: { isReady: boolean }) {
  if (isReady) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        Connected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
      <span className="h-2 w-2 rounded-full bg-zinc-400" />
      Waiting for extension
    </span>
  );
}

const TOOLS = [
  { name: 'navigate', desc: 'Go to /, /work, or /resume' },
  { name: 'get_works', desc: 'List all portfolio projects' },
  { name: 'read_work', desc: 'Open a project by slug' },
] as const;

function WebMCPContent() {
  const { isReady, logs, messageSent } = useWebMCPContext();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-serif font-bold">WebMCP</h1>
            <StatusBadge isReady={isReady} />
          </div>
          <p className="text-zinc-500 leading-relaxed">
            This page exposes AI-agent tools via the{' '}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Web Model Context Protocol
            </span>
            . An agent with a WebMCP-compatible browser extension can navigate the site, browse
            projects, and submit the contact form below — all programmatically.
          </p>
        </header>

        {!isReady && (
          <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
            <h2 className="text-base font-bold">Getting started</h2>
            <ol className="list-decimal list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Install a browser extension that implements the WebMCP spec.</li>
              <li>Reload this page — the status badge will turn green once connected.</li>
              <li>
                Ask the agent to &quot;show me Frad&apos;s projects&quot; or &quot;navigate to the
                resume&quot;.
              </li>
            </ol>
          </section>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Registered tools</h2>
            <span className="text-xs text-zinc-400 font-mono">{TOOLS.length} tools</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {TOOLS.map((t) => (
              <div
                key={t.name}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 space-y-1"
              >
                <span className="text-xs font-mono font-medium">{t.name}</span>
                <p className="text-xs text-zinc-500">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">Contact form (demo)</h2>
          <p className="text-sm text-zinc-500">
            The agent can fill and submit this form automatically. This is a demo — no messages are
            actually delivered.
          </p>

          {messageSent ? (
            <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg">
              Message submitted (demo — not actually delivered).
            </div>
          ) : (
            <ContactForm />
          )}
        </section>

        {isReady && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold">Agent logs</h2>
            <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg font-mono text-xs h-48 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="opacity-50 italic">Waiting for tool invocations...</div>
              ) : (
                logs.map((l, i) => (
                  <div
                    key={`${i}-${l.substring(0, 10)}`}
                    className="mb-1 border-b border-zinc-200 dark:border-zinc-800 pb-1 last:border-0"
                  >
                    {l}
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function WebMCPPage() {
  return (
    <WebMCPProvider>
      <WebMCPContent />
    </WebMCPProvider>
  );
}
