/**
 * BDD: tests/features/chat/ask.feature
 * Regression for AI SDK 7 migration: frontend must use DefaultChatTransport
 * with /api/chat or streaming Q&A fails (transport/stream mismatch).
 *
 * RED before fix: ChatSection called useChat() bare → DefaultChatTransport
 * never used, while server switched to toUIMessageStream/createUIMessageStreamResponse.
 * GREEN after fix: useChat({ transport: new DefaultChatTransport({ api: '/api/chat' }) }).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('ChatSection — tests/features/chat/ask.feature', () => {
  const src = readFileSync(join(process.cwd(), 'components/Chat/ChatSection.tsx'), 'utf8');

  it('Scenario: Frontend sends a question via DefaultChatTransport to /api/chat', () => {
    expect(src).toContain('DefaultChatTransport');
    expect(src).toContain("api: '/api/chat'");
    expect(src).toContain('useChat');
    expect(src).toMatch(/from\s+['"]ai['"]/);
    expect(src).toContain("from '@ai-sdk/react'");
  });

  it('Regression: uses DefaultChatTransport from ai, not bare useChat()', () => {
    // Bare useChat() without transport would still build but would not match
    // the server's createUIMessageStreamResponse/toUIMessageStream protocol
    // and causes "问答会报错" on send.
    expect(src).toMatch(/new\s+DefaultChatTransport\s*\(/);
    expect(src).not.toMatch(/useChat\s*\(\s*\)/);
  });

  it('Scenario: Ask section renders heading and suggested questions', () => {
    expect(src).toContain('SUGGESTED_QUESTIONS');
    expect(src).toContain('What does Frad do?');
    expect(src).toContain('Ask me anything about Frad');
    expect(src).toContain('id="ask"');
  });

  it('Scenario: sendMessage contract matches Ask section interaction', () => {
    expect(src).toContain('sendMessage');
    expect(src).toContain('send(');
    expect(src).toContain('handleSubmit');
  });
});
