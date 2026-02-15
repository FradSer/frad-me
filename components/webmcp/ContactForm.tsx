"use client";

import { useWebMCPContext } from "@/contexts/WebMCPContext";
import type React from "react";

export function ContactForm() {
  const { setMessageSent } = useWebMCPContext();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Cast to the extended Event type from global declaration
    const nativeEvent = e.nativeEvent as Event;
    const isAgent = nativeEvent.agentInvoked;
    
    // Simulate sending
    setMessageSent(true);
    
    if (isAgent && nativeEvent.respondWith) {
      nativeEvent.respondWith(
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
        <label htmlFor="email" className="block text-xs uppercase text-zinc-500 mb-1">Your Email</label>
        <input 
          id="email"
          name="email" 
          type="email"
          required 
          className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-2 text-sm"
          placeholder="you@example.com"
          toolparamdescription="Sender's email address"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs uppercase text-zinc-500 mb-1">Message</label>
        <textarea 
          id="message"
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
