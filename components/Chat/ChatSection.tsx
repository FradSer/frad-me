'use client';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SUGGESTED_QUESTIONS = [
  'What does Frad do?',
  'Show me XR projects',
  'What are his skills?',
  'Tell me about his patents',
];

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

function ChatMessage({ role, text }: { role: string; text: string }) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={clsx(
          'max-w-[85%] rounded-2xl px-5 py-3 text-base leading-relaxed sm:text-lg',
          isUser
            ? 'bg-black text-white dark:bg-white dark:text-black'
            : 'bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-gray-100',
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className={clsx(
            'prose max-w-none break-words',
            isUser ? 'prose-invert dark:prose' : 'prose-neutral dark:prose-invert',
            // Override prose defaults to fit bubble tightly
            'prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0 prose-headings:my-1',
            // Specific overrides for User bubble
            isUser && 'dark:prose-headings:text-black dark:prose-strong:text-black',
          )}
          components={{
            a: ({ node, ...props }) => (
              <a {...props} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" />
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl bg-gray-100 px-5 py-3.5 dark:bg-neutral-800">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatSection() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if chat is configured on the server
  useEffect(() => {
    fetch('/api/chat')
      .then((r) => r.json())
      .then((data) => setEnabled(data.enabled))
      .catch(() => setEnabled(false));
  }, []);

  const { messages, sendMessage, status, error } = useChat();

  const isLoading = status === 'submitted' || status === 'streaming';
  const isError = status === 'error';

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages change
  useEffect(scrollToBottom, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (!isExpanded) return;
    const id = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(id);
  }, [isExpanded]);

  const send = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      if (!isExpanded) setIsExpanded(true);
      sendMessage({ text });
      setInput('');
    },
    [sendMessage, isExpanded],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      send(input);
    },
    [send, input],
  );

  const visibleMessages = messages.filter((m) => {
    if (m.role === 'system') return false;
    return getMessageText(m).length > 0;
  });

  const hasMessages = visibleMessages.length > 0;
  // null = still loading (treat as disabled); false = confirmed not configured
  const isDisabled = enabled !== true;

  // Don't render the section at all if chat is confirmed not configured
  if (enabled === false) return null;

  return (
    <section className="layout-wrapper my-20 md:my-24 lg:my-32">
      <div className="flex flex-col items-start">
        {/* Section heading */}
        <div className="mb-8 flex w-full items-end justify-between">
          <h2 className="text-[7rem] hover:cursor-default lg:text-[10rem] xl:text-[13rem] 2xl:text-[16rem]">
            ask
          </h2>
        </div>

        <div className="w-full max-w-3xl">
          {/* Suggested questions */}
          {!hasMessages && !isExpanded && !isDisabled && (
            <div className="mb-8 flex flex-wrap gap-3">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-gray-300 px-5 py-2.5 text-base font-medium text-gray-600 transition-all hover:border-black hover:text-black dark:border-gray-600 dark:text-gray-400 dark:hover:border-white dark:hover:text-white sm:text-lg"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Conversation area */}
          <AnimatePresence>
            {(hasMessages || isExpanded) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div ref={scrollRef} className="mb-6 max-h-[28rem] space-y-4 overflow-y-auto">
                  {visibleMessages.map((m) => (
                    <ChatMessage key={m.id} role={m.role} text={getMessageText(m)} />
                  ))}
                  {isLoading && <TypingIndicator />}
                  {isError && (
                    <div className="flex justify-start">
                      <span className="rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        {error?.message ?? 'Something went wrong. Please try again.'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-4">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isDisabled ? 'not configured' : 'Ask me anything about Frad...'}
                onFocus={() => !isDisabled && setIsExpanded(true)}
                className={clsx(
                  'flex-1 border-b-2 bg-transparent py-3 text-xl font-bold text-black outline-none transition-colors placeholder:font-normal focus:border-black dark:text-white dark:focus:border-white sm:text-2xl md:text-3xl',
                  isDisabled
                    ? 'cursor-not-allowed border-gray-200 placeholder:text-gray-300 dark:border-gray-800 dark:placeholder:text-gray-700'
                    : 'border-gray-300 placeholder:text-gray-400 focus:border-black dark:border-gray-600 dark:placeholder:text-gray-500 dark:focus:border-white',
                )}
                disabled={isLoading || isDisabled}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || isDisabled}
                className="shrink-0 text-gray-400 transition-colors hover:text-black disabled:opacity-20 dark:hover:text-white"
                aria-label="Send message"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
