import ChatSection from '@/components/Chat/ChatSection';
import Footer from '@/components/Footer';
import Hero from '@/components/Landing/Hero';
import Patents from '@/components/Landing/Patents';
import StrudelPiece from '@/components/Landing/StrudelPiece';
import Work from '@/components/Landing/Work';

export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Patents />
      <ChatSection />
      <StrudelPiece />
      <Footer />
    </>
  );
}
