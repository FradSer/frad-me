import { Suspense } from 'react';

import ChatSectionIsland from '@/components/Chat/ChatSectionIsland';
import Footer from '@/components/Footer';
import Hero from '@/components/Landing/Hero';
import Patents from '@/components/Landing/Patents';
import StrudelPiece from '@/components/Landing/StrudelPiece';
import Work from '@/components/Landing/Work';

// Keeps the ask-section heading in place while the chat shell streams in,
// so the sections below it don't jump when the interactive UI mounts.
function ChatFallback() {
  return (
    <section id="ask" className="layout-wrapper my-20 scroll-mt-24 md:my-24 lg:my-32">
      <div className="mb-8 flex w-full items-end justify-between">
        <h2 className="text-[7rem] hover:cursor-default lg:text-[10rem] xl:text-[13rem] 2xl:text-[16rem]">
          ask
        </h2>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Patents />
      <Suspense fallback={<ChatFallback />}>
        <ChatSectionIsland />
      </Suspense>
      <StrudelPiece />
      <Footer />
    </>
  );
}
