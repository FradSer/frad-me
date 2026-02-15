"use client";

import { WebMCPProvider, useWebMCPContext } from "@/contexts/WebMCPContext";
import { ContactForm } from "@/components/webmcp/ContactForm";

function WebMCPDebugUI() {
  const { isReady, logs, messageSent } = useWebMCPContext();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-12">
        
        <header>
          <h1 className="text-3xl font-serif font-bold mb-2">WebMCP Integration</h1>
          <p className="text-zinc-500">
            This page demonstrates the Agent capabilities for Frad's portfolio.
            Open the <a href="https://github.com/webmachinelearning/webmcp" className="underline hover:text-blue-500">WebMCP</a> extension to interact.
          </p>
          <div className="mt-4 flex items-center gap-2">
            Status: 
            {isReady ? (
              <span className="text-green-600 font-bold">Active (Tools Registered)</span>
            ) : (
              <span className="text-red-500">Inactive (Missing navigator.modelContext)</span>
            )}
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Declarative Tool: Contact Form</h2>
          <p className="text-sm text-zinc-500">
            The agent can fill this form automatically when you ask it to "Send a message to Frad".
          </p>
          
          {messageSent ? (
            <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
              ✓ Message sent successfully!
            </div>
          ) : (
            <ContactForm />
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Agent Logs</h2>
          <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg font-mono text-xs h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="opacity-50 italic">Waiting for tool invocations...</div>
            ) : (
              logs.map((l, i) => <div key={`${i}-${l.substring(0, 10)}`} className="mb-1 border-b border-zinc-200 dark:border-zinc-800 pb-1 last:border-0">{l}</div>)
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

export default function WebMCPPage() {
  return (
    <WebMCPProvider>
      <WebMCPDebugUI />
    </WebMCPProvider>
  );
}
