'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useCallback, useEffect, useRef, useState } from 'react';
import SectionHeading from '@/components/common/SectionHeading';
import { CursorType } from '@/contexts/Mouse/MouseContext';
import useMouseContext from '@/hooks/useMouseContext';
import ChatMessage, { getMessageText } from './ChatMessage';

const SUGGESTED_QUESTIONS = [
  'What is Frad building with AI agents?',
  'How does Code Terrier review code?',
  'Show me his developer tools and open-source work',
  'How does he connect product design with engineering?',
];
const controlClass =
  'min-h-11 underline underline-offset-4 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-40';

function useAvailability() {
  const [availability, setAvailability] = useState<'checking' | 'enabled' | 'disabled' | 'error'>(
    'checking',
  );
  const [attempt, setAttempt] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: attempt intentionally reruns the availability request.
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(), 10000);
    setAvailability('checking');
    void fetch('/api/chat', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unavailable');
        const data: unknown = await response.json();
        if (
          !data ||
          typeof data !== 'object' ||
          !('enabled' in data) ||
          typeof data.enabled !== 'boolean'
        )
          throw new Error('Invalid availability');
        if (active) setAvailability(data.enabled ? 'enabled' : 'disabled');
      })
      .catch(() => {
        if (active) setAvailability('error');
      })
      .finally(() => clearTimeout(timer));
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [attempt]);
  return { availability, reconnect: () => setAttempt((value) => value + 1) };
}

function useAssistant() {
  const [input, setInput] = useState('');
  const [failure, setFailure] = useState(false);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const failed = useRef(false);
  const lastQuestion = useRef('');
  const chat = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: () => {
      failed.current = true;
      setFailure(true);
    },
  });
  const loading = pending || chat.status === 'submitted' || chat.status === 'streaming';
  const hasError = failure || chat.status === 'error';
  const run = useCallback(
    async (text: string, retry = false) => {
      if (busy.current || !text.trim()) return;
      busy.current = true;
      failed.current = false;
      setPending(true);
      setFailure(false);
      chat.clearError();
      lastQuestion.current = text;
      if (!retry) setInput(text);
      try {
        if (retry) await chat.regenerate();
        else await chat.sendMessage({ text });
        if (!failed.current) setInput((current) => (current === text ? '' : current));
      } catch {
        failed.current = true;
        setFailure(true);
      } finally {
        busy.current = false;
        setPending(false);
      }
    },
    [chat.clearError, chat.regenerate, chat.sendMessage],
  );
  const reset = () => {
    if (busy.current || loading) return;
    chat.setMessages([]);
    chat.clearError();
    setFailure(false);
    setInput('');
    lastQuestion.current = '';
  };
  return {
    ...chat,
    input,
    setInput,
    loading,
    hasError,
    reset,
    send: (text: string) => run(text.trim(), hasError && text.trim() === lastQuestion.current),
    retry: () => run(lastQuestion.current, true),
  };
}

export default function ChatSection() {
  const { availability, reconnect } = useAvailability();
  const chat = useAssistant();
  const mouseContext = useMouseContext();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messages = chat.messages.filter(
    (message) => message.role !== 'system' && getMessageText(message),
  );
  const status =
    availability === 'checking'
      ? 'Checking availability…'
      : chat.status === 'streaming'
        ? 'Writing an answer…'
        : chat.loading
          ? 'Thinking about your question…'
          : '';
  const send = (text: string) => {
    if (availability !== 'enabled' || chat.loading) return;
    mouseContext.cursorChangeHandler(CursorType.default);
    void chat.send(text);
  };
  return (
    <section id="ask" className="layout-wrapper my-20 scroll-mt-24 md:my-24 lg:my-32">
      <div className="mb-8">
        <SectionHeading>ask</SectionHeading>
      </div>
      <div className="w-full max-w-3xl">
        <p className="mb-6 max-w-[65ch] text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
          An AI assistant for questions about Frad’s experience and public work in agents, developer
          tools, and product design. Answers are generated by AI; explore the linked work for
          details.
        </p>
        {availability === 'disabled' && (
          <p>
            Chat is currently unavailable.{' '}
            <a href="/resume" className={controlClass}>
              Read Frad’s resume
            </a>
            .
          </p>
        )}
        {availability === 'error' && (
          <p role="status">
            Couldn’t connect to the assistant.{' '}
            <button type="button" onClick={reconnect} className={controlClass}>
              Try connecting again
            </button>{' '}
            or{' '}
            <a href="/resume" className={controlClass}>
              read the resume
            </a>
            .
          </p>
        )}
        {availability === 'enabled' && messages.length === 0 && !chat.loading && (
          <div className="mb-8 flex flex-wrap gap-3">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => send(question)}
                onMouseEnter={() => mouseContext.cursorChangeHandler(CursorType.buttonHovered)}
                onMouseLeave={() => mouseContext.cursorChangeHandler(CursorType.default)}
                className="min-h-11 rounded-full border border-gray-300 px-5 py-2.5 text-base font-medium text-gray-600 transition-colors hover:border-black hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 dark:border-gray-600 dark:text-gray-400 dark:hover:border-white dark:hover:text-white sm:text-lg"
              >
                {question}
              </button>
            ))}
          </div>
        )}
        <div
          role="log"
          aria-label="Conversation with Frad’s AI assistant"
          aria-live="polite"
          aria-busy={chat.loading}
          className="mb-6 space-y-4"
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
        <p role="status" className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          {status}
        </p>
        {chat.hasError && (
          <div role="alert" className="mb-4 text-base text-gray-700 dark:text-gray-300">
            The answer couldn’t finish. Your question is saved.{' '}
            <button
              type="button"
              onClick={() => void chat.retry()}
              disabled={chat.loading}
              className={controlClass}
            >
              Retry answer
            </button>
          </div>
        )}
        {availability === 'enabled' && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              send(chat.input);
            }}
          >
            <label htmlFor="ask-question" className="sr-only">
              Your question about Frad
            </label>
            <div className="flex items-end gap-4">
              <textarea
                id="ask-question"
                ref={inputRef}
                rows={2}
                maxLength={4000}
                value={chat.input}
                onChange={(event) => chat.setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    send(chat.input);
                  }
                }}
                onFocus={() => mouseContext.cursorChangeHandler(CursorType.inputActive)}
                onBlur={() => mouseContext.cursorChangeHandler(CursorType.default)}
                placeholder="Ask about Frad’s work…"
                className="min-w-0 flex-1 resize-y border-b-2 border-gray-300 bg-transparent py-3 text-xl font-bold text-black outline-none placeholder:font-normal placeholder:text-gray-500 focus:border-black dark:border-gray-600 dark:text-white dark:focus:border-white sm:text-2xl"
              />
              <button
                type="submit"
                disabled={chat.loading || !chat.input.trim()}
                className={controlClass}
                aria-label="Send message"
              >
                Send
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 text-sm text-gray-600 dark:text-gray-400">
              <span>Enter to send · Shift + Enter for a new line</span>
              {chat.loading && (
                <button type="button" onClick={() => void chat.stop()} className={controlClass}>
                  Stop generating
                </button>
              )}
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={chat.reset}
                  disabled={chat.loading}
                  className={controlClass}
                >
                  New conversation
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
