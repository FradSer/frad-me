'use client';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'frad-chat-config';

const SUGGESTED_QUESTIONS = [
  'What does Frad do?',
  'Show me XR projects',
  'What are his skills?',
  'Tell me about his patents',
];

interface ChatConfig {
  baseURL: string;
  apiKey: string;
  modelId: string;
}

function loadConfig(): ChatConfig {
  if (typeof window === 'undefined') return { baseURL: '', apiKey: '', modelId: '' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { baseURL: '', apiKey: '', modelId: '' };
  } catch {
    return { baseURL: '', apiKey: '', modelId: '' };
  }
}

function saveConfig(config: ChatConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === 'text')
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
        <div className="whitespace-pre-wrap">{text}</div>
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

function ConfigInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="border-b border-gray-300 bg-transparent py-1.5 text-sm text-black outline-none transition-colors placeholder:text-gray-300 focus:border-black dark:border-gray-700 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-white"
      />
    </div>
  );
}

export default function ChatSection() {
  const [config, setConfig] = useState<ChatConfig>({ baseURL: '', apiKey: '', modelId: '' });
  const [showConfig, setShowConfig] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Keep a ref so the transport body function always reads the latest config
  const configRef = useRef(config);
  configRef.current = config;

  // Load config from localStorage on mount
  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  // Persist config whenever it changes
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  // Stable transport — reads config via ref so it's always current
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: () => ({
          config: {
            baseURL: configRef.current.baseURL || undefined,
            apiKey: configRef.current.apiKey || undefined,
            modelId: configRef.current.modelId || undefined,
          },
        }),
      }),
    [],
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === 'submitted' || status === 'streaming';

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages change
  useEffect(scrollToBottom, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
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

  const updateConfig = useCallback(
    (key: keyof ChatConfig) => (value: string) => setConfig((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const visibleMessages = messages.filter((m) => {
    if (m.role === 'system') return false;
    return getMessageText(m).length > 0;
  });

  const hasMessages = visibleMessages.length > 0;
  const hasConfig = config.baseURL || config.apiKey || config.modelId;

  return (
    <section className="layout-wrapper my-20 md:my-24 lg:my-32">
      <div className="flex flex-col items-start">
        {/* Section heading */}
        <div className="mb-8 flex w-full items-end justify-between">
          <h2 className="text-[7rem] hover:cursor-default lg:text-[10rem] xl:text-[13rem] 2xl:text-[16rem]">
            ask
          </h2>
          {/* Config toggle — subtle, matches footer link style */}
          <button
            type="button"
            onClick={() => setShowConfig((v) => !v)}
            className={clsx(
              'mb-4 text-sm transition-colors sm:text-base',
              showConfig || hasConfig
                ? 'text-black dark:text-white'
                : 'text-gray-400 hover:text-black dark:text-gray-600 dark:hover:text-white',
            )}
            aria-label="Configure AI provider"
          >
            {showConfig ? 'done' : 'configure'}
          </button>
        </div>

        <div className="w-full max-w-3xl">
          {/* Config panel */}
          <AnimatePresence>
            {showConfig && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <ConfigInput
                    label="Base URL"
                    value={config.baseURL}
                    onChange={updateConfig('baseURL')}
                    placeholder="https://api.openai.com/v1"
                  />
                  <ConfigInput
                    label="API Key"
                    value={config.apiKey}
                    onChange={updateConfig('apiKey')}
                    placeholder="sk-..."
                    type="password"
                  />
                  <ConfigInput
                    label="Model ID"
                    value={config.modelId}
                    onChange={updateConfig('modelId')}
                    placeholder="gpt-4o-mini"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggested questions */}
          {!hasMessages && !isExpanded && (
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
                placeholder="Ask me anything about Frad..."
                onFocus={() => setIsExpanded(true)}
                className="flex-1 border-b-2 border-gray-300 bg-transparent py-3 text-xl font-bold text-black outline-none transition-colors placeholder:font-normal placeholder:text-gray-400 focus:border-black dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-white sm:text-2xl md:text-3xl"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
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
