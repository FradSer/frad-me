import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AnchorHTMLAttributes, ComponentType } from 'react';
import ChatSection from '../ChatSection';

const mockTransport = jest.fn();
const mockUseChat = jest.fn();
jest.mock('@ai-sdk/react', () => ({ useChat: (...args: unknown[]) => mockUseChat(...args) }));
jest.mock('ai', () => ({
  DefaultChatTransport: class {
    constructor(options: unknown) {
      mockTransport(options);
    }
  },
}));
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({
    children,
    components,
  }: {
    children: string;
    components: { a: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement>> };
  }) => {
    const link = children.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const Link = components.a;
    return link ? (
      <p>
        <Link href={link[2]}>{link[1]}</Link>
      </p>
    ) : (
      <p>{children}</p>
    );
  },
}));
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => {} }));
jest.mock('@/hooks/useMouseContext', () => ({
  __esModule: true,
  default: () => ({ cursorChangeHandler: jest.fn() }),
}));

const originalFetch = global.fetch;
const chat = {
  messages: [] as { id: string; role: string; parts: { type: string; text: string }[] }[],
  status: 'ready',
  error: undefined,
  sendMessage: jest.fn(),
  regenerate: jest.fn(),
  stop: jest.fn(),
  clearError: jest.fn(),
  setMessages: jest.fn(),
};
const response = (enabled = true) => ({ ok: true, json: async () => ({ enabled }) });
const message = (role: string, text: string) => ({
  id: role,
  role,
  parts: [{ type: 'text', text }],
});

beforeEach(() => {
  jest.clearAllMocks();
  chat.messages = [];
  chat.status = 'ready';
  chat.sendMessage.mockReset().mockResolvedValue(undefined);
  chat.regenerate.mockReset().mockResolvedValue(undefined);
  mockUseChat.mockImplementation(() => chat);
  global.fetch = jest.fn().mockResolvedValue(response());
});
afterAll(() => {
  global.fetch = originalFetch;
});

async function ready() {
  await screen.findByRole('textbox', { name: 'Your question about Frad' });
}
function enter(text: string) {
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: text } });
  return input;
}

describe('Ask assistant experience', () => {
  it('explains the assistant, offers four current questions, and uses the SDK transport', async () => {
    render(<ChatSection />);
    await ready();
    expect(screen.getByRole('heading', { name: 'ask' })).toBeVisible();
    expect(screen.getByText(/An AI assistant for questions about Frad/)).toBeVisible();
    const question = screen.getByRole('button', { name: 'What is Frad building with AI agents?' });
    expect(screen.getAllByRole('button')).toHaveLength(5);
    expect(mockTransport).toHaveBeenCalledWith({ api: '/api/chat' });
    await act(async () => {
      fireEvent.click(question);
    });
    expect(chat.sendMessage).toHaveBeenCalledWith({
      text: 'What is Frad building with AI agents?',
    });
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('retains failed input and retries the existing turn without another user message', async () => {
    chat.sendMessage.mockImplementationOnce(async () => {
      mockUseChat.mock.calls.at(-1)?.[0].onError(new Error('secret provider failure'));
    });
    render(<ChatSection />);
    await ready();
    enter('Tell me about Code Terrier');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    });
    expect(screen.getByRole('textbox')).toHaveValue('Tell me about Code Terrier');
    expect(screen.getByRole('alert')).not.toHaveTextContent('secret provider');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Retry answer' }));
    });
    expect(chat.sendMessage).toHaveBeenCalledTimes(1);
    expect(chat.regenerate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('preserves input on rejected submission and Enter retries that turn', async () => {
    chat.sendMessage.mockRejectedValueOnce(new Error('network failed'));
    render(<ChatSection />);
    await ready();
    const input = enter('What has Frad built?');
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    expect(input).toHaveValue('What has Frad built?');
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    expect(chat.regenerate).toHaveBeenCalledTimes(1);
    expect(chat.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('prevents duplicate sends and keeps Shift+Enter and composition from submitting', async () => {
    let finish = () => {};
    chat.sendMessage.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(<ChatSection />);
    await ready();
    const input = enter('A question');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(chat.sendMessage).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(chat.sendMessage).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
    expect(screen.getByRole('log')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Thinking');
    await act(async () => finish());
  });

  it('distinguishes thinking and writing and exposes stop generation', async () => {
    chat.messages = [message('user', 'A question')];
    chat.status = 'submitted';
    const { rerender } = render(<ChatSection />);
    await ready();
    expect(screen.getByRole('status')).toHaveTextContent('Thinking');
    chat.status = 'streaming';
    chat.messages.push(message('assistant', 'A streaming answer'));
    rerender(<ChatSection />);
    expect(screen.getByRole('status')).toHaveTextContent('Writing');
    expect(screen.getByRole('log')).toHaveTextContent('A streaming answer');
    fireEvent.click(screen.getByRole('button', { name: 'Stop generating' }));
    expect(chat.stop).toHaveBeenCalledTimes(1);
  });

  it('renders assistant portfolio links with safe external attributes', async () => {
    chat.messages = [
      {
        ...message('assistant', '[Open DeskOS](https://github.com/FradSer/open-deskos)'),
        id: 'external',
      },
      { ...message('assistant', '[Pachino](/works/pachino)'), id: 'local' },
    ];
    render(<ChatSection />);
    await ready();
    expect(screen.getByRole('link', { name: 'Open DeskOS' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    expect(screen.getByRole('link', { name: 'Open DeskOS' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Pachino' })).toHaveAttribute('href', '/works/pachino');
    expect(screen.getByRole('link', { name: 'Pachino' })).not.toHaveAttribute('target');
  });

  it('resets the conversation, error, and draft', async () => {
    chat.messages = [message('user', 'Old question')];
    render(<ChatSection />);
    await ready();
    enter('New draft');
    fireEvent.click(screen.getByRole('button', { name: 'New conversation' }));
    expect(chat.setMessages).toHaveBeenCalledWith([]);
    expect(chat.clearError).toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('recovers from transient availability failures and aborts on unmount', async () => {
    jest.mocked(global.fetch).mockRejectedValueOnce(new Error('offline'));
    const { unmount } = render(<ChatSection />);
    await screen.findByRole('button', { name: 'Try connecting again' });
    expect(screen.getByRole('link', { name: 'read the resume' })).toHaveAttribute(
      'href',
      '/resume',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Try connecting again' }));
    await ready();
    const options = jest.mocked(global.fetch).mock.calls.at(-1)?.[1];
    unmount();
    expect(options?.signal?.aborted).toBe(true);
  });

  it('offers a static resume when chat is deliberately disabled', async () => {
    jest.mocked(global.fetch).mockResolvedValue(response(false) as Response);
    render(<ChatSection />);
    expect(await screen.findByRole('link', { name: 'Read Frad’s resume' })).toHaveAttribute(
      'href',
      '/resume',
    );
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
    expect(chat.sendMessage).not.toHaveBeenCalled();
  });
});
