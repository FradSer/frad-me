import type { UIMessage } from 'ai';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export default function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={clsx('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'min-w-0 max-w-[90%] rounded-2xl px-5 py-3 text-base leading-relaxed sm:text-lg',
          isUser
            ? 'bg-black text-white dark:bg-white dark:text-black'
            : 'bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-gray-100',
        )}
      >
        <span className="sr-only">{isUser ? 'You' : 'AI assistant'}: </span>
        <div
          className={
            isUser
              ? 'break-words'
              : 'prose max-w-none break-words prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-headings:my-3 dark:prose-invert'
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-inherit">{getMessageText(message)}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node: _node, href, ...props }) => (
                  <a
                    {...props}
                    href={href}
                    {...(href?.startsWith('https://')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="underline underline-offset-4 hover:opacity-80 focus-visible:outline-2"
                  />
                ),
                pre: ({ node: _node, ...props }) => (
                  <pre {...props} className="max-w-full overflow-x-auto" />
                ),
                table: ({ node: _node, ...props }) => (
                  <div className="overflow-x-auto">
                    <table {...props} />
                  </div>
                ),
              }}
            >
              {getMessageText(message)}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
