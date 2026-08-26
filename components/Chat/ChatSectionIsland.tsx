'use client';

import dynamic from 'next/dynamic';

// The AI chat runtime (Vercel AI SDK + react-markdown) is heavy and sits below
// the fold, so its chunk loads on the client after hydration instead of
// weighing down the initial bundle.
const ChatSection = dynamic(() => import('@/components/Chat/ChatSection'), {
  ssr: false,
});

export default function ChatSectionIsland() {
  return <ChatSection />;
}
