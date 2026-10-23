import { convertToModelMessages, safeValidateUIMessages, type ToolSet, type UIMessage } from 'ai';

const MAX_BODY_BYTES = 128_000;

async function readBoundedBody(req: Request): Promise<string | null> {
  const reader = req.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks, length).toString('utf8');
  } finally {
    reader.releaseLock();
  }
}

function checkConversation(messages: UIMessage[]): string | null {
  if (!messages.length || messages.length > 40) return 'Start a new conversation to continue.';
  if (messages.at(-1)?.role !== 'user') return 'A user question is required.';
  let total = 0;
  for (const message of messages) {
    if (message.role !== 'user' && message.role !== 'assistant') return 'Invalid message role.';
    if (message.role === 'user' && message.parts.some((part) => part.type !== 'text')) {
      return 'Only text questions are supported.';
    }
    const text = message.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('');
    if (message.role === 'user' && !text.trim()) return 'A user question is required.';
    if (message.role === 'user' && text.length > 4000) {
      return 'Questions must be 4000 characters or fewer.';
    }
    total += text.length;
  }
  return total > 32_000 ? 'Start a new conversation to continue.' : null;
}

export async function readChatRequest(req: Request, tools: ToolSet) {
  const declaredLength = Number(req.headers.get('content-length'));
  if (declaredLength > MAX_BODY_BYTES) return { error: 'Request is too large.', status: 413 };
  let body: unknown;
  try {
    const raw = await readBoundedBody(req);
    if (raw === null) {
      return { error: 'Request is too large.', status: 413 };
    }
    body = JSON.parse(raw);
  } catch {
    return { error: 'Invalid JSON body.', status: 400 };
  }
  if (!body || typeof body !== 'object' || !('messages' in body)) {
    return { error: 'Missing messages field.', status: 400 };
  }
  try {
    const validated = await safeValidateUIMessages({ messages: body.messages, tools });
    if (!validated.success) return { error: 'Invalid messages format.', status: 400 };
    const error = checkConversation(validated.data);
    if (error) return { error, status: 400 };
    const modelMessages = await convertToModelMessages(validated.data, {
      tools,
      ignoreIncompleteToolCalls: true,
    });
    return { messages: validated.data, modelMessages };
  } catch {
    return { error: 'Invalid messages format.', status: 400 };
  }
}
