"use client";

import React from "react";
import { useWebMCPContext } from "@/contexts/WebMCPContext";

export function ContactForm() {
  const { setMessageSent } = useWebMCPContext();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // @ts-ignore
    const isAgent = (e.nativeEvent as any).agentInvoked;
    
    // Simulate sending
    setMessageSent(true);
    
    if (isAgent && (e.nativeEvent as any).respondWith) {
      (e.nativeEvent as any).respondWith(
        Promise.resolve({ success: true, message: "Message sent to Frad." })
      );
    }
  };

  return (
    <form
      className="flex flex-col gap-4 max-w-md"
      onSubmit={handleSubmit}
      toolname="contact_me"
      tooldescription="Send a message to Frad. Requires email and message body."
    >
      <div>
        <label className="block text-xs uppercase text-zinc-500 mb-1">Your Email</label>
        <input 
          name="email" 
          type="email"
          required 
          className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-2 text-sm"
          placeholder="you@example.com"
          toolparamdescription="Sender's email address"
        />
      </div>

      <div>
        <label className="block text-xs uppercase text-zinc-500 mb-1">Message</label>
        <textarea 
          name="message" 
          required
          className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-2 text-sm h-24"
          placeholder="Say hello..."
          toolparamdescription="The content of the message"
        />
      </div>

      <button 
        type="submit" 
        className="bg-black dark:bg-white text-white dark:text-black font-medium py-2 px-4 rounded hover:opacity-80 transition-opacity"
      >
        Send Message
      </button>
    </form>
  );
}
